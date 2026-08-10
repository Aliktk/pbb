import { redirect } from 'next/navigation';

// /admin → sign-in (the account decides the landing screen after auth).
export default function AdminIndex() {
  redirect('/admin/login');
}
