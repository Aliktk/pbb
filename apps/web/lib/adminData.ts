// Sample admin data, ported from the prototype seed (pbb-admin.js SEED). Design phase only -
// replaced by API reads (donors, requests) once T2/T3 land. Negatives written as '-ve'.
import type { Donor } from './admin';

const clear = { hcv: '-ve', hiv: '-ve', hbs: '-ve', vdrl: '-ve', mp: '-ve' } as const;

export const DONORS: Donor[] = [
  { id: 1, n: 'Abdul Samad Kakar', g: 'O−', gx: 'Male', p: '0300 3815590', c: 'Quetta', last: '2026-05-07', times: 4, mr: 'CHM-0142', dob: '1991-02-14', emg: 'Bilal Kakar', emgr: 'Brother', addr: 'Mohallah Killi Deba, Quetta', ml: 350, freq: 'Every 3 months', issue: 'W/O/R', tests: { ...clear }, tested: '2026-05-07', defer: null },
  { id: 2, n: 'Muhammad Ayaz', g: 'B+', gx: 'Male', p: '0333 7828121', c: 'Pishin', last: '2026-07-19', times: 2, mr: 'PSH-0088', dob: '1998-11-02', emg: 'Rehmat Ullah', emgr: 'Cousin', addr: 'Band Road, Pishin', ml: 450, freq: 'Every 6 months', issue: 'W/R', tests: { ...clear }, tested: '2026-07-19', defer: null },
  { id: 3, n: 'Gulnaz Bibi Achakzai', g: 'A+', gx: 'Female', p: '0312 2044810', c: 'Quetta', last: null, times: 0, mr: 'QTA-0311', dob: '1986-06-30', emg: 'Sana Gul', emgr: 'Sister', addr: 'Sariab Road, Quetta', ml: 350, freq: 'Every year', issue: 'W/O/R', tests: null, tested: null, defer: null },
  { id: 4, n: 'Hameedullah Tareen', g: 'O−', gx: 'Male', p: '0301 3390211', c: 'Quetta', last: '2026-04-01', times: 2, mr: 'QTA-0287', dob: '1994-01-09', emg: 'Hidayat Khan', emgr: 'Father', addr: 'Jinnah Road, Quetta', ml: 350, freq: 'Every 3 months', issue: 'W/O/R', tests: { ...clear }, tested: '2026-04-01', defer: null },
  { id: 5, n: 'Shah Muhammad', g: 'AB+', gx: 'Male', p: '0345 8102299', c: 'Zhob', last: '2026-06-06', times: 3, mr: 'ZHB-0074', dob: '1989-08-21', emg: 'Shah Nawaz', emgr: 'Brother', addr: 'Sharbat Khan Road, Zhob', ml: 450, freq: 'Every 6 months', issue: 'W/O/R', tests: { ...clear }, tested: '2026-06-06', defer: null },
  { id: 6, n: 'Zahoor Ahmed Kasi', g: 'O+', gx: 'Male', p: '0322 5541780', c: 'Loralai', last: '2026-01-09', times: 6, mr: 'LRL-0119', dob: '1979-04-17', emg: 'Zahoor Bibi', emgr: 'Wife', addr: 'Sayed Abdul Qadir Road, Loralai', ml: 350, freq: 'Every 6 months', issue: 'W/R', tests: { ...clear }, tested: '2026-01-09', defer: null },
  { id: 7, n: 'Bilal Khan Nasar', g: 'B−', gx: 'Male', p: '0311 7788321', c: 'Quetta', last: '2026-07-02', times: 1, mr: 'QTA-0402', dob: '2001-12-05', emg: 'Nasar Khan', emgr: 'Father', addr: 'Killi Shabo, Quetta', ml: 350, freq: 'Every 3 months', issue: 'W/O/R', tests: { ...clear }, tested: '2026-07-02', defer: null },
  { id: 8, n: 'Sanaullah Mandokhail', g: 'A−', gx: 'Male', p: '0335 9021144', c: 'Muslim Bagh', last: '2026-03-06', times: 2, mr: 'MSB-0033', dob: '1992-03-28', emg: 'Sanaullah Khan', emgr: 'Brother', addr: 'Bazaar Road, Muslim Bagh', ml: 350, freq: 'Every year', issue: 'W/O/R', tests: { ...clear }, tested: '2026-03-06', defer: null },
  { id: 9, n: 'Israrullah Khan', g: 'O−', gx: 'Male', p: '0313 5590128', c: 'Quetta', last: '2026-02-19', times: 6, mr: 'QTA-0198', dob: '1984-09-12', emg: 'Israr Bibi', emgr: 'Wife', addr: 'Alamdar Road, Quetta', ml: 450, freq: 'Every 3 months', issue: 'W/O/R', tests: { ...clear }, tested: '2026-02-19', defer: null },
  { id: 10, n: 'Noor Muhammad Shahwani', g: 'O−', gx: 'Male', p: '0344 2201933', c: 'Quetta', last: '2026-01-18', times: 1, mr: 'QTA-0356', dob: '1996-05-23', emg: 'Noor Ahmed', emgr: 'Brother', addr: 'Brewery Road, Quetta', ml: 350, freq: 'Every 6 months', issue: 'W/O/R', tests: { ...clear }, tested: '2026-01-18', defer: null },
  { id: 11, n: 'Waheed Achakzai', g: 'O−', gx: 'Male', p: '0300 8811274', c: 'Quetta', last: '2025-12-07', times: 3, mr: 'KCH-0021', dob: '1988-10-08', emg: 'Waheed Gul', emgr: 'Cousin', addr: 'Kuchlak Bazaar', ml: 350, freq: 'Every year', issue: 'W/O/R', tests: { ...clear }, tested: '2025-12-07', defer: null },
  { id: 12, n: 'Farida Raisani', g: 'O−', gx: 'Female', p: '0332 4419902', c: 'Quetta', last: null, times: 0, mr: 'QTA-0433', dob: '2000-07-19', emg: 'Farhan Raisani', emgr: 'Brother', addr: 'Samungli Road, Quetta', ml: 350, freq: 'Every 6 months', issue: 'W/O/R', tests: null, tested: null, defer: null },
  { id: 13, n: 'Gul Khan Tareen', g: 'A+', gx: 'Male', p: '0300 4412876', c: 'Zhob', last: '2026-06-28', times: 5, mr: 'ZHB-0090', dob: '1990-02-02', emg: 'Gul Bibi', emgr: 'Mother', addr: 'Sharbat Khan Road, Zhob', ml: 450, freq: 'Every 3 months', issue: 'W/R', tests: { ...clear }, tested: '2026-06-28', defer: null },
  { id: 14, n: 'Rehmana Bibi', g: 'B+', gx: 'Female', p: '0345 1129983', c: 'Pishin', last: null, times: 0, mr: 'PSH-0102', dob: '1997-06-14', emg: 'Rehmat Gul', emgr: 'Brother', addr: 'Band Road, Pishin', ml: 350, freq: 'Every year', issue: 'W/O/R', tests: null, tested: null, defer: null },
];

