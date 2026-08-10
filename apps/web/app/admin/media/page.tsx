'use client';

import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { ImageSlot } from '../../../components/ImageSlot';

const MEDIA_LABELS = ['Camp', 'Ambulance', 'Building', 'Thalassemia', 'Eid', 'Staff', 'Camp', 'Awareness', 'Building', 'Camp'];

export default function AdminMedia() {
  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <button className="btn btn-p btn-s" onClick={() => alert('Upload — wires to the media library / Supabase Storage (T7).')}>+ Upload</button>
    </>
  );

  return (
    <AdminShell view="media" title="Media" subtitle="10 files" actions={actions}>
      <div className="dropzone">Drag photographs, posters or PDFs here</div>
      <div className="medgrid">
        {MEDIA_LABELS.map((label, i) => (
          <div key={i} className="medcard">
            <ImageSlot ratio="1" placeholder="Drop a photo" />
            <div style={css('padding:10px')}>
              <div className="sm">{label}</div>
              <span className={`tag ${i % 3 ? 'gy' : 'ok'}`} style={css('margin-top:6px')}>{i % 3 ? 'Not used' : 'Used ×' + (i + 1)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="g2" style={css('gap:18px;margin-top:18px')}>
        <div className="acard">
          <h3 style={css('margin-bottom:6px')}>Upload once, use anywhere</h3>
          <p className="sm">The gallery, publications, events, people and any page block all pick from this one library. &quot;Used ×3&quot; stops anyone deleting a photo that is live on three pages.</p>
        </div>
        <div className="acard" style={css('border-color:#F0BDB6')}>
          <h3 style={css('margin-bottom:6px;color:var(--red-d)')}>Consent flag</h3>
          <p className="sm">Photographs of patients or children carry a consent flag. Without it, the picker refuses to place the image on a public page — it is enforced, not a policy on paper.</p>
        </div>
      </div>
    </AdminShell>
  );
}
