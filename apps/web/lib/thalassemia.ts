import { supabase } from './supabaseClient';

// Thalassemia register, read straight from `thalassemia_patients` with the town name joined in.
// RLS scopes every read/write to the caller's town (0011), so the browser only ever sees and
// touches records it is allowed to. This is the ONE place the web reads/writes thalassemia
// children from.

export interface ThalPatient {
  id: string;
  name: string;
  dateOfBirth: string | null;
  bloodGroup: string;
  rhFactor: string;
  guardianName: string | null;
  guardianPhone: string | null;
  townId: string;
  town: string | null;
  transfusionIntervalDays: number;
  nextTransfusionDue: string | null;
  hospital: string | null;
  photoConsent: boolean;
}

interface RawPatient {
  id: string;
  name: string;
  dateOfBirth: string | null;
  bloodGroup: string;
  rhFactor: string;
  guardianName: string | null;
  guardianPhone: string | null;
  townId: string;
  transfusionIntervalDays: number | null;
  nextTransfusionDue: string | null;
  hospital: string | null;
  photoConsent: boolean;
  town?: { name: string | null } | null;
}

function mapPatient(r: RawPatient): ThalPatient {
  return {
    id: r.id,
    name: r.name,
    dateOfBirth: r.dateOfBirth,
    bloodGroup: r.bloodGroup,
    rhFactor: r.rhFactor,
    guardianName: r.guardianName,
    guardianPhone: r.guardianPhone,
    townId: r.townId,
    town: r.town?.name ?? null,
    transfusionIntervalDays: r.transfusionIntervalDays ?? 21,
    nextTransfusionDue: r.nextTransfusionDue,
    hospital: r.hospital,
    photoConsent: r.photoConsent,
  };
}

// PostgREST embeds the joined town via the FK (aliased `town:towns`), matching donations/volunteers.
// The caller gets the town name without a second round-trip; RLS still confines rows to the town.
const SELECT = 'id,name,dateOfBirth,bloodGroup,rhFactor,guardianName,guardianPhone,townId,transfusionIntervalDays,nextTransfusionDue,hospital,photoConsent,town:towns(name)';

export async function fetchPatients(): Promise<ThalPatient[]> {
  const { data, error } = await supabase
    .from('thalassemia_patients')
    .select(SELECT)
    .order('nextTransfusionDue', { ascending: true, nullsFirst: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as RawPatient[]).map(mapPatient);
}

async function fetchPatientById(id: string): Promise<ThalPatient | null> {
  const { data, error } = await supabase
    .from('thalassemia_patients')
    .select(SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapPatient(data as unknown as RawPatient) : null;
}

export interface NewPatientInput {
  name: string;
  dateOfBirth: string;
  bloodGroup: string;
  rhFactor: string;
  guardianName: string;
  guardianPhone?: string | null;
  townId: string;
  photoConsent: boolean;
}

// Register a child. branchId is not part of this model (town scopes the record); id/updatedAt get
// their DB defaults from 0011. The written row is read back so the caller gets the joined town name.
export async function createPatient(input: NewPatientInput): Promise<ThalPatient> {
  const row: Record<string, unknown> = {
    name: input.name,
    dateOfBirth: input.dateOfBirth,
    bloodGroup: input.bloodGroup,
    rhFactor: input.rhFactor,
    guardianName: input.guardianName,
    guardianPhone: input.guardianPhone ?? null,
    townId: input.townId,
    photoConsent: input.photoConsent,
  };
  const { data, error } = await supabase.from('thalassemia_patients').insert(row).select('id').single();
  if (error) throw new Error(error.message);
  const patient = await fetchPatientById(data.id as string);
  if (!patient) throw new Error('Patient saved but could not be read back.');
  return patient;
}

export interface PatientPatch {
  name?: string;
  bloodGroup?: string;
  rhFactor?: string;
  guardianName?: string;
  guardianPhone?: string | null;
  townId?: string;
  photoConsent?: boolean;
}

export async function updatePatient(id: string, patch: PatientPatch): Promise<ThalPatient> {
  const { error } = await supabase.from('thalassemia_patients').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
  const patient = await fetchPatientById(id);
  if (!patient) throw new Error('Patient updated but could not be read back.');
  return patient;
}

export async function deletePatient(id: string): Promise<void> {
  const { error } = await supabase.from('thalassemia_patients').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Record a completed transfusion: push nextTransfusionDue forward by the child's interval. The
// interval defaults to 21 days when the row does not carry one.
export async function recordTransfusion(id: string, intervalDays: number): Promise<ThalPatient> {
  const days = Number.isFinite(intervalDays) && intervalDays > 0 ? intervalDays : 21;
  const next = new Date(Date.now() + days * 86400000).toISOString();
  const { error } = await supabase
    .from('thalassemia_patients')
    .update({ nextTransfusionDue: next })
    .eq('id', id);
  if (error) throw new Error(error.message);
  const patient = await fetchPatientById(id);
  if (!patient) throw new Error('Transfusion recorded but the record could not be read back.');
  return patient;
}