export interface AdminRequest {
  id: string; pt: string; hosp: string; g: string; u: number; c: string; urg: string;
  by: string; ph: string; minsAgo: number; st: 'open' | 'done'; src: string;
}

export const REQUESTS: AdminRequest[] = [
  { id: 'PBB-1006', pt: 'Bibi Zarina', hosp: 'Civil Hospital, Quetta', g: 'O−', u: 3, c: 'Quetta', urg: 'Critical - today', by: 'Brother', ph: '0300 4412201', minsAgo: 22, st: 'open', src: 'web' },
  { id: 'PBB-1005', pt: 'Abdul Wahid', hosp: 'BMC, Quetta', g: 'B−', u: 2, c: 'Quetta', urg: 'Urgent - within 2 days', by: 'Father', ph: '0333 5590128', minsAgo: 60, st: 'open', src: 'phone' },
  { id: 'PBB-1004', pt: 'Gul Bibi', hosp: 'DHQ Hospital, Zhob', g: 'A+', u: 1, c: 'Zhob', urg: 'Planned - a date is set', by: 'Son', ph: '0345 2201933', minsAgo: 180, st: 'open', src: 'phone' },
  { id: 'PBB-0998', pt: 'Sultan Ahmed', hosp: 'Sandeman Hospital', g: 'A−', u: 1, c: 'Quetta', urg: 'Urgent - within 2 days', by: 'Friend', ph: '0311 8811274', minsAgo: 1440, st: 'done', src: 'web' },
];

export const DONATIONS_TODAY: [string, string, string, number, string][] = [
  ['2026-08-09', 'Sultan Ahmed', 'A−', 1, 'Quetta'],
  ['2026-08-09', 'Zarak Khan', 'O+', 1, 'Quetta'],
];

export function agoLabel(mins: number): string {
  return mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.floor(mins / 60)} hr ago` : `${Math.floor(mins / 1440)} d ago`;
}
