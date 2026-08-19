import { redirect } from 'next/navigation';

// There is no online donor sign-in (no SMS/OTP service). The record is handled at a branch, so
// send anyone here to the contact-a-branch page.
export default function Me() {
  redirect('/me/signin');
}
