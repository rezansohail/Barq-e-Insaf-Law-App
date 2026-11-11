// Live Data Store for Lawyer Portal - Connected to Neon DB via Backend APIs
import { useState, useEffect } from 'react';
import api from '../../constants/api';
import { getCurrentLawyerId, getCurrentLawyerUser } from '../../constants/authStore';

let listeners = [];

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn('Listener notification error:', e);
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

// ── 1. LAWYER PROFILE STATE ──
export const lawyerProfile = {
  id: 6,
  name: '',
  spec: 'General Practice',
  rating: 5.0,
  sbc: '',
  successfulCasesCount: 0,
  activeCasesCount: 0,
  pendingRequestsCount: 0,
  district: '',
  city: '',
  experience: '',
  experienceYears: 0,
  education: '',
  about: '',
  isAvailable: true,
  address: '',
  email: '',
  phone: '',
  cnic: '',
  initials: 'L',
  color: '#0F2744',
  dp: null,
  isVerified: false,
  verificationStatus: 'pending',
  loading: false,
};

/**
 * Pre-populates lawyer profile state immediately from login/session user
 */
export const setLawyerProfileFromUser = (user) => {
  if (!user) return;
  if (user.id) lawyerProfile.id = user.id;
  if (user.name) lawyerProfile.name = user.name;
  if (user.specialty || user.specialization) lawyerProfile.spec = user.specialty || user.specialization;
  if (user.sbcNumber || user.sbc_number) lawyerProfile.sbc = user.sbcNumber || user.sbc_number;
  if (user.district || user.city) lawyerProfile.district = user.district || user.city;
  if (user.city || user.district) lawyerProfile.city = user.city || user.district;
  if (user.email) lawyerProfile.email = user.email;
  if (user.phone) lawyerProfile.phone = user.phone;
  if (user.cnic) lawyerProfile.cnic = user.cnic;
  if (user.isVerified !== undefined) lawyerProfile.isVerified = Boolean(user.isVerified);
  if (user.verificationStatus) lawyerProfile.verificationStatus = user.verificationStatus;
  if (user.initials) lawyerProfile.initials = user.initials;
  notify();
};

// Check if user session already exists in memory
try {
  const existingUser = getCurrentLawyerUser();
  if (existingUser) {
    setLawyerProfileFromUser(existingUser);
  }
} catch (e) {}

// ── 2. CASE REQUESTS (FROM CITIZENS) ──
export const caseRequests = [];

// ── 3. ACTIVE CASES ──
export const activeCases = [];

// ── 4. TIMING SLOTS / OFFICE HOURS ──
export const timingSlots = [];

// ── 5. OTHER LAWYERS DIRECTORY ──
export const otherLawyers = [];

// ── ASYNC API METHODS ──

/**
 * Loads all lawyer dashboard info, real SBC number, profile, stats, requests, cases & schedule
 */
export const fetchLawyerDashboard = async (targetId) => {
  const id = targetId || lawyerProfile.id || getCurrentLawyerId();
  if (!id) return;

  lawyerProfile.loading = true;
  notify();

  try {
    const res = await api.get(`/lawyers/${id}`);
    const data = res.data;

    lawyerProfile.id = data.id || id;
    lawyerProfile.name = data.name || lawyerProfile.name || '';
    lawyerProfile.spec = data.specialty || data.specialization || lawyerProfile.spec || 'General Practice';
    lawyerProfile.sbc = data.sbcNumber || data.sbc_number || lawyerProfile.sbc || ''; // Real registered SBC License Number
    lawyerProfile.district = data.district || data.city || '';
    lawyerProfile.city = data.city || data.district || '';
    lawyerProfile.rating = Number(data.rating || 5.0);
    lawyerProfile.totalRatings = data.totalRatings || 0;
    lawyerProfile.experienceYears = data.experienceYears || 0;
    lawyerProfile.experience = data.pastExperience || (data.experienceYears ? `${data.experienceYears} Years Practice` : '');
    lawyerProfile.education = data.education || '';
    lawyerProfile.about = data.bio || '';
    lawyerProfile.isAvailable = data.isAvailable !== undefined ? data.isAvailable : true;
    lawyerProfile.address = data.officeAddress || '';
    lawyerProfile.email = data.email || '';
    lawyerProfile.phone = data.phone || '';
    lawyerProfile.cnic = data.cnic || '';
    lawyerProfile.initials = data.initials || 'L';
    lawyerProfile.isVerified = Boolean(data.isVerified);
    lawyerProfile.verificationStatus = data.verificationStatus || 'pending';

    // Live stats from database
    if (data.stats) {
      lawyerProfile.successfulCasesCount = data.stats.successfulCasesCount || 0;
      lawyerProfile.activeCasesCount = data.stats.activeCasesCount || 0;
      lawyerProfile.pendingRequestsCount = data.stats.pendingRequestsCount || 0;
    }

    lawyerProfile.loading = false;
    notify();

    // Fetch related sub-resources in parallel
    await Promise.allSettled([
      fetchRequests(id),
      fetchCases(id),
      fetchSchedule(id),
      fetchOtherLawyers(id),
    ]);
  } catch (err) {
    console.error('Error fetching lawyer dashboard:', err.response?.data || err.message);
    lawyerProfile.loading = false;
    notify();
  }
};

