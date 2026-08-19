import { redirect } from 'next/navigation';

// Removal is done at a branch (staff confirm identity in person / by phone), since there is no
// online sign-in. Send anyone here to the contact-a-branch record page.
export default function MeRemove() {
  redirect('/me/signin');
}
