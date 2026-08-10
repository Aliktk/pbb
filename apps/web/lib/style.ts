import type { CSSProperties } from 'react';

/**
 * Parse a CSS declaration string ("margin-top:18px;max-width:62ch") into a React style
 * object. Lets us port the prototype's inline styles verbatim, keeping the design pixel-
 * faithful, while staying valid JSX (React only accepts object styles, not strings).
 */
export function css(text: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const decl of text.split(';')) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    if (!prop || !value) continue;
    // custom properties (--red) stay as-is; others camelCase (margin-top -> marginTop)
    const key = prop.startsWith('--')
      ? prop
      : prop.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
    style[key] = value;
  }
  return style as CSSProperties;
}
