'use client';

import { api } from './api';

export interface TownNetworkItem {
  id: string;
  name: string;
  standing: string; // e.g. 'Head office', 'Branch', 'Served from Quetta'
  isOffice?: boolean;
  donorsCount?: number;
  volunteersCount?: number;
  childrenCount?: number;
  openRequests: number;
  lastStockUpdate: string;
  officeAddress?: string;
  managerName?: string;
}

export const INITIAL_TOWNS_NETWORK: TownNetworkItem[] = [
  { id: 't-1', name: 'Quetta', standing: 'Head office', openRequests: 0, lastStockUpdate: 'today', officeAddress: 'Quetta Press Club Central Office', managerName: 'Super Admin' },
  { id: 't-2', name: 'Pishin', standing: 'Branch', openRequests: 0, lastStockUpdate: 'today', officeAddress: 'Band Road Main Desk', managerName: 'Hameed Ullah' },
  { id: 't-3', name: 'Loralai', standing: 'Branch', openRequests: 0, lastStockUpdate: '2 days ago', officeAddress: 'Civil Hospital Road', managerName: 'Bilal Ahmad' },
  { id: 't-4', name: 'Zhob', standing: 'Branch', openRequests: 0, lastStockUpdate: '9 days ago', officeAddress: 'Main Cantt Road', managerName: 'Malik Rahim' },
  { id: 't-5', name: 'Chaman', standing: 'Branch', openRequests: 0, lastStockUpdate: 'never', officeAddress: 'Bypass Highway Desk', managerName: 'Abdul Manan' },
  { id: 't-6', name: 'Muslim Bagh', standing: 'Branch', openRequests: 0, lastStockUpdate: '4 days ago', officeAddress: 'Bazar Center', managerName: 'Sana Gul' },
  { id: 't-7', name: 'Killa Saifullah', standing: 'Served Town', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-8', name: 'Dukki', standing: 'Served Town', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-9', name: 'Musakhel', standing: 'Served Town', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-10', name: 'Sherani', standing: 'Served Town', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-11', name: 'Harnai', standing: 'Served Town', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-12', name: 'Ziarat', standing: 'Served Town', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-13', name: 'Qila Abdullah', standing: 'Served Town', openRequests: 0, lastStockUpdate: '-' },
  { id: 't-14', name: 'Sibi', standing: 'Served Town', openRequests: 0, lastStockUpdate: '-' },
];

let memoryTowns: TownNetworkItem[] = [...INITIAL_TOWNS_NETWORK];

export function getNetworkTowns(): TownNetworkItem[] {
  if (typeof window === 'undefined') return memoryTowns;
  try {
    const saved = localStorage.getItem('pbb_network_towns');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return memoryTowns;
}

export function setMemoryTowns(towns: TownNetworkItem[], notify = false) {
  memoryTowns = towns;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('pbb_network_towns', JSON.stringify(towns));
      if (notify) {
        window.dispatchEvent(new Event('pbb_towns_updated'));
      }
    } catch {}
  }
}

export function getTownNamesList(): string[] {
  const current = getNetworkTowns();
  return current.map((t) => t.name);
}

export async function syncTownsFromApi(): Promise<TownNetworkItem[]> {
  try {
    const res = await api.get<{ data: Array<{ id: string; name: string; isOffice?: boolean }> }>('/towns');
    if (res.data && res.data.length > 0) {
      const current = getNetworkTowns();
      const currentNames = current.map((t) => t.name).sort().join(',');
      const newNames = res.data.map((t) => t.name).sort().join(',');
      const hasChanged = currentNames !== newNames;

      const currentMap = new Map(current.map((t) => [t.name.toLowerCase(), t]));
      const synced: TownNetworkItem[] = res.data.map((dbTown) => {
        const existing = currentMap.get(dbTown.name.toLowerCase());
        if (existing) return { ...existing, id: dbTown.id, name: dbTown.name };
        return {
          id: dbTown.id,
          name: dbTown.name,
          standing: dbTown.isOffice ? 'Branch' : 'Served Town',
          openRequests: 0,
          lastStockUpdate: 'today',
        };
      });

      setMemoryTowns(synced, hasChanged);
      return synced;
    }
  } catch {}
  return getNetworkTowns();
}

export function saveNetworkTowns(towns: TownNetworkItem[]) {
  setMemoryTowns(towns, true);
}
