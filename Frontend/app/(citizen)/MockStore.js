// Data will come from the backend API; these stores start empty.
import { useState, useEffect } from 'react';

let listeners = [];

function notify() {
  listeners.forEach(listener => listener());
}

export const subscribe = (listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

export function useMockStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribe(() => setTick(t => t + 1));
  }, []);
}

export const userData = {
  name: 'Ahmed Khan',
  email: 'ahmed.citizen@barqeinsaf.pk',
  phone: '0300-1234567',
  cnic: '42101-1234567-1',
  district: 'Karachi Central',
  role: 'Citizen',
  joinedDate: 'November 2026',
  dp: 'AK',
};

export const updateProfile = (newData) => {
  Object.assign(userData, newData);
  notify();
};

export const lawyers = [
  {
    id: 'l-1',
    name: 'Adv. Tariq Mansoor',
    spec: 'Property & Land Dispute',
    experience: '14 years',
    location: 'High Court, Karachi',
    district: 'Karachi Central',
    rating: '4.9',
    casesWon: '180+',
    fee: 'Rs. 2,000 / consult',
    phone: '0321-9876543',
    initials: 'TM',
    color: '#0F2744',
  },
  {
    id: 'l-2',
    name: 'Adv. Fatima Shah',
    spec: 'Family Law & Custody',
    experience: '9 years',
    location: 'District Court, Karachi',
    district: 'Karachi Central',
    rating: '4.8',
    casesWon: '95+',
    fee: 'Rs. 1,500 / consult',
    phone: '0333-1234567',
    initials: 'FS',
    color: '#1B4332',
  },
  {
    id: 'l-3',
    name: 'Adv. Rehan Qureshi',
    spec: 'Civil & Inheritance',
    experience: '12 years',
    location: 'Sessions Court, Hyderabad',
    district: 'Hyderabad',
    rating: '4.9',
    casesWon: '140+',
    fee: 'Rs. 2,500 / consult',
    phone: '0300-4455667',
    initials: 'RQ',
    color: '#5C1A1A',
  },
  {
    id: 'l-4',
    name: 'Adv. Bilal Soomro',
    spec: 'Criminal & Bail Defense',
    experience: '16 years',
    location: 'High Court Bench, Sukkur',
    district: 'Sukkur',
    rating: '4.7',
    casesWon: '210+',
    fee: 'Rs. 3,000 / consult',
    phone: '0312-3344556',
    initials: 'BS',
    color: '#4a148c',
  },
];

export const activeCases = [
  {
    id: 'case-101',
    title: 'Gulshan Plot Ownership Dispute',
    type: 'Property Dispute',
    description: 'Encroachment dispute regarding residential plot #B-14 in Gulshan-e-Iqbal Block 13-D. Mutation records and survey documents need verification before Sindh High Court.',
    district: 'Karachi - Karachi Central',
    filingDate: 'November 1, 2026',
    lastUpdated: 'Today',
    status: 'Active',
    evidence: [
      { id: 'ev-1', name: 'Registry_Deed_Copy.pdf', type: 'PDF', size: '2.4 MB', uri: '' },
      { id: 'ev-2', name: 'Site_Demarcation_Photo.jpg', type: 'Photo', size: '3.1 MB', uri: '' },
      { id: 'ev-3', name: 'KMC_Tax_Challan_2025.pdf', type: 'PDF', size: '940 KB', uri: '' },
    ],
  },
  {
    id: 'case-102',
    title: 'Family Maintenance & Custody Claim',
    type: 'Family Case',
    description: 'Petition filed under Family Courts Act 1964 for monthly maintenance allowance and visitation rights schedule in Family Court Central Karachi.',
    district: 'Karachi - Karachi Central',
    filingDate: 'October 24, 2026',
    lastUpdated: '3 days ago',
    status: 'Pending',
    evidence: [
      { id: 'ev-4', name: 'Nikahnama_Certified_Copy.pdf', type: 'PDF', size: '1.8 MB', uri: '' },
      { id: 'ev-5', name: 'Children_Birth_Certificates.pdf', type: 'PDF', size: '1.2 MB', uri: '' },
    ],
  },
];

export const addCase = (newCase) => {
  activeCases.unshift({
    id: 'case-' + Date.now(),
    filingDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
    lastUpdated: 'Just now',
    status: 'Pending',
    evidence: [],
    ...newCase
  });
  notify();
};

export const updateCase = (id, updatedFields) => {
  const cIndex = activeCases.findIndex(c => c.id === id);
  if (cIndex !== -1) {
    activeCases[cIndex] = {
      ...activeCases[cIndex],
      ...updatedFields,
      lastUpdated: 'Just now'
    };
    notify();
  }
};

export const addEvidenceToCase = (caseId, file) => {
  const c = activeCases.find(c => c.id === caseId);
  if (c) {
    c.evidence.push(file);
    c.lastUpdated = 'Just now';
    notify();
  }
};

export const removeEvidenceFromCase = (caseId, index) => {
  const c = activeCases.find(c => c.id === caseId);
  if (c && c.evidence[index] !== undefined) {
    c.evidence.splice(index, 1);
    c.lastUpdated = 'Just now';
    notify();
  }
};