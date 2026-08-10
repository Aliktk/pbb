// Minimal imperative toast — no context/provider needed, so any client component can call
// it. Used for design-phase actions that will write to the API once the backend is wired,
// so no control is ever silently dead (INV-9). Guarded for SSR.
export function showToast(message: string): void {
  if (typeof document === 'undefined') return;
  let el = document.getElementById('pbb-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'pbb-toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  const existing = Number(el.dataset.timer || 0);
  if (existing) window.clearTimeout(existing);
  el.dataset.timer = String(window.setTimeout(() => el?.classList.remove('show'), 2600));
}
