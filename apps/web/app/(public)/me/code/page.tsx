import { redirect } from 'next/navigation';

// The old SMS/OTP step is gone (we do not run an SMS service). Send anyone here to the
// contact-a-branch record page instead.
export default function MeCode() {
  redirect('/me/signin');
}
