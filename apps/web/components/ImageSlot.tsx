import { Fragment, type CSSProperties } from 'react';
import { css } from '../lib/style';

interface ImageSlotProps {
  /** Faint placeholder caption describing the intended image (may contain <br>). */
  placeholder?: string;
  /** aspect-ratio value, e.g. "16/9", "4/4.4". */
  ratio?: string;
  /** extra inline style text, appended (e.g. "border-radius:0;min-height:520px"). */
  style?: string;
}

/**
 * The prototype's empty image box (`.ph` + `<image-slot>`). Renders a labelled placeholder
 * until real media is wired (media library / Supabase Storage in T7). Kept as a component
 * so every empty slot is consistent and swapping in a real <Image> later is one change.
 */
export function ImageSlot({ placeholder = '', ratio = '16/9', style = '' }: ImageSlotProps) {
  const boxStyle: CSSProperties = { aspectRatio: ratio, ...css(style) };
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
