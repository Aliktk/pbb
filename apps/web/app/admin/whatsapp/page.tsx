import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { ActionButton } from '../../../components/ActionButton';

// WhatsApp assistant, ported from pbb-admin4.js (PAGES['admin/whatsapp']). Behind a flag: it is
// disabled until the WhatsApp business number is approved (the .soonbar coming-soon state). The
// board columns already exist because every request and donor carries a source — desk, website or
// WhatsApp — so nothing has to be rebuilt when the number arrives; it simply starts filling.

const ASSISTANT: [string, string][] = [
  ['Take a blood request', 'Somebody messages the number. The assistant asks the same questions as the form and the request appears on the board — marked as coming from WhatsApp.'],
  ['Register a donor', 'Name, group, town, phone. Straight onto the register, marked unverified until a coordinator confirms it.'],
  ['Alert donors', 'When a request opens, the assistant messages eligible donors in that town — the least recently contacted first, never twice in a day.'],
  ['Answer the usual questions', 'Who can donate, where the branches are, what exchange means. Passed to a person the moment it becomes a real conversation.'],
];

const BOARD: [string, number][] = [
  ['Waiting on us', 3],
  ['Being handled', 2],
  ['Passed to a person', 1],
  ['Closed', 0],
];

const CARD_TITLES = ['Needs O− at BMC', 'Wants to register', 'Asking about exchange', 'Camp timings', 'Thalassemia schedule', 'Where is Pishin branch'];

export default function AdminWhatsApp() {
  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <ActionButton className="btn btn-o btn-s" message="Connecting the WhatsApp business number wires to the API">Connect a number</ActionButton>
    </>
  );

  return (
    <AdminShell view="whatsapp" title="WhatsApp" subtitle="Waiting on the business number" actions={actions}>
      <div className="soonbar">
        <div><b>Not connected yet.</b> Everything below is built and waiting for the WhatsApp business number to be approved. Nothing else has to change when it arrives.</div>
        <span className="tag gy">Ready when you are</span>
      </div>

      <div className="g2" style={css('gap:18px;align-items:start')}>
        <div className="acard">
          <h3 style={css('margin-bottom:6px')}>What the assistant will do</h3>
          <p className="sm" style={css('margin-bottom:18px')}>The same four things the desk does, in the language the person writes in.</p>
          {ASSISTANT.map(([t, d]) => (
            <div className="waitem" key={t}><b>{t}</b><p>{d}</p></div>
          ))}
        </div>

        <div>
          <div className="acard">
            <h3 style={css('margin-bottom:6px')}>The board it will fill</h3>
            <p className="sm" style={css('margin-bottom:16px')}>Conversations arrive here beside everything else, not in somebody&apos;s personal phone.</p>
            <div className="wacols">
              {BOARD.map(([t, n]) => (
                <div className="wacol" key={t}>
                  <div className="wch">{t}<span>{n}</span></div>
                  {n ? (
                    Array.from({ length: n }, (_, i) => (
                      <div className="wcard" key={i}>
                        <div className="sm">+92 3•• ••• ••••</div>
                        <div style={css('font-weight:600;margin-top:4px')}>{CARD_TITLES[i % 6]}</div>
                      </div>
                    ))
                  ) : (
                    <div className="sm" style={css('padding:8px 2px')}>—</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="acard" style={css('margin-top:18px')}>
            <h3 style={css('margin-bottom:6px')}>Why it is drawn now</h3>
            <p className="sm">Because the columns for it exist already. Every request and every donor in this system carries a <b>source</b> — desk, website, or WhatsApp — so when the number is approved nothing needs rebuilding. It simply starts filling.</p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