/**
 * Updates lawyer profile via PUT /api/lawyers/:id/profile and persists to database
 */
export const updateLawyerProfile = async (newData, targetId) => {
  const id = targetId || lawyerProfile.id || getCurrentLawyerId();
  // Optimistically update local state
  Object.assign(lawyerProfile, newData);
  notify();

  try {
    const payload = {
      name: newData.name !== undefined ? newData.name : lawyerProfile.name,
      specialty: newData.spec !== undefined ? newData.spec : lawyerProfile.spec,
      district: newData.district !== undefined ? newData.district : lawyerProfile.district,
      city: newData.city !== undefined ? newData.city : lawyerProfile.city,
      bio: newData.about !== undefined ? newData.about : (newData.bio !== undefined ? newData.bio : lawyerProfile.about),
      education: newData.education !== undefined ? newData.education : lawyerProfile.education,
      pastExperience: newData.experience !== undefined ? newData.experience : (newData.pastExperience !== undefined ? newData.pastExperience : lawyerProfile.experience),
      officeAddress: newData.address !== undefined ? newData.address : (newData.officeAddress !== undefined ? newData.officeAddress : lawyerProfile.address),
      isAvailable: newData.isAvailable !== undefined ? newData.isAvailable : lawyerProfile.isAvailable,
      phone: newData.phone !== undefined ? newData.phone : lawyerProfile.phone,
    };

    const res = await api.put(`/lawyers/${id}/profile`, payload);
    if (res.data?.lawyer) {
      const d = res.data.lawyer;
      lawyerProfile.name = d.name;
      lawyerProfile.spec = d.specialty;
      lawyerProfile.sbc = d.sbcNumber;
      lawyerProfile.about = d.bio;
      lawyerProfile.education = d.education;
      lawyerProfile.experience = d.pastExperience;
      lawyerProfile.address = d.officeAddress;
      lawyerProfile.isAvailable = d.isAvailable;
      lawyerProfile.initials = d.initials || 'L';
      notify();
    }
    return res.data;
  } catch (err) {
    console.error('Error updating lawyer profile:', err.response?.data || err.message);
    throw err;
  }
};

/**
 * Fetches all consultation requests for this lawyer from database
 */
export const fetchRequests = async (targetId) => {
  const id = targetId || lawyerProfile.id || getCurrentLawyerId();
  if (!id) return;

  try {
    const res = await api.get(`/lawyers/${id}/requests`);
    const data = res.data || [];
    caseRequests.length = 0;
    data.forEach((r) => {
      caseRequests.push({
        id: String(r.id),
        name: r.citizenName || 'Citizen Client',
        spec: r.problemStatement || 'Legal Consultation',
        desc: r.caseSummary || r.problemStatement || 'Consultation requested',
        court: 'District Court',
        contact: r.citizenPhone || '',
        email: r.citizenEmail || '',
        location: r.district || lawyerProfile.district || 'Sindh',
        time: r.appointmentDate ? new Date(r.appointmentDate).toLocaleDateString() : 'Recent',
        status: r.status,
        declineReason: r.declineReason,
        problemStatement: r.problemStatement || r.caseSummary,
      });
    });
    lawyerProfile.pendingRequestsCount = caseRequests.filter((r) => r.status === 'pending').length;
    notify();
  } catch (err) {
    console.error('Error fetching case requests:', err.response?.data || err.message);
  }
};

/**
 * Accepts a consultation request and creates an active case
 */
export const acceptRequest = async (requestId, targetId) => {
  const id = targetId || lawyerProfile.id || getCurrentLawyerId();
  try {
    const res = await api.put(`/lawyers/${id}/requests/${requestId}/accept`);
    await Promise.all([fetchRequests(id), fetchCases(id), fetchLawyerDashboard(id)]);
    return res.data;
  } catch (err) {
    console.error('Error accepting request:', err.response?.data || err.message);
    throw err;
  }
};

/**
 * Declines a consultation request with a mandatory reason
 */
export const declineRequest = async (requestId, reason, targetId) => {
  const id = targetId || lawyerProfile.id || getCurrentLawyerId();
  try {
    const res = await api.put(`/lawyers/${id}/requests/${requestId}/decline`, {
      reason: reason || 'Schedule full / Outside practice jurisdiction',
    });
    await Promise.all([fetchRequests(id), fetchLawyerDashboard(id)]);
    return res.data;
  } catch (err) {
    console.error('Error declining request:', err.response?.data || err.message);
    throw err;
  }
};

/**
 * Fetches active cases assigned to this lawyer from database
 */
