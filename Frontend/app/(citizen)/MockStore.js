import { useState, useEffect } from 'react';
import api from '../../constants/api';
import { getCurrentCitizenId, getCurrentCitizenUser } from '../../constants/authStore';
import { saveFileToLocalVault, deleteLocalVaultFile } from '../../services/vaultStorage';

let listeners = [];

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn('Citizen store notification error:', e);
    }
  });
}

export const subscribe = (listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export function useMockStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribe(() => setTick((t) => t + 1));
  }, []);
}

// ── 1. CITIZEN USER STATE ──
export const userData = {
  id: 1,
  name: '',
  fullName: '',
  email: '',
  phone: '',
  cnic: '',
  district: '',
  city: '',
  address: '',
  role: 'Citizen',
  joinedDate: '',
  dp: 'C',
  customSections: [],
  activeCasesCount: 0,
  pendingCasesCount: 0,
  totalVaultItems: 0,
  consultationsCount: 0,
  loading: false,
};

// ── 2. LAWYERS DIRECTORY (INITIAL CACHE FOR INSTANT ZERO-LATENCY LOAD) ──
export const lawyers = [
  {
    id: '6',
    name: 'Advocate Tariq Hassan',
    spec: 'Property & Land Dispute',
    experience: '14 Years Practice',
    location: 'Chamber 402, Lawyers Court, Karachi',
    district: 'Karachi',
    rating: '5.0',
    casesWon: '180+',
    phone: '+923001234567',
    sbc: 'SBC-4421',
    schedule: [
      { id: 'ts-2', day: 'Wednesday', time: '03:00 PM - 06:00 PM' },
      { id: 'ts-3', day: 'Saturday', time: '11:00 AM - 02:00 PM' },
      { id: 'ts-1794387330587', day: 'Thursday', time: '02:00 PM - 05:00 PM' },
    ],
    initials: 'TH',
    color: '#0F2744',
  },
  {
    id: '3',
    name: 'Advocate Tariq Aziz',
    spec: 'Corporate & Civil Law',
    experience: '12 Years Practice',
    location: 'Karachi, High Court',
    district: 'Karachi',
    casesWon: '120+',
    phone: '+923334567890',
    sbc: 'KHI-9921',
    schedule: [],
    initials: 'TA',
    color: '#5C1A1A',
  },
  {
    id: '2',
    name: 'Advocate Sara Malik',
    spec: 'Family & Custody Law',
    experience: '7 Years Practice',
    location: 'Karachi Central, City Courts',
    district: 'Karachi',
    casesWon: '90+',
    phone: '+923219876543',
    sbc: 'ISB-5531',
    schedule: [],
    initials: 'SM',
    color: '#1B4332',
  },
  {
    id: '1',
    name: 'Advocate Ahmed Khan',
    spec: 'Civil & Criminal Defense',
    experience: '10 Years Practice',
    location: 'Karachi, Sindh High Court',
    district: 'Karachi',
    casesWon: '140+',
    phone: '+923001234567',
    sbc: 'LHR-8842',
    schedule: [],
    initials: 'AK',
    color: '#0F2744',
  },
];

// ── 3. NGOS & MEDIA DIRECTORY (INITIAL CACHE) ──
export const ngos = [
  {
    id: '1',
    name: 'Human Rights Commission Sindh',
    fullName: 'Human Rights Commission Sindh',
    type: 'Legal Aid & Human Rights',
    organizationType: 'Legal Aid NGO',
    district: 'Karachi',
    phone: '021-3567890',
    email: 'info@hrcp-sindh.org',
    isVerified: true,
    initials: 'HR',
  },
  {
    id: '2',
    name: 'Legal Aid Society Sindh',
    fullName: 'Legal Aid Society Sindh',
    type: 'Free Legal Defense',
    organizationType: 'Legal Aid NGO',
    district: 'Karachi',
    phone: '021-3987654',
    email: 'aid@legalaidsociety.org',
    isVerified: true,
    initials: 'LA',
  },
];

// ── 4. CITIZEN CASES ──
export const activeCases = [];

// ── 5. EVIDENCE VAULT (PRIVATE ENCRYPTED REPOSITORY) ──
export const evidenceVault = [];

// ── 6. CONSULTATION REQUESTS ──
export const consultationRequests = [];

/**
 * Pre-populates citizen state immediately from login/register response
 */
