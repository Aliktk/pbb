import { Fragment, type CSSProperties } from 'react';
import { css } from '../lib/style';

interface ImageSlotProps {
  /** Faint placeholder caption describing the intended image (may contain <br>). */
  placeholder?: string;
  /** aspect-ratio value, e.g. "16/9", "4/4.4". */
  ratio?: string;
  /** extra inline style text, appended (e.g. "border-radius:0;min-height:520px"). */
  style?: string;
  /** Optional real image URL. When set, the photo fills the slot; the placeholder text
   *  becomes its alt text. Design-phase stand-ins live in lib/images.ts and are swapped for
   *  consented PBB media (media library / Supabase Storage) later. */
  src?: string;
  /** Explicit alt text; falls back to the (stripped) placeholder caption. */
  alt?: string;
}

/**
 * The prototype's image box (`.ph` + `<image-slot>`). Renders a real photograph when `src` is
 * given, otherwise a labelled placeholder describing the intended image. Kept as one component
 * so every slot is consistent and swapping in real media later is a single change.
 */
export function ImageSlot({ placeholder = '', ratio = '16/9', style = '', src, alt }: ImageSlotProps) {
  const boxStyle: CSSProperties = { aspectRatio: ratio, overflow: 'hidden', ...css(style) };
  const caption = placeholder.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').trim();

  if (src) {
    return (
      <div className="ph" style={boxStyle}>
        {/* Plain <img> by design: remote stand-in, no next/image remote-domain config in the design phase. */}
        <img
          src={src}
          alt={alt ?? caption}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }

  // Split on <br> (author copy) and render as real line breaks — no innerHTML.
  const lines = placeholder.split(/<br\s*\/?>/i);
  return (
    <div className="ph" style={boxStyle}>
      <span
        aria-hidden
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '18px',
          textAlign: 'center',
          fontSize: 12.5,
          lineHeight: 1.5,
          color: 'var(--mid)',
          fontWeight: 600,
        }}
      >
        {lines.map((line, i) => (
          <Fragment key={i}>
            {line.replace(/<[^>]+>/g, '')}
            {i < lines.length - 1 ? <br /> : null}
          </Fragment>
        ))}
      </span>
    </div>
  );
}
