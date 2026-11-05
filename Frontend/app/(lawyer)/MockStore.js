// Data for lawyer portal
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

export const lawyerProfile = {
  id: 'lp-101',
  name: 'Adv. Tariq Mansoor',
  spec: 'Property & Land Dispute',
  rating: 4.9,
  sbc: 'SBC-4421/KHI',
  successfulCasesCount: 184,
  district: 'Karachi Central',
  experience: '14 Years Practice',
  education: 'LL.B (SM Law College), LL.M (Karachi University)',
  about: 'High Court enrolled advocate specializing in Sindh land revenue laws, succession certificates, and property civil suits.',
  isAvailable: true,
  address: 'Chamber 402, Lawyers Court Building, M.A. Jinnah Road, Karachi',
  email: 'tariq.adv@sindhbar.org',
  phone: '0321-9876543',
  initials: 'TM',
  color: '#0F2744',
  dp: null,
};

export const otherLawyers = [
  {
    id: 'ol-1',
    name: 'Adv. Fatima Shah',
    spec: 'Family & Custody',
    rating: '4.8',
    casesWon: '95+',
    district: 'Karachi Central',
    phone: '0333-1234567',
    initials: 'FS',
    color: '#1B4332',
  },
  {
    id: 'ol-2',
    name: 'Adv. Rehan Qureshi',
    spec: 'Civil & Inheritance',
    rating: '4.9',
    casesWon: '140+',
    district: 'Hyderabad',
    phone: '0300-4455667',
    initials: 'RQ',
    color: '#5C1A1A',
  },
];

export const updateLawyerProfile = (newData) => {
  Object.assign(lawyerProfile, newData);
  notify();
};

export const timingSlots = [
  { id: 'ts-1', day: 'Monday', time: '10:00 AM - 01:00 PM' },
  { id: 'ts-2', day: 'Wednesday', time: '03:00 PM - 06:00 PM' },
  { id: 'ts-3', day: 'Saturday', time: '11:00 AM - 02:00 PM' },
];

export const addTimingSlot = (day, time) => {
  timingSlots.push({
    id: String(Date.now()),
    day,
    time
  });
  notify();
};

export const deleteTimingSlot = (id) => {
  const idx = timingSlots.findIndex(s => s.id === id);
  if (idx !== -1) {
    timingSlots.splice(idx, 1);
    notify();
  }
};

export const editTimingSlot = (id, day, time) => {
  const idx = timingSlots.findIndex(s => s.id === id);
  if (idx !== -1) {
    timingSlots[idx] = { id, day, time };
    notify();
  }
};

export const caseRequests = [
  {
    id: 'req-1',
    name: 'Kamran Siddiqui',
    spec: 'Property Dispute',
    court: 'Sindh High Court',
    desc: 'Ancestral land demarcation dispute in Scheme 33. Construction stopped by illegal occupants.',
    contact: '0300-9876543',
    evidence: 'Registry_Deed_1998.pdf',
    problemStatement: 'Land demarcation dispute in Scheme 33.',
  },
  {
    id: 'req-2',
    name: 'Saira Bano',
    spec: 'Family Maintenance',
    court: 'Family Court Central',
    desc: 'Maintenance petition filed under Family Courts Act 1964 for two minor children.',
    contact: '0334-1122334',
    evidence: 'Birth_Certificates.pdf',
    problemStatement: 'Maintenance petition for two minor children.',
  },
];

export const activeCases = [
  {
    id: 'ac-1',
    title: 'Plot 42 Encroachment Civil Suit',
    clientName: 'Naveed Akhtar',
    court: 'City Court Karachi',
    description: 'Civil suit for declaration and permanent injunction regarding residential property.',
    contact: '0321-4455667',
    evidence: 'Survey_Report.pdf',
    problemStatement: 'Encroachment declaration and permanent injunction suit.',
  },
];

export const declineRequest = (id) => {
  const idx = caseRequests.findIndex(r => r.id === id);
  if (idx !== -1) {
    caseRequests.splice(idx, 1);
    notify();
  }
};

export const acceptRequest = (id) => {
  const req = caseRequests.find(r => r.id === id);
  if (req) {
    activeCases.unshift({
      id: String(Date.now()),
      title: `${req.name} - ${req.spec}`,
      clientName: req.name,
      court: req.court || '',
      description: req.desc,
      contact: req.contact,
      evidence: req.evidence,
      problemStatement: req.problemStatement || (req.desc || '').substring(0, 50),
    });
    declineRequest(id);
  }
};