export const setCitizenProfileFromUser = (user) => {
  if (!user) return;
  if (user.id) userData.id = user.id;
  const name = user.fullName || user.name || '';
  if (name) {
    userData.name = name;
    userData.fullName = name;
  }
  if (user.email) userData.email = user.email;
  if (user.phone) userData.phone = user.phone;
  if (user.district) userData.district = user.district;
  if (user.city) userData.city = user.city;
  if (user.cnic) userData.cnic = user.cnic;
  if (user.address) userData.address = user.address;
  if (user.dp) userData.dp = user.dp;
  else if (name) {
    userData.dp = name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase();
  }
  if (user.customSections) {
    userData.customSections = Array.isArray(user.customSections)
      ? user.customSections
      : (typeof user.customSections === 'string' ? JSON.parse(user.customSections) : []);
  }
  notify();
};

// Try hydrating immediately from session in memory
try {
  const existingUser = getCurrentCitizenUser();
  if (existingUser) {
    setCitizenProfileFromUser(existingUser);
  }
} catch (e) {}

/**
 * Loads entire citizen portal data from backend:
 * Citizen Profile, Cases, Vault, Lawyers, NGOs, Consultations
 */
export const fetchCitizenDashboard = async (targetId) => {
  const id = targetId || userData.id || getCurrentCitizenId();
  if (!id) return;

  userData.loading = true;
  notify();

  try {
    const res = await api.get(`/citizens/${id}`);
    const data = typeof res.data === 'object' && res.data !== null ? res.data : {};

    userData.id = data.id || id;
    userData.name = data.fullName || data.name || userData.name || 'Citizen';
    userData.fullName = data.fullName || data.name || userData.fullName || 'Citizen';
    userData.email = data.email || userData.email || '';
    userData.phone = data.phone || userData.phone || '';
    userData.cnic = data.cnic || userData.cnic || '';
    userData.district = data.district || data.city || userData.district || '';
    userData.city = data.city || data.district || userData.city || '';
    userData.address = data.address || userData.address || '';
    userData.dp = data.dp || data.initials || (userData.name ? userData.name.substring(0, 2).toUpperCase() : 'C');
    userData.role = 'Citizen';
    userData.joinedDate = data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Member';

    if (data.customSections) {
      userData.customSections = Array.isArray(data.customSections)
        ? data.customSections
        : (typeof data.customSections === 'string' ? JSON.parse(data.customSections) : []);
    }

    if (data.stats) {
      userData.activeCasesCount = data.stats.activeCasesCount || 0;
      userData.pendingCasesCount = data.stats.pendingCasesCount || 0;
      userData.totalVaultItems = data.stats.totalVaultItems || 0;
      userData.consultationsCount = data.stats.consultationsCount || 0;
    }

    userData.loading = false;
    notify();

    // Fetch related datasets in parallel
    await Promise.allSettled([
      fetchCitizenCases(id),
      fetchCitizenVault(id),
      fetchLawyersList(),
      fetchNgosList(),
      fetchCitizenConsultations(id),
    ]);
  } catch (err) {
    console.error('[CITIZEN] Error fetching citizen profile:', err.response?.data || err.message);
    userData.loading = false;
    notify();
  }
};

/**
 * Fetches all cases for the citizen
 */
export const fetchCitizenCases = async (targetId) => {
  const id = targetId || userData.id || getCurrentCitizenId();
  try {
    const res = await api.get(`/citizens/${id}/cases`);
    const data = res.data || [];
    activeCases.length = 0;
    data.forEach((c) => {
      const caseEvidence = evidenceVault.filter((v) => String(v.caseId) === String(c.id));
      activeCases.push({
        id: String(c.id),
        title: c.title,
        type: c.type || 'Legal Dispute',
        description: c.description || '',
        district: c.district || userData.district || 'Sindh',
        court: c.court || 'District Court',
        filingDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recent',
        lastUpdated: 'Recently',
        status: c.status ? (c.status.charAt(0).toUpperCase() + c.status.slice(1)) : 'Active',
        hearingDate: c.hearingDate,
        lawyer: c.lawyer || null,
        evidence: caseEvidence,
      });
    });
    userData.activeCasesCount = activeCases.filter((c) => c.status === 'Active').length;
    userData.pendingCasesCount = activeCases.filter((c) => c.status === 'Pending').length;
    notify();
  } catch (err) {
    console.error('[CITIZEN] Error fetching cases:', err.response?.data || err.message);
  }
};

/**
 * Fetches citizen's evidence vault items
 */
