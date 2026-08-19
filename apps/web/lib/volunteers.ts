import { supabase } from './supabaseClient';

// Volunteers, read/written straight from the `volunteers` table (Supabase-direct, BCP model).
// RLS scopes every row to the caller's town (head office sees all) - see 0012_volunteers.sql.
// This is the ONE place the web reads/writes volunteers from.

// The page pipeline has three stages; the DB enum (VolunteerStatus) has three values. Map them
// 1:1 in both directions so the UI keeps its labels while the DB stays the source of truth.
export type VolStage = 'new' | 'contacted' | 'active';
type VolunteerStatus = 'APPLIED' | 'ACTIVE' | 'INACTIVE';

function stageToStatus(stage: VolStage): VolunteerStatus {
  if (stage === 'active') return 'ACTIVE';
  if (stage === 'contacted') return 'INACTIVE';
  return 'APPLIED';
}

function statusToStage(status: string): VolStage {
  if (status === 'ACTIVE') return 'active';
  if (status === 'APPLIED') return 'new';
  return 'contacted';
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  town: string;
  townId: string | null;
  skills: string[];
  stage: VolStage;
  createdAt: string;
}

interface RawVolunteer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  townId: string | null;
  skills: string | null;
  status: string;
  createdAt: string;
  town?: { name: string | null } | null;
}

function mapVolunteer(r: RawVolunteer): Volunteer {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone ?? '',
    email: r.email ?? undefined,
    town: r.town?.name ?? r.townId ?? '',
    townId: r.townId,
    skills: r.skills ? r.skills.split(',').map((s) => s.trim()).filter(Boolean) : ['Camps'],
    stage: statusToStage(r.status),
    createdAt: r.createdAt,
  };
}

// Read the volunteer + its town name via the towns FK. RLS confines the result to the caller's
// scope, so no explicit town filter is needed here.
const SELECT = 'id,name,phone,email,townId,skills,status,createdAt,town:towns(name)';

export async function fetchVolunteers(): Promise<Volunteer[]> {
  const { data, error } = await supabase
    .from('volunteers')
    .select(SELECT)
    .order('createdAt', { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as RawVolunteer[]).map(mapVolunteer);
}

async function fetchVolunteerById(id: string): Promise<Volunteer | null> {
  const { data, error } = await supabase.from('volunteers').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapVolunteer(data as unknown as RawVolunteer) : null;
}

export interface NewVolunteerInput {
  name: string;
  phone: string;
  email?: string | null;
  townId: string;
  skills: string[];
}

// Register a volunteer. The town scopes the record and RLS confines the insert to the caller's
// town. The written row is read back (with its town name) so the caller gets the display shape.
export async function createVolunteer(input: NewVolunteerInput): Promise<Volunteer> {
  const row: Record<string, unknown> = {
    name: input.name,
    phone: input.phone,
    townId: input.townId,
    skills: input.skills.length ? input.skills.join(', ') : null,
    status: 'APPLIED',
  };
  if (input.email) row.email = input.email;
  const { data, error } = await supabase.from('volunteers').insert(row).select('id').single();
  if (error) throw new Error(error.message);
  const volunteer = await fetchVolunteerById(data.id as string);
  if (!volunteer) throw new Error('Volunteer saved but could not be read back.');
  return volunteer;
}

export interface VolunteerPatch {
  name?: string;
  phone?: string;
  email?: string | null;
  townId?: string;
  skills?: string[];
}

export async function updateVolunteer(id: string, patch: VolunteerPatch): Promise<Volunteer> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.townId !== undefined) row.townId = patch.townId;
  if (patch.skills !== undefined) row.skills = patch.skills.length ? patch.skills.join(', ') : null;

  const { error } = await supabase.from('volunteers').update(row).eq('id', id);
  if (error) throw new Error(error.message);
  const volunteer = await fetchVolunteerById(id);
  if (!volunteer) throw new Error('Volunteer updated but could not be read back.');
  return volunteer;
}

export async function deleteVolunteer(id: string): Promise<void> {
  const { error } = await supabase.from('volunteers').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Move a volunteer along the pipeline (new -> contacted -> active). Writes the mapped enum value
// and reads the row back so the caller gets the canonical stage from the DB.
export async function setVolunteerStage(id: string, stage: VolStage): Promise<Volunteer> {
  const { error } = await supabase.from('volunteers').update({ status: stageToStatus(stage) }).eq('id', id);
  if (error) throw new Error(error.message);
  const volunteer = await fetchVolunteerById(id);
  if (!volunteer) throw new Error('Stage updated but the volunteer could not be read back.');
  return volunteer;
}
