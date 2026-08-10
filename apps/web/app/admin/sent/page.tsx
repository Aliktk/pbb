import Link from 'next/link';
import { css } from '../../../lib/style';
import { LoginShell } from '../../../components/admin/LoginShell';

// Reset link sent confirmation.
export default function AdminSent() {
  return (
    <LoginShell>
      <div className="tick">✓</div>
      <h2 style={css('margin-bottom:6px')}>Check your email</h2>
      <p className="muted" style={css('margin-bottom:24px;font-size:14.5px')}>
        If that address belongs to an account, a link is on its way. It stops working after one hour, or as
        soon as you have used it.
      </p>
      <Link href="/admin/login" className="btn btn-p" style={css('width:100%;padding:15px')}>Back to sign in</Link>
      <p className="sm" style={css('margin-top:18px')}>Nothing after a few minutes? Look in the spam folder, then telephone 081-2836820.</p>
    </LoginShell>
  );
}
