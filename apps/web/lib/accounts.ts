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

// Update a person's display name (own row, or a row the caller may manage under profiles_manage).
export async function updateAccountName(id: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 200) throw new Error('Name must be between 1 and 200 characters.');
  const { error } = await supabase.from('profiles').update({ name: trimmed }).eq('id', id);
  if (error) throw new Error(error.message);
}

// Send a self-service password-reset email. The link returns the person to /admin/reset where
// they choose a new password. Requires the project's email (SMTP) + /admin/reset in the Auth
// redirect allow-list. Browser-only (anon key) — no elevated privilege needed.
export async function sendPasswordReset(email: string): Promise<void> {
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/admin/reset` : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
  if (error) throw new Error(error.message);
}

// Privileged ops go through the admin-users Edge Function (service role, head-office only).
// supabase.functions.invoke attaches the caller's JWT automatically so the function can authorize.
async function invokeAdminUsers(body: Record<string, unknown>): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-users', { body });
  if (error) {
    let message = error.message;
    // FunctionsHttpError carries the Response; surface the real server message when present.
    try {
      const parsed = await (error as { context?: { json?: () => Promise<{ error?: string }> } }).context?.json?.();
      if (parsed?.error) message = parsed.error;
    } catch {
      /* fall back to error.message */
    }
    throw new Error(message);
  }
  if (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) {
    throw new Error((data as { error: string }).error);
  }
}

// Head office force-sets an account's password (e.g. the person lost access and has no email).
export async function adminSetPassword(userId: string, password: string): Promise<void> {
  if (password.length < 8 || password.length > 128) {
    throw new Error('The new password must be between 8 and 128 characters.');
  }
  await invokeAdminUsers({ action: 'set-password', userId, password });
}

// Head office permanently deletes an account. The profile row cascades with the auth user.
export async function deleteAccount(userId: string): Promise<void> {
  await invokeAdminUsers({ action: 'delete-user', userId });
}