export const fetchCases = async (targetId) => {
  const id = targetId || lawyerProfile.id || getCurrentLawyerId();
  if (!id) return;

  try {
    const res = await api.get(`/lawyers/${id}/cases`);
    const data = res.data || [];
    activeCases.length = 0;
    data.forEach((c) => {
      activeCases.push({
        id: String(c.id),
        title: c.title || 'Legal Case',
        clientName: c.clientName || 'Client',
        court: c.court || 'District Court',
        description: c.description || '',
        contact: c.clientPhone || '',
        email: c.clientEmail || '',
        problemStatement: c.title,
        status: c.status || 'active',
        district: c.district || '',
        hearingDate: c.hearingDate,
      });
    });
    lawyerProfile.activeCasesCount = activeCases.length;
    notify();
  } catch (err) {
    console.error('Error fetching cases:', err.response?.data || err.message);
  }
};

/**
 * Helper to safely extract schedule array
 */
const normalizeSlots = (data) => {
  if (!data) return [];
  let raw = data;
  if (data.office_hours !== undefined) raw = data.office_hours;
  else if (data.officeHours !== undefined) raw = data.officeHours;

  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw.map((s, idx) => ({
    id: s.id ? String(s.id) : `slot-${idx}-${Date.now()}`,
    day: s.day || 'Monday',
    time: s.time || '10:00 AM - 01:00 PM',
  }));
};

/**
 * Fetches lawyer schedule / office hours from database
 */
export const fetchSchedule = async (targetId) => {
  const id = targetId || lawyerProfile.id || getCurrentLawyerId();
  if (!id) return [];

  try {
    const res = await api.get(`/lawyers/${id}/schedule`);
    const slots = normalizeSlots(res.data);
    timingSlots.length = 0;
    slots.forEach((s) => timingSlots.push(s));
    notify();
    return slots;
  } catch (err) {
    console.error('Error fetching schedule:', err.response?.data || err.message);
    return timingSlots;
  }
};

/**
 * Adds a new timing slot and saves to database
 */
export const addTimingSlot = async (day, time, targetId) => {
  const id = targetId || lawyerProfile.id || getCurrentLawyerId();
  const newSlot = {
    id: `ts-${Date.now()}`,
    day: day || 'Monday',
    time: time || '10:00 AM - 01:00 PM',
  };
  timingSlots.push(newSlot);
  notify();

  try {
    const res = await api.put(`/lawyers/${id}/schedule`, { office_hours: timingSlots });
    if (res.data?.officeHours) {
      const serverSlots = normalizeSlots(res.data.officeHours);
      if (serverSlots.length > 0) {
        timingSlots.length = 0;
        serverSlots.forEach((s) => timingSlots.push(s));
        notify();
      }
    }
    return timingSlots;
  } catch (err) {
    console.error('Error saving schedule slot:', err.response?.data || err.message);
    throw err;
  }
};

/**
 * Deletes a timing slot and saves to database
 */
export const deleteTimingSlot = async (slotId, targetId) => {
  const id = targetId || lawyerProfile.id || getCurrentLawyerId();
  const idx = timingSlots.findIndex((s) => String(s.id) === String(slotId));
  if (idx !== -1) {
    timingSlots.splice(idx, 1);
    notify();
  }

  try {
    const res = await api.put(`/lawyers/${id}/schedule`, { office_hours: timingSlots });
    if (res.data?.officeHours) {
      const serverSlots = normalizeSlots(res.data.officeHours);
      timingSlots.length = 0;
      serverSlots.forEach((s) => timingSlots.push(s));
      notify();
    }
    return timingSlots;
  } catch (err) {
    console.error('Error deleting schedule slot:', err.response?.data || err.message);
    throw err;
  }
};

/**
 * Edits a timing slot and saves to database
 */
export const editTimingSlot = async (slotId, day, time, targetId) => {
  const id = targetId || lawyerProfile.id || getCurrentLawyerId();
  const idx = timingSlots.findIndex((s) => String(s.id) === String(slotId));
  if (idx !== -1) {
    timingSlots[idx] = { id: String(slotId), day, time };
    notify();
  }

  try {
    const res = await api.put(`/lawyers/${id}/schedule`, { office_hours: timingSlots });
    if (res.data?.officeHours) {
      const serverSlots = normalizeSlots(res.data.officeHours);
      if (serverSlots.length > 0) {
        timingSlots.length = 0;
        serverSlots.forEach((s) => timingSlots.push(s));
        notify();
      }
    }
    return timingSlots;
  } catch (err) {
    console.error('Error updating schedule slot:', err.response?.data || err.message);
    throw err;
  }
};

/**
 * Fetches other lawyers for networking/directory
 */
export const fetchOtherLawyers = async (currentId) => {
  try {
    const res = await api.get('/lawyers');
    const all = res.data || [];
    otherLawyers.length = 0;
    all
      .filter((l) => Number(l.id) !== Number(currentId))
      .forEach((l) => {
        otherLawyers.push({
          id: String(l.id),
          name: l.name,
          spec: l.specialty,
          rating: String(l.rating || '5.0'),
          casesWon: `${l.stats?.successfulCasesCount || 0}+`,
          district: l.district || 'Sindh',
          phone: l.phone || '',
          initials: l.initials || 'L',
          color: '#1B4332',
        });
      });
    notify();
  } catch (err) {
    console.error('Error fetching other lawyers:', err.response?.data || err.message);
  }
};

export default function MockStoreRoute() {
  return null;
}
