import { supabase } from './supabaseClient';
import type { RoleKey } from './roles';

// Account register, backed by Supabase. Row Level Security (0003) already scopes every call:
// head office sees all offices; an office manager sees only their own office. The frontend adds
// NO permission logic of its own - it just reads and writes, and the database decides.

export interface StaffAccount {
  id: string;
  name: string;
  email: string | null;
  role_key: RoleKey;
  town_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AccountInvite {
  email: string;
  name: string;
  role_key: RoleKey;
  town_id: string | null;
  created_at: string;
}

export interface CreateInviteInput {
  email: string;
  name: string;
  role_key: RoleKey;
  town_id: string | null;
}

// Active (or suspended) accounts the caller is allowed to see.
export async function fetchStaff(): Promise<StaffAccount[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,name,email,role_key,town_id,is_active,created_at')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as StaffAccount[];
}

// Invitations that have not been accepted yet (the person has not signed up).
export async function fetchInvites(): Promise<AccountInvite[]> {
  const { data, error } = await supabase
    .from('account_invites')
    .select('email,name,role_key,town_id,created_at')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as AccountInvite[];
}

// Create an invitation. The person activates it by signing up with this email (a trigger turns
// the invite into their profile). RLS refuses invites the caller is not allowed to make.
export async function createInvite(input: CreateInviteInput): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from('account_invites').insert({
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    role_key: input.role_key,
    town_id: input.town_id,
    invited_by: auth.user?.id ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function deleteInvite(email: string): Promise<void> {
  const { error } = await supabase.from('account_invites').delete().eq('email', email.toLowerCase());
  if (error) throw new Error(error.message);
}

export async function setAccountActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateAccountRoleTown(id: string, roleKey: RoleKey, townId: string | null): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role_key: roleKey, town_id: townId }).eq('id', id);
  if (error) throw new Error(error.message);
}
