import { supabase } from './supabaseClient';

// Towns are public reference data (RLS grants anon + authenticated SELECT). This is the ONE
// place the app reads them from the database, so every office/town dropdown stays in sync.

export interface Town {
  id: string;
  name: string;
}

export async function fetchTowns(): Promise<Town[]> {
  const { data, error } = await supabase.from('towns').select('id,name').order('name');
  if (error) throw new Error(error.message);
  return (data ?? []) as Town[];
}