export const fetchCitizenVault = async (targetId) => {
  const id = targetId || userData.id || getCurrentCitizenId();
  try {
    const res = await api.get(`/citizens/${id}/vault`);
    const data = res.data || [];
    evidenceVault.length = 0;
    data.forEach((v) => {
      evidenceVault.push({
        id: String(v.id),
        caseId: v.caseId ? String(v.caseId) : null,
        title: v.title,
        name: v.title,
        category: v.category || 'Legal Document',
        type: v.fileType || 'Photo',
        fileType: v.fileType || 'Photo',
        size: v.fileSize || '1.0 MB',
        fileSize: v.fileSize || '1.0 MB',
        uri: v.fileUri || '',
        fileUri: v.fileUri || '',
        encryptedData: v.encryptedData,
        notes: v.notes || '',
        isSharedWithLawyer: Boolean(v.isSharedWithLawyer),
        createdAt: v.createdAt,
      });
    });
    // Link vault items to existing cases
    activeCases.forEach((c) => {
      c.evidence = evidenceVault.filter((v) => String(v.caseId) === String(c.id));
    });
    userData.totalVaultItems = evidenceVault.length;
    notify();
  } catch (err) {
    console.error('[CITIZEN] Error fetching vault:', err.response?.data || err.message);
  }
};

/**
 * Fetches verified lawyers directory from API with optional specialty filter
 */
export const fetchLawyersList = async (specialty = '') => {
  try {
    const url = specialty && specialty !== 'All' 
      ? `/lawyers?specialty=${encodeURIComponent(specialty)}`
      : '/lawyers';
    const res = await api.get(url);
    const data = res.data || [];
    lawyers.length = 0;
    data.forEach((l) => {
      lawyers.push({
        id: String(l.id),
        name: l.name,
        spec: l.specialty || 'General Practice',
        experience: l.pastExperience || (l.experienceYears ? `${l.experienceYears} Years Practice` : '10+ Years'),
        location: l.officeAddress || `${l.district || 'Karachi'}, High Court`,
        district: l.district || 'Karachi',
        casesWon: `${l.stats?.successfulCasesCount || 0}+`,
        phone: l.phone || '',
        sbc: l.sbcNumber || '',
        schedule: Array.isArray(l.officeHours) ? l.officeHours : [],
        initials: l.initials || 'L',
        color: '#0F2744',
      });
    });
    notify();
  } catch (err) {
    console.error('[CITIZEN] Error fetching lawyers:', err.response?.data || err.message);
  }
};

/**
 * Fetches active NGOs & Media directory
 */
export const fetchNgosList = async (filter = {}) => {
  try {
    const res = await api.get('/citizens/ngos', { params: filter });
    const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    if (data.length > 0) {
      ngos.length = 0;
      data.forEach((n) => {
        ngos.push({
          id: String(n.id),
          name: n.fullName || n.name,
          fullName: n.fullName || n.name,
          type: n.organizationType || 'NGO / Media',
          organizationType: n.organizationType || 'NGO / Media',
          district: n.district || 'Sindh',
          phone: n.phone || '',
          email: n.email || '',
          isVerified: Boolean(n.isVerified),
          initials: n.initials || 'N',
        });
      });
      notify();
    }
  } catch (err) {
    console.warn('[CITIZEN] Note on fetching NGOs:', err.response?.data || err.message);
  }
};

/**
 * Fetches all consultation requests sent by this citizen
 */
export const fetchCitizenConsultations = async (targetId) => {
  const id = targetId || userData.id || getCurrentCitizenId();
  try {
    const res = await api.get(`/citizens/${id}/consultations`);
    const data = res.data || [];
    consultationRequests.length = 0;
    data.forEach((c) => consultationRequests.push(c));
    userData.consultationsCount = consultationRequests.length;
    notify();
  } catch (err) {
    console.error('[CITIZEN] Error fetching consultations:', err.response?.data || err.message);
  }
};

/**
 * Updates citizen profile in database
 */
export const updateProfile = async (newData, targetId) => {
  const id = targetId || userData.id || getCurrentCitizenId();
  Object.assign(userData, newData);
  if (newData.name) userData.fullName = newData.name;
  notify();

  try {
    const res = await api.put(`/citizens/${id}`, {
      fullName: userData.name || userData.fullName,
      phone: userData.phone,
      district: userData.district,
      city: userData.city,
      cnic: userData.cnic,
      address: userData.address,
      dp: userData.dp,
      customSections: userData.customSections,
    });
    if (res.data?.citizen) {
      setCitizenProfileFromUser(res.data.citizen);
    }
    return res.data;
  } catch (err) {
    console.error('[CITIZEN] Error updating profile:', err.response?.data || err.message);
    throw err;
  }
};

/**
 * Builds a new case in the database
 */
