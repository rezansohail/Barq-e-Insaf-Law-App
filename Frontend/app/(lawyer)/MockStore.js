// Placeholder store: all data will come from the backend API.
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
  id: '',
  name: '',
  spec: '',
  rating: 0,
  sbc: '',
  successfulCasesCount: 0,
  district: '',
  experience: '',
  education: '',
  about: '',
  isAvailable: false,
  address: '',
  email: '',
  phone: '',
  initials: '',
  color: '#0F2744',
  dp: null,
};

export const otherLawyers = [];

export const updateLawyerProfile = (newData) => {
  Object.assign(lawyerProfile, newData);
  notify();
};

export const timingSlots = [];

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

export const caseRequests = [];

export const activeCases = [];

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