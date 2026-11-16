// Shared store for editable NGO (NCHD) and Media (KTN News) profiles
// Allows NGO and Media users to update their profile info, which Citizens & Lawyers see live.

export const initialNGOData = {
  name: 'National Commission for Human Development (NCHD)',
  nativeName: 'قومی کمیشن برائے انسانی ترقی · Govt of Pakistan',
  categoryBadge: 'INSTITUTIONAL LEGAL AID & DEVELOPMENT',
  description:
    'Established in 2002 under Presidential Ordinance No. XXIX, NCHD is a premier federal statutory body operating under the Ministry of Federal Education & Professional Training, dedicated to grassroots community empowerment, adult legal literacy, and primary social justice across Pakistan.',
  email: 'info@nchd.org.pk',
  phone: '+92 21 99201234',
  helpline: '111-00-6243 (NCHD)',
  officeAddress: 'Sindh Provincial Headquarters, Barrack 79, Sindh Secretariat, Saddar, Karachi',
  operatingRegions: 'Karachi, Hyderabad, Sukkur, Larkana, Mirpurkhas',
  activeDesks: '28 Community Legal Desks',
  casesHandled: '1,420+ Citizens Assisted',
  keyFocus: [
    'Grassroots Civil & Family Dispute Aid',
    'Sindh Tenancy & Land Dispossession Defense',
    'Adult Legal Literacy in Sindhi & Urdu',
    'Free Legal Aid for Destitute Undertrial Prisoners',
  ],
};

export const initialMediaData = {
  name: 'KTN News (Kawish Television Network)',
  nativeName: 'کے ٽي اين نيوز · Premier Sindhi News Channel',
  categoryBadge: '24/7 SINDHI BROADCAST JOURNALISM',
  description:
    'Launched in October 2007 by Kawish Group of Publications, KTN News is Pakistan’s first 24-hour private Sindhi news television channel. It is renowned for high court and trial court reporting, investigative journalism on social and legal injustices, and providing a powerful public microphone for aggrieved citizens across Sindh.',
  email: 'newsdesk@ktnnews.tv',
  phone: '+92 21 35643001',
  helpline: '+92 300 8225866 (Whistleblower Desk)',
  officeAddress: 'Kawish Television Network, KTN Head Office, Technology Park, Shahrah-e-Faisal, Karachi',
  operatingRegions: 'All 30 Districts of Sindh (Live Bureau Relay)',
  activeDesks: '30 District Bureau Desks',
  broadcastFrequency: '24/7 Satellite & Digital Transmission',
  keyFocus: [
    'Court & High Court Judicial Proceedings',
    'Land Grabbing & Encroachment Investigative Exposés',
    'Human Rights & Vulnerable Minority Protection',
    'Official Whistleblower Case Broadcasts',
  ],
};

let currentNGO = { ...initialNGOData };
let currentMedia = { ...initialMediaData };
let hasUnreadAdminNotifications = true;

const listeners = new Set();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (_) {}
  });
}

export function getNGOProfile() {
  return currentNGO;
}

export function updateNGOProfile(updates) {
  currentNGO = { ...currentNGO, ...updates };
  notifyListeners();
  return currentNGO;
}

export function getMediaProfile() {
  return currentMedia;
}

export function updateMediaProfile(updates) {
  currentMedia = { ...currentMedia, ...updates };
  notifyListeners();
  return currentMedia;
}

export function getAdminUnreadNotificationStatus() {
  return hasUnreadAdminNotifications;
}

export function markAdminNotificationsRead() {
  hasUnreadAdminNotifications = false;
  notifyListeners();
}

export function subscribeToStore(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
