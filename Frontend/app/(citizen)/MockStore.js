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
  name: '',
  email: '',
  phone: '',
  cnic: '',
  district: '',
  role: 'Citizen',
  joinedDate: '',
  dp: '',
};

export const updateProfile = (newData) => {
  Object.assign(userData, newData);
  notify();
};

export const lawyers = [];

export const activeCases = [];

export const addCase = (newCase) => {
  activeCases.unshift({
    id: String(Date.now()),
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