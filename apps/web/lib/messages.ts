import { supabase } from './supabaseClient';

// Inbox messages (public-form arrivals), backed by Supabase. RLS (0005) lets the public insert
// and scopes staff reads to their office. This is the ONE place the web reads/writes the inbox.

export type MessageKind = 'message' | 'volunteer' | 'partner' | 'organisation' | 'donor' | 'donation';

export interface InboxMessage {
  id: string;
  kind: MessageKind;
  name: string | null;
  org: string | null;
  phone: string | null;
  email: string | null;
  town_id: string | null;
  detail: string | null;
  status: 'NEW' | 'ANSWERED';
  created_at: string;
}

export interface ContactInput {
  kind: MessageKind;
  name?: string;
  org?: string;
  phone?: string;
  email?: string;
  townId?: string | null;
  detail?: string;
}

export async function submitContactMessage(input: ContactInput): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert({
    kind: input.kind,
    name: input.name?.trim() || null,
    org: input.org?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    town_id: input.townId || null,
    detail: input.detail?.trim() || null,
    status: 'NEW',
  });
  if (error) throw new Error(error.message);
}

export async function fetchMessages(): Promise<InboxMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id,kind,name,org,phone,email,town_id,detail,status,created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as InboxMessage[];
}

export async function markMessageAnswered(id: string): Promise<void> {
  const { error } = await supabase.from('contact_messages').update({ status: 'ANSWERED' }).eq('id', id);
  if (error) throw new Error(error.message);
}
