'use client';

export interface TownNetworkItem {
  id: string;
  name: string;
  standing: string; // e.g. 'Head office', 'Branch', 'Served from Quetta'
  openRequests: number;
  lastStockUpdate: string;
  officeAddress?: string;
  managerName?: string;
}

export const INITIAL_TOWNS_NETWORK: TownNetworkItem[] = [
  { id: 't-1', name: 'Quetta', standing: 'Head office', openRequests: 4, lastStockUpdate: 'today', officeAddress: 'Quetta Press Club Central Office', managerName: 'Super Admin' },
  { id: 't-2', name: 'Pishin', standing: 'Branch', openRequests: 1, lastStockUpdate: 'today', officeAddress: 'Band Road Main Desk', managerName: 'Hameed Ullah' },
  { id: 't-3', name: 'Loralai', standing: 'Branch', openRequests: 0, lastStockUpdate: '2 days ago', officeAddress: 'Civil Hospital Road', managerName: 'Bilal Ahmad' },
  { id: 't-4', name: 'Zhob', standing: 'Branch', openRequests: 1, lastStockUpdate: '9 days ago', officeAddress: 'Main Cantt Road', managerName: 'Malik Rahim' },
  { id: 't-5', name: 'Chaman', standing: 'Branch', openRequests: 0, lastStockUpdate: 'never', officeAddress: 'Bypass Highway Desk', managerName: 'Abdul Manan' },
  { id: 't-6', name: 'Muslim Bagh', standing: 'Branch', openRequests: 0, lastStockUpdate: '4 days ago', officeAddress: 'Bazar Center', managerName: 'Sana Gul' },
  { id: 't-7', name: 'Killa Saifullah', standing: 'Served from Muslim Bagh', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-8', name: 'Dukki', standing: 'Served from Loralai', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-9', name: 'Musakhel', standing: 'Served from Loralai', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-10', name: 'Sherani', standing: 'Served from Zhob', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-11', name: 'Harnai', standing: 'Served from Quetta', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-12', name: 'Ziarat', standing: 'Served from Quetta', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-13', name: 'Qila Abdullah', standing: 'Served from Chaman', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-14', name: 'Sibi', standing: 'Served from Quetta', openRequests: 0, lastStockUpdate: '-' },
];

export function getNetworkTowns(): TownNetworkItem[] {
  if (typeof window === 'undefined') return INITIAL_TOWNS_NETWORK;
  try {
    const saved = localStorage.getItem('pbb_network_towns');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_TOWNS_NETWORK;
}

export function getTownNamesList(): string[] {
  return getNetworkTowns().map((t) => t.name);
}

export function saveNetworkTowns(towns: TownNetworkItem[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('pbb_network_towns', JSON.stringify(towns));
      window.dispatchEvent(new Event('pbb_towns_updated'));
    } catch {}
  }
}