export const addCase = async (newCase, targetId) => {
  const id = targetId || userData.id || getCurrentCitizenId();
  try {
    const res = await api.post(`/citizens/${id}/cases`, {
      title: newCase.title,
      type: newCase.type,
      description: newCase.description,
      district: newCase.district || userData.district,
      court: newCase.court || 'District Court',
      lawyerId: newCase.lawyerId || null,
    });
    const createdCaseId = res.data?.case?.id || res.data?.id;
    if (createdCaseId && Array.isArray(newCase.evidence) && newCase.evidence.length > 0) {
      for (const ev of newCase.evidence) {
        try {
          await addToVault({ ...ev, caseId: createdCaseId }, id);
        } catch (evErr) {
          console.warn('[CITIZEN] Could not auto-attach evidence to vault:', evErr.message);
        }
      }
    }
    await fetchCitizenCases(id);
    return res.data;
  } catch (err) {
    console.warn('[CITIZEN] Backend case post failed, saving resiliently to local vault & active cases:', err.response?.data || err.message);
    const fallbackId = 'case-' + Date.now();
    const createdCase = {
      id: fallbackId,
      title: newCase.title,
      type: newCase.type || 'Legal Case',
      description: newCase.description,
      district: newCase.district || userData.district || 'Karachi Central',
      status: 'Active',
      filingDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      evidence: Array.isArray(newCase.evidence) ? [...newCase.evidence] : [],
      sections: ['PPC 447', 'PPC 448', 'Specific Relief Act 1877'],
    };
    activeCases.unshift(createdCase);
    userData.activeCasesCount = activeCases.length;

    if (Array.isArray(newCase.evidence) && newCase.evidence.length > 0) {
      newCase.evidence.forEach(async (ev) => {
        try {
          await addToVault({ ...ev, caseId: fallbackId }, id);
        } catch (evErr) {}
      });
    }

    notify();
    return { case: createdCase };
  }
};

/**
 * Sends a consultation request to a lawyer
 */
export const requestConsultation = async (consultationData, targetId) => {
  const id = targetId || userData.id || getCurrentCitizenId();
  try {
    const res = await api.post(`/citizens/${id}/consultations`, consultationData);
    await fetchCitizenConsultations(id);
    return res.data;
  } catch (err) {
    console.error('[CITIZEN] Error sending consultation request:', err.response?.data || err.message);
    throw err;
  }
};

/**
 * Adds an item to the on-device sandbox vault AND database
 */
export const addToVault = async (itemData, targetId) => {
  const id = targetId || userData.id || getCurrentCitizenId();
  
  // 1. Copy file to local sandbox directory (Tier 1)
  let localUri = itemData.fileUri || itemData.uri || '';
  if (localUri) {
    localUri = await saveFileToLocalVault(localUri, itemData.title || itemData.name || 'evidence');
  }

  // 2. Persist metadata & encrypted reference to database
  try {
    const res = await api.post(`/citizens/${id}/vault`, {
      title: itemData.title || itemData.name || 'Evidence Item',
      category: itemData.category || 'Legal Document',
      fileType: itemData.fileType || itemData.type || 'Photo',
      fileSize: itemData.fileSize || itemData.size || '1.0 MB',
      fileUri: localUri,
      encryptedData: itemData.encryptedData || null,
      notes: itemData.notes || '',
      caseId: itemData.caseId || null,
    });

    await fetchCitizenVault(id);
    return res.data;
  } catch (err) {
    console.error('[CITIZEN] Error saving to vault:', err.response?.data || err.message);
    throw err;
  }
};

/**
 * Deletes an item from the citizen's vault
 */
export const deleteFromVault = async (itemId, targetId) => {
  const id = targetId || userData.id || getCurrentCitizenId();
  const existing = evidenceVault.find((v) => String(v.id) === String(itemId));
  if (existing && existing.fileUri) {
    await deleteLocalVaultFile(existing.fileUri);
  }

  try {
    const res = await api.delete(`/citizens/${id}/vault/${itemId}`);
    await fetchCitizenVault(id);
    return res.data;
  } catch (err) {
    console.error('[CITIZEN] Error deleting vault item:', err.response?.data || err.message);
    throw err;
  }
};

export const updateCase = async (caseId, updatedFields, targetId) => {
  const id = targetId || userData.id || getCurrentCitizenId();
  const cIndex = activeCases.findIndex((c) => String(c.id) === String(caseId));
  if (cIndex !== -1) {
    activeCases[cIndex] = {
      ...activeCases[cIndex],
      ...updatedFields,
      lastUpdated: 'Just now',
    };
    notify();
  }

  try {
    const res = await api.put(`/citizens/${id}/cases/${caseId}`, updatedFields);
    await fetchCitizenCases(id);
    return res.data;
  } catch (err) {
    console.error('[CITIZEN] Error updating case in DB:', err.response?.data || err.message);
  }
};

export const addEvidenceToCase = async (caseId, file, targetId) => {
  await addToVault({ ...file, caseId }, targetId);
};

export const removeEvidenceFromCase = async (caseId, index, targetId) => {
  const c = activeCases.find((c) => c.id === caseId);
  if (c && c.evidence && c.evidence[index]) {
    const item = c.evidence[index];
    if (item.id) {
      await deleteFromVault(item.id, targetId);
    }
  }
};

export default function MockStoreRoute() {
  return null;
}
