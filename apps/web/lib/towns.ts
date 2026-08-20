'use client';

import { supabase } from './supabaseClient';

// Minimal town shape + live Supabase reader used by the Supabase-wired pages (donors, find, the
// public join/request forms). Kept alongside the network-town helpers below so both compile.
export interface Town {
  id: string;
  name: string;
}

export async function fetchTowns(): Promise<Town[]> {
  const { data, error } = await supabase.from('towns').select('id,name').order('name');
  if (error) throw new Error(error.message);
  return (data ?? []) as Town[];
}

// Create a town (head office only - enforced by the towns_insert policy in 0013). Returns the new
// town's network shape. is_office decides Branch vs Served Town standing.
export async function createTown(input: { name: string; isOffice: boolean }): Promise<TownNetworkItem> {
  const { data, error } = await supabase
    .from('towns')
    .insert({ name: input.name, is_office: input.isOffice })
    .select('id,name,is_office,is_head_office')
    .single();
  if (error) throw new Error(error.message);
  const row = data as { id: string; name: string; is_office: boolean | null; is_head_office: boolean | null };
  return {
    id: row.id,
    name: row.name,
    standing: row.is_head_office ? 'Head office' : row.is_office ? 'Branch' : 'Served Town',
    isOffice: Boolean(row.is_office),
    openRequests: 0,
    lastStockUpdate: '-',
  };
}

// Update a town's name / office standing (head office only - guarded by a trigger in 0013) and/or
// its address (head any town, manager own town - column grant + policy from 0006). Only send the
// columns that changed so a manager editing address never trips the name/is_office guard.
export interface TownUpdate {
  name?: string;
  isOffice?: boolean;
  address?: string | null;
}

export async function updateTown(id: string, patch: TownUpdate): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.isOffice !== undefined) row.is_office = patch.isOffice;
  if (patch.address !== undefined) row.address = patch.address;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from('towns').update(row).eq('id', id);
  if (error) throw new Error(error.message);
}

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

// Read every town (with its office standing + address) straight from Supabase for the network page.
// Public SELECT on towns is open (0001), so this works for any signed-in staff; RLS still applies.
// Health metrics (donors/requests counts) are intentionally left undefined here - the page shows a
// clear placeholder rather than a fabricated number. This is separate from the legacy localStorage
// network helpers below, which are being retired.
interface RawNetworkTown {
  id: string;
  name: string;
  is_office: boolean | null;
  is_head_office: boolean | null;
  address: string | null;
}

export async function fetchNetworkTowns(): Promise<TownNetworkItem[]> {
  const { data, error } = await supabase
    .from('towns')
    .select('id,name,is_office,is_head_office,address')
    .order('is_head_office', { ascending: false })
    .order('is_office', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as RawNetworkTown[]).map((t) => ({
    id: t.id,
    name: t.name,
    standing: t.is_head_office ? 'Head office' : t.is_office ? 'Branch' : 'Served Town',
    isOffice: Boolean(t.is_office),
    openRequests: 0,
    lastStockUpdate: '-',
    officeAddress: t.address ?? undefined,
  }));
}
