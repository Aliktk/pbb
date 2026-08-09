/* @ds-bundle: {"format":4,"namespace":"Modernist_modern","components":[],"sourceHashes":{"image-slot.js":"fff26d081c8d","pbb-admin.js":"91e6e5e52cac","pbb-admin2.js":"d742f7fd6006","pbb-admin3.js":"fea700247452","pbb-admin4.js":"4c885ccd41c0","pbb-admin5.js":"c040317300ed","pbb-app.js":"87cf0fe7fff9","pbb-forms.js":"671f9c7d12fd","pbb-me.js":"0e7c20cb6866","pbb-pages.js":"2fb3953e2cdc","pbb-pages2.js":"6605c0f7d391"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.Modernist_modern = window.Modernist_modern || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// image-slot.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <image-slot> — user-fillable image placeholder.
 *
 * Drop this into a deck, mockup, or page wherever a design needs an image.
 * You control the slot's shape; it sizes to its container by default. When the search_stock_photos tool
 * is available, prefill the slot by default — write the photo's URL into
 * src (with credit/credit-href); the user can still fill or replace it
 * by dragging an image file onto it (or clicking to browse). The dropped
 * image persists across reloads via a .image-slots.state.json sidecar —
 * same read-via-fetch / write-via-window.omelette pattern as
 * design_canvas.jsx, so the filled slot shows on share links, downloaded
 * zips, and PPTX export. Outside the omelette runtime the slot is read-only.
 *
 * The sidecar is a SIBLING of the HTML file that uses this component: the
 * read is a document-relative fetch, and the host resolves the bridge's
 * sidecar writes into the previewed file's directory to match (same
 * contract as design_canvas.jsx). Pages in the same directory share one
 * sidecar; keep slot ids distinct across them.
 *
 * Attributes:
 *   id           Persistence key. REQUIRED for the drop to survive reload —
 *                every slot on the page needs a distinct id.
 *   shape        'rect' | 'rounded' | 'circle' | 'pill'   (default 'rounded')
 *                'circle' applies 50% border-radius; on a non-square slot
 *                that's an ellipse — set equal width and height for a true
 *                circle.
 *   radius       Corner radius in px for 'rounded'.       (default 12)
 *   mask         Any CSS clip-path value. Overrides `shape` — use this for
 *                hexagons, blobs, arbitrary polygons.
 *   fit          Initial framing baseline: cover | contain.   (default 'cover')
 *                cover starts the image filling the frame (overflow cropped);
 *                contain starts it fully visible (letterboxed). Either way the
 *                user can always pan/scale from there — double-click, or the
 *                Edit control, enters reframe mode (drag to move, scroll or
 *                corner-handles to scale; Escape / click-out commits). The
 *                crop persists alongside the image in the sidecar.
 *   placeholder  Empty-state caption.                      (default 'Drop an image')
 *   src          Optional initial/fallback image URL. Prefill it with a real
 *                photo via search_stock_photos when that tool is available
 *                (set credit/credit-href from the result). A user drop
 *                overrides it; clearing the drop reveals src again.
 *   credit       Attribution text shown as a small overlay at the
 *                bottom-left of the filled slot. REQUIRED whenever src
 *                points at any Unsplash host (images.unsplash.com,
 *                plus.unsplash.com, …): an Unsplash src with no credit
 *                renders an error tile INSTEAD of the photo (Unsplash
 *                terms forbid showing their photos unattributed). Use the
 *                exact form 'Photo by {photographer name} on Unsplash' —
 *                the overlay then links the name to credit-href and
 *                'Unsplash' to the Unsplash homepage, and links back to
 *                unsplash.com automatically get the required utm referral
 *                params appended at render time. The credit belongs to
 *                the src image, so it only shows while src is what's
 *                displayed — a user-dropped image hides it.
 *   credit-href  Link for the photographer's name in the credit overlay
 *                (their Unsplash profile URL from the stock-photo search
 *                results). http(s) URLs only — anything else renders the
 *                name as plain text.
 *
 * Sizing: the slot fills its container by default (width/height 100%).
 * Put it in a sized wrapper — absolutely positioned, a grid cell, a fixed
 * frame — and it takes exactly that box. When the parent's height is
 * indefinite (ordinary flow), it falls back to full width at a 3:2 aspect
 * ratio instead of collapsing. In a shrink-to-fit parent (a float,
 * width:max-content, an unsized absolute wrapper), percentages have
 * nothing to resolve against — size the slot or its wrapper explicitly
 * there. For a fixed-size slot, set
 * width/height on the element itself (inline style), which overrides the
 * default. When
 * layering content above a slot (full-bleed layouts), make the overlay
 * click-through — pointer-events: none on scrims/text plates, re-enabled
 * on interactive children — so the slot's hover controls stay reachable.
 * Keep the slot's bottom-left corner visually clear as well: the credit
 * overlay renders there, and a dark fade or text plate covering it hides
 * the attribution Unsplash's terms require — end the fade above that
 * corner, or keep it nearly transparent where the credit sits.
 *
 * Usage:
 *   <div style="position:relative;width:100%;height:100%">      <!-- full-bleed: -->
 *     <image-slot id="bg" shape="rect"></image-slot>            <!-- fills the wrapper -->
 *   </div>
 *   <image-slot id="hero"   style="width:800px;height:450px" shape="rounded" radius="20"
 *               placeholder="Drop a hero image"></image-slot>
 *   <image-slot id="avatar" style="width:120px;height:120px" shape="circle"></image-slot>
 *   <image-slot id="kite"   style="width:300px;height:300px"
 *               mask="polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"></image-slot>
 */
/* END USAGE */

(() => {
  const STATE_FILE = '.image-slots.state.json';

  // Unsplash terms require visible attribution wherever their photos
  // display, and every link back to unsplash.com must carry utm referral
  // params. Two render-time rules enforce that here:
  //  - an Unsplash-src slot with NO credit attribute renders an error
  //    tile INSTEAD of the photo (an uncredited Unsplash photo on screen
  //    is itself the terms violation, so it never renders bare);
  //  - rendered credit links pointing at unsplash.com get the referral
  //    params appended when absent (credit-href values live in page
  //    content that can't be edited after the fact).
  // Keep the utm_source value in sync with UTM_SOURCE in
  // platform/web-agent/unsplash.ts — this file is a project-local
  // artifact and cannot import it (equality is pinned by tests).
  const UNSPLASH_HOMEPAGE_HREF = 'https://unsplash.com/?utm_source=claude_design&utm_medium=referral';
  // Host rule mirrors the hotlink validator that admits Unsplash srcs into
  // pages in the first place (cdn$ in unsplash.ts: apex or any subdomain)
  // — Unsplash+ results serve from plus.unsplash.com, not just images.*,
  // and an admitted-but-uncredited photo must error whatever unsplash
  // host it rides on.
  // Trailing-dot FQDNs (images.unsplash.com.) are the same host to the
  // browser but would miss the regex — strip one dot so the check fails
  // CLOSED (unrecognized-but-real Unsplash srcs must error, not render).
  const isUnsplashHost = u => {
    try {
      return /(^|\.)unsplash\.com$/.test(new URL(u, document.baseURI).hostname.replace(/\.$/, ''));
    } catch {
      return false;
    }
  };
  // Render-time referral normalization for links back to Unsplash:
  // appends utm_source/utm_medium when absent, preserves every existing
  // query param, never overwrites an existing utm_source, and passes
  // non-Unsplash URLs through untouched. Input is an ABSOLUTE validated
  // http(s) URL (the credit render funnel resolves + validates first).
  const withReferral = href => {
    try {
      const u = new URL(href);
      if (!/(^|\.)unsplash\.com$/.test(u.hostname.replace(/\.$/, ''))) {
        return href;
      }
      if (!u.searchParams.has('utm_source')) {
        u.searchParams.set('utm_source', 'claude_design');
      }
      if (!u.searchParams.has('utm_medium')) {
        u.searchParams.set('utm_medium', 'referral');
      }
      return u.toString();
    } catch (e) {
      return href;
    }
  };
  // 2× a ~600px slot in a 1920-wide deck — retina-sharp without making the
  // sidecar enormous. A 1200px WebP at q=0.85 is ~150-300KB.
  const MAX_DIM = 1200;
  // Raster formats only. SVG is excluded (can carry script; createImageBitmap
  // on SVG blobs is inconsistent). GIF is excluded because the canvas
  // re-encode keeps only the first frame, so an animated GIF would silently
  // go still — better to reject than surprise.
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  // ── Shared sidecar store ────────────────────────────────────────────────
  // One fetch + immediate write-on-change for every <image-slot> on the
  // page. Reads via fetch() so viewing works anywhere the HTML and sidecar
  // are served together; writes go through window.omelette.writeFile, which
  // the host allowlists to *.state.json basenames only.
  const subs = new Set();
  let slots = {};
  // ids explicitly cleared before the sidecar fetch resolved — otherwise
  // the merge below can't tell "never set" from "just deleted" and would
  // resurrect the sidecar's stale value.
  const tombstones = new Set();
  let loaded = false;
  let loadP = null;
  function load() {
    if (loadP) return loadP;
    loadP = fetch(STATE_FILE).then(r => r.ok ? r.json() : null).then(j => {
      // Merge: sidecar loses to any in-memory change that raced ahead of
      // the fetch (drop or clear) so neither is clobbered by hydration.
      if (j && typeof j === 'object') {
        const merged = Object.assign({}, j, slots);
        // A framing-only write that raced ahead of hydration must not
        // drop a user image that's only on disk — inherit u from the
        // sidecar for any in-memory entry that lacks one.
        for (const k in slots) {
          if (merged[k] && !merged[k].u && j[k]) {
            merged[k].u = typeof j[k] === 'string' ? j[k] : j[k].u;
          }
        }
        for (const id of tombstones) delete merged[id];
        slots = merged;
      }
      tombstones.clear();
    }).catch(() => {}).then(() => {
      loaded = true;
      subs.forEach(fn => fn());
    });
    return loadP;
  }

  // Serialize writes so two near-simultaneous drops on different slots
  // can't reorder at the backend and leave the sidecar with only the
  // first. A save requested mid-flight just marks dirty and re-fires on
  // completion with the then-current slots.
  let saving = false;
  let saveDirty = false;
  // Unload-time flush: save()'s serialization defers a mid-RTT re-fire to a
  // .then that never runs in an unloading document, silently dropping a
  // pagehide commit. Post the current slots immediately instead — content
  // is a superset snapshot of any in-flight save's, the write is a
  // whole-file last-writer-wins replace, and postMessage FIFO delivers it
  // to the host after the in-flight one, so a backend-side reorder at
  // worst reproduces the dropped-commit outcome this flush improves on.
  // Guarded on the initial sidecar read: pre-hydration slots can miss
  // other slots' persisted entries, and flushing it would clobber them —
  // that narrow case stays best-effort (the in-memory merge in load()
  // cannot happen in an unloading document anyway).
  function flushNow() {
    if (!loaded) return;
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    try {
      Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {});
    } catch (e) {}
  }
  function save() {
    if (saving) {
      saveDirty = true;
      return;
    }
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    saving = true;
    Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {}).then(() => {
      saving = false;
      if (saveDirty) {
        saveDirty = false;
        save();
      }
    });
  }
  const S_MAX = 5;
  const clampS = s => Math.max(1, Math.min(S_MAX, s));

  // Normalize a stored slot value. Pre-reframe sidecars stored a bare
  // data-URL string; newer ones store {u, s, x, y}. Either shape is valid.
  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? {
      u: v,
      s: 1,
      x: 0,
      y: 0
    } : v;
  }
  function setSlot(id, val) {
    if (!id) return;
    if (val) {
      slots[id] = val;
      tombstones.delete(id);
    } else {
      delete slots[id];
      if (!loaded) tombstones.add(id);
    }
    subs.forEach(fn => fn());
    // A drop is rare + high-value — write immediately so nav-away can't lose
    // it. Gate on the initial read so we don't overwrite a sidecar we haven't
    // merged yet; the merge in load() keeps this change once the read lands.
    if (loaded) save();else load().then(save);
  }

  // ── Image downscale ─────────────────────────────────────────────────────
  // Encode through a canvas so the sidecar carries resized bytes, not the
  // raw upload. Longest side is capped at 2× the slot's rendered width
  // (retina) and at MAX_DIM. WebP keeps alpha and is ~10× smaller than PNG
  // for photos, so there's no need for per-image format picking.
  async function toDataUrl(file, targetW) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close && bitmap.close();
    }
  }

  // ── Custom element ──────────────────────────────────────────────────────
  const stylesheet =
  // Fill the container by default: slots are usually placed inside a
  // sized wrapper (a hero frame, a grid cell, an inset:0 layer) and are
  // expected to take that box — a fixed intrinsic size would render as
  // a small tile in the corner of a full-bleed wrapper instead.
  // aspect-ratio is the companion fallback that keeps a bare slot
  // visible when the parent's height is indefinite: height:100%
  // resolves to auto there, and the ratio then derives height from
  // width instead of letting the slot collapse to zero height.
  // Explicit width/height on the element override all of this.
  // color:inherit (not a fixed near-black): the placeholder chrome —
  // empty-state icon/caption (currentColor) and the dashed ring — must
  // read on dark decks too, and the slide's own text color is the one
  // color guaranteed to contrast with the slide background. The soft
  // look comes from opacity on those parts, not from a baked-in alpha.
  ':host{display:block;position:relative;' + '  font:13px/1.3 system-ui,-apple-system,sans-serif;' + '  width:100%;height:100%;aspect-ratio:3/2}' + '.empty .cap,.empty .sub{opacity:.75}' + '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(127,127,127,.08)}' +
  // .frame img (clipped) and .spill (unclipped ghost + handles) share the
  // same left/top/width/height in frame-%, computed by _applyView(), so the
  // inside-mask crop and the outside-mask spill stay pixel-aligned.
  '.frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);' + '  -webkit-user-drag:none;user-select:none;touch-action:none}' +
  // Reframe mode (double-click): the full image spills past the mask. The
  // spill layer is sized to the IMAGE bounds so its corners are where the
  // resize handles belong. The ghost <img> inside is translucent; the real
  // clipped <img> underneath shows the opaque in-mask crop.
  // popover=manual promotes the spill to the top layer on reframe, so it is
  // not clipped by any overflow:hidden / clip-path / scroll-container
  // ancestor (a plain z-index can't escape overflow clipping). UA popover
  // defaults (inset:0;margin:auto) are reset; _applyView sets viewport px.
  '.spill{position:fixed;margin:0;inset:auto;border:0;padding:0;background:transparent;' + '  overflow:visible;transform:translate(-50%,-50%);z-index:1;cursor:grab;touch-action:none}' + ':host([data-panning]) .spill{cursor:grabbing}' + '.spill .ghost{position:absolute;inset:0;width:100%;height:100%;opacity:.35;' + '  pointer-events:none;-webkit-user-drag:none;user-select:none;' + '  box-shadow:0 0 0 1px rgba(0,0,0,.2),0 12px 32px rgba(0,0,0,.2)}' + '.spill .handle{position:absolute;width:12px;height:12px;border-radius:50%;' + '  background:#fff;box-shadow:0 0 0 1.5px #c96442,0 1px 3px rgba(0,0,0,.3);' + '  transform:translate(-50%,-50%)}' + '.spill .handle[data-c=nw]{left:0;top:0;cursor:nwse-resize}' + '.spill .handle[data-c=ne]{left:100%;top:0;cursor:nesw-resize}' + '.spill .handle[data-c=sw]{left:0;top:100%;cursor:nesw-resize}' + '.spill .handle[data-c=se]{left:100%;top:100%;cursor:nwse-resize}' + ':host([data-reframe]){z-index:10}' + ':host([data-reframe]) .frame{box-shadow:0 0 0 2px #c96442}' + '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  cursor:pointer;user-select:none}' + '.empty svg{opacity:.45}' + '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' + '.empty .sub{font-size:11px}' + '.empty .sub u{text-underline-offset:2px}' + '.empty:hover .sub{opacity:1}' + ':host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;' + '  background:rgba(201,100,66,.10)}' + '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed currentColor;' + '  opacity:.35;transition:border-color .12s,opacity .12s}' + ':host([data-over]) .ring{border-color:#c96442;opacity:1}' + ':host([data-filled]) .ring{display:none}' +
  // Controls overlay INSIDE the frame, pinned to the top-right corner, so
  // a full-bleed slot in an overflow:hidden container still shows them
  // (the old below-mask placement got clipped). Credit sits bottom-left,
  // so top-right avoids collision. The blurred pill background keeps them
  // legible over the image.
  // The UA [popover] base rule styles the element in EVERY state (only
  // display:none is gated on :not(:popover-open), and the display:flex
  // below overrides that) — so the UA resets live HERE, like .spill's,
  // or the ordinary hover-state strip renders as a bordered Canvas box
  // centered by margin:auto. inset:auto precedes top/right (shorthand).
  '.ctl{position:absolute;inset:auto;top:8px;right:8px;margin:0;border:0;padding:0;' + '  background:transparent;overflow:visible;' + '  display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' + '  white-space:nowrap}' +
  // While reframing, the spill owns the top layer and would swallow every
  // click on the in-frame controls. Promoting .ctl into the top layer
  // ABOVE the spill (shown after it — later popovers stack higher) keeps
  // Edit-as-toggle and Replace clickable mid-reframe. _applyView pins it
  // to the frame's top-right in viewport px (translateX(-100%)
  // right-aligns against the computed left edge); inset:auto clears the
  // base rule's top/right so the inline left/top position it alone.
  '.ctl:popover-open{position:fixed;inset:auto;transform:translateX(-100%)}' + ':host([data-filled][data-editable]:hover) .ctl,:host([data-reframe]) .ctl' + '  {opacity:1;pointer-events:auto}' + '.ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;' + '  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;' + '  backdrop-filter:blur(6px)}' + '.ctl button:hover{background:rgba(0,0,0,.8)}' + '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' + '  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}' +
  // Replacement in flight: after a src swap the browser keeps painting
  // the PREVIOUS image until the new one decodes, so a Replace would
  // flash the old photo and then pop. Hide the stale frame (visibility,
  // not display — _applyView geometry still applies) and spin until the
  // new image reports in (load/error clears data-swapping).
  ':host([data-swapping]) .frame img{visibility:hidden}' + '.loading{position:absolute;inset:0;display:none;align-items:center;' + '  justify-content:center;pointer-events:none}' + ':host([data-swapping]) .loading{display:flex}' + '.loading::after{content:"";width:22px;height:22px;border-radius:50%;' + '  border:2px solid rgba(127,127,127,.25);border-top-color:currentColor;' + '  animation:om-slot-spin .7s linear infinite}' + '@keyframes om-slot-spin{to{transform:rotate(360deg)}}' +
  // Reduced motion: the static two-tone ring still reads as "working".
  '@media (prefers-reduced-motion:reduce){.loading::after{animation:none}}' + '.credit{position:absolute;left:6px;bottom:6px;max-width:calc(100% - 12px);display:none;' + '  padding:3px 7px;border-radius:5px;background:rgba(0,0,0,.55);color:#fff;' + '  font:10px/1.2 system-ui,-apple-system,sans-serif;text-decoration:none;' + '  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;backdrop-filter:blur(6px)}' +
  // The credit is a SPAN holding one or two <a>s (Unsplash's prescribed
  // form links the photographer AND Unsplash) — anchors style inline so
  // the overlay reads as one line of text.
  '.credit a{color:inherit;text-decoration:none}' + '.credit a:hover,.credit a:focus-visible{text-decoration:underline}' + ':host([data-filled][data-credit]) .credit{display:block}' +
  // Exports must ship JUST the image — no hover controls, no credit chip
  // (the host marks <html data-om-exporting> for the capture window; the
  // page-level hide script can't reach shadow DOM, this rule can).
  ':host-context([data-om-exporting]) .ctl,' + ':host-context([data-om-exporting]) .credit{display:none !important}' +
  // Print must ship just the image too: the hover-gated controls can be
  // mid-hover when print() fires, and the credit chip is screen chrome —
  // the same rule the capture window gets, keyed on print media instead
  // of the host's data-om-exporting mark (the print path sets no mark).
  '@media print{.ctl,.credit{display:none !important}}' +
  // No export-window mask rules here on purpose: the export capture
  // releases the replacement mask by REMOVING data-swapping (the
  // shadow-root pass in pages/export/shared.ts HIDE_EXPORT_CHROME_SCRIPT)
  // — attribute removal works in every engine (:host-context is
  // Chromium-only), is scoped by construction to slots actually
  // mid-swap, and hides the spinner through the same gate. A masked img
  // would otherwise be silently dropped from PPTX decks (the capture
  // walk skips visibility:hidden imgs).
  // Attribution error tile: REPLACES the photo when an Unsplash src has
  // no credit attribute — rendering the photo uncredited is the terms
  // violation, so the photo must not appear at all.
  // Calm and neutral on purpose (review feedback): the tile informs the
  // user; the fix instructions are machine-facing (usage docblock, tool
  // description, and the turn-end scan's bounce copy name the attributes
  // for the agent).
  '.attr-error{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  background:#f2f1ef;color:#6e6c66;user-select:none;' + '  font:13px/1.45 system-ui,-apple-system,sans-serif}' + '.attr-error svg{opacity:.55}' + '.attr-error .cap{max-width:92%;font-weight:500;letter-spacing:.01em}' + ':host([data-attribution-error]) .attr-error{display:flex}' + ':host([data-attribution-error]) .ring{display:none}';
  const icon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' + '<path d="m21 15-5-5L5 21"/></svg>';
  const warnIcon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>' + '<path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'placeholder', 'src', 'id', 'credit', 'credit-href'];
    }

    /** Duplicate-slide hook (called by deck-stage, see its
     *  _remintDuplicateIds): copy this id's stored image, if any, under a
     *  freshly minted key and return that key — so a duplicated slide's
     *  slot keeps its dropped photo instead of reverting to the
     *  placeholder. 'isFree' is the caller's uniqueness check (document
     *  ids); candidates must ALSO be unused in the sidecar, which can
     *  hold keys from other pages sharing the project root. (An EMPTY
     *  slot on another page leaves no sidecar entry, so its id is not
     *  detectable here — a minted key can collide with it and that slot
     *  would show this photo. Same blast radius as two pages reusing an
     *  id by hand, which the shared sidecar already permits.) Returns null
     *  when no id could be minted (caller strips the id, today's
     *  behavior). */
    static cloneSlot(fromId, isFree) {
      if (typeof fromId !== 'string' || !fromId) return null;
      // Pre-hydration the store can't veto candidates or source the copy
      // — degrade to the strip (today's behavior) rather than mint
      // against keys we can't see yet. Any rendered (= droppable) slot
      // means load() has already settled.
      if (!loaded) return null;
      const stem = fromId.replace(/-\d+$/, '') || fromId;
      for (let n = 2; n < 100; n++) {
        const toId = stem + '-' + n;
        if (toId === fromId) continue;
        if (slots[toId] !== undefined) {
          // Reuse a key holding this exact value (bytes AND crop) if no
          // live element here owns it — a duplicate op the host refused
          // after minting leaves such a key behind, and reusing keeps
          // refused retries from accumulating one orphaned copy per
          // attempt. Full equality (not just bytes) so a byte-identical
          // key another PAGE owns with its own crop is stepped past, not
          // adopted or rewritten. (Entries without .u never match.)
          const prev = getSlot(toId);
          const cur = getSlot(fromId);
          if (!(prev && cur && prev.u && prev.u === cur.u && prev.s === cur.s && prev.x === cur.x && prev.y === cur.y && (typeof isFree !== 'function' || isFree(toId)))) continue;
          return toId;
        }
        if (typeof isFree === 'function' && !isFree(toId)) continue;
        const v = getSlot(fromId);
        if (v) setSlot(toId, Object.assign({}, v));
        return toId;
      }
      return null;
    }
    constructor() {
      super();
      // clonable: rail thumbnails deep-clone slides and carry this shadow
      // along; reuse an already-cloned root so upgrade-after-clone works.
      // (Deliberately NOT serializable — a getHTML consumer would embed
      // multi-MB sidecar data-URLs into serialized page HTML.)
      const root = this.shadowRoot || this.attachShadow({
        mode: 'open',
        clonable: true
      });
      // .spill and .ctl sit OUTSIDE .frame so overflow:hidden + border-radius
      // on the frame (circle, pill, rounded) can't clip them.
      root.innerHTML = '<style>' + stylesheet + '</style>' + '<div class="frame" part="frame">' + '  <img part="image" alt="" draggable="false" style="display:none">' + '  <div class="empty" part="empty">' + icon + '    <div class="cap"></div>' + '    <div class="sub">or <u>browse files</u></div></div>' + '  <div class="attr-error" part="attribution-error">' + warnIcon + '    <div class="cap">This photo needs attribution</div></div>' + '  <div class="loading" part="loading"></div>' + '  <div class="ring" part="ring"></div>' + '</div>' +
      // Outside .frame, like .spill/.ctl — the frame's overflow:hidden +
      // border-radius/clip-path would cut the credit off on circle/pill/mask.
      // A SPAN, not an <a>: the prescribed Unsplash credit holds two links
      // (photographer + Unsplash), built per-render in _render().
      '<span class="credit" part="credit"></span>' + '<div class="spill" popover="manual" data-dc-edit-transparent>' + '  <img class="ghost" alt="" draggable="false">' + '  <div class="handle" data-c="nw"></div><div class="handle" data-c="ne"></div>' + '  <div class="handle" data-c="sw"></div><div class="handle" data-c="se"></div>' + '</div>' +
      // data-dc-edit-transparent: the DC editor's edit-mode picker lets
      // clicks through for chrome marked with it (EDIT_TRANSPARENT_SEL)
      // — without it, Replace/Edit clicks in Edit mode are swallowed by
      // element selection and the controls look dead.
      '<div class="ctl" popover="manual" data-dc-edit-transparent><button data-act="replace" title="Replace image">Replace</button>' + '  <button data-act="edit" title="Reframe image">Edit</button></div>' + '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';
      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('.frame img');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._sub = root.querySelector('.sub');
      this._spill = root.querySelector('.spill');
      this._ctl = root.querySelector('.ctl');
      this._credit = root.querySelector('.credit');
      this._attrError = root.querySelector('.attr-error');
      // Credit clicks open the link, not browse/reframe.
      this._credit.addEventListener('click', e => e.stopPropagation());
      this._credit.addEventListener('dblclick', e => e.stopPropagation());
      this._ghost = root.querySelector('.ghost');
      this._err = null;
      this._input = root.querySelector('input');
      this._depth = 0;
      this._gen = 0;
      // Encode-in-flight marker (the owning _ingest generation): while set,
      // the same-src "nothing in flight" clear in _render must not fire —
      // the stored value still points at the OLD image until the encode
      // lands, so that clear would unmask the stale image mid-replace.
      this._swapGen = 0;
      // Render-owned swap in flight: set when _render assigns a new src,
      // cleared only by the img's own load/error (or the empty branch).
      // img.complete CANNOT stand in for this — setting src only QUEUES
      // the current-request swap (a microtask), so synchronously after an
      // assignment, complete still reports the OLD settled request. The
      // pick path does exactly that: the host sets src, credit, and
      // credit-href back-to-back in one task, and renders #2/#3 would
      // read the stale complete === true and drop the mask one render
      // after it was set.
      this._loadPending = false;
      // See _render's empty branch: a transient attribution-error wipe of a
      // showing image must make the follow-up render a replacement (spinner),
      // not a first fill (blank frame).
      this._hidShowing = false;
      this._view = {
        s: 1,
        x: 0,
        y: 0
      };
      this._subFn = () => this._render();
      // Shadow-DOM listeners live with the shadow DOM — bound once here so
      // disconnect/reconnect (e.g. React remount) doesn't stack handlers.
      this._empty.addEventListener('click', () => this._input.click());
      root.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        // The hidden controls are opacity-0 but still tabbable — without
        // this gate a keyboard user could drive them on a read-only share
        // link (mirrors the dblclick handler's editable gate).
        if (!this.hasAttribute('data-editable')) return;
        if (act === 'replace') {
          this._exitReframe(true);
          // Host-owned picker (Unsplash modal; it also offers local import).
          this.dispatchEvent(new CustomEvent('image-slot:pick', {
            bubbles: true,
            composed: true,
            detail: {
              id: this.id || null
            }
          }));
        }
        if (act === 'edit') {
          if (!this._reframes()) return;
          if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
      // naturalWidth/Height aren't known until load — re-apply so the cover
      // baseline is computed from real dimensions, not the 100%×100% fallback.
      // load/error also release the replacement-in-flight mask (via the
      // single discipline in _releaseMask): the swap is only revealed once
      // the new image can actually paint (on error the frame shows its
      // background, same as a fresh slot with a broken src).
      this._img.addEventListener('load', () => {
        this._loadPending = false;
        this._releaseMask(true);
        this._applyView();
      });
      this._img.addEventListener('error', () => {
        this._loadPending = false;
        this._releaseMask(true);
      });
      // Gated only on editable — any filled slot can be repositioned/scaled,
      // regardless of fit. Share links (no writeFile) stay static.
      this.addEventListener('dblclick', e => {
        if (!this.hasAttribute('data-editable') || !this._reframes()) return;
        e.preventDefault();
        if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
      });
      // Pan + resize both originate on the spill layer. A handle pointerdown
      // drives an aspect-locked resize anchored at the opposite corner; any
      // other pointerdown on the spill pans. Offsets are frame-% so a
      // reframed slot survives responsive resize / PPTX export.
      this._spill.addEventListener('pointerdown', e => {
        if (e.button !== 0 || !this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        e.stopPropagation();
        this._spill.setPointerCapture(e.pointerId);
        const rect = this.getBoundingClientRect();
        const fw = rect.width || 1,
          fh = rect.height || 1;
        const corner = e.target.getAttribute && e.target.getAttribute('data-c');
        let move;
        if (corner) {
          // Resize about the OPPOSITE corner. Viewport-px throughout (rect
          // fw/fh, not clientWidth) so the math survives a transform:scale()
          // ancestor — deck_stage renders slides scaled-to-fit.
          const iw = this._img.naturalWidth || 1,
            ih = this._img.naturalHeight || 1;
          const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
          const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
          const sx = corner.includes('e') ? 1 : -1;
          const sy = corner.includes('s') ? 1 : -1;
          const s0 = this._view.s;
          const w0 = iw * base * s0,
            h0 = ih * base * s0;
          const cx0 = (50 + this._view.x) / 100 * fw;
          const cy0 = (50 + this._view.y) / 100 * fh;
          const ox = cx0 - sx * w0 / 2,
            oy = cy0 - sy * h0 / 2;
          const diag0 = Math.hypot(w0, h0);
          const ux = sx * w0 / diag0,
            uy = sy * h0 / diag0;
          move = ev => {
            const proj = (ev.clientX - rect.left - ox) * ux + (ev.clientY - rect.top - oy) * uy;
            const s = clampS(s0 * proj / diag0);
            const d = diag0 * s / s0;
            this._view.s = s;
            this._view.x = (ox + ux * d / 2) / fw * 100 - 50;
            this._view.y = (oy + uy * d / 2) / fh * 100 - 50;
            this._clampView();
            this._applyView();
          };
        } else {
          this.setAttribute('data-panning', '');
          const start = {
            px: e.clientX,
            py: e.clientY,
            x: this._view.x,
            y: this._view.y
          };
          move = ev => {
            this._view.x = start.x + (ev.clientX - start.px) / fw * 100;
            this._view.y = start.y + (ev.clientY - start.py) / fh * 100;
            this._clampView();
            this._applyView();
          };
        }
        const up = () => {
          try {
            this._spill.releasePointerCapture(e.pointerId);
          } catch {}
          this._spill.removeEventListener('pointermove', move);
          this._spill.removeEventListener('pointerup', up);
          this._spill.removeEventListener('pointercancel', up);
          this.removeAttribute('data-panning');
          this._dragUp = null;
        };
        // Stashed so _exitReframe (Escape / outside-click mid-drag) can
        // tear the capture + listeners down synchronously.
        this._dragUp = up;
        this._spill.addEventListener('pointermove', move);
        this._spill.addEventListener('pointerup', up);
        this._spill.addEventListener('pointercancel', up);
      });
      // Wheel zoom stays available inside reframe mode as a trackpad nicety —
      // zooms toward the cursor (offset' = cursor·(1-k) + offset·k).
      this.addEventListener('wheel', e => {
        if (!this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        const r = this.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width * 100 - 50;
        const cy = (e.clientY - r.top) / r.height * 100 - 50;
        const prev = this._view.s;
        const next = clampS(prev * Math.pow(1.0015, -e.deltaY));
        if (next === prev) return;
        const k = next / prev;
        this._view.s = next;
        this._view.x = cx * (1 - k) + this._view.x * k;
        this._view.y = cy * (1 - k) + this._view.y * k;
        this._clampView();
        this._applyView();
      }, {
        passive: false
      });
    }
    connectedCallback() {
      // Warn once per page — an id-less slot works for the session but
      // cannot persist, and two id-less slots would share nothing.
      if (!this.id && !ImageSlot._warned) {
        ImageSlot._warned = true;
        console.warn('<image-slot> without an id will not persist its dropped image.');
      }
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      // The host may inject window.omelette.writeFile AFTER the first render;
      // re-render on hover so the editable-gated controls reliably appear.
      this.addEventListener('pointerenter', this._subFn);
      // width%/height% in _applyView encode the frame aspect at call time —
      // a host resize (responsive grid, pane divider) would stretch the
      // image until the next _render. Re-render on size change: _render()
      // re-seeds _view from stored before clamp/apply, so a shrink→grow
      // cycle round-trips instead of ratcheting x/y toward the narrower
      // frame's clamp range.
      this._ro = new ResizeObserver(() => this._render());
      this._ro.observe(this);
      load();
      this._render();
    }
    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('pointerenter', this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      // commit=false: a disconnect is not a user intent — committing here
      // would persist whatever half-finished drag a React remount or DOM
      // splice happened to interrupt. Deliberate exits commit on their own
      // paths (Escape/click-out/toggle), and unloads commit via pagehide.
      this._exitReframe(false);
    }
    _enterReframe() {
      if (this.hasAttribute('data-reframe')) return;
      this.setAttribute('data-reframe', '');
      this._signalReframe(true);
      // Best-effort commit when the document unloads mid-reframe (a host
      // navigation racing the enter signal, a manual reload, tab close):
      // the sidecar write rides the host bridge, which outlives this
      // document, so the crop survives even though the mode dies with the
      // DOM. Held on the instance so _exitReframe detaches exactly what
      // was attached.
      this._pagehide = () => {
        this._exitReframe(true);
        flushNow();
      };
      window.addEventListener('pagehide', this._pagehide);
      // Promote spill to the top layer, then keep it pinned over the frame:
      // scroll/resize cover the common cases, and a per-frame rect check
      // catches layout shifts that fire neither (an image above finishing
      // load, streamed DOM pushing the slot down, an ancestor transform
      // change) so the overlay can't detach from the frame.
      try {
        this._spill.showPopover();
      } catch {}
      // After the spill, so the controls stack above it in the top layer.
      try {
        this._ctl.showPopover();
      } catch {}
      this._reposition = () => {
        if (this.hasAttribute('data-reframe')) this._applyView();
      };
      window.addEventListener('scroll', this._reposition, true);
      window.addEventListener('resize', this._reposition);
      this._lastRect = '';
      this._watch = () => {
        if (!this.hasAttribute('data-reframe')) return;
        const r = this.getBoundingClientRect();
        const key = r.left + ',' + r.top + ',' + r.width + ',' + r.height;
        if (key !== this._lastRect) {
          this._lastRect = key;
          this._applyView();
        }
        this._watchId = requestAnimationFrame(this._watch);
      };
      this._watchId = requestAnimationFrame(this._watch);
      this._applyView();
      // Close on click outside (the spill handler stopPropagation()s so
      // in-image drags don't reach this) and on Escape. Listeners are held
      // on the instance so _exitReframe / disconnectedCallback can detach
      // exactly what was attached.
      this._outside = e => {
        if (e.composedPath && e.composedPath().includes(this)) return;
        this._exitReframe(true);
      };
      this._esc = e => {
        if (e.key === 'Escape') this._exitReframe(true);
      };
      document.addEventListener('pointerdown', this._outside, true);
      document.addEventListener('keydown', this._esc, true);
    }
    _exitReframe(commit) {
      if (!this.hasAttribute('data-reframe')) return;
      if (this._dragUp) this._dragUp();
      this.removeAttribute('data-reframe');
      this.removeAttribute('data-panning');
      if (this._outside) document.removeEventListener('pointerdown', this._outside, true);
      if (this._esc) document.removeEventListener('keydown', this._esc, true);
      this._outside = this._esc = null;
      if (this._reposition) {
        window.removeEventListener('scroll', this._reposition, true);
        window.removeEventListener('resize', this._reposition);
        this._reposition = null;
      }
      if (this._watchId) {
        cancelAnimationFrame(this._watchId);
        this._watchId = 0;
      }
      if (this._pagehide) {
        window.removeEventListener('pagehide', this._pagehide);
        this._pagehide = null;
      }
      try {
        this._spill.hidePopover();
      } catch {}
      try {
        this._ctl.hidePopover();
      } catch {}
      this._ctl.style.left = '';
      this._ctl.style.top = '';
      if (commit) this._commitView();
      this._signalReframe(false);
    }

    // Reframe state lives only in this DOM until commit, invisible to the
    // host's dirty signals — announce enter/exit so the host can hold
    // auto-reloads for exactly the gesture (the guest bundle forwards
    // image-slot:reframe to the host as imageSlotReframe). Dispatched on
    // the element (composed, so it escapes shadow roots) while connected;
    // a disconnected exit (disconnectedCallback) falls back to document so
    // the host still hears it.
    _signalReframe(active) {
      const target = this.isConnected ? this : document;
      target.dispatchEvent(new CustomEvent('image-slot:reframe', {
        bubbles: true,
        composed: true,
        detail: {
          active: active,
          id: this.id || null
        }
      }));
    }

    // Public: host's "Import from computer" calls this to run local browse.
    openFilePicker() {
      this._exitReframe(true);
      this._input.click();
    }

    // A src write is a newer intent for this slot's content — the host
    // pick path (setImageSlotImage) or an agent edit — so it must win
    // over any encode still in flight from an earlier drop: left live,
    // that encode lands later, passes _ingest's gen guard, and its
    // setSlot silently overwrites the pick (the stored value shadows
    // src in _render). Bumping _gen kills the encode before its own
    // _swapGen clear runs, so clear the dead claim here too — otherwise
    // _releaseMask (gated on !_swapGen) never fires and the pick's
    // spinner is stranded. src ONLY: the pick sets credit/credit-href
    // in the same task, and clearing _swapGen on those would let the
    // same-src branch unmask the old image mid-encode.
    attributeChangedCallback(name, oldVal, newVal) {
      if (name === 'src' && oldVal !== newVal) {
        this._gen++;
        this._swapGen = 0;
      }
      if (this.shadowRoot) this._render();
    }

    // handleEvent — one listener object for all four drag events keeps the
    // add/remove symmetric and the depth counter correct.
    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        // Without preventDefault the browser never fires 'drop'.
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        // dragenter/leave fire for every descendant crossing — count depth
        // so hovering the icon inside the empty state doesn't flicker.
        if (--this._depth <= 0) {
          this._depth = 0;
          this.removeAttribute('data-over');
        }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }
    async _ingest(file) {
      this._setError(null);
      if (!file || ACCEPT.indexOf(file.type) < 0) {
        this._setError('Drop a PNG, JPEG, WebP, or AVIF image.');
        return;
      }
      // toDataUrl can take hundreds of ms on a large photo. A Clear or a
      // newer drop during that window would be clobbered when this await
      // resumes — bump + capture a generation so stale encodes bail.
      const gen = ++this._gen;
      // Replacing a shown image: surface the swap through the encode too,
      // not just the decode — otherwise the old photo sits there with no
      // feedback while the canvas re-encode runs. An empty slot keeps its
      // placeholder (no spinner) until the encode lands, as before.
      // _swapGen guards the mask against re-renders DURING the encode
      // (pointerenter, ResizeObserver, another slot's store write): the
      // stored value still resolves to the old image there, so _render's
      // same-src clear would otherwise unmask it mid-replace.
      if (this.hasAttribute('data-filled')) {
        this.setAttribute('data-swapping', '');
        this._swapGen = gen;
      }
      try {
        const w = this.clientWidth || this.offsetWidth || MAX_DIM;
        const url = await toDataUrl(file, w);
        if (gen !== this._gen) return;
        // Only exit reframe once the new image is in hand — a rejected type
        // or decode failure leaves the in-progress crop untouched.
        this._exitReframe(false);
        // Clear BEFORE setSlot: its synchronous re-render must see no
        // pending encode, so a byte-identical re-upload (same data URL, no
        // load event coming) still clears the mask via the complete branch.
        this._swapGen = 0;
        const val = {
          u: url,
          s: 1,
          x: 0,
          y: 0
        };
        setSlot(this.id || '', val);
        // Keep a session-local copy for id-less slots so the drop still
        // shows, even though it cannot persist.
        if (!this.id) {
          this._local = val;
          this._render();
        }
      } catch (err) {
        if (gen !== this._gen) return;
        this._swapGen = 0;
        // Reveal the kept old image — unless another replacement (a
        // remote pick's src swap) is still in flight, in which case the
        // mask stays until THAT image settles (its load/error releases).
        this._releaseMask();
        this._setError('Could not read that image.');
        console.warn('<image-slot> ingest failed:', err);
      }
    }
    _setError(msg) {
      if (this._err) {
        this._err.remove();
        this._err = null;
      }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err';
      d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => {
        if (this._err === d) {
          d.remove();
          this._err = null;
        }
      }, 3000);
    }

    // Reframing (pan/resize) is available on any filled slot — the user can
    // always reposition/scale. `fit` only sets the initial baseline (see
    // _geom): contain starts fully-visible, cover starts frame-filling.
    _reframes() {
      return this.hasAttribute('data-filled');
    }

    // The single release discipline for the replacement-in-flight mask
    // (data-swapping). The mask comes off only when BOTH hold:
    //  - no encode is pending (_swapGen) — mid-encode the stored value
    //    still resolves to the old image, so any reveal paints it;
    //  - the frame img has settled on its current src — an unsettled src
    //    means some replacement is still in flight (e.g. a remote pick),
    //    whoever started it, and revealing would paint the previous
    //    frame. The load/error listeners pass settled=true (the event IS
    //    the settlement signal, per spec complete is true by then);
    //    other callers rely on the complete flag (covers loaded AND
    //    failed).
    // Every release path funnels through here EXCEPT _render's empty
    // branch (the img is being cleared — nothing will ever settle).
    _releaseMask(settled) {
      if (!this._swapGen && !this._loadPending && (settled || this._img.complete)) {
        this.removeAttribute('data-swapping');
      }
    }

    // Baseline geometry, shared by clamp/apply/resize. `base` is the scale at
    // view-scale s=1: cover = fill the frame (overflow on the looser axis),
    // contain = fit fully inside (letterboxed). Zooming a contain image past
    // s where it overflows naturally becomes a crop. Null until the img has
    // loaded (naturalWidth is 0 before that) or when the slot has no layout
    // box — ResizeObserver fires with a 0×0 rect under display:none, and
    // clamping against a degenerate 1×1 frame would silently pull the stored
    // pan toward zero.
    _geom() {
      const iw = this._img.naturalWidth,
        ih = this._img.naturalHeight;
      const fw = this.clientWidth,
        fh = this.clientHeight;
      if (!iw || !ih || !fw || !fh) return null;
      const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
      const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
      return {
        iw,
        ih,
        fw,
        fh,
        base
      };
    }
    _clampView() {
      // Pan range on each axis is half the overflow past the frame edge.
      const g = this._geom();
      if (!g) return;
      const mx = Math.max(0, (g.iw * g.base * this._view.s / g.fw - 1) * 50);
      const my = Math.max(0, (g.ih * g.base * this._view.s / g.fh - 1) * 50);
      this._view.x = Math.max(-mx, Math.min(mx, this._view.x));
      this._view.y = Math.max(-my, Math.min(my, this._view.y));
    }
    _applyView() {
      const g = this._geom();
      // Top-layer controls: pin to the frame's top-right in viewport px
      // (the same 8px inset as the in-frame layout; unscaled — top-layer UI
      // reads as chrome, not page content). BEFORE the geometry branch:
      // placement needs only the frame rect, and a not-yet-loaded or broken
      // src must not leave the promoted strip floating unpositioned. Gated
      // on the popover actually being open: without the Popover API,
      // showPopover() threw (swallowed in _enterReframe), .ctl stays in
      // its in-frame absolute layout, and viewport-px coordinates would
      // shove it off-frame — and matches(':popover-open') itself throws
      // there (unknown pseudo-class), hence the try/catch.
      if (this.hasAttribute('data-reframe')) {
        let onTop = false;
        try {
          onTop = this._ctl.matches(':popover-open');
        } catch {}
        if (onTop) {
          const r = this.getBoundingClientRect();
          this._ctl.style.left = r.right - 8 + 'px';
          this._ctl.style.top = r.top + 8 + 'px';
        }
      }
      if (!g) {
        // Dimensions not known yet (before img load) — centered fit so there
        // is no flash of an unpositioned image before the geometry lands.
        const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.style.left = '50%';
        this._img.style.top = '50%';
        this._img.style.objectFit = contain ? 'contain' : 'cover';
        return;
      }
      // Baseline (cover-fill or contain-fit) × view scale. Width/height and
      // left/top are all frame-% — depends only on the frame aspect ratio, so
      // a responsive resize keeps the same crop. The spill layer mirrors the
      // same box so its corners = image corners.
      const k = g.base * this._view.s;
      const w = g.iw * k / g.fw * 100 + '%';
      const h = g.ih * k / g.fh * 100 + '%';
      const l = 50 + this._view.x + '%';
      const t = 50 + this._view.y + '%';
      this._img.style.width = w;
      this._img.style.height = h;
      this._img.style.left = l;
      this._img.style.top = t;
      this._img.style.objectFit = '';
      if (this.hasAttribute('data-reframe')) {
        // Top-layer spill: position in viewport px over the frame. The top
        // layer escapes ancestor transforms entirely, so EVERY term must be
        // in viewport units: getBoundingClientRect gives the frame's scaled
        // origin AND size, and the rect/layout ratio rescales the ghost —
        // sizing from layout px alone renders it 1/scale too large under a
        // scaled deck slide. Inner ghost + handles stay box-relative.
        const r = this.getBoundingClientRect();
        const sx = g.fw ? r.width / g.fw : 1;
        const sy = g.fh ? r.height / g.fh : 1;
        this._spill.style.width = g.iw * k * sx + 'px';
        this._spill.style.height = g.ih * k * sy + 'px';
        this._spill.style.left = r.left + (50 + this._view.x) / 100 * r.width + 'px';
        this._spill.style.top = r.top + (50 + this._view.y) / 100 * r.height + 'px';
      }
    }
    _commitView() {
      const v = {
        s: this._view.s,
        x: this._view.x,
        y: this._view.y
      };
      if (this._userUrl) v.u = this._userUrl;
      // Framing-only (no u) persists too so an author-src slot remembers its
      // crop; clearing the sidecar still falls through to src=.
      if (this.id) setSlot(this.id, v);else {
        this._local = v;
      }
    }
    _render() {
      // Shape / mask. Presets use border-radius so the dashed ring can
      // follow the rounded outline; clip-path is only applied for an
      // explicit `mask` (the ring is hidden there since a rectangle
      // dashed border chopped by an arbitrary polygon looks broken).
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';else if (shape === 'pill') radius = '9999px';else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._ring.style.borderRadius = mask ? '' : radius;
      this._ring.style.display = mask ? 'none' : '';

      // Controls and reframe entry gate on this so share links stay read-only.
      const editable = !!(window.omelette && window.omelette.writeFile);
      this.toggleAttribute('data-editable', editable);
      this._sub.style.display = editable ? '' : 'none';

      // Content. The sidecar is also writable by the agent's write_file
      // tool, so its value isn't guaranteed canvas-originated — only accept
      // data:image/ URLs from it. The `src` attribute is author-controlled
      // (Claude wrote it into the HTML) so it passes through unchanged.
      let stored = this.id ? getSlot(this.id) : this._local;
      if (stored && stored.u && !/^data:image\//i.test(stored.u)) stored = null;
      const srcAttr = this.getAttribute('src') || '';
      this._userUrl = stored && stored.u || null;
      const url = this._userUrl || srcAttr;
      // Don't clobber an in-flight reframe with a store-triggered re-render.
      if (!this.hasAttribute('data-reframe')) {
        this._view = {
          s: stored && Number.isFinite(stored.s) ? clampS(stored.s) : 1,
          x: stored && Number.isFinite(stored.x) ? stored.x : 0,
          y: stored && Number.isFinite(stored.y) ? stored.y : 0
        };
      }
      this._cap.textContent = this.getAttribute('placeholder') || 'Drop an image';
      // Toggle via style.display — the [hidden] attribute alone loses to
      // the display:flex / display:block rules in the stylesheet above.
      // An Unsplash src with no credit attribute must NOT render — showing
      // the photo uncredited is the Unsplash-terms violation itself. The
      // error tile replaces the photo until the credit is written. A
      // user-dropped image is the user's own content and always renders.
      // Trimmed: credit is agent/user-editable content, and a whitespace-
      // only value must count as missing — otherwise it would suppress the
      // error tile AND render an empty credit box (no text, no links),
      // exactly the unattributed state this gate exists to prevent.
      const credit = (this.getAttribute('credit') || '').trim();
      const attrError = !!(!credit && !this._userUrl && srcAttr && isUnsplashHost(srcAttr));
      this.toggleAttribute('data-attribution-error', attrError);
      if (url && !attrError) {
        const prev = this._img.getAttribute('src');
        if (prev !== url) {
          // Replacing an already-shown image: mark the swap BEFORE setting
          // src so the stale frame is never revealed (see the data-swapping
          // stylesheet rules). First fill (prev empty) keeps the existing
          // placeholder-until-load behavior — no spinner. _hidShowing
          // covers the pick path's transient attribution-error wipe: prev
          // is gone, but an image WAS showing, so this is a replacement.
          if (prev || this._hidShowing) this.setAttribute('data-swapping', '');
          // Mark the swap BEFORE assigning src: complete keeps reporting
          // the old settled request until the browser's
          // update-the-image-data microtask runs, so same-task re-renders
          // (the pick path's credit/credit-href setAttributes) need this
          // flag, not complete, to know a load is in flight.
          this._loadPending = true;
          this._img.src = url;
          this._ghost.src = url;
        } else {
          // Same-src re-render — release if settled, so an ingest-set
          // spinner can't stick after a byte-identical re-upload (same
          // data URL, no further load event ever fires).
          this._releaseMask();
        }
        this._hidShowing = false;
        this._img.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
        this._clampView();
        this._applyView();
      } else {
        this.removeAttribute('data-swapping');
        // The src is being removed — no load/error will ever fire for it.
        this._loadPending = false;
        // A transient attribution-error wipe of a showing image happens on
        // the pick path: the host sets src one setAttribute before credit,
        // so render N hides the old image (attrError) and render N+1
        // restores a URL. Remember the wipe so that restore renders as a
        // replacement (spinner), not a first fill (blank frame).
        this._hidShowing = attrError && !!this._img.getAttribute('src');
        this._img.style.display = 'none';
        this._img.removeAttribute('src');
        this._ghost.removeAttribute('src');
        // The error tile owns the blocked-photo state; .empty stays for
        // the genuinely-empty slot.
        this._empty.style.display = attrError ? 'none' : 'flex';
        this.removeAttribute('data-filled');
      }

      // Credit belongs to the author src, so a user drop hides it.
      // textContent + the http(s)-only funnel keep external strings inert.
      const showCredit = !!(url && credit && !this._userUrl && !attrError);
      this._credit.textContent = '';
      if (showCredit) {
        // Validate once (resolved against the document, http(s) only),
        // then append the terms-required utm referral params to links
        // that point back at unsplash.com.
        let href = '';
        const rawHref = this.getAttribute('credit-href') || '';
        if (rawHref) {
          try {
            const u = new URL(rawHref, document.baseURI);
            if (u.protocol === 'http:' || u.protocol === 'https:') {
              href = withReferral(u.href);
            }
          } catch {}
        }
        const mkLink = (text, linkHref) => {
          const a = document.createElement('a');
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
          a.setAttribute('href', linkHref);
          a.textContent = text;
          return a;
        };
        // Unsplash's prescribed credit is TWO links — the photographer's
        // name to their profile (credit-href) and 'Unsplash' to the
        // homepage. Render that split whenever the text has the canonical
        // shape; other text keeps the legacy single-link rendering.
        const m = /^Photo by (.+) on Unsplash$/.exec(credit);
        if (m) {
          this._credit.appendChild(document.createTextNode('Photo by '));
          this._credit.appendChild(href ? mkLink(m[1], href) : document.createTextNode(m[1]));
          this._credit.appendChild(document.createTextNode(' on '));
          this._credit.appendChild(mkLink('Unsplash', UNSPLASH_HOMEPAGE_HREF));
        } else if (href) {
          this._credit.appendChild(mkLink(credit, href));
        } else {
          this._credit.textContent = credit;
        }
      }
      this.toggleAttribute('data-credit', showCredit);
    }
  }
  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "image-slot.js", error: String((e && e.message) || e) }); }

// pbb-admin.js
try { (() => {
/* PBB — admin app. Shares the store with the public site. */
const DB = {
  get k() {
    return 'pbb-store';
  },
  load() {
    try {
      return JSON.parse(localStorage.getItem(this.k)) || null;
    } catch (e) {
      return null;
    }
  },
  save(d) {
    try {
      localStorage.setItem(this.k, JSON.stringify(d));
    } catch (e) {}
  }
};
/* The Chaman branch Donor Diary carries these columns. Everything the book held is kept;
   what it could not hold — a screening date, a deferral, an eligibility that changes by itself — is added. */
const ISSUE = {
  'W/O/R': 'Without replacement',
  'W/R': 'With replacement',
  'P/D': 'Patient donation'
};
const TESTS = [['hcv', 'HCV'], ['hiv', 'HIV'], ['hbs', 'HBs/IG'], ['vdrl', 'VDRL'], ['mp', 'MP']];
const FREQ = ['Every 3 months', 'Every 6 months', 'Every year'];
const dref = {
  mr: '',
  dob: '',
  emg: '',
  emgr: '',
  addr: '',
  ml: 350,
  freq: 'Every 6 months',
  issue: 'W/O/R',
  tests: null,
  tested: null,
  defer: null
};
const D = (d, k) => d[k] !== undefined && d[k] !== null ? d[k] : dref[k];
const clean = d => {
  const t = D(d, 'tests');
  return t ? TESTS.every(([k]) => t[k] === '-ve') : null;
};
const SEED = {
  donors: [{
    id: 1,
    n: 'Abdul Samad Kakar',
    g: 'O−',
    p: '0300 3815590',
    c: 'Quetta',
    last: '2026-05-07',
    times: 4,
    mr: 'CHM-0142',
    dob: '1991-02-14',
    emg: 'Bilal Kakar',
    emgr: 'Brother',
    addr: 'Mohallah Killi Deba, Quetta',
    ml: 350,
    freq: 'Every 3 months',
    issue: 'W/O/R',
    tests: {
      hcv: '-ve',
      hiv: '-ve',
      hbs: '-ve',
      vdrl: '-ve',
      mp: '-ve'
    },
    tested: '2026-05-07',
    defer: null
  }, {
    id: 2,
    n: 'Muhammad Ayaz',
    g: 'B+',
    p: '0333 7828121',
    c: 'Pishin',
    last: '2026-07-19',
    times: 2,
    mr: 'PSH-0088',
    dob: '1998-11-02',
    emg: 'Rehmat Ullah',
    emgr: 'Cousin',
    addr: 'Band Road, Pishin',
    ml: 450,
    freq: 'Every 6 months',
    issue: 'W/R',
    tests: {
      hcv: '-ve',
      hiv: '-ve',
      hbs: '-ve',
      vdrl: '-ve',
      mp: '-ve'
    },
    tested: '2026-07-19',
    defer: null
  }, {
    id: 3,
    n: 'Naseebullah Achakzai',
    g: 'A+',
    p: '0312 2044810',
    c: 'Quetta',
    last: null,
    times: 0,
    mr: 'QTA-0311',
    dob: '1986-06-30',
    emg: 'Sana Gul',
    emgr: 'Wife',
    addr: 'Sariab Road, Quetta',
    ml: 350,
    freq: 'Every year',
    issue: 'W/O/R',
    tests: null,
    tested: null,
    defer: null
  }, {
    id: 4,
    n: 'Hameedullah Tareen',
    g: 'O−',
    p: '0301 3390211',
    c: 'Quetta',
    last: '2026-04-01',
    times: 2,
    mr: 'QTA-0287',
    dob: '1994-01-09',
    emg: 'Hidayat Khan',
    emgr: 'Father',
    addr: 'Jinnah Road, Quetta',
    ml: 350,
    freq: 'Every 3 months',
    issue: 'W/O/R',
    tests: {
      hcv: '-ve',
      hiv: '-ve',
      hbs: '-ve',
      vdrl: '-ve',
      mp: '-ve'
    },
    tested: '2026-04-01',
    defer: null
  }, {
    id: 5,
    n: 'Shah Muhammad',
    g: 'AB+',
    p: '0345 8102299',
    c: 'Zhob',
    last: '2026-06-06',
    times: 3,
    mr: 'ZHB-0074',
    dob: '1989-08-21',
    emg: 'Shah Nawaz',
    emgr: 'Brother',
    addr: 'Sharbat Khan Road, Zhob',
    ml: 450,
    freq: 'Every 6 months',
    issue: 'W/O/R',
    tests: {
      hcv: '-ve',
      hiv: '-ve',
      hbs: '-ve',
      vdrl: '-ve',
      mp: '-ve'
    },
    tested: '2026-06-06',
    defer: null
  }, {
    id: 6,
    n: 'Zahoor Ahmed Kasi',
    g: 'O+',
    p: '0322 5541780',
    c: 'Loralai',
    last: '2026-01-09',
    times: 6,
    mr: 'LRL-0119',
    dob: '1979-04-17',
    emg: 'Zahoor Bibi',
    emgr: 'Wife',
    addr: 'Sayed Abdul Qadir Road, Loralai',
    ml: 350,
    freq: 'Every 6 months',
    issue: 'W/R',
    tests: {
      hcv: '-ve',
      hiv: '-ve',
      hbs: '-ve',
      vdrl: '-ve',
      mp: '-ve'
    },
    tested: '2026-01-09',
    defer: null
  }, {
    id: 7,
    n: 'Bilal Khan Nasar',
    g: 'B−',
    p: '0311 7788321',
    c: 'Quetta',
    last: '2026-07-02',
    times: 1,
    mr: 'QTA-0402',
    dob: '2001-12-05',
    emg: 'Nasar Khan',
    emgr: 'Father',
    addr: 'Killi Shabo, Quetta',
    ml: 350,
    freq: 'Every 3 months',
    issue: 'W/O/R',
    tests: {
      hcv: '-ve',
      hiv: '-ve',
      hbs: '-ve',
      vdrl: '-ve',
      mp: '-ve'
    },
    tested: '2026-07-02',
    defer: null
  }, {
    id: 8,
    n: 'Sanaullah Mandokhail',
    g: 'A−',
    p: '0335 9021144',
    c: 'Muslim Bagh',
    last: '2026-03-06',
    times: 2,
    mr: 'MSB-0033',
    dob: '1992-03-28',
    emg: 'Sanaullah Khan',
    emgr: 'Brother',
    addr: 'Bazaar Road, Muslim Bagh',
    ml: 350,
    freq: 'Every year',
    issue: 'W/O/R',
    tests: {
      hcv: '-ve',
      hiv: '-ve',
      hbs: '-ve',
      vdrl: '-ve',
      mp: '-ve'
    },
    tested: '2026-03-06',
    defer: null
  }, {
    id: 9,
    n: 'Israrullah Khan',
    g: 'O−',
    p: '0313 5590128',
    c: 'Quetta',
    last: '2026-02-19',
    times: 6,
    mr: 'QTA-0198',
    dob: '1984-09-12',
    emg: 'Israr Bibi',
    emgr: 'Wife',
    addr: 'Alamdar Road, Quetta',
    ml: 450,
    freq: 'Every 3 months',
    issue: 'W/O/R',
    tests: {
      hcv: '-ve',
      hiv: '-ve',
      hbs: '-ve',
      vdrl: '-ve',
      mp: '-ve'
    },
    tested: '2026-02-19',
    defer: null
  }, {
    id: 10,
    n: 'Noor Muhammad Shahwani',
    g: 'O−',
    p: '0344 2201933',
    c: 'Quetta',
    last: '2026-01-18',
    times: 1,
    mr: 'QTA-0356',
    dob: '1996-05-23',
    emg: 'Noor Ahmed',
    emgr: 'Brother',
    addr: 'Brewery Road, Quetta',
    ml: 350,
    freq: 'Every 6 months',
    issue: 'W/O/R',
    tests: {
      hcv: '-ve',
      hiv: '-ve',
      hbs: '-ve',
      vdrl: '-ve',
      mp: '-ve'
    },
    tested: '2026-01-18',
    defer: null
  }, {
    id: 11,
    n: 'Waheed Achakzai',
    g: 'O−',
    p: '0300 8811274',
    c: 'Quetta',
    last: '2025-12-07',
    times: 3,
    mr: 'KCH-0021',
    dob: '1988-10-08',
    emg: 'Waheed Gul',
    emgr: 'Cousin',
    addr: 'Kuchlak Bazaar',
    ml: 350,
    freq: 'Every year',
    issue: 'W/O/R',
    tests: {
      hcv: '-ve',
      hiv: '-ve',
      hbs: '-ve',
      vdrl: '-ve',
      mp: '-ve'
    },
    tested: '2025-12-07',
    defer: null
  }, {
    id: 12,
    n: 'Farhan Ali Raisani',
    g: 'O−',
    p: '0332 4419902',
    c: 'Quetta',
    last: null,
    times: 0,
    mr: 'QTA-0433',
    dob: '2000-07-19',
    emg: 'Farhan Raisani',
    emgr: 'Brother',
    addr: 'Samungli Road, Quetta',
    ml: 350,
    freq: 'Every 6 months',
    issue: 'W/O/R',
    tests: null,
    tested: null,
    defer: null
  }, {
    id: 13,
    n: 'Gul Khan Tareen',
    g: 'A+',
    p: '0300 4412876',
    c: 'Zhob',
    last: '2026-06-28',
    times: 5,
    mr: 'ZHB-0090',
    dob: '1990-02-02',
    emg: 'Gul Bibi',
    emgr: 'Mother',
    addr: 'Sharbat Khan Road, Zhob',
    ml: 450,
    freq: 'Every 3 months',
    issue: 'W/R',
    tests: {
      hcv: '-ve',
      hiv: '-ve',
      hbs: '-ve',
      vdrl: '-ve',
      mp: '-ve'
    },
    tested: '2026-06-28',
    defer: null
  }, {
    id: 14,
    n: 'Rehmat Ullah',
    g: 'B+',
    p: '0345 1129983',
    c: 'Pishin',
    last: null,
    times: 0,
    mr: 'PSH-0102',
    dob: '1997-06-14',
    emg: 'Rehmat Gul',
    emgr: 'Brother',
    addr: 'Band Road, Pishin',
    ml: 350,
    freq: 'Every year',
    issue: 'W/O/R',
    tests: null,
    tested: null,
    defer: null
  }],
  requests: [{
    id: 'PBB-1006',
    pt: 'Bibi Zarina',
    hosp: 'Civil Hospital, Quetta',
    g: 'O−',
    u: 3,
    c: 'Quetta',
    urg: 'Critical — today',
    by: 'Brother',
    ph: '0300 4412201',
    at: Date.now() - 22 * 60000,
    st: 'open',
    src: 'web',
    called: []
  }, {
    id: 'PBB-1005',
    pt: 'Abdul Wahid',
    hosp: 'BMC, Quetta',
    g: 'B−',
    u: 2,
    c: 'Quetta',
    urg: 'Urgent — within 2 days',
    by: 'Father',
    ph: '0333 5590128',
    at: Date.now() - 3600000,
    st: 'open',
    src: 'phone',
    called: []
  }, {
    id: 'PBB-1004',
    pt: 'Gul Bibi',
    hosp: 'DHQ Hospital, Zhob',
    g: 'A+',
    u: 1,
    c: 'Zhob',
    urg: 'Planned — a date is set',
    by: 'Son',
    ph: '0345 2201933',
    at: Date.now() - 10800000,
    st: 'open',
    src: 'phone',
    called: []
  }, {
    id: 'PBB-0998',
    pt: 'Sultan Ahmed',
    hosp: 'Sandeman Hospital',
    g: 'A−',
    u: 1,
    c: 'Quetta',
    urg: 'Urgent — within 2 days',
    by: 'Friend',
    ph: '0311 8811274',
    at: Date.now() - 86400000,
    st: 'done',
    src: 'web',
    called: []
  }],
  submissions: [],
  donations: [{
    d: '2026-08-09',
    n: 'Sultan Ahmed',
    g: 'A−',
    bags: 1,
    c: 'Quetta'
  }, {
    d: '2026-08-09',
    n: 'Zarak Khan',
    g: 'O+',
    bags: 1,
    c: 'Quetta'
  }],
  seq: 1007
};
let S = DB.load() || JSON.parse(JSON.stringify(SEED));
function persist() {
  DB.save(S);
}
/* A store written before the diary fields existed must be brought forward, not thrown away —
   the branch's own added donors live in it. Backfill from the seed by id, then fill the rest with defaults. */
const TOWNS14 = window.PBBTOWNS,
  SERVEDFROM = window.PBBSERVEDFROM;
(function migrate() {
  if (!S.schema || S.schema < 2) {
    const byId = {};
    SEED.donors.forEach(d => byId[d.id] = d);
    S.donors = (S.donors || []).map(d => {
      const seed = byId[d.id] || {};
      const out = {
        ...d
      };
      for (const k of ['mr', 'dob', 'emg', 'emgr', 'addr', 'ml', 'freq', 'issue', 'tests', 'tested', 'defer']) if (out[k] === undefined) out[k] = seed[k] !== undefined ? seed[k] : dref[k];
      return out;
    });
    S.schema = 2;
  }
  if (S.schema < 3) {
    /* A donor whose town is not one PBB lists cannot be filtered, searched or counted — they are
       invisible to everybody except whoever happens to scroll past them. Re-home them to the serving office. */
    S.donors.forEach(d => {
      if (!TOWNS14.includes(d.c)) d.c = SERVEDFROM[d.c] || 'Quetta';
    });
    S.schema = 3;
  }
  persist();
})();
window.PBBSTORE = {
  addRequest(r) {
    r.id = 'PBB-' + S.seq++;
    r.at = Date.now();
    r.st = 'open';
    r.called = [];
    S.requests.unshift(r);
    persist();
    return r.id;
  },
  addDonor(d) {
    d.id = Date.now();
    d.times = 0;
    S.donors.unshift(d);
    persist();
  },
  addSubmission(x) {
    S.submissions = S.submissions || [];
    S.submissions.unshift(x);
    persist();
  }
};

/* ---- helpers ---- */
const TOWNS_A = window.PBBTOWNS;
/* The six with an office of their own — used where a branch is meant, not a town. */
const OFFICES = ['Quetta', 'Pishin', 'Zhob', 'Loralai', 'Chaman', 'Muslim Bagh'];
const GROUPS_A = ['O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−'];
let SCOPE = null,
  ROLE = 'head';
const ALLOW = {
  head: null,
  mgr: ['overview', 'requests', 'find', 'inventory', 'inbox', 'whatsapp', 'donors', 'volunteers', 'thalassemia', 'ledger', 'record', 'partners', 'reports', 'branches', 'accounts', 'audit', 'profile'],
  emp: ['overview', 'requests', 'find', 'inventory', 'donors', 'record', 'profile']
};
const LANDING = {
  head: 'overview',
  mgr: 'overview',
  emp: 'requests'
};
function can(v) {
  const a = ALLOW[ROLE];
  return !a || a.includes(v);
}
/* head-office-only markup: an action nobody below may take is not shown at all, never shown greyed */
const hd = h => ROLE === 'head' ? h : '';
window.PBBCAN = can;
window.PBBLANDING = () => LANDING[ROLE] || 'overview';
const ROLES = {
  head: {
    who: 'Head office',
    sub: 'Sees all fourteen towns',
    scope: null,
    email: 'admin@pashtoonkhwabloodbank.org',
    phone: '081-2836820',
    office: 'Zainab Chamber, Shara-e-Adalat, Quetta'
  },
  mgr: {
    who: 'Zhob branch manager',
    sub: 'Sees Zhob only',
    scope: 'Zhob',
    email: 'zhob@pashtoonkhwabloodbank.org',
    phone: '0822-413902',
    office: 'Sharbat Khan Road, Zhob'
  },
  emp: {
    who: 'Data entry, Pishin',
    sub: 'Adds and edits donors',
    scope: 'Pishin',
    email: 'pishin@pashtoonkhwabloodbank.org',
    phone: '0826-421288',
    office: 'Band Road, Pishin'
  }
};
const days = d => d ? Math.floor((Date.now() - new Date(d)) / 86400000) : null;
const scoped = a => SCOPE ? a.filter(x => x.c === SCOPE) : a;
/* The only place a town's donor count comes from. Four screens used to keep their own figure. */
const townCount = t => S.donors.filter(d => d.c === t).length;
const ago = t => {
  const m = Math.floor((Date.now() - t) / 60000);
  return m < 60 ? m + ' min ago' : m < 1440 ? Math.floor(m / 60) + ' hr ago' : Math.floor(m / 1440) + ' d ago';
};
const bgTag = g => `<span class="abg${g.includes('−') ? ' r' : ''}">${g}</span>`;
/* A donor is callable only if all four hold: not deferred, screened, clear, and past the ninety days.
   The register, the record sheet and the search all read this — so they cannot disagree. */
function elig(d) {
  if (D(d, 'defer')) return {
    ok: 0,
    tag: 'no',
    lab: 'Deferred',
    why: 'Deferred — ' + D(d, 'defer')
  };
  const t = D(d, 'tests');
  if (!t) return {
    ok: 0,
    tag: 'gy',
    lab: 'Not screened',
    why: 'Not screened — the five tests must be done first'
  };
  if (!clean(d)) return {
    ok: 0,
    tag: 'no',
    lab: 'Reactive',
    why: 'A screening result was reactive. Do not call.'
  };
  const td = D(d, 'tested'),
    sd = td ? days(td) : null;
  if (sd !== null && sd > 180) return {
    ok: 0,
    tag: 'wt',
    lab: 'Screen again',
    why: 'Screened ' + sd + ' days ago. Repeat before issuing.'
  };
  const n = days(d.last);
  if (n !== null && n < 90) return {
    ok: 0,
    tag: 'wt',
    lab: 90 - n + ' days to wait',
    why: 'Can give again in ' + (90 - n) + ' days'
  };
  return {
    ok: 1,
    tag: 'ok',
    lab: 'Can give',
    why: 'Yes, today'
  };
}
const eligTag = d => {
  const e = elig(d);
  return `<span class="tag ${e.tag}">${e.lab}</span>`;
};

/* ---- shell ---- */
const AGROUPS = [['Operations', [['overview', 'Overview'], ['requests', 'Blood requests'], ['find', 'Find donors'], ['inventory', 'Inventory'], ['inbox', 'Inbox'], ['whatsapp', 'WhatsApp']]], ['Registry', [['donors', 'Donors'], ['volunteers', 'Volunteers'], ['thalassemia', 'Thalassemia'], ['ledger', 'Donations ledger'], ['record', 'Record a donation']]], ['Content', [['homepage', 'Homepage'], ['pages', 'Pages'], ['announcements', 'Announcements'], ['events', 'Events'], ['media', 'Media']]], ['Network', [['network', 'All towns'], ['partners', 'Partners &amp; organisations'], ['reports', 'Reports']]], ['Organisation', [['branches', 'Branches'], ['settings', 'Site settings'], ['accounts', 'Accounts &amp; hierarchy'], ['roles', 'Roles &amp; access'], ['data', 'Data'], ['audit', 'Log']]], ['You', [['profile', 'Your account']]]];
const ANAV = [['overview', 'Overview', '◎'], ['requests', 'Requests', '✚'], ['donors', 'Donors', '≡'], ['find', 'Find', '⌕']];
function adminShell(view, body, bar) {
  const r = ROLES[ROLE];
  return `<div class="adm"><aside class="aside">
 <a href="#/admin/${LANDING[ROLE] || 'overview'}" class="abrand"><img src="assets/pbb-logo.png" alt=""><span>Blood Register<small>${SCOPE || 'All branches'}</small></span></a>
 ${AGROUPS.map(([g, items]) => {
    const vis = items.filter(([v]) => can(v));
    return vis.length ? `<div class="agp">${g}</div>` + vis.map(([v, l]) => `<a href="#/admin/${v}" class="anav${v === view ? ' on' : ''}">${l}${v === 'requests' ? `<span class="ct">${scoped(S.requests).filter(x => x.st === 'open').length}</span>` : v === 'inventory' ? '<span class="ct">1</span>' : ''}</a>`).join('') : '';
  }).join('')}
 <div class="awho">Signed in as<b>${r.who}</b>${r.sub}<a href="#/" class="alogout">Back to website</a></div>
 </aside><div class="amain">
 <div class="abar">${bar}<div class="roleswitch">${Object.entries(ROLES).map(([k, v]) => `<button class="${k === ROLE ? 'on' : ''}" onclick="setRole('${k}')" title="View as ${v.who}">${v.who.split(',')[0].replace(' branch manager', '')}</button>`).join('')}</div></div><div class="acont">${body}</div></div></div>
 <div class="mobbar">${ANAV.filter(([v]) => can(v)).map(([v, l, i]) => `<a href="#/admin/${v}"${v === view ? ' class="on"' : ''}><b>${i}</b>${l.split(' ')[0]}</a>`).join('')}</div>
 `;
}
function setRole(k) {
  ROLE = k;
  SCOPE = ROLES[k].scope;
  const cur = (location.hash.replace(/^#\/?admin\/?/, '') || '').split('?')[0];
  if (!can(cur)) {
    location.hash = '#/admin/' + (LANDING[k] || 'overview');
    return;
  }
  route();
}

/* ---- donors ---- */
PAGES['admin/donors'] = () => {
  const list = scoped(S.donors);
  return adminShell('donors', `
 <div class="afilters">
 <input class="fld" style="flex:1;min-width:190px" placeholder="Search name, phone or MR number…" oninput="fDonors(this.value)" id="dSearch">
 <select class="fld" style="width:auto" id="dGroup" onchange="fDonors()"><option value="">All groups</option>${GROUPS_A.map(g => `<option>${g}</option>`).join('')}</select>
 ${SCOPE ? '' : `<select class="fld" style="width:auto" id="dCity" onchange="fDonors()"><option value="">All towns</option>${TOWNS_A.map(t => `<option>${t}</option>`).join('')}</select>`}
 </div>
 <div class="atbl"><table><thead><tr><th>MR No</th><th>Name</th><th>Group</th><th>Phone</th><th>Town</th><th>Screened</th><th>Last donated</th><th>Status</th></tr></thead><tbody id="dRows">${donorRows(list)}</tbody></table></div>
 <p class="ahint">Every column of the branch Donor Diary is here — MR number, group and RH, age, contact, emergency contact and relationship, address, quantity, frequency, mode of issue, and the five screening results. What the book could not do is work out for itself whether somebody can give <b>today</b>, or that a screening result has gone stale. That is the whole difference.</p>`, `<h1>Donor register</h1><span class="asub" id="dCount">${list.length} ${list.length === 1 ? 'donor' : 'donors'}</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openSheet('addDonor')">+ Add donor</button>`);
};
const screenTag = d => {
  const c = clean(d);
  return c === null ? '<span class="tag gy">Not screened</span>' : c ? '<span class="tag ok">Clear</span>' : '<span class="tag no">Reactive</span>';
};
const donorRows = l => l.length ? l.map(d => `<tr onclick="openDonor(${d.id})">
 <td class="mono2 m1">${D(d, 'mr') || '—'}</td>
 <td class="m2"><div class="nm">${d.n}</div><div class="sm">${D(d, 'mr') || d.c} · ${d.p}</div></td>
 <td>${bgTag(d.g)}</td><td class="mono2 m1">${d.p}</td><td class="m1">${d.c}</td>
 <td class="m3">${screenTag(d)}</td>
 <td>${d.last ? days(d.last) + ' days ago' : '<span class="sm">Never</span>'}</td><td class="m3">${eligTag(d)}</td></tr>`).join('') : '<tr><td colspan="8" class="aempty">No donors match. <b>Add the first one.</b></td></tr>';
function fDonors(q) {
  const s = (q || document.getElementById('dSearch').value || '').toLowerCase();
  const g = document.getElementById('dGroup').value,
    cEl = document.getElementById('dCity'),
    c = SCOPE || (cEl ? cEl.value : '');
  const l = scoped(S.donors).filter(d => (!s || d.n.toLowerCase().includes(s) || d.p.includes(s) || (D(d, 'mr') || '').toLowerCase().includes(s)) && (!g || d.g === g) && (!c || d.c === c));
  document.getElementById('dRows').innerHTML = donorRows(l);
  document.getElementById('dCount').textContent = l.length + (l.length === 1 ? ' donor' : ' donors') + (SCOPE ? ' in ' + SCOPE : '');
}

/* ---- find ---- */
let findG = 'O−';
PAGES['admin/find'] = () => {
  setTimeout(runFind, 0);
  return adminShell('find', `
 <div class="acard">
 <label class="lb">Which blood group is needed?</label>
 <div class="row" style="gap:8px;margin-bottom:20px" id="fBg">${GROUPS_A.map(g => `<button class="bgp${g === findG ? ' on' : ''}" onclick="setFindG('${g}')">${g}</button>`).join('')}</div>
 <div class="g2" style="gap:14px">
 <div><label class="lb">Town</label><select class="fld" id="fCity" onchange="runFind()" ${SCOPE ? 'disabled' : ''}>${(SCOPE ? [SCOPE] : TOWNS_A).map(t => `<option>${t}</option>`).join('')}</select></div>
 <div><label class="lb">Show</label><select class="fld" id="fElig" onchange="runFind()"><option>Only those who can give today</option><option>Everyone, including cooldown</option></select></div>
 </div></div>
 <div class="row" style="margin:20px 0 14px"><h3 id="fCount">—</h3></div>
 <div id="fRows"></div>
 <p class="ahint">Ordered by <b>longest since last donation</b>, so the calls spread around instead of exhausting the same three willing people. Press <b>Called</b> and the next person on shift sees it.</p>`, `<h1>Find a donor</h1><span class="asub">Instead of turning pages</span>`);
};
function setFindG(g) {
  findG = g;
  document.querySelectorAll('#fBg .bgp').forEach(b => b.classList.toggle('on', b.textContent === g));
  runFind();
}
function runFind() {
  const city = SCOPE || document.getElementById('fCity').value;
  const onlyElig = document.getElementById('fElig').selectedIndex === 0;
  let l = S.donors.filter(d => d.g === findG && d.c === city);
  if (onlyElig) l = l.filter(d => elig(d).ok);
  l.sort((a, b) => (days(b.last) ?? 9999) - (days(a.last) ?? 9999));
  document.getElementById('fCount').textContent = l.length ? `${l.length} ${l.length === 1 ? 'donor' : 'donors'} can give ${findG} in ${city}` : `Nobody on the ${city} register can give ${findG} today`;
  document.getElementById('fRows').innerHTML = l.length ? l.map(d => `<div class="frow">
 <div style="flex:1;min-width:170px"><div class="nm">${d.n}</div><div class="sm">${d.times ? d.times + ' donations' : 'never donated'} · ${d.last ? days(d.last) + ' days since last' : 'no record of a donation'}</div></div>
 <div class="mono2" style="font-weight:700">${d.p}</div>
 <a class="btn btn-p btn-s" href="tel:${d.p.replace(/ /g, '')}">Call</a>
 <button class="btn btn-o btn-s" onclick="markCalled(this)">Mark called</button></div>`).join('') : `<div class="acard aempty"><h3>Nobody available</h3><p style="margin-top:8px">Widen to “everyone including cooldown”, or phone the head office in Quetta on <b>081-2836820</b> and ask them to look on their register.</p></div>`;
}
function markCalled(b) {
  b.classList.toggle('btn-d');
  b.textContent = b.textContent === 'Called' ? 'Mark called' : 'Called';
}

/* ---- requests ---- */
PAGES['admin/requests'] = () => {
  const l = scoped(S.requests),
    open = l.filter(r => r.st === 'open');
  return adminShell('requests', `
 <div class="akpi">
 <div class="c"><div class="l">Open now</div><div class="n r">${open.length}</div></div>
 <div class="c"><div class="l">Arranged</div><div class="n">${l.filter(r => r.st === 'done').length}</div></div>
 <div class="c"><div class="l">Donors on register</div><div class="n">${scoped(S.donors).length}</div></div>
 <div class="c"><div class="l">Recorded today</div><div class="n">${S.donations.length}</div></div></div>
 <div class="atbl"><table><thead><tr><th>Patient / hospital</th><th>Group</th><th>Units</th><th>Town</th><th>Asked</th><th>Status</th></tr></thead><tbody>
 ${l.length ? l.map(r => `<tr onclick="openReq('${r.id}')">
 <td class="m2"><div class="nm">${r.hosp}</div><div class="sm">${r.pt || 'Patient name not given'} · ${r.id}${r.src === 'web' ? ' · from the website' : ''}</div></td>
 <td class="m1">${bgTag(r.g)}</td><td>${r.u}</td><td>${r.c}</td><td class="sm">${ago(r.at)}</td>
 <td class="m3">${r.st === 'open' ? '<span class="tag no">Open</span>' : '<span class="tag ok">Arranged</span>'}</td></tr>`).join('') : '<tr><td colspan="6" class="aempty">No requests yet.</td></tr>'}
 </tbody></table></div>
 <p class="ahint">A list, not a board. Requests sent from the public website land here the moment they are submitted — <b>try it: submit one on the site and come back.</b></p>`, `<h1>Blood requests</h1><span class="asub">${open.length} open</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openSheet('newReq')">+ New request</button>`);
};
function openReq(id) {
  const r = S.requests.find(x => x.id === id);
  if (!r) return;
  sheet(`<span class="tag ${r.st === 'open' ? 'no' : 'ok'}">${r.st === 'open' ? 'Open' : 'Arranged'}</span>
 <h2 style="margin:12px 0 4px">${bgTag(r.g)} <span style="margin-left:8px">${r.u} ${r.u === 1 ? 'unit' : 'units'}</span></h2>
 <div class="mono2" style="color:var(--mid)">${r.id} · asked ${ago(r.at)}${r.src === 'web' ? ' · from the website' : ''}</div>
 <div style="margin:22px 0">
 ${[['Patient', r.pt], ['Gender', r.gender], ['Age', r.age && r.age + ' years'], ['Case or disease', r.disease], ['Report available', r.report], ['__', 'What is needed'], ['Component', r.btype], ['Bags', r.u], ['Needed on', [r.date, r.time].filter(Boolean).join(' · ')], ['Urgency', r.urg], ['__', 'Where'], ['Hospital', r.hosp], ['Town', r.c], ['Address', r.address], ['__', 'The attendant'], ['Name', r.by], ['Phone', r.ph], ['Blood group', r.attgroup], ['Can donate', r.attdonate], ['Exchange possible', r.exchange], ['Transport', r.transport]].filter(([k, v]) => k === '__' || v).map(([k, v]) => k === '__' ? `<div class="fsec" style="margin:20px 0 10px"><span>${v}</span></div>` : `<div class="drow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
 <div class="row" style="gap:9px"><a class="btn btn-p" style="flex:1" href="tel:${(r.ph || '').replace(/ /g, '')}">Call ${r.by || 'requester'}</a>
 <a class="btn btn-o" href="#/admin/find" onclick="findG='${r.g}';closeSheet()">Find a donor</a></div>
 ${r.st === 'open' ? `<button class="btn btn-d" style="width:100%;margin-top:12px" onclick="fulfil('${r.id}')">Mark arranged</button>` : ''}`);
}
function fulfil(id) {
  const r = S.requests.find(x => x.id === id);
  r.st = 'done';
  persist();
  closeSheet();
  route();
}

/* ---- record ---- */
PAGES['admin/record'] = () => adminShell('record', `
 <div style="max-width:620px">
 <form class="acard" onsubmit="return saveDonation(event)">
 <div class="fgrp"><label class="lb">Who donated?</label><input class="fld" list="donorList" name="who" required placeholder="Type a name from the register…"><datalist id="donorList">${scoped(S.donors).map(d => `<option value="${d.n}">`).join('')}</datalist>
 <div class="sm" style="margin-top:7px">Not on the register? <a href="#" onclick="openSheet('addDonor');return false"><b>Add them first →</b></a></div></div>
 <div class="g2" style="gap:14px"><div class="fgrp"><label class="lb">Date</label><input class="fld" type="date" name="date" value="${new Date().toISOString().slice(0, 10)}"></div>
 <div class="fgrp"><label class="lb">Bags</label><input class="fld" name="bags" value="1" inputmode="numeric"></div></div>
 <div class="fgrp"><label class="lb">Against a request? <span class="sm">— optional</span></label><select class="fld" name="req"><option value="">Not linked</option>${scoped(S.requests).filter(r => r.st === 'open').map(r => `<option value="${r.id}">${r.id} · ${r.g} · ${r.hosp}</option>`).join('')}</select></div>
 <button class="btn btn-p" style="width:100%;padding:15px">Save to the register</button>
 </form>
 <p class="ahint">Saving does three things at once: writes the donation, sets that donor\u2019s next eligible date <b>ninety days out</b>, and adds to the year\u2019s total. Nothing is entered twice.</p>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:14px">Recorded today</h3>
 ${S.donations.length ? S.donations.map(d => `<div class="row" style="padding:11px 0;border-bottom:1px solid var(--line)">${bgTag(d.g)}<span style="flex:1;font-weight:600">${d.n}</span><span class="sm">${d.bags} bag</span></div>`).join('') : '<p class="sm">Nothing recorded yet today.</p>'}
 </div></div>`, `<h1>Record a donation</h1><span class="asub">One form, three fields</span>`);
function saveDonation(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const who = f.get('who'),
    d = S.donors.find(x => x.n === who);
  if (d) {
    d.last = f.get('date');
    d.times++;
  }
  S.donations.unshift({
    d: f.get('date'),
    n: who,
    g: d ? d.g : '—',
    bags: +f.get('bags'),
    c: d ? d.c : SCOPE || 'Quetta'
  });
  const rq = f.get('req');
  if (rq) {
    const r = S.requests.find(x => x.id === rq);
    if (r) r.st = 'done';
  }
  persist();
  route();
  return false;
}

/* ---- sheets ---- */
function sheet(html) {
  let el = document.getElementById('sheet');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sheet';
    el.className = 'sheet';
    document.body.appendChild(el);
    const ov = document.createElement('div');
    ov.id = 'sheetOv';
    ov.className = 'sheetov';
    ov.onclick = closeSheet;
    document.body.appendChild(ov);
  }
  el.innerHTML = '<button class="cl" onclick="closeSheet()">✕</button>' + html;
  el.classList.add('open');
  document.getElementById('sheetOv').classList.add('on');
}
function closeSheet() {
  const s = document.getElementById('sheet');
  if (s) {
    s.classList.remove('open');
    document.getElementById('sheetOv').classList.remove('on');
  }
}
function openDonor(id) {
  const d = S.donors.find(x => x.id === id);
  if (!d) return;
  const n = days(d.last),
    t = D(d, 'tests'),
    td = D(d, 'tested'),
    sd = td ? days(td) : null,
    stale = sd !== null && sd > 180;
  const age = D(d, 'dob') ? Math.floor((Date.now() - new Date(D(d, 'dob'))) / 31557600000) : null;
  const def = D(d, 'defer');
  sheet(`<div class="row" style="gap:10px;align-items:center">${bgTag(d.g)}<span class="mono2 sm">${D(d, 'mr') || 'no MR number'}</span></div>
 <h2 style="margin:12px 0 4px">${d.n}</h2><div class="sm">${d.c}${age ? ' · ' + age + ' years' : ''}</div>

 ${def ? `<div class="alert" style="margin:18px 0"><div><b>Deferred — do not call.</b> ${def}</div></div>` : ''}

 <div class="qlab" style="margin:22px 0 10px">Donor</div>
 <div>${[['Blood group and RH', d.g.includes('−') ? d.g + ' (negative)' : d.g + ' (positive)'], ['Age', age ? age + ' years' : '—'], ['Date of birth', D(d, 'dob') || '—'], ['Contact', d.p], ['Emergency contact', D(d, 'emg') || '—'], ['Relationship', D(d, 'emgr') || '—'], ['Address', D(d, 'addr') || '—']].map(([k, v]) => `<div class="drow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>

 <div class="qlab" style="margin:22px 0 10px">Donation</div>
 <div>${[['Quantity given', D(d, 'ml') + ' ml'], ['Willing to give', D(d, 'freq')], ['Mode of issue', D(d, 'issue') + ' — ' + (ISSUE[D(d, 'issue')] || '')], ['Times donated', d.times], ['Last donated', d.last ? n + ' days ago' : 'Never'], ['Can give again', elig(d).why]].map(([k, v]) => `<div class="drow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>

 <div class="qlab" style="margin:22px 0 10px">Screening</div>
 ${t ? `<div class="testgrid">${TESTS.map(([k, l]) => `<div class="testbox ${t[k] === '-ve' ? 'ok' : 'no'}"><b>${l}</b><span>${t[k]}</span></div>`).join('')}</div>
 <div class="drow" style="margin-top:12px"><span>Tested</span><b>${td || '—'}${sd !== null ? ' · ' + sd + ' days ago' : ''}</b></div>
 ${stale ? '<div class="ahint" style="margin-top:10px;border-color:#F0DFB4;background:var(--amb-t)">These results are more than six months old. Screen again before issuing.</div>' : ''}` : '<div class="ahint">Never screened. This person cannot be called for a donation until HCV, HIV, HBs/IG, VDRL and MP have been done.</div>'}

 <div class="row" style="gap:9px;margin-top:22px"><a class="btn btn-p" style="flex:1" href="tel:${d.p.replace(/ /g, '')}">Call</a><a class="btn btn-o" href="https://wa.me/92${d.p.replace(/[^0-9]/g, '').replace(/^0/, '')}" target="_blank" rel="noopener">WhatsApp</a></div>
 <div class="row" style="gap:9px;margin-top:9px"><button class="btn btn-o" style="flex:1">Edit details</button><button class="btn btn-o" style="flex:1">Record a screening</button></div>
 <button class="btn btn-d" style="width:100%;margin-top:9px">${def ? 'Lift the deferral' : 'Defer this donor'}</button>`);
}
function openSheet(kind) {
  if (kind === 'addDonor') sheet(`<h2 style="margin-bottom:4px">Add a donor</h2><p class="sm" style="margin-bottom:20px">The same page as the branch Donor Diary. Only the starred fields are needed to save — the rest can be filled in when the person next comes in.</p>
 <form onsubmit="return addDonor(event)">
 <div class="qlab" style="margin-bottom:10px">Donor</div>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Full name *</label><input class="fld" name="n" required autofocus></div>
 <div class="fgrp"><label class="lb">MR number</label><input class="fld" name="mr" placeholder="CHM-0000"><div class="sm" style="margin-top:5px">Left blank, one is given.</div></div></div>
 <div class="fgrp"><label class="lb">Blood group and RH factor *</label><div class="row" style="gap:7px" id="adG">${GROUPS_A.map(g => `<button type="button" class="bgp sm2" onclick="pickAdd(this)">${g}</button>`).join('')}</div></div>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Date of birth</label><input class="fld" name="dob" type="date"><div class="sm" style="margin-top:5px">Better than an age, which is wrong a year later.</div></div>
 <div class="fgrp"><label class="lb">Contact number *</label><input class="fld" name="p" required placeholder="0300 0000000"></div></div>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Emergency contact</label><input class="fld" name="emg"></div>
 <div class="fgrp"><label class="lb">Relationship with donor</label><input class="fld" name="emgr" placeholder="Brother, wife, father…"></div></div>
 <div class="fgrp"><label class="lb">Address</label><textarea class="fld" name="addr" rows="2" placeholder="Mohallah, village, district"></textarea></div>
 <div class="fgrp"><label class="lb">Town *</label><select class="fld" name="c">${(SCOPE ? [SCOPE] : TOWNS_A).map(t => `<option>${t}</option>`).join('')}</select></div>

 <div class="qlab" style="margin:22px 0 10px">Donation</div>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Quantity (ml)</label><select class="fld" name="ml"><option>350</option><option>450</option></select></div>
 <div class="fgrp"><label class="lb">How often they will give</label><select class="fld" name="freq">${FREQ.map(f => `<option${f === 'Every 6 months' ? ' selected' : ''}>${f}</option>`).join('')}</select></div></div>
 <div class="fgrp"><label class="lb">Mode of issue</label><select class="fld" name="issue">${Object.entries(ISSUE).map(([k, v]) => `<option value="${k}">${k} — ${v}</option>`).join('')}</select></div>
 <div class="fgrp"><label class="lb">Last donated <span class="sm">— if known</span></label><input class="fld" name="last" type="date"></div>

 <div class="qlab" style="margin:22px 0 10px">Screening</div>
 <div class="ahint" style="margin-bottom:16px">Recorded separately, against the laboratory date, so a result can never be quietly changed alongside a name or a telephone number. Use <b>Record a screening</b> on the donor's page.</div>
 <button class="btn btn-p" style="width:100%;padding:14px">Save donor</button>
 <button type="button" class="btn btn-o" style="width:100%;margin-top:9px" onclick="addDonor(event,1)">Save and add another</button></form>`);
  if (kind === 'newReq') sheet(`<h2 style="margin-bottom:4px">New blood request</h2><p class="sm" style="margin-bottom:20px">Usually taken over the phone. Write it here instead of a slip.</p>
 <form onsubmit="return addReq(event)">
 <div class="fgrp"><label class="lb">Blood group *</label><div class="row" style="gap:7px" id="adG">${GROUPS_A.map(g => `<button type="button" class="bgp sm2" onclick="pickAdd(this)">${g}</button>`).join('')}</div></div>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Units *</label><input class="fld" name="u" value="2" required></div>
 <div class="fgrp"><label class="lb">Town *</label><select class="fld" name="c">${(SCOPE ? [SCOPE] : TOWNS_A).map(t => `<option>${t}</option>`).join('')}</select></div></div>
 <div class="fgrp"><label class="lb">Hospital *</label><input class="fld" name="hosp" required></div>
 <div class="fgrp"><label class="lb">Patient name</label><input class="fld" name="pt"></div>
 <div class="fgrp"><label class="lb">Who is asking — phone *</label><input class="fld" name="ph" required></div>
 <button class="btn btn-p" style="width:100%;padding:14px">Save request</button></form>`);
}
function pickAdd(b) {
  document.querySelectorAll('#adG .bgp').forEach(x => x.classList.remove('on'));
  b.classList.add('on');
}
function addDonor(e, again) {
  e.preventDefault();
  const form = e.target.closest('form'),
    f = new FormData(form);
  const g = document.querySelector('#adG .bgp.on');
  if (!g) {
    alert('Choose a blood group.');
    return false;
  }
  const pre = {
    Quetta: 'QTA',
    Pishin: 'PSH',
    Zhob: 'ZHB',
    Loralai: 'LRL',
    Chaman: 'CHM',
    'Muslim Bagh': 'MSB'
  }[f.get('c')] || 'PBB';
  const mr = (f.get('mr') || '').trim() || pre + '-' + String(S.donors.filter(x => (D(x, 'mr') || '').startsWith(pre)).length + 1).padStart(4, '0');
  S.donors.unshift({
    id: Date.now(),
    n: f.get('n'),
    g: g.textContent,
    p: f.get('p'),
    c: f.get('c'),
    last: f.get('last') || null,
    times: 0,
    mr,
    dob: f.get('dob') || '',
    emg: f.get('emg') || '',
    emgr: f.get('emgr') || '',
    addr: f.get('addr') || '',
    ml: +f.get('ml') || 350,
    freq: f.get('freq') || 'Every 6 months',
    issue: f.get('issue') || 'W/O/R',
    tests: null,
    tested: null,
    defer: null
  });
  persist();
  if (again) {
    form.reset();
    document.querySelectorAll('#adG .bgp').forEach(x => x.classList.remove('on'));
    form.querySelector('input').focus();
  } else {
    closeSheet();
    route();
  }
  return false;
}
function addReq(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const g = document.querySelector('#adG .bgp.on');
  if (!g) {
    alert('Choose a blood group.');
    return false;
  }
  S.requests.unshift({
    id: 'PBB-' + S.seq++,
    pt: f.get('pt'),
    hosp: f.get('hosp'),
    g: g.textContent,
    u: +f.get('u'),
    c: f.get('c'),
    urg: 'Urgent — within 2 days',
    by: '',
    ph: f.get('ph'),
    at: Date.now(),
    st: 'open',
    src: 'admin',
    called: []
  });
  persist();
  closeSheet();
  route();
  return false;
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "pbb-admin.js", error: String((e && e.message) || e) }); }

// pbb-admin2.js
try { (() => {
/* PBB admin — remaining screens. Depends on pbb-admin.js (S, adminShell, helpers). */

/* ---------------- OVERVIEW ----------------
   Every panel here answers a question somebody actually asks out loud:
   are we keeping up, which group will run out, who has gone quiet, when do the calls come. */
/* Bags on the shelf, and how many units of that group were asked for over the last year.
   Everything else on this screen is derived from these two numbers. */
const HELDBY = {
  null: {
    'O−': 2,
    'AB−': 3,
    'B−': 6,
    'A−': 11,
    'O+': 41,
    'A+': 34,
    'B+': 28,
    'AB+': 9
  },
  Zhob: {
    'O−': 0,
    'AB−': 1,
    'B−': 1,
    'A−': 2,
    'O+': 7,
    'A+': 5,
    'B+': 4,
    'AB+': 2
  },
  Pishin: {
    'O−': 1,
    'AB−': 0,
    'B−': 2,
    'A−': 3,
    'O+': 9,
    'A+': 6,
    'B+': 5,
    'AB+': 1
  }
};
const DEMANDBY = {
  Zhob: {
    'O−': 7,
    'AB−': 3,
    'B−': 8,
    'A−': 6,
    'O+': 34,
    'A+': 24,
    'B+': 27,
    'AB+': 4
  },
  Pishin: {
    'O−': 9,
    'AB−': 4,
    'B−': 11,
    'A−': 8,
    'O+': 41,
    'A+': 29,
    'B+': 32,
    'AB+': 5
  }
};
const HELD = HELDBY[SCOPE] || HELDBY[null];
const DEMAND = DEMANDBY[SCOPE] || {
  'O−': 38,
  'AB−': 14,
  'B−': 44,
  'A−': 36,
  'O+': 210,
  'A+': 150,
  'B+': 165,
  'AB+': 22
};
/* Months of cover: what is held, against the rate it is asked for. Under one month is a shortage. */
const held = g => (HELDBY[SCOPE] || HELDBY[null])[g];
const demand = g => (DEMANDBY[SCOPE] || DEMAND)[g];
const cover = g => {
  const d = demand(g);
  return d ? held(g) / (d / 12) : 99;
};
const coverClass = g => {
  const c = cover(g);
  return c < 1 ? 'cr' : c < 2 ? 'lo' : 'ok';
};
const STOCKA = () => Object.keys(HELDBY[null]).map(g => [g, held(g), coverClass(g)]);
const REG = [1142, 1158, 1171, 1189, 1204, 1223, 1241, 1258, 1272, 1289, 1301, 1318];
const OPENREQ = [9, 7, 11, 8, 12, 10, 14, 9, 13, 7, 11, 8];
const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const BAGS = [318, 352, 340, 376, 361, 404, 392, 431, 377, 448, 412, 467];
const ANSWERED = [74, 78, 76, 81, 79, 84, 82, 86, 83, 88, 85, 89]; /* % of requests answered, used on the time-to-donor card */
const HOURS = [1, 1, 1, 1, 2, 3, 5, 9, 14, 17, 15, 12, 10, 13, 16, 19, 22, 18, 13, 9, 6, 4, 3, 2];
/* Response time in minutes, this year against last, per town — a branch's own figure, not the org's. */
const RESPBY = {
  null: [168, 260],
  Zhob: [252, 405],
  Pishin: [150, 222]
};
const RESP = RESPBY[SCOPE] ? RESPBY[SCOPE][0] : RESPBY[null][0],
  RESPWAS = RESPBY[SCOPE] ? RESPBY[SCOPE][1] : RESPBY[null][1];
const resp = () => RESPBY[SCOPE] || RESPBY[null];
const hhmm = m => Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm';
/* The peak window, and its real share of the year's requests. */
const HTOT = HOURS.reduce((a, b) => a + b, 0);
const PEAKFROM = 15,
  PEAKTO = 18;
const PEAKSHARE = Math.round(HOURS.slice(PEAKFROM, PEAKTO + 1).reduce((a, b) => a + b, 0) / HTOT * 100);
const QUIETEST = Math.min(...HOURS);
/* Activity and last-update per town. The donor count is NOT held here — it is counted from the
   register itself, so this panel and the headline card can never state two different numbers. */
const ACT = {
  Quetta: ['today', 96],
  Pishin: ['today', 88],
  Loralai: ['2 days', 71],
  Zhob: ['9 days', 34],
  Chaman: ['never', 12],
  'Muslim Bagh': ['today', 80]
};
/* Every town, so a donor can never sit in one the panel does not show. Towns without an office
   are listed only once somebody there is on the register. */
const TOWNACT = () => window.PBBTOWNS.filter(t => ACT[t] || townCount(t)).map(t => [t, ...(ACT[t] || ['—', 0])]);
const spark = (vals, col) => {
  const mx = Math.max(...vals),
    mn = Math.min(...vals),
    w = 100,
    h = 28;
  const pts = vals.map((v, i) => [i / (vals.length - 1) * w, h - (v - mn) / (mx - mn || 1) * h].map(x => x.toFixed(1)).join(',')).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
};
const ring = (pct, col, label) => {
  const r = 34,
    c = 2 * Math.PI * r;
  return `<div class="ringwrap"><svg viewBox="0 0 80 80" class="ring"><circle cx="40" cy="40" r="${r}" fill="none" stroke="var(--line)" stroke-width="9"/><circle cx="40" cy="40" r="${r}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(c * pct / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 40 40)"/></svg><div class="ringv"><b>${pct}%</b><span>${label}</span></div></div>`;
};
PAGES['admin/overview'] = () => {
  const rq = scoped(S.requests),
    open = rq.filter(r => r.st === 'open'),
    dn = scoped(S.donors);
  const ready = dn.filter(d => elig(d).ok).length;
  const crit = open.filter(r => /Critical/.test(r.urg));
  const unscreened = dn.filter(d => !D(d, 'tests')).length;
  const stale = dn.filter(d => {
    const t = D(d, 'tested');
    return t && days(t) > 180;
  }).length;
  const never = dn.filter(d => !d.times).length;
  const notCallable = dn.length - ready;
  const ratio = Object.keys(HELDBY[null]).map(g => [g, held(g), demand(g), +cover(g).toFixed(1)]).sort((a, b) => a[3] - b[3]);
  const peak = HOURS.indexOf(Math.max(...HOURS));
  return adminShell('overview', `
 ${crit.length ? `<div class="alert"><div><b>${crit.length} critical ${crit.length === 1 ? 'request' : 'requests'} open.</b> ${crit[0].g} · ${crit[0].hosp} · asked ${ago(crit[0].at)}</div><a href="#/admin/requests" class="btn btn-w btn-s">Open the list</a></div>` : '<div class="okbar">No critical requests open right now.</div>'}

 <div class="kpirow">
 <div class="kpi"><div class="l">Donors on the register</div><div class="row" style="justify-content:space-between;align-items:flex-end"><div class="n">${dn.length.toLocaleString()}</div><div class="dl">${never} ${never === 1 ? 'has' : 'have'} never given</div></div>${spark(REG, 'var(--grn)')}</div>
 <div class="kpi"><div class="l">Can give today</div><div class="row" style="justify-content:space-between;align-items:flex-end"><div class="n">${ready}</div><div class="dl">${dn.length ? Math.round(ready / dn.length * 100) : 0}% of the register</div></div><div class="mini"><i style="width:${dn.length ? Math.round(ready / dn.length * 100) : 0}%"></i></div></div>
 <div class="kpi ${open.length ? 'warn' : ''}"><div class="l">Open requests</div><div class="row" style="justify-content:space-between;align-items:flex-end"><div class="n r">${open.length}</div><div class="dl ${crit.length ? 'dn' : ''}">${crit.length} critical</div></div>${spark(OPENREQ, 'var(--red)')}</div>
 <div class="kpi"><div class="l">Typical time to a donor</div><div class="row" style="justify-content:space-between;align-items:flex-end"><div class="n">${hhmm(resp()[0])}</div><div class="dl up">${hhmm(resp()[1] - resp()[0])} faster</div></div><div class="dl" style="margin-top:8px">Against ${hhmm(resp()[1])} a year ago</div>${spark(ANSWERED, 'var(--ink)')}</div>
 </div>

 <div class="dash2">
 <div class="acard"><div class="row" style="justify-content:space-between;align-items:baseline;margin-bottom:4px"><h3>Which group runs out first</h3><span class="sm">months of cover</span></div>
 <p class="sm" style="margin-bottom:18px">The single figure worth watching, and the one a shelf count cannot give you. ${ratio.length ? `${ratio[ratio.length - 1][1]} ${ratio[ratio.length - 1][1] === 1 ? 'bag' : 'bags'} of ${ratio[ratio.length - 1][0]} is ${ratio[ratio.length - 1][3]} months of cover, while ${ratio[0][1]} ${ratio[0][1] === 1 ? 'bag' : 'bags'} of ${ratio[0][0]} is ${ratio[0][3]} months` : ''}. The stock boxes below are coloured by this same calculation.</p>
 <div class="ratiorows">${ratio.map(([g, n, d, r]) => `<div class="rrow ${r < 1 ? 'bad' : r < 2 ? 'mid' : ''}">
 <span class="rg">${g}</span>
 <span class="rbar"><i style="width:${Math.min(100, r / 4 * 100)}%"></i></span>
 <span class="rn">${r} months</span><span class="rd">${n} held · ${d} asked a year</span>
 <span class="tag ${r < 1 ? 'no' : r < 2 ? 'wt' : 'ok'}">${r < 1 ? 'Will run out' : r < 2 ? 'Tight' : 'Comfortable'}</span></div>`).join('')}</div>
 <div class="ahint" style="margin-top:16px">O− is the group every shortage starts with: it can be given to anybody, so it is spent on emergencies before the right group is known.</div></div>

 <div class="acard"><h3 style="margin-bottom:16px">The register's health</h3>
 <div class="ringrow">${ring(dn.length ? Math.round((dn.length - unscreened) / dn.length * 100) : 0, 'var(--grn)', 'screened')}${ring(dn.length ? Math.round((dn.length - never) / dn.length * 100) : 0, 'var(--ink)', 'have given')}${ring(38, 'var(--red)', 'came back')}</div>
 <div style="margin-top:20px">
 ${[[unscreened + ' never screened', 'Cannot be called until the five tests are done', '#/admin/donors', unscreened ? 'no' : 'ok'], [stale + ' screened over six months ago', 'Results should be repeated before issuing', '#/admin/donors', stale ? 'wt' : 'ok'], [never + ' have never given', 'Registered, but never once called in', '#/admin/find', 'gy']].map(([t, s, u, c]) => `<a href="${u}" class="todo2"><div><b>${t}</b><span>${s}</span></div><span class="tag ${c}">${c === 'no' ? 'Blocked' : c === 'wt' ? 'Stale' : '—'}</span></a>`).join('')}</div></div>
 </div>

 <div class="dash2" style="margin-top:18px">
 <div class="acard"><div class="row" style="justify-content:space-between;align-items:baseline;margin-bottom:16px"><h3>Bags collected</h3><span class="sm">twelve months · all fourteen towns · ${BAGS.reduce((a, b) => a + b, 0).toLocaleString()} total</span></div>
 <div class="chart" style="height:150px">${BAGS.map((v, i) => `<div class="bar${i === 11 ? ' pk' : ''}" style="height:${Math.round(v / Math.max(...BAGS) * 100)}%"><span>${MONTHS[i]} · ${v} bags</span></div>`).join('')}</div>
 <div class="axis">${MONTHS.map(m => `<span>${m}</span>`).join('')}</div></div>

 <div class="acard"><div class="row" style="justify-content:space-between;align-items:baseline;margin-bottom:6px"><h3>When the calls come</h3><span class="sm">peak ${String(peak).padStart(2, '0')}:00</span></div>
 <p class="sm" style="margin-bottom:16px">Requests by hour across all fourteen towns, over a year. It says plainly when the desk needs somebody on it.</p>
 <div class="hourly">${HOURS.map((v, i) => `<i class="${v >= 15 ? 'pk' : ''}" style="height:${Math.round(v / Math.max(...HOURS) * 100)}%" title="${i}:00 · ${v}"></i>`).join('')}</div>
 <div class="axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
 <div class="ahint" style="margin-top:14px">${PEAKSHARE}% of all requests arrive between ${PEAKFROM}:00 and ${PEAKTO}:00, and they do not stop at night — the quietest hour of the year still carries ${QUIETEST}.</div></div>
 </div>

 <div class="dash2" style="margin-top:18px">
 <div class="acard"><div class="row" style="justify-content:space-between;align-items:baseline;margin-bottom:16px"><h3>Stock by group</h3><a href="#/admin/inventory" class="minilink">Update</a></div>
 <div class="stockgrid">${STOCKA().map(([g, n, s]) => `<div class="sbox ${s}"><div class="sg">${g}</div><div class="sn">${n}</div><div class="ss">${n === 1 ? 'bag' : 'bags'}</div></div>`).join('')}</div>
 <p class="sm" style="margin-top:14px">${SCOPE || 'Quetta'} · updated 2 hours ago</p></div>

 <div class="acard"><h3 style="margin-bottom:6px">${SCOPE ? SCOPE : 'Towns, and who has gone quiet'}</h3><p class="sm" style="margin-bottom:16px">${SCOPE ? 'Your own town. The head office holds the picture across all fourteen.' : 'The six branch offices, and any other town with somebody on the register. A branch that stops updating is the reason the public shortage strip goes stale.'}</p>
 ${(SCOPE ? TOWNACT().filter(t => t[0] === SCOPE) : TOWNACT()).map(([t, u, act]) => `<div class="townrow"><span class="tn">${t}</span><span class="tbar"><i class="${act < 40 ? 'bad' : act < 75 ? 'mid' : ''}" style="width:${act}%"></i></span><span class="td">${townCount(t).toLocaleString()}</span><span class="tag ${u === 'never' ? 'no' : u.includes('day') && parseInt(u) > 7 ? 'wt' : 'ok'}">${u === 'today' ? 'Today' : u === 'never' ? 'Never' : u}</span></div>`).join('')}
 ${SCOPE ? '' : '<a href="#/admin/network" class="btn btn-o btn-s" style="margin-top:16px;width:100%">All fourteen towns</a>'}</div>
 </div>

 <div class="acard" style="margin-top:18px"><div class="row" style="justify-content:space-between;align-items:baseline;margin-bottom:16px"><h3>Latest activity</h3><a href="#/admin/requests" class="minilink">All requests</a></div>
 <div class="atbl" style="border:0"><table><tbody>
 ${rq.slice(0, 5).map(r => `<tr onclick="openReq('${r.id}')"><td class="m2"><div class="nm">${r.hosp}</div><div class="sm">${r.id} · ${r.src === 'web' ? 'from the website' : 'entered by staff'}</div></td><td class="m1">${bgTag(r.g)}</td><td class="sm">${ago(r.at)}</td><td class="m3">${r.st === 'open' ? '<span class="tag no">Open</span>' : '<span class="tag ok">Arranged</span>'}</td></tr>`).join('')}
 </tbody></table></div></div>`, `<h1>Overview</h1><span class="asub">${SCOPE || 'All fourteen towns'}</span>`);
};

/* ---------------- INVENTORY ---------------- */
PAGES['admin/inventory'] = () => adminShell('inventory', `
 <div class="stockgrid big">${STOCKA().map(([g, n, s]) => `<div class="sbox ${s}"><div class="row" style="justify-content:space-between"><div class="sg">${g}</div><span class="tag ${s === 'cr' ? 'no' : s === 'lo' ? 'wt' : 'ok'}">${s === 'cr' ? 'Critical' : s === 'lo' ? 'Low' : 'Enough'}</span></div>
 <div class="sn big">${n}</div><div class="ss">${n === 1 ? 'bag' : 'bags'} in the fridge</div>
 <div class="row" style="gap:6px;margin-top:12px"><button class="btn btn-o btn-s" onclick="adj(this,-1)">−</button><button class="btn btn-o btn-s" onclick="adj(this,1)">+</button></div></div>`).join('')}</div>
 <div class="g2" style="gap:18px;margin-top:18px;align-items:start">
 <div class="acard"><h3 style="margin-bottom:14px">Expiring soon</h3>
 ${[['O−', '#4821', '3 days', 'cr'], ['B+', '#4776', '9 days', ''], ['A+', '#4802', '12 days', '']].map(([g, u, d, c]) => `<div class="row" style="padding:11px 0;border-bottom:1px solid var(--line)">${bgTag(g)}<span class="mono2" style="flex:1">${u}</span><span class="${c === 'cr' ? 'red' : 'sm'}" style="font-weight:700">${d}</span></div>`).join('')}</div>
 <div class="acard"><h3 style="margin-bottom:6px">Show on the public website</h3><p class="sm" style="margin-bottom:14px">The shortage strip on the home page reads these numbers.</p>
 <label class="chk"><input type="checkbox" checked><span>Show what we are short of</span></label>
 <p class="ahint" style="margin-top:14px">If no branch updates for <b>48 hours</b> the strip hides itself automatically, so the public page can never show stale stock.</p></div>
 </div>`, `<h1>Inventory</h1><span class="asub">${SCOPE || 'Quetta'} · updated 2 hours ago</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s">Save stock</button>`);
function adj(b, d) {
  const box = b.closest('.sbox').querySelector('.sn');
  box.textContent = Math.max(0, +box.textContent + d);
}

/* ---------------- VOLUNTEERS ---------------- */
const VOLS = [{
  n: 'Hafeez Ullah',
  c: 'Quetta',
  sk: 'Camps',
  st: 'new'
}, {
  n: 'Sabir Khan',
  c: 'Zhob',
  sk: 'Outreach',
  st: 'active'
}, {
  n: 'Naveed Ahmed',
  c: 'Pishin',
  sk: 'Driving',
  st: 'contacted'
}, {
  n: 'Asma Bibi',
  c: 'Quetta',
  sk: 'Office',
  st: 'active'
}, {
  n: 'Rahim Dad',
  c: 'Loralai',
  sk: 'Camps',
  st: 'new'
}];
PAGES['admin/volunteers'] = () => {
  const l = scoped(VOLS);
  return adminShell('volunteers', `
 <div class="akpi"><div class="c"><div class="l">Not yet contacted</div><div class="n r">${l.filter(v => v.st === 'new').length}</div></div>
 <div class="c"><div class="l">Contacted</div><div class="n">${l.filter(v => v.st === 'contacted').length}</div></div>
 <div class="c"><div class="l">Active</div><div class="n">${l.filter(v => v.st === 'active').length}</div></div>
 <div class="c"><div class="l">Total</div><div class="n">${l.length}</div></div></div>
 <div class="atbl"><table><thead><tr><th>Name</th><th>Town</th><th>Can help with</th><th>Stage</th></tr></thead><tbody>
 ${l.map(v => `<tr><td class="m2"><div class="nm">${v.n}</div><div class="sm">${v.c} · ${v.sk}</div></td><td>${v.c}</td><td>${v.sk}</td><td class="m3">${v.st === 'new' ? '<span class="tag no">Not contacted</span>' : v.st === 'active' ? '<span class="tag ok">Active</span>' : '<span class="tag wt">Contacted</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <p class="ahint">Volunteers who signed up and were never called are the most common failure of any volunteer programme. That count sits first, in red, for a reason.</p>`, `<h1>Volunteers</h1><span class="asub">${l.length} ${l.length === 1 ? 'person' : 'people'}</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('addVolunteer')">+ Add volunteer</button>`);
};

/* ---------------- THALASSEMIA ---------------- */
const THAL = [{
  id: 'T-014',
  n: 'Habiba',
  a: 6,
  g: 'B+',
  c: 'Quetta',
  due: -4,
  sp: 0,
  ph: 0
}, {
  id: 'T-027',
  n: 'Zarghoona',
  a: 11,
  g: 'O+',
  c: 'Pishin',
  due: 3,
  sp: 1,
  ph: 1
}, {
  id: 'T-031',
  n: 'Naveed',
  a: 4,
  g: 'A−',
  c: 'Zhob',
  due: 9,
  sp: 0,
  ph: 0
}, {
  id: 'T-044',
  n: 'Bilal',
  a: 8,
  g: 'O−',
  c: 'Quetta',
  due: 1,
  sp: 1,
  ph: 0
}];
PAGES['admin/thalassemia'] = () => {
  const l = scoped(THAL);
  return adminShell('thalassemia', `
 <div class="akpi"><div class="c"><div class="l">Transfusion overdue</div><div class="n r">${l.filter(t => t.due < 0).length}</div></div>
 <div class="c"><div class="l">Due this week</div><div class="n">${l.filter(t => t.due >= 0 && t.due <= 7).length}</div></div>
 <div class="c"><div class="l">Registered children</div><div class="n">${SCOPE ? l.length : 200}</div></div>
 <div class="c"><div class="l">Photo consent on file</div><div class="n">${l.filter(t => t.ph).length}</div></div></div>
 <div class="atbl"><table><thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Group</th><th>Next transfusion</th><th>Photo consent</th></tr></thead><tbody>
 ${l.map(t => `<tr><td class="mono2 m1">${t.id}</td><td class="m2"><div class="nm">${t.n}</div><div class="sm">${t.a} years · ${t.c}${t.sp ? ' · sponsored' : ''}</div></td><td>${t.a}</td><td>${bgTag(t.g)}</td>
 <td class="${t.due < 0 ? 'red' : ''}" style="font-weight:600">${t.due < 0 ? 'Overdue ' + -t.due + ' days' : 'In ' + t.due + ' days'}</td>
 <td class="m3">${t.ph ? '<span class="tag ok">On file</span>' : '<span class="tag gy">Not given</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <p class="ahint">Photo consent is <b>off by default</b> and needs a signed form from the family. A child without consent is still counted and still transfused — but never appears on the public website.</p>`, `<h1>Thalassemia register</h1><span class="asub">${SCOPE ? l.length + (l.length === 1 ? ' child' : ' children') : '200 children'}</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('addChild')">+ Register a child</button>`);
};

/* ---------------- LEDGER ---------------- */
const YEARLY = [[2008, 5905], [2009, 5920], [2010, 6937], [2011, 9484], [2012, 5120], [2013, null], [2014, null], [2015, null]];
PAGES['admin/ledger'] = () => adminShell('ledger', `
 <div class="g2" style="gap:18px;align-items:start">
 <div class="acard"><h3 style="margin-bottom:4px">Yearly totals</h3><p class="sm" style="margin-bottom:18px">Solid bars are figures on record. Hatched years still need entering.</p>
 <div class="chart" style="height:150px">${YEARLY.map(([y, b]) => `<div class="bar${b ? y === 2011 ? ' pk' : '' : ' gap'}" style="height:${b ? Math.round(b / 9484 * 100) : 28}%"><span>${y}${b ? ' · ' + b.toLocaleString() + ' bags' : ' · no figures yet'}</span></div>`).join('')}</div>
 <div class="axis"><span>2008</span><span>2015</span></div></div>
 <div class="acard"><h3 style="margin-bottom:4px">Enter a year</h3><p class="sm" style="margin-bottom:16px">The gap between 2013 and today closes with four numbers a year — no migration needed.</p>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Year</label><input class="fld" placeholder="2013"></div><div class="fgrp"><label class="lb">Bags</label><input class="fld"></div>
 <div class="fgrp"><label class="lb">CCs</label><input class="fld"></div><div class="fgrp"><label class="lb">Platelets + FFP</label><input class="fld"></div></div>
 <button class="btn btn-p" style="width:100%">Save the year</button></div></div>
 <div class="atbl" style="margin-top:18px"><table><thead><tr><th>Date</th><th>Donor</th><th>Group</th><th>Bags</th><th>Town</th></tr></thead><tbody>
 ${S.donations.length ? S.donations.map(d => `<tr><td class="m1 sm">${d.d}</td><td class="m2"><div class="nm">${d.n}</div><div class="sm">${d.c}</div></td><td>${bgTag(d.g)}</td><td class="m3">${d.bags}</td><td>${d.c}</td></tr>`).join('') : '<tr><td colspan="5" class="aempty">Nothing recorded yet.</td></tr>'}
 </tbody></table></div>`, `<h1>Donations ledger</h1><span class="asub">Where the public chart comes from</span>`);

/* ---------------- CONTENT: HOMEPAGE ---------------- */
const SECTIONS = [['Announcement strip', 'live', 'scheduled to 20 Sep'], ['Hero', 'live', 'headline, buttons, photograph'], ['Key numbers', 'live', 'four figures'], ['Shortage strip', 'live', 'reads from Inventory'], ['What we do', 'live', 'four cards'], ['Yearly chart', 'live', 'reads from the ledger'], ['Where we are', 'live', 'map + branches'], ['Announcements', 'live', 'latest three'], ['Gallery preview', 'hidden', 'latest four photos'], ['Closing band', 'live', 'red band + button']];
PAGES['admin/homepage'] = () => adminShell('homepage', `
 <div class="g2" style="gap:18px;align-items:start">
 <div><p class="sm" style="margin-bottom:12px">Drag to reorder. Hide anything you are not ready to show.</p>
 ${SECTIONS.map(([n, s, d]) => `<div class="secrow"><span class="grip">⠿</span><div style="flex:1"><b>${n}</b><span class="sm" style="display:block">${d}</span></div>
 <button class="tag ${s === 'live' ? 'ok' : 'gy'}" onclick="this.classList.toggle('ok');this.classList.toggle('gy');this.textContent=this.textContent==='Live'?'Hidden':'Live'">${s === 'live' ? 'Live' : 'Hidden'}</button>
 <button class="btn btn-o btn-s">Edit</button></div>`).join('')}
 <div class="addrow">+ Add a section</div></div>
 <div class="acard"><h3 style="margin-bottom:16px">Editing: Hero</h3>
 <div class="fgrp"><label class="lb">Headline</label><input class="fld" value="Blood is life. We keep the record."></div>
 <div class="fgrp"><label class="lb">Sub-headline</label><textarea class="fld" rows="3">Screened, tested blood for anyone who needs it — irrespective of language, colour, religion, race or ethnicity.</textarea></div>
 <div class="fgrp"><label class="lb">Buttons</label><div class="row" style="gap:8px"><span class="chip">Request Blood</span><span class="chip">Register as a Donor</span><span class="chip" style="border-style:dashed">+ add</span></div></div>
 <div class="row" style="gap:8px;margin-top:6px"><span class="tag ok">English ✓</span><span class="tag ok">اردو ✓</span><span class="tag no">پښتو missing</span></div>
 <button class="btn btn-p" style="width:100%;margin-top:18px">Save and publish</button></div></div>`, `<h1>Homepage</h1><span class="asub">Ten sections</span><span style="margin-left:auto"></span><a href="#/" class="btn btn-o btn-s">View the site</a><button class="btn btn-p btn-s">Publish</button>`);

/* ---------------- CONTENT: PAGES ---------------- */
const SITEPAGES = [['Home', '/', '10', 'Home', 'EN اردو', 'live'], ['Our story', '/about', '7', 'About', 'EN اردو', 'live'], ['Services', '/services', '6', 'Services', 'EN', 'live'], ['Our branches', '/branches', '3', 'About', 'EN اردو', 'live'], ['Thalassemia children', '/thalassemia', '5', 'Services', 'EN اردو', 'live'], ['Committee & staff', '/people', '3', 'About', 'EN', 'live'], ['Photos & videos', '/gallery', '1', 'Media', 'EN', 'live'], ['Announcements', '/news', '1', 'Media', 'EN', 'live'], ['Donate', '/donate', '6', 'Get involved', 'EN اردو', 'live'], ['Contact', '/contact', '4', 'Contact', 'EN', 'live'], ['Annual report 2026', '/report-2026', '9', '—', 'EN', 'draft']];
PAGES['admin/pages'] = () => adminShell('pages', `
 <div class="atbl"><table><thead><tr><th>Page</th><th>Address</th><th>Blocks</th><th>In the menu</th><th>Languages</th><th>Status</th></tr></thead><tbody>
 ${SITEPAGES.map(([n, u, b, m, l, s]) => `<tr><td class="m2"><div class="nm">${n}</div><div class="sm mono2">${u}</div></td><td class="mono2">${u}</td><td>${b}</td><td>${m}</td><td class="m1">${l}</td><td class="m3">${s === 'live' ? '<span class="tag ok">Live</span>' : '<span class="tag gy">Draft</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <div class="g2" style="gap:18px;margin-top:18px;align-items:start">
 <div class="acard"><h3 style="margin-bottom:6px">Blocks you can build a page from</h3><p class="sm" style="margin-bottom:14px">Add, drag, remove. No developer needed.</p>
 <div class="row" style="gap:7px">${['heading', 'rich text', 'text + image', 'cards', 'stat row', 'timeline', 'people grid', 'gallery', 'FAQ', 'table', 'quote', 'file download', 'video', 'map', 'form', 'call to action'].map(x => `<span class="chip">${x}</span>`).join('')}</div></div>
 <div class="acard"><h3 style="margin-bottom:6px">Every publish is saved</h3><p class="sm">You can look at any earlier version of a page and put it back. Nothing is lost by a wrong edit.</p>
 <div style="margin-top:14px">${[['Today, 11:04', 'Olus Yar'], ['7 August', 'Web administrator'], ['2 August', 'Web administrator']].map(([d, w]) => `<div class="drow"><span>${d}</span><b>${w}</b></div>`).join('')}</div></div></div>`, `<h1>Pages</h1><span class="asub">${SITEPAGES.length} pages</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('newPage')">+ New page</button>`);

/* ---------------- CONTENT: ANNOUNCEMENTS ---------------- */
PAGES['admin/announcements'] = () => adminShell('announcements', `
 <div class="atbl"><table><thead><tr><th>Message</th><th>Kind</th><th>Starts</th><th>Ends</th><th>Shown on</th><th>Status</th></tr></thead><tbody>
 ${[['Free blood donation camp, Pishin branch, 12 September', 'Camp', 'now', '20 Sep', 'strip · home · news', 'live'], ['New building — final stage', 'Notice', '3 Sep', '—', 'news', 'live'], ['Eid ul Adha hide collection', 'Appeal', '1 Jun', '20 Jun', 'strip · home', 'expired']].map(([m, k, s, e, w, st]) => `<tr><td class="m2"><div class="nm">${m}</div><div class="sm">${w}</div></td><td class="m1">${k}</td><td class="sm">${s}</td><td class="sm">${e}</td><td class="sm">${w}</td><td class="m3">${st === 'live' ? '<span class="tag ok">Live</span>' : '<span class="tag gy">Expired</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:16px">New announcement</h3>
 <div class="g2" style="gap:18px;align-items:start">
 <div><div class="fgrp"><label class="lb">Message</label><textarea class="fld" rows="3" placeholder="Keep it to one sentence."></textarea></div>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Starts</label><input class="fld" type="date"></div><div class="fgrp"><label class="lb">Ends</label><input class="fld" type="date"></div></div></div>
 <div><label class="lb">Where it appears</label>
 ${[['Strip across the top of every page', 1], ['Card on the home page', 1], ['The announcements page', 1], ['WhatsApp broadcast — when the bot is ready', 0]].map(([t, on]) => `<label class="chk"><input type="checkbox" ${on ? 'checked' : 'disabled'}><span>${t}</span></label>`).join('')}
 <button class="btn btn-p" style="width:100%;margin-top:16px">Publish</button></div></div>
 <p class="ahint">An end date is required on urgent notices. The most common failing of a small organisation's website is a banner from two years ago that nobody remembered to remove.</p></div>`, `<h1>Announcements</h1><span class="asub">1 live</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('newAnnouncement')">+ New</button>`);

/* ---------------- CONTENT: EVENTS ---------------- */
PAGES['admin/events'] = () => adminShell('events', `
 <div class="akpi"><div class="c"><div class="l">Upcoming</div><div class="n r">3</div></div><div class="c"><div class="l">Registered to attend</div><div class="n">48</div></div><div class="c"><div class="l">Past events</div><div class="n">61</div></div><div class="c"><div class="l">Campaigns running</div><div class="n">1</div></div></div>
 <div class="atbl"><table><thead><tr><th>Event</th><th>Kind</th><th>Date</th><th>Town</th><th>Attending</th><th>Status</th></tr></thead><tbody>
 ${[['Free donation camp', 'Camp', '12 Sep', 'Pishin', '48', 'live'], ['University awareness drive', 'Awareness', '28 Sep', 'Quetta', '—', 'draft'], ['Eid ul Adha hide collection', 'Campaign', 'seasonal', 'All', '—', 'live']].map(([n, k, d, c, a, s]) => `<tr><td class="m2"><div class="nm">${n}</div><div class="sm">${k} · ${c}</div></td><td class="m1">${k}</td><td class="sm">${d}</td><td>${c}</td><td>${a}</td><td class="m3">${s === 'live' ? '<span class="tag ok">Published</span>' : '<span class="tag gy">Draft</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">Who is coming — Pishin camp</h3><p class="sm" style="margin-bottom:14px">People who registered on the website.</p>
 ${[['Hameed Ullah', 'O+', 'Pishin'], ['Sana Gul', 'B−', 'Pishin'], ['Abdul Manan', 'A+', 'Huramzai']].map(([n, g, c]) => `<div class="row" style="padding:11px 0;border-bottom:1px solid var(--line)">${bgTag(g)}<span style="flex:1;font-weight:600">${n}</span><span class="sm">${c}</span><button class="btn btn-o btn-s">Add to the register</button></div>`).join('')}
 <p class="ahint">A camp should grow the register. Adding an attendee straight to the donor list is the whole reason to take registrations here instead of on paper.</p></div>`, `<h1>Events &amp; campaigns</h1><span class="asub">3 upcoming</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('newEvent')">+ New event</button>`);

/* ---------------- CONTENT: MEDIA ---------------- */
PAGES['admin/media'] = () => adminShell('media', `
 <div class="dropzone">Drag photographs, posters or PDFs here</div>
 <div class="medgrid">${Array.from({
  length: 10
}, (_, i) => `<div class="medcard"><div class="ph" style="aspect-ratio:1"><image-slot id="media-${i + 1}" shape="rect" placeholder="Drop a photo"></image-slot></div>
 <div style="padding:10px"><div class="sm">${['Camp', 'Ambulance', 'Building', 'Thalassemia', 'Eid', 'Staff', 'Camp', 'Awareness', 'Building', 'Camp'][i]}</div>
 <span class="tag ${i % 3 ? 'gy' : 'ok'}" style="margin-top:6px">${i % 3 ? 'Not used' : 'Used ×' + (i + 1)}</span></div></div>`).join('')}</div>
 <div class="g2" style="gap:18px;margin-top:18px">
 <div class="acard"><h3 style="margin-bottom:6px">Upload once, use anywhere</h3><p class="sm">The gallery, publications, events, people and any page block all pick from this one library. "Used ×3" stops anyone deleting a photo that is live on three pages.</p></div>
 <div class="acard" style="border-color:#F0BDB6"><h3 style="margin-bottom:6px;color:var(--red-d)">Consent flag</h3><p class="sm">Photographs of patients or children carry a consent flag. Without it, the picker refuses to place the image on a public page — it is enforced, not a policy on paper.</p></div></div>`, `<h1>Media</h1><span class="asub">10 files</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('upload')">+ Upload</button>`);

/* ---------------- BRANCHES ---------------- */
const BR = [['Quetta', 'Zainab Chamber, Shara-e-Adalat', '081-2836820', 'today', 1], ['Loralai', 'Sayed Abdul Qadir Road', '0824-662066', '2 days ago', 0], ['Pishin', 'Band Road', '0826-421288', 'today', 0], ['Zhob', 'Sharbat Khan Road', '0822-413902', '9 days ago', 0], ['Chaman', 'Taj Road', '—', 'never', 0], ['Muslim Bagh', 'Aryan Market', '—', '4 days ago', 0]];
PAGES['admin/branches'] = () => adminShell('branches', `
 <div class="atbl"><table><thead><tr><th>Branch</th><th>Address</th><th>Phone</th><th>Donors</th><th>Stock updated</th></tr></thead><tbody>
 ${(SCOPE ? BR.filter(b => b[0] === SCOPE) : BR).map(([n, a, p, u, h]) => `<tr><td class="m2"><div class="nm">${n}${h ? ' <span class="hd-tag">HEAD OFFICE</span>' : ''}</div><div class="sm">${a}</div></td><td class="sm">${a}</td><td class="mono2 m1">${p}</td><td>${townCount(n).toLocaleString()}</td><td class="m3 ${/never|9 days/.test(u) ? 'red' : ''}" style="font-weight:600">${u}</td></tr>`).join('')}
 </tbody></table></div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">Towns served without an office</h3><p class="sm" style="margin-bottom:14px">These feed the town list on every form across the website.</p>
 ${window.PBBTOWNS.filter(t => !OFFICES.includes(t)).map(t => `<span class="chip">${t}</span>`).join('')}<span class="chip" style="border-style:dashed;color:var(--red)">+ add a town</span></div>
 <p class="ahint">"Stock updated" is the accountability column. A branch that has not updated in a week is the reason the public shortage strip would go stale.</p>`, `<h1>Branches</h1><span class="asub">${SCOPE ? SCOPE + ' only' : '6 offices · 14 towns'}</span><span style="margin-left:auto"></span>${hd('<button class="btn btn-p btn-s" onclick="openForm(&quot;addBranch&quot;)">+ Add branch</button>')}`);

/* ---------------- SITE SETTINGS ---------------- */
PAGES['admin/settings'] = () => adminShell('settings', `
 <div class="g2" style="gap:18px;align-items:start">
 <div class="acard"><h3 style="margin-bottom:16px">The organisation</h3>
 ${[['Name', 'Pashtoonkhwa Blood Bank & Welfare Society'], ['Head office', 'Zainab Chamber, Shara-e-Adalat, Quetta'], ['Phone', '081-2836820'], ['Second phone', '081-2839500'], ['Email', 'admin@pashtoonkhwabloodbank.org'], ['Founded', '24 March 1999']].map(([k, v]) => `<div class="fgrp"><label class="lb">${k}</label><input class="fld" value="${v}"></div>`).join('')}
 <button class="btn btn-p" style="width:100%">Save</button>
 <p class="ahint">Changed here, changed everywhere — the header, the footer, every contact block and every printed form.</p></div>
 <div>
 <div class="acard"><h3 style="margin-bottom:6px">Who can donate</h3><p class="sm" style="margin-bottom:16px">The same numbers the public Services page shows, so the two can never disagree.</p>
 ${[['Minimum age', 18], ['Maximum age', 60], ['Minimum weight (kg)', 50], ['Days between donations', 90], ['Most calls to one donor per day', 2]].map(([k, v]) => `<div class="row" style="padding:10px 0;border-bottom:1px solid var(--line)"><span style="flex:1;font-weight:600">${k}</span><input class="fld" style="width:88px;text-align:center" value="${v}"></div>`).join('')}</div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:16px">Languages</h3>
 ${[['English', 'default', 'ok'], ['اردو Urdu', 'live', 'ok'], ['پښتو Pashto', '62% translated', 'wt']].map(([l, s, c]) => `<div class="row" style="padding:11px 0;border-bottom:1px solid var(--line)"><span style="flex:1;font-weight:600">${l}</span><span class="tag ${c}">${s}</span></div>`).join('')}
 <p class="ahint">A language stays switched off until it is complete. Anything untranslated falls back to English rather than showing blank.</p></div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:16px">Switches</h3>
 ${[['Shortage strip on the home page', 1], ['Donor registration form', 1], ['Event registration', 1], ['WhatsApp button — when the bot is ready', 0]].map(([t, on]) => `<label class="chk"><input type="checkbox" ${on ? 'checked' : 'disabled'}><span>${t}</span></label>`).join('')}</div>
 </div></div>`, `<h1>Site settings</h1>`);

/* ---------------- ROLES ---------------- */
const RLIST = [['Olus Yar', 'Everything, all fourteen towns, including deleting and managing staff', 2], ['Executive', 'All data and all towns; publishes the website. Cannot delete or manage staff', 3], ['Branch manager', 'One town. Runs requests, donors and stock for that town', 6], ['Coordinator', 'Answers requests and calls donors. No editing of records', 4], ['Data entry', 'Adds and edits donors and donations. No status changes', 14], ['Accounts', 'Donations and receipts only', 2], ['Verifier', 'Approves donor records. Sees no phone numbers', 2], ['Volunteer lead', 'Volunteers and events only', 3]];
const PERMS = [['Donors', 'View', ['All', 'All', 'Own town', 'Own town', 'Own town', '—', 'All', '—']], ['Donors', 'Add and edit', ['✓', '✓', '✓', '✓', '✓', '—', '—', '—']], ['Donors', 'Delete or merge', ['✓', '—', '—', '—', '—', '—', '—', '—']], ['Requests', 'Answer and close', ['✓', '✓', '✓', '✓', '—', '—', '—', '—']], ['Inventory', 'Update stock', ['✓', '—', '✓', '—', '✓', '—', '—', '—']], ['Ledger', 'Record donations', ['✓', '✓', '✓', '✓', '✓', '✓', '—', '—']], ['Money', 'Verify receipts', ['✓', '✓', '—', '—', '—', '✓', '✓', '—']], ['Website', 'Edit and publish', ['✓', '✓', '—', '—', '—', '—', '—', '✓']], ['Settings', 'Change the rules', ['✓', '—', '—', '—', '—', '—', '—', '—']], ['Staff', 'Manage accounts', ['✓', '—', '—', '—', '—', '—', '—', '—']]];
PAGES['admin/roles'] = () => adminShell('roles', `
 <div class="rolegrid">${RLIST.map(([n, d, c]) => `<div class="acard" style="padding:16px"><b style="font-size:15px">${n}</b><p class="sm" style="margin-top:6px;line-height:1.5">${d}</p><span class="tag gy" style="margin-top:10px">${c} ${c === 1 ? 'person' : 'people'}</span></div>`).join('')}</div>
 <div class="acard" style="margin-top:18px;padding:0;overflow:auto"><div style="padding:20px 22px 10px"><h3>What each role can do</h3><p class="sm" style="margin-top:4px">Every cell is a switch. A new role starts as a copy of the nearest one.</p></div>
 <table class="permtbl"><thead><tr><th>Area</th><th>Action</th>${RLIST.map(r => `<th>${r[0]}</th>`).join('')}</tr></thead><tbody>
 ${PERMS.map(([a, act, cells]) => `<tr><td class="pa">${a}</td><td class="pact">${act}</td>${cells.map(c => `<td class="pc">${c === '✓' ? '<span class="yes">✓</span>' : c === '—' ? '<span class="no2">—</span>' : '<span class="scopetag">' + c + '</span>'}</td>`).join('')}</tr>`).join('')}
 </tbody></table></div>
 <div class="g2" style="gap:18px;margin-top:18px">
 <div class="acard"><h3 style="margin-bottom:6px">"Own town" is a rule in the database</h3><p class="sm">Not a hidden menu. A Zhob employee asking for donors gets Zhob rows — there is no address they can type that returns Quetta's. Try it with the role switcher.</p></div>
 <div class="acard" style="border-color:#F0BDB6"><h3 style="margin-bottom:6px;color:var(--red-d)">Three things nobody has by default</h3><p class="sm">Deleting a record, exporting the donor list, and granting a child's photo consent. Head office only, and each one is written to the log with a reason.</p></div></div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:14px">Staff accounts</h3>
 <div class="atbl" style="border:0"><table><tbody>
 ${[['Olus Yar', 'Head office', 'All', 'now'], ['Dr. Naseer Muhammad', 'Verifier', 'All', '2 hours ago'], ['Zhob coordinator', 'Branch manager', 'Zhob', 'yesterday'], ['Pishin desk', 'Data entry', 'Pishin', '3 days ago']].map(([n, r, t, l]) => `<tr><td class="m2"><div class="nm">${n}</div><div class="sm">${r} · ${t}</div></td><td class="m1">${r}</td><td>${t}</td><td class="m3 sm">${l}</td></tr>`).join('')}
 </tbody></table></div>
 <a href="#/admin/accounts" class="btn btn-o" style="margin-top:14px">Create an account instead</a></div>`, `<h1>Roles &amp; access</h1><span class="asub">8 roles · 36 people</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('newRole')">+ New role</button>`);
})(); } catch (e) { __ds_ns.__errors.push({ path: "pbb-admin2.js", error: String((e && e.message) || e) }); }

// pbb-admin3.js
try { (() => {
/* PBB admin — partners, submissions inbox, network, reports, audit. */

/* ---------------- PARTNERS & ORGANISATIONS ---------------- */
const PARTNERS = [{
  n: 'Civil Hospital, Quetta',
  k: 'Hospital',
  c: 'Quetta',
  st: 'active',
  since: '2004',
  note: 'Highest referrer. Named coordinator assigned.'
}, {
  n: 'Bolan Medical Complex',
  k: 'Hospital',
  c: 'Quetta',
  st: 'active',
  since: '2007',
  note: ''
}, {
  n: 'DHQ Hospital, Zhob',
  k: 'Hospital',
  c: 'Zhob',
  st: 'active',
  since: '2011',
  note: ''
}, {
  n: 'Quetta Diagnostic Laboratory',
  k: 'Laboratory',
  c: 'Quetta',
  st: 'pending',
  since: '—',
  note: 'Offering overflow screening capacity. Awaiting committee.'
}, {
  n: 'Al-Khidmat Welfare Society',
  k: 'Welfare society',
  c: 'Loralai',
  st: 'active',
  since: '2015',
  note: 'Runs the Eid hide collection in Loralai.'
}, {
  n: 'Balochistan University',
  k: 'University',
  c: 'Quetta',
  st: 'active',
  since: '2019',
  note: 'Two campus drives a year.'
}, {
  n: 'Sherani Welfare Trust',
  k: 'Welfare society',
  c: 'Sherani',
  st: 'pending',
  since: '—',
  note: 'Asking for a branch in a town we serve without an office.'
}, {
  n: 'Rahmat Foundation',
  k: 'Foundation',
  c: '—',
  st: 'pending',
  since: '—',
  note: 'Offering to fund screening kits for one year.'
}];
PAGES['admin/partners'] = () => {
  const l = SCOPE ? PARTNERS.filter(p => p.c === SCOPE) : PARTNERS,
    pend = l.filter(p => p.st === 'pending');
  return adminShell('partners', `
 ${pend.length ? `<div class="alert"><div><b>${pend.length} ${pend.length === 1 ? 'organisation is' : 'organisations are'} waiting for a decision.</b> Each one has to be approved by the organising committee.</div></div>` : ''}
 <div class="akpi">
 <div class="c"><div class="l">Active partners</div><div class="n">${l.filter(p => p.st === 'active').length}</div></div>
 <div class="c"><div class="l">Awaiting approval</div><div class="n r">${pend.length}</div></div>
 <div class="c"><div class="l">Hospitals</div><div class="n">${l.filter(p => p.k === 'Hospital').length}</div></div>
 <div class="c"><div class="l">Laboratories</div><div class="n">${l.filter(p => p.k === 'Laboratory').length}</div></div></div>
 <div class="atbl"><table><thead><tr><th>Organisation</th><th>Kind</th><th>Town</th><th>Partner since</th><th>Status</th></tr></thead><tbody>
 ${l.map(p => `<tr onclick="openPartner('${p.n.replace(/'/g, "\\'")}')"><td class="m2"><div class="nm">${p.n}</div><div class="sm">${p.k} · ${p.c}${p.note ? ' · ' + p.note : ''}</div></td>
 <td class="m1">${p.k}</td><td>${p.c}</td><td class="sm">${p.since}</td>
 <td class="m3">${p.st === 'active' ? '<span class="tag ok">Active</span>' : '<span class="tag no">Waiting</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <p class="ahint">Hospitals, laboratories, foundations, welfare societies, universities and other blood banks all live here. An approved partner gets a named coordinator, a direct line, and their logo on the public supporters page.</p>`, `<h1>Partners &amp; organisations</h1><span class="asub">${l.length} on the books</span><span style="margin-left:auto"></span>${hd('<button class="btn btn-p btn-s" onclick="openForm(&quot;addPartner&quot;)">+ Add organisation</button>')}${SCOPE ? '<span class="sm">Head office approves partners</span>' : ''}`);
};
function openPartner(n) {
  const p = PARTNERS.find(x => x.n === n);
  if (!p) return;
  sheet(`<span class="tag ${p.st === 'active' ? 'ok' : 'no'}">${p.st === 'active' ? 'Active partner' : 'Waiting for a decision'}</span>
 <h2 style="margin:12px 0 4px">${p.n}</h2><div class="sm">${p.k} · ${p.c}</div>
 <div style="margin:22px 0">${[['Kind', p.k], ['Town', p.c], ['Partner since', p.since], ['Coordinator', p.st === 'active' ? 'Assigned' : 'Not yet'], ['Logo on the website', p.st === 'active' ? 'Yes' : 'No']].map(([k, v]) => `<div class="drow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
 ${p.note ? `<div class="ahint" style="margin:0 0 18px">${p.note}</div>` : ''}
 ${p.st === 'pending' ? '<div class="row" style="gap:9px"><button class="btn btn-p" style="flex:1">Approve</button><button class="btn btn-o">Decline</button></div>' : '<div class="row" style="gap:9px"><button class="btn btn-o" style="flex:1">Edit details</button><button class="btn btn-o">End partnership</button></div>'}`);
}

/* ---------------- SUBMISSIONS INBOX ---------------- */
PAGES['admin/inbox'] = () => {
  const subs = S.submissions || [];
  return adminShell('inbox', `
 <div class="row" style="gap:8px;margin-bottom:18px">${['Everything', 'Volunteers', 'Partners', 'Organisations', 'Messages', 'Donations'].map((f, i) => `<button class="pill${i ? '' : ' on'}" onclick="galPick(this)">${f}</button>`).join('')}</div>
 ${subs.length ? `<div class="atbl"><table><thead><tr><th>From</th><th>Kind</th><th>Town</th><th>When</th><th>Status</th></tr></thead><tbody>
 ${subs.map((s, i) => `<tr onclick="openSub(${i})"><td class="m2"><div class="nm">${s.name || s.org || 'No name given'}</div><div class="sm">${s.kind} · ${s.phone || ''}</div></td>
 <td class="m1">${s.kind}</td><td>${s.city || '—'}</td><td class="sm">${ago(s.at)}</td>
 <td class="m3"><span class="tag no">New</span></td></tr>`).join('')}</tbody></table></div>` : `<div class="acard aempty"><h3>Nothing waiting</h3><p style="margin-top:8px;max-width:46ch;margin-inline:auto">Every form on the public website lands here — volunteers, partner organisations, foundations, messages and donation receipts.</p>
 <p style="margin-top:14px"><a href="#/join/volunteer"><b>Try it: fill in the volunteer form →</b></a></p></div>`}
 <p class="ahint">The old website had a public comment box that displayed "sorry, no comments". Everything now arrives here instead, where somebody can be held responsible for answering it.</p>`, `<h1>Inbox</h1><span class="asub">${subs.length} waiting</span>`);
};
function openSub(i) {
  const s = S.submissions[i];
  if (!s) return;
  sheet(`<span class="tag no">${s.kind}</span><h2 style="margin:12px 0 4px">${s.name || s.org || 'No name given'}</h2><div class="sm">Received ${ago(s.at)}</div>
 <div style="margin:22px 0">${Object.entries(s).filter(([k]) => !['at', 'kind'].includes(k) && s[k]).map(([k, v]) => `<div class="drow"><span>${k.replace(/^\w/, c => c.toUpperCase())}</span><b>${v}</b></div>`).join('')}</div>
 <div class="row" style="gap:9px">${s.phone ? `<a class="btn btn-p" style="flex:1" href="tel:${String(s.phone).replace(/ /g, '')}">Call</a><a class="btn btn-o" href="https://wa.me/92${String(s.phone).replace(/\D/g, '').replace(/^0/, '')}" target="_blank" rel="noopener">WhatsApp</a>` : ''}</div>
 <button class="btn btn-d" style="width:100%;margin-top:12px">Mark as answered</button>`);
}

/* ---------------- NETWORK / CITIES ---------------- */
/* Standing, open requests and last stock update per town. The donor count is counted from the
   register by townCount() — no screen keeps its own copy of that number. */
/* Standing, open requests and last stock update, keyed by town. The list of towns itself is PBBTOWNS. */
const CITYINFO = {
  Quetta: ['Head office', 4, 'today'],
  Pishin: ['Branch', 1, 'today'],
  Loralai: ['Branch', 0, '2 days'],
  Zhob: ['Branch', 1, '9 days'],
  Chaman: ['Branch', 0, 'never'],
  'Muslim Bagh': ['Branch', 0, '4 days'],
  'Killa Saifullah': ['Served from Muslim Bagh', 0, '—'],
  Dukki: ['Served from Loralai', 0, '—'],
  Musakhel: ['Served from Loralai', 0, '—'],
  Sherani: ['Served from Zhob', 0, '—'],
  Harnai: ['Served from Quetta', 0, '—'],
  Ziarat: ['Served from Quetta', 0, '—'],
  'Qila Abdullah': ['Served from Chaman', 0, '—'],
  Sibi: ['Served from Quetta', 0, '—']
};
const CITIES = () => window.PBBTOWNS.map(t => [t, ...(CITYINFO[t] || ['Served from Quetta', 0, '—'])]);
PAGES['admin/network'] = () => adminShell('network', `
 <div class="akpi">
 <div class="c"><div class="l">Towns covered</div><div class="n">${window.PBBTOWNS.length}</div></div>
 <div class="c"><div class="l">With a permanent office</div><div class="n">6</div></div>
 <div class="c"><div class="l">Donors across the network</div><div class="n">${S.donors.length.toLocaleString()}</div></div>
 <div class="c"><div class="l">Open requests, all towns</div><div class="n r">${CITIES().reduce((a, c) => a + c[2], 0)}</div></div></div>
 <div class="atbl"><table><thead><tr><th>Town</th><th>Standing</th><th>Donors</th><th>Open requests</th><th>Stock updated</th></tr></thead><tbody>
 ${CITIES().map(([n, k, r, u]) => `<tr><td class="m2"><div class="nm">${n}</div><div class="sm">${k}</div></td><td class="m1 sm">${k}</td><td>${townCount(n).toLocaleString()}</td>
 <td>${r ? `<span class="tag no">${r}</span>` : '<span class="sm">—</span>'}</td>
 <td class="m3 ${/never|9 days/.test(u) ? 'red' : 'sm'}" style="font-weight:600">${u}</td></tr>`).join('')}
 </tbody></table></div>
 <div class="g2" style="gap:18px;margin-top:18px">
 <div class="acard"><h3 style="margin-bottom:6px">Adding a town</h3><p class="sm">A town joins when the organising committee approves it and appoints a manager. It starts with its own empty register and its own staff accounts — nothing is shared until somebody chooses to share it.</p>
 <button class="btn btn-o" style="margin-top:16px" onclick="openForm('addTown')">Add a town</button></div>
 <div class="acard"><h3 style="margin-bottom:6px">When one town cannot help</h3><p class="sm">Any branch can see what every other branch holds — stock and open requests, never personal details. Donors are only called by their own town unless they have agreed to be contacted from elsewhere, which is on by default.</p></div></div>
 <p class="ahint">Built for fourteen towns today and for whatever comes after. Nothing in the design assumes there is only one organisation.</p>`, `<h1>The network</h1><span class="asub">14 towns</span><span style="margin-left:auto"></span>${hd('<button class="btn btn-p btn-s" onclick="openForm(&quot;addTown&quot;)">+ Add a town</button>')}`);

/* ---------------- REPORTS ---------------- */
/* Requests, answer rate and response time per town. The donor count is counted, never stored. */
const TOWNROWS = [['Quetta', 312, '91%', '1h 52m', 2984], ['Pishin', 108, '88%', '2h 30m', 612], ['Loralai', 74, '84%', '3h 05m', 418], ['Zhob', 96, '79%', '4h 12m', 502], ['Chaman', 63, '76%', '4h 40m', 186], ['Muslim Bagh', 41, '82%', '3h 20m', 110]];
PAGES['admin/reports'] = () => {
  const rows = SCOPE ? TOWNROWS.filter(r => r[0] === SCOPE) : TOWNROWS;
  const t = rows[0] || ['—', 0, '—', '—', 0];
  const K = SCOPE ? [['Bags this year', t[4].toLocaleString()], ['Requests answered', t[2]], ['Typical time to a donor', t[3]], ['Donors who came back', '31%']] : [['Bags this year', TOWNROWS.reduce((a, r) => a + r[4], 0).toLocaleString()], ['Requests answered', '86%'], ['Typical time to a donor', hhmm(resp()[0])], ['Donors who came back', '38%']];
  return adminShell('reports', `
 <div class="akpi">
 ${K.map(([l, v], i) => `<div class="c"><div class="l">${l}</div><div class="n${i === 2 ? ' r' : ''}">${v}</div></div>`).join('')}</div>
 <div class="g2" style="gap:18px;align-items:start">
 <div class="acard"><h3 style="margin-bottom:4px">Bags each month</h3><p class="sm" style="margin-bottom:16px">Twelve months to September</p>
 <div class="chart" style="height:170px">${[46, 58, 52, 71, 64, 80, 74, 90, 66, 85, 78, 100].map((v, i) => `<div class="bar${i === 11 ? ' pk' : ''}" style="height:${v}%"><span>${['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][i]} · ${Math.round(v * 5.4)} bags</span></div>`).join('')}</div>
 <div class="axis"><span>Oct</span><span>Sep</span></div></div>
 <div class="acard"><h3 style="margin-bottom:4px">Where the register is thin</h3><p class="sm" style="margin-bottom:16px">Donors held against how often that group is asked for</p>
 ${[['O−', 163, 'thin'], ['AB−', 45, 'thin'], ['B−', 124, 'thin'], ['A−', 97, 'thin'], ['AB+', 188, ''], ['A+', 498, ''], ['B+', 561, ''], ['O+', 742, '']].map(([g, v, c]) => `<div class="hbar"><span class="hn">${g}</span><span class="ht"><i class="${c ? 'r' : ''}" style="width:${Math.round(v / 742 * 100)}%"></i></span><span class="hv">${v}</span></div>`).join('')}
 <p class="ahint" style="margin-top:16px">The four negative groups are where every shortage comes from. A campaign aimed only at them would be worth more than a general one.</p></div>
 </div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:16px">By town</h3>
 <div class="atbl" style="border:0"><table><thead><tr><th>Town</th><th>Donors</th><th>Requests</th><th>Answered</th><th>Typical time</th></tr></thead><tbody>
 ${rows.map(r => `<tr><td class="m2"><div class="nm">${r[0]}</div><div class="sm">${townCount(r[0]).toLocaleString()} ${townCount(r[0]) === 1 ? 'donor' : 'donors'} · ${r[2]} answered</div></td><td>${townCount(r[0]).toLocaleString()}</td><td class="m1">${r[1]}</td><td>${r[2]}</td><td class="m3">${r[3]}</td></tr>`).join('')}
 </tbody></table></div>${SCOPE ? '<p class="ahint" style="margin-top:14px">These are the ' + SCOPE + ' figures. The head office holds the organisation-wide totals.</p>' : ''}</div>`, `<h1>Reports</h1><span class="asub">${SCOPE ? SCOPE + ' · twelve months' : 'Twelve months'}</span><span style="margin-left:auto"></span>${hd('<button class="btn btn-o btn-s">Export</button>')}<button class="btn btn-p btn-s">Print for the committee</button>`);
};

/* ---------------- AUDIT ---------------- */
const LOG = [['2 minutes ago', 'Pishin desk', 'Added a donor', 'Pishin'], ['18 minutes ago', 'Website', 'A blood request came in', 'Quetta'], ['1 hour ago', 'Zhob coordinator', 'Marked a request arranged', 'Zhob'], ['2 hours ago', 'Dr. Naseer Muhammad', 'Verified 4 donor records', 'All'], ['Yesterday', 'Olus Yar', 'Granted photo consent for T-027', 'Pishin'], ['Yesterday', 'Head office', 'Exported the donor list — reason: annual audit', 'All'], ['Yesterday', 'Zhob coordinator', 'Added 2 donors', 'Zhob'], ['2 days ago', 'Zhob coordinator', 'Updated stock', 'Zhob']];
PAGES['admin/audit'] = () => {
  /* A branch sees its own town and nothing else — including no sight of an export it was not party to. */
  const rows = SCOPE ? LOG.filter(r => r[3] === SCOPE) : LOG;
  return adminShell('audit', `
 <div class="atbl"><table><thead><tr><th>When</th><th>Who</th><th>What</th><th>Town</th></tr></thead><tbody>
 ${rows.map(([w, who, what, t]) => `<tr><td class="m1 sm">${w}</td><td class="m2"><div class="nm">${who}</div><div class="sm">${what}</div></td><td>${what}</td><td class="m3 sm">${t}</td></tr>`).join('')}
 </tbody></table></div>
 <div class="g2" style="gap:18px;margin-top:18px">
 <div class="acard"><h3 style="margin-bottom:6px">The log cannot be edited</h3><p class="sm">Not by branch staff, and not by the head office. An organisation that holds other people\u2019s telephone numbers should be able to show exactly who looked at them.</p></div>
 <div class="acard" style="border-color:#F0BDB6"><h3 style="margin-bottom:6px;color:var(--red-d)">Three things that always ask why</h3><p class="sm">Deleting a record, exporting the donor list, and granting a child\u2019s photo consent. Each writes a line here with the reason typed by the person who did it.</p></div></div>
 ${SCOPE ? '<p class="ahint">This is the ' + SCOPE + ' log. Anything done in another town, and anything done across the whole organisation, is visible only to the head office.</p>' : ''}`, `<h1>Log</h1><span class="asub">${SCOPE ? 'Everything changed in ' + SCOPE : 'Everything that has been changed'}</span>`);
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "pbb-admin3.js", error: String((e && e.message) || e) }); }

// pbb-admin4.js
try { (() => {
/* PBB admin — accounts, hierarchy, sign-up approvals, WhatsApp board. */

/* ---------------- ACCOUNTS & HIERARCHY ---------------- */
const ACCOUNTS = [{
  n: 'Olus Yar',
  r: 'Olus Yar',
  t: 'All towns',
  e: 'organizer@pbb.org',
  ph: '0300-3815590',
  st: 'active',
  by: '—',
  last: 'now',
  tfa: 1
}, {
  n: 'Dr. Hamid Khan Achakzai',
  r: 'Executive',
  t: 'All towns',
  e: 'committee@pbb.org',
  ph: '—',
  st: 'active',
  by: 'Olus Yar',
  last: '2 hours ago',
  tfa: 1
}, {
  n: 'Mr. Faqir Khushal Khan Kasi',
  r: 'Executive',
  t: 'All towns',
  e: 'faqir@pbb.org',
  ph: '—',
  st: 'active',
  by: 'Olus Yar',
  last: 'yesterday',
  tfa: 0
}, {
  n: 'Dr. Naseer Muhammad',
  r: 'Verifier',
  t: 'All towns',
  e: 'lab@pbb.org',
  ph: '—',
  st: 'active',
  by: 'Olus Yar',
  last: '3 hours ago',
  tfa: 1
}, {
  n: 'Zhob coordinator',
  r: 'Branch manager',
  t: 'Zhob',
  e: 'zhob@pbb.org',
  ph: '0822-413902',
  st: 'active',
  by: 'Dr. Hamid Khan Achakzai',
  last: 'yesterday',
  tfa: 0
}, {
  n: 'Pishin desk',
  r: 'Data entry',
  t: 'Pishin',
  e: 'pishin@pbb.org',
  ph: '0826-421288',
  st: 'active',
  by: 'Zhob coordinator',
  last: '3 days ago',
  tfa: 0
}, {
  n: 'Loralai desk',
  r: 'Data entry',
  t: 'Loralai',
  e: 'loralai@pbb.org',
  ph: '0824-662066',
  st: 'suspended',
  by: 'Dr. Hamid Khan Achakzai',
  last: '41 days ago',
  tfa: 0
}, {
  n: 'Chaman volunteer lead',
  r: 'Volunteer lead',
  t: 'Chaman',
  e: 'chaman@pbb.org',
  ph: '—',
  st: 'invited',
  by: 'Dr. Hamid Khan Achakzai',
  last: '—',
  tfa: 0
}];

/* Who each role may create. Nobody can create at or above their own level. */
const CANMAKE = {
  head: ['Executive', 'Verifier', 'Accounts', 'Branch manager', 'Coordinator', 'Data entry', 'Volunteer lead'],
  mgr: ['Coordinator', 'Data entry', 'Volunteer lead'],
  emp: []
};
PAGES['admin/accounts'] = () => {
  const l = SCOPE ? ACCOUNTS.filter(a => a.t === SCOPE) : ACCOUNTS;
  const pend = l.filter(a => a.st === 'invited');
  return adminShell('accounts', `
 ${pend.length ? `<div class="alert"><div><b>${pend.length} ${pend.length === 1 ? 'invitation has' : 'invitations have'} not been accepted yet.</b> The link expires after seven days, then the account is deleted on its own.</div><button class="btn btn-w btn-s">Send it again</button></div>` : ''}
 <div class="akpi">
 <div class="c"><div class="l">Active accounts</div><div class="n">${l.filter(a => a.st === 'active').length}</div></div>
 <div class="c"><div class="l">Invited, not yet accepted</div><div class="n r">${pend.length}</div></div>
 <div class="c"><div class="l">Suspended</div><div class="n">${l.filter(a => a.st === 'suspended').length}</div></div>
 <div class="c"><div class="l">With two-step sign in</div><div class="n">${l.filter(a => a.tfa).length} of ${l.length}</div></div></div>

 ${SCOPE ? `<div class="ahint" style="margin-bottom:18px">You are seeing the ${SCOPE} accounts only. The rest of the hierarchy is shown so you know who is above you, but you cannot open those records.</div>` : ''}
 <div class="acard" style="margin-bottom:18px"><h3 style="margin-bottom:6px">Who answers to whom</h3><p class="sm" style="margin-bottom:20px">An account can only be created by somebody above it, and can only be given a role at or below their own. That is what stops the register quietly growing accounts nobody remembers making.</p>
 <div class="tree">
 <div class="tnode t1"><div class="tbox"><b>Olus Yar</b><span>Head of the organisation · all fourteen towns</span><i>Creates and removes anybody. The only role that can delete a record or export the register.</i></div></div>
 <div class="tkids">
  <div class="tnode t2"><div class="tbox"><b>Executive</b><span>2 members of the organising committee</span><i>All towns. Publishes the website. Creates branch managers.</i></div>
   <div class="tkids">
    <div class="tnode t3"><div class="tbox"><b>Branch manager</b><span>6 towns</span><i>One town. Creates data entry and coordinator accounts for that town only.</i></div>
     <div class="tkids">
      <div class="tnode t4"><div class="tbox"><b>Coordinator</b><span>Answers requests, calls donors</span></div></div>
      <div class="tnode t4"><div class="tbox"><b>Data entry</b><span>Adds donors and donations</span></div></div>
      <div class="tnode t4"><div class="tbox"><b>Volunteer lead</b><span>Volunteers and camps</span></div></div>
     </div></div>
   </div></div>
  <div class="tnode t2"><div class="tbox"><b>Verifier</b><span>Laboratory · Dr. Naseer Muhammad</span><i>Approves donor records across every town. Sees no telephone numbers.</i></div></div>
  <div class="tnode t2"><div class="tbox"><b>Accounts</b><span>Money and receipts only</span></div></div>
 </div></div>
 </div>

 <div class="atbl"><table><thead><tr><th>Person</th><th>Role</th><th>Town</th><th>Created by</th><th>Two-step</th><th>Status</th></tr></thead><tbody>
 ${l.map(a => `<tr onclick="openAcct('${a.e}')"><td class="m2"><div class="nm">${a.n}</div><div class="sm">${a.r} · ${a.t} · ${a.e}</div></td>
 <td class="m1">${a.r}</td><td>${a.t}</td><td class="sm">${a.by}</td>
 <td>${a.tfa ? '<span class="tag ok">On</span>' : '<span class="tag gy">Off</span>'}</td>
 <td class="m3">${a.st === 'active' ? '<span class="tag ok">Active</span>' : a.st === 'invited' ? '<span class="tag no">Invited</span>' : '<span class="tag wt">Suspended</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <p class="ahint">There is no way to sign up for an account. Every one on this list was created by a named person above it, and that name cannot be edited afterwards. If somebody asks for access, the person above them creates it — or nobody does.</p>`, `<h1>Accounts</h1><span class="asub">${l.length} ${l.length === 1 ? 'person' : 'people'}</span><span style="margin-left:auto"></span>${(CANMAKE[ROLE] || []).length ? '<button class="btn btn-p btn-s" onclick="newAccount()">+ Create an account</button>' : '<span class="sm">Your role cannot create accounts</span>'}`);
};
function openAcct(e) {
  const a = ACCOUNTS.find(x => x.e === e);
  if (!a) return;
  sheet(`<span class="tag ${a.st === 'active' ? 'ok' : a.st === 'invited' ? 'no' : 'wt'}">${a.st === 'active' ? 'Active' : a.st === 'invited' ? 'Invited — has not signed in yet' : 'Suspended'}</span>
 <h2 style="margin:12px 0 4px">${a.n}</h2><div class="sm">${a.r} · ${a.t}</div>
 <div style="margin:22px 0">${[['Email', a.e], ['Telephone', a.ph], ['Role', a.r], ['Sees', a.t], ['Account created by', a.by], ['Last signed in', a.last], ['Two-step sign in', a.tfa ? 'On' : 'Off']].map(([k, v]) => `<div class="drow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
 ${a.st === 'invited' ? `<div class="row" style="gap:9px"><button class="btn btn-p" style="flex:1">Send the invitation again</button><button class="btn btn-o">Cancel it</button></div>` : `<div class="row" style="gap:9px"><button class="btn btn-o" style="flex:1">Change role or town</button><button class="btn btn-o">Reset password</button></div>
 <button class="btn btn-o" style="width:100%;margin-top:10px">Require two-step sign in</button>
 <button class="btn btn-d" style="width:100%;margin-top:10px">${a.st === 'suspended' ? 'Restore this account' : 'Suspend this account'}</button>`}
 <p class="ahint" style="margin-top:18px">Every change here is written to the log with the name of whoever made it.</p>`);
}

/* ---------------- WHATSAPP (coming) ---------------- */
PAGES['admin/whatsapp'] = () => adminShell('whatsapp', `
 <div class="soonbar"><div><b>Not connected yet.</b> Everything below is built and waiting for the WhatsApp business number to be approved. Nothing else has to change when it arrives.</div><span class="tag gy">Ready when you are</span></div>
 <div class="g2" style="gap:18px;align-items:start">
 <div class="acard"><h3 style="margin-bottom:6px">What the assistant will do</h3><p class="sm" style="margin-bottom:18px">The same four things the desk does, in the language the person writes in.</p>
 ${[['Take a blood request', 'Somebody messages the number. The assistant asks the same questions as the form and the request appears on the board — marked as coming from WhatsApp.'], ['Register a donor', 'Name, group, town, phone. Straight onto the register, marked unverified until a coordinator confirms it.'], ['Alert donors', 'When a request opens, the assistant messages eligible donors in that town — the least recently contacted first, never twice in a day.'], ['Answer the usual questions', 'Who can donate, where the branches are, what exchange means. Passed to a person the moment it becomes a real conversation.']].map(([t, d]) => `<div class="waitem"><b>${t}</b><p>${d}</p></div>`).join('')}</div>
 <div>
 <div class="acard"><h3 style="margin-bottom:6px">The board it will fill</h3><p class="sm" style="margin-bottom:16px">Conversations arrive here beside everything else, not in somebody's personal phone.</p>
 <div class="wacols">${[['Waiting on us', 3], ['Being handled', 2], ['Passed to a person', 1], ['Closed', 0]].map(([t, n]) => `<div class="wacol"><div class="wch">${t}<span>${n}</span></div>${n ? Array.from({
  length: n
}, (_, i) => `<div class="wcard"><div class="sm">+92 3•• ••• ••••</div><div style="font-weight:600;margin-top:4px">${['Needs O− at BMC', 'Wants to register', 'Asking about exchange', 'Camp timings', 'Thalassemia schedule', 'Where is Pishin branch'][i % 6]}</div></div>`).join('') : '<div class="sm" style="padding:8px 2px">—</div>'}</div>`).join('')}</div></div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">Why it is drawn now</h3><p class="sm">Because the columns for it exist already. Every request and every donor in this system carries a <b>source</b> — desk, website, or WhatsApp — so when the number is approved nothing needs rebuilding. It simply starts filling.</p></div>
 </div></div>`, `<h1>WhatsApp</h1><span class="asub">Waiting on the business number</span><span style="margin-left:auto"></span><button class="btn btn-o btn-s">Connect a number</button>`);

/* ---------------- CREATE AN ACCOUNT ----------------
   No password is ever typed here. The person receives a one-time link and sets
   their own — so the creator never knows it, and never needs to. */
let naRole = '',
  naTown = SCOPE || '';
function newAccount() {
  const allowed = CANMAKE[ROLE] || [];
  if (!allowed.length) {
    sheet('<h2>Your role cannot create accounts</h2><p class="sm" style="margin-top:8px">Ask the person above you.</p>');
    return;
  }
  naRole = allowed[allowed.length - 1];
  naTown = SCOPE || 'Quetta';
  sheet(`<h2 style="margin-bottom:4px">Create an account</h2>
 <p class="sm" style="margin-bottom:22px">You are creating this as <b>${ROLES[ROLE].who}</b>. Your name is attached to it permanently.</p>
 <form onsubmit="return saveAccount(event)">
 <div class="fgrp"><label class="lb">Their full name</label><input class="fld" required placeholder="As it should appear in the log"></div>
 <div class="g2" style="gap:14px">
 <div class="fgrp"><label class="lb">Email address</label><input class="fld" type="email" required placeholder="name@pashtoonkhwabloodbank.org"></div>
 <div class="fgrp"><label class="lb">Telephone</label><input class="fld" type="tel" placeholder="03XX XXXXXXX"></div></div>

 <div class="fgrp"><label class="lb">What they will be</label>
 <div class="pickgrid" id="naRoles">${allowed.map((r, i) => `<button type="button" class="pickopt${i === allowed.length - 1 ? ' on' : ''}" onclick="pickNa(this,'${r}')"><b>${r}</b><span>${ROLEDESC[r] || ''}</span></button>`).join('')}</div>
 <div class="sm" style="margin-top:8px">${ROLE === 'head' ? 'You may grant any role.' : 'You may only create roles below your own, and only in your own town.'}</div></div>

 <div class="fgrp"><label class="lb">Which town they may see</label>
 <select class="fld" ${SCOPE ? 'disabled style="opacity:.6"' : ''}>${(SCOPE ? [SCOPE] : ['All fourteen towns', ...TOWNS]).map(t => `<option>${t}</option>`).join('')}</select>
 ${SCOPE ? `<div class="sm" style="margin-top:6px">Fixed to ${SCOPE}. Only the head office can place somebody in another town.</div>` : ''}</div>

 <div class="acard" style="padding:14px 16px;background:var(--bg);margin-bottom:18px">
 <label class="togrow" style="border:0;padding:6px 0"><span>Require two-step sign in</span><input type="checkbox" checked><i></i></label>
 <label class="togrow" style="padding:6px 0"><span>May see donors' telephone numbers</span><input type="checkbox" checked><i></i></label>
 <label class="togrow" style="border:0;padding:6px 0"><span>May export lists</span><input type="checkbox"><i></i></label>
 <p class="sm" style="margin-top:8px">These sit on top of the role. Anything not switched on here is refused even if the role would normally allow it.</p></div>

 <div class="ahint" style="margin-bottom:16px">They receive a single link that works once and expires in seven days. They choose their own password — you will never see it, and if they forget it you can only reset it, never read it.</div>
 <button class="btn btn-p" style="width:100%;padding:15px">Create and send the invitation</button>
 <button type="button" class="btn btn-o" style="width:100%;margin-top:10px" onclick="closeSheet()">Cancel</button>
 </form>`);
}
const ROLEDESC = {
  'Executive': 'All towns. Publishes the website.',
  'Verifier': 'Approves records. Sees no telephone numbers.',
  'Accounts': 'Money and receipts only.',
  'Branch manager': 'One town, and the people in it.',
  'Coordinator': 'Answers requests, calls donors.',
  'Data entry': 'Adds donors and donations.',
  'Volunteer lead': 'Volunteers and camps.'
};
function pickNa(el, r) {
  el.parentElement.querySelectorAll('.pickopt').forEach(x => x.classList.remove('on'));
  el.classList.add('on');
  naRole = r;
}
function saveAccount(e) {
  e.preventDefault();
  const f = e.target,
    name = f.querySelector('input').value.trim() || 'The new account';
  sheet(`<div class="tick">✓</div><h2 style="margin-bottom:6px">Invitation sent</h2>
 <p class="sm" style="margin-bottom:20px">${name} has been created as <b>${naRole}</b> and can do nothing until they open the link and set a password.</p>
 <div style="margin-bottom:20px">${[['Created by', ROLES[ROLE].who], ['Role', naRole], ['Sees', SCOPE || 'All fourteen towns'], ['Link expires', 'in 7 days'], ['Written to the log', 'yes, permanently']].map(([k, v]) => `<div class="drow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
 <button class="btn btn-p" style="width:100%" onclick="closeSheet()">Done</button>
 <button class="btn btn-o" style="width:100%;margin-top:10px" onclick="newAccount()">Create another</button>`);
  return false;
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "pbb-admin4.js", error: String((e && e.message) || e) }); }

// pbb-admin5.js
try { (() => {
/* PBB admin — my profile, data import/export, and the interactive role editor. */

/* ---------------- MY PROFILE ---------------- */
PAGES['admin/profile'] = () => {
  const r = ROLES[ROLE];
  return adminShell('profile', `
 <div class="g2" style="gap:18px;align-items:start">
 <div>
 <div class="acard"><h3 style="margin-bottom:18px">Your details</h3>
 <div class="row" style="gap:16px;margin-bottom:20px">
 <div class="avatar"><image-slot id="me-photo" shape="circle" placeholder="Photo"></image-slot></div>
 <div style="flex:1"><b style="font-size:17px">${r.who}</b><div class="sm">${r.sub}</div>
 <div class="row" style="gap:8px;margin-top:10px"><button class="btn btn-o btn-s">Change photo</button><button class="btn btn-o btn-s">Remove</button></div></div></div>
 <div class="fgrp"><label class="lb">Full name</label><input class="fld" value="${r.who}"></div>
 <div class="fgrp"><label class="lb">Office</label><input class="fld" value="${r.office}" disabled style="opacity:.65"><div class="sm" style="margin-top:6px">Set by whoever created your account. Ask them to move you.</div></div>
 <div class="g2" style="gap:14px"><div class="fgrp"><label class="lb">Telephone</label><input class="fld" value="${r.phone}"></div>
 <div class="fgrp"><label class="lb">Email</label><input class="fld" value="${r.email}"></div></div>
 <div class="fgrp"><label class="lb">Language you prefer</label><select class="fld"><option>English</option><option>اردو Urdu</option><option>پښتو Pashto</option></select></div>
 <button class="btn btn-p" style="width:100%">Save</button></div>

 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">Password</h3><p class="sm" style="margin-bottom:16px">Change it here. Nobody else can see it, including the super admin — they can only reset it.</p>
 <div class="fgrp"><label class="lb">Current password</label><input class="fld" type="password"></div>
 <div class="g2" style="gap:14px"><div class="fgrp"><label class="lb">New password</label><input class="fld" type="password"></div>
 <div class="fgrp"><label class="lb">Type it again</label><input class="fld" type="password"></div></div>
 <button class="btn btn-o" style="width:100%">Change password</button></div>
 </div>

 <div>
 <div class="acard"><h3 style="margin-bottom:6px">Two-step sign in</h3><p class="sm" style="margin-bottom:16px">A code sent to your phone each time you sign in from a new device. Required for anyone who can see telephone numbers.</p>
 <div class="listrow">
 <div><b>Currently</b><div class="sm">On, by SMS to ${r.phone}</div></div><span class="tag ok">On</span></div>
 <button class="btn btn-o" style="width:100%;margin-top:14px">Turn off</button></div>

 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">What you can do here</h3><p class="sm" style="margin-bottom:14px">Set by ${ROLE === 'head' ? 'the organising committee' : 'the person who created your account'}. Ask them if you need more.</p>
 <div class="drow"><span>Role</span><b>${r.who}</b></div>
 <div class="drow"><span>You can see</span><b>${SCOPE || 'All fourteen towns'}</b></div>
 <div class="drow"><span>Screens you can open</span><b>${(ALLOW[ROLE] || {
    length: 24
  }).length || 24}</b></div>
 <a href="#/admin/roles" class="btn btn-o" style="width:100%;margin-top:14px">See what each role can do</a></div>

 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:16px">Where you are signed in</h3>
 ${[['This device', 'Quetta · now', '1'], ['Office desktop', 'Quetta · 2 days ago', ''], ['Phone', 'Zhob · 8 days ago', '']].map(([d, w, cur]) => `<div class="listrow"><div><b>${d}</b><div class="sm">${w}</div></div>${cur ? '<span class="tag ok">This one</span>' : '<button class="btn btn-o btn-s">Sign out</button>'}</div>`).join('')}
 <button class="btn btn-d" style="width:100%;margin-top:14px">Sign out everywhere else</button></div>
 </div></div>`, `<h1>Your account</h1><span class="asub">${r.who}</span>`);
};

/* ---------------- DATA IMPORT / EXPORT ---------------- */
PAGES['admin/data'] = () => adminShell('data', `
 <div class="g2" style="gap:18px;align-items:start">
 <div>
 <div class="acard"><h3 style="margin-bottom:6px">Bring the old book in</h3><p class="sm" style="margin-bottom:18px">Twenty-seven years of paper does not have to be typed twice. Upload a spreadsheet and match the columns once.</p>
 <div class="dropzone" style="margin-bottom:16px">Drop a CSV or Excel file here<br><span class="sm">or photograph a page and somebody will type it</span></div>
 <div class="qlab" style="margin-bottom:10px">Match the columns</div>
 ${[['Name', 'Column A — Name', 'ok'], ['Blood group', 'Column C — Grp', 'ok'], ['Phone', 'Column D — Contact', 'ok'], ['Town', 'Column F — Area', 'ok'], ['Last donated', 'Column H — Date', 'warn'], ['Address', 'not matched', 'off']].map(([f, c, s]) => `<div class="maprow"><span class="mf">${f}</span><span class="mc">${c}</span><span class="tag ${s === 'ok' ? 'ok' : s === 'warn' ? 'wt' : 'gy'}">${s === 'ok' ? 'Matched' : s === 'warn' ? 'Check the date format' : 'Skipped'}</span></div>`).join('')}
 <div class="ahint" style="margin-top:16px">Dates in the old registers are written several ways. Anything the importer cannot read with confidence is left blank rather than guessed — a wrong last-donation date puts a donor at risk.</div>
 <button class="btn btn-p" style="width:100%;margin-top:16px">Check the file</button></div>

 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">What the check found</h3><p class="sm" style="margin-bottom:16px">Nothing is saved until you say so.</p>
 <div class="g2" style="gap:12px">
 <div class="statbox ok"><b>1,842</b><span>rows ready</span></div>
 <div class="statbox wt"><b>61</b><span>possible duplicates</span></div>
 <div class="statbox no"><b>14</b><span>missing a phone number</span></div>
 <div class="statbox gy"><b>7</b><span>no blood group</span></div></div>
 <div class="qlab" style="margin:20px 0 10px">Possible duplicates</div>
 ${[['Abdul Samad Kakar', '0300 3815590', 'already on the Quetta register'], ['Muhammad Ayaz', '0333 7828121', 'already on the Pishin register']].map(([n, p, w]) => `<div class="duprow"><div><b>${n}</b><div class="sm">${p} · ${w}</div></div><div class="row" style="gap:6px"><button class="btn btn-o btn-s">Merge</button><button class="btn btn-o btn-s">Keep both</button></div></div>`).join('')}
 <button class="btn btn-p" style="width:100%;margin-top:18px">Import 1,842 donors</button>
 <button class="btn btn-o" style="width:100%;margin-top:9px">Cancel and start again</button></div>
 </div>

 <div>
 <div class="acard"><h3 style="margin-bottom:6px">Take a copy out</h3><p class="sm" style="margin-bottom:16px">Exporting the register is recorded in the log with the reason you type. Head office only.</p>
 ${[['Donor register', 'CSV or Excel'], ['Blood requests', 'CSV'], ['Donations ledger', 'CSV'], ['Thalassemia register', 'CSV'], ['Everything', 'a full backup file']].map(([n, f]) => `<div class="listrow"><div><b>${n}</b><span class="sm" style="display:block">${f}</span></div><button class="btn btn-o btn-s" ${ROLE === 'head' ? '' : 'disabled style="opacity:.4"'}>Export</button></div>`).join('')}
 ${ROLE === 'head' ? '' : '<div class="ahint" style="margin-top:14px">Only the head office can export. Ask the organising committee.</div>'}</div>

 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">Backups</h3><p class="sm" style="margin-bottom:14px">Taken every night and kept for ninety days.</p>
 ${[['Last night', '02:00', 'ok'], ['Two nights ago', '02:00', 'ok'], ['Three nights ago', '02:00', 'ok']].map(([d, t, s]) => `<div class="listrow"><div><b>${d}</b><div class="sm">${t}</div></div><span class="tag ok">Complete</span></div>`).join('')}
 <button class="btn btn-o" style="width:100%;margin-top:14px">Restore from a backup</button></div>

 <div class="acard" style="margin-top:18px;border-color:#F0BDB6"><h3 style="margin-bottom:6px;color:var(--red-d)">Removing somebody</h3><p class="sm">A donor who asks to be taken off is removed the same day, and we do not ask them why. Their donations stay in the yearly totals as a number, without their name.</p>
 <button class="btn btn-o" style="width:100%;margin-top:14px">Remove a person</button></div>
 </div></div>`, `<h1>Data</h1><span class="asub">Import, export and backups</span>`);

/* last admin file — every screen is registered, so render the address actually asked for */
route();
})(); } catch (e) { __ds_ns.__errors.push({ path: "pbb-admin5.js", error: String((e && e.message) || e) }); }

// pbb-app.js
try { (() => {
/* PBB website — home page, router, form behaviour */

const NAV = [['Home', '#/'], ['About', null, [['The problem we are solving', '#/problem', 'Twelve gaps, and our answer'], ['Our story', '#/about', 'Since 24 March 1999'], ['Our leadership', '#/people', 'Committee and medical staff'], ['Who stands with us', '#/supporters', 'Supporting organisations'], ['Our branches', '#/branches', '6 offices, 14 towns']]], ['Services', null, [['What we provide', '#/services', 'Screened blood, on exchange'], ['Thalassemia children', '#/thalassemia', 'Free, without exchange']]], ['Get involved', null, [['Everything in one place', '#/join', 'Five ways to take part'], ['Who needs blood now', '#/needs', 'Every open request, no names'], ['Request blood', '#/join/requester', 'For a patient in hospital'], ['Register as a donor', '#/join/donor', 'Takes three minutes'], ['Volunteer with us', '#/join/volunteer', 'Camps and outreach'], ['Partner organisation', '#/join/partner', 'Hospitals and laboratories'], ['Register an organisation', '#/join/organisation', 'Bring a branch to your town'], ['Work with us', '#/partners', 'Hospitals, labs, foundations'], ['Donate', '#/donate', 'Bank transfer, Zakat, Eid hides']]], ['Media', null, [['Photos & videos', '#/gallery', 'Camps, ambulances, the new building'], ['Announcements & events', '#/news', 'What is happening now'], ['Publications', '#/publications', 'Posters, appeals and reports'], ['Questions', '#/faq', 'Things people ask us']]], ['Contact', '#/contact']];
function buildMob() {
  document.getElementById('mob').innerHTML = `
<div class="mh"><img src="assets/pbb-logo.png" alt=""><div><div style="font-weight:800;font-size:15px">Pashtoonkhwa Blood Bank</div><div style="font-family:'Noto Nastaliq Urdu',serif;font-size:11px;color:var(--mid)">پښتونخوا د وینې زېرمه</div></div><button class="cl" onclick="mobClose()">✕</button></div>
${NAV.map(([l, h, sub]) => h ? `<a href="${h}" onclick="mobClose()" data-t="${l}">${l}</a>` : `<div class="gp" data-t="${l}">${l}</div>` + sub.map(([t, u]) => `<a href="${u}" onclick="mobClose()" data-t="${t}">${t}</a>`).join('')).join('')}
<div class="ft"><a href="#/join/requester" class="btn btn-p" style="color:#fff" onclick="mobClose()" data-t="Request Blood">Request Blood</a>
<div class="row" style="gap:8px"><button class="btn btn-o" style="flex:1">English</button><button class="btn btn-o" style="flex:1">اردو</button><button class="btn btn-o" style="flex:1">پښتو</button></div>
<div style="font-size:13px;color:var(--mid);padding-top:4px">Emergency · <b style="color:var(--ink)">081-2836820</b></div></div>`;
}
buildMob();
function mobOpen() {
  document.getElementById('mob').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function mobClose() {
  document.getElementById('mob').classList.remove('open');
  document.body.style.overflow = '';
}

/* ---------------- HOME ---------------- */
const STOCK = [['O−', 'cr', 'Critical'], ['AB−', 'lo', 'Low'], ['B−', 'lo', 'Low'], ['A−', 'ok', 'Available'], ['O+', 'ok', 'Available'], ['A+', 'ok', 'Available'], ['B+', 'ok', 'Available'], ['AB+', 'ok', 'Available']];
const PILLARS = [['Screened blood', 'Tested by ELISA for Hepatitis B, Hepatitis C, HIV/AIDS and MP before it reaches a patient.', 'M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z'], ['Thalassemia care', '200 registered children transfused regularly, free of cost and without exchange.', 'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z'], ['Ambulance service', 'Three vehicles in Quetta, running twenty-four hours a day for anyone who needs them.', 'M3 17V7a1 1 0 0 1 1-1h9v11M13 10h4l4 4v3h-3M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'], ['Disaster response', 'Abbottabad 2005, Ziarat 2008, and every bomb blast and emergency since.', 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z']];
const CHART = [[1999, 360, 12], [2000, 720, 18], [2001, 1080, 24], [2002, 1440, 30], [2003, 2160, 40], [2004, 2747, 48], [2005, 3118, 54], [2006, 3968, 64], [2007, 4582, 72], [2008, 5905, 88], [2009, 5920, 89], [2010, 6937, 96], [2011, 9484, 100], [2012, 5120, 55]];
PAGES[''] = () => `
<header class="hero"><div class="wrap"><div class="hero-g">
<div>
<span class="eyebrow"><b></b>Serving Balochistan since 24 March 1999</span>
<h1>Blood is life.<br>We keep the <em>record</em>.</h1>
<p class="lead">Screened, tested blood for anyone who needs it — irrespective of language, colour, religion, race or ethnicity. Free and without exchange for thalassemia children, mothers, emergencies and disasters.</p>
<div class="row" style="margin-top:28px"><a href="#/join/requester" class="btn btn-p">Request Blood</a><a href="#/join/donor" class="btn btn-d">Register as a Donor</a></div>
<div class="stats">
<div><div class="n r">64,000+</div><div class="c">bags donated since 1999</div></div>
<div><div class="n">200</div><div class="c">thalassemia children</div></div>
<div><div class="n">14</div><div class="c">towns served</div></div>
<div><div class="n">3</div><div class="c">ambulances, 24 hours</div></div>
</div></div>
<div class="ph" style="aspect-ratio:4/4.4;border-radius:var(--rl)"><image-slot id="home-hero" shape="rect" placeholder="Drop the hero photograph — a donor at the bench, or a PBB ambulance"></image-slot></div>
</div></div></header>

<div class="wrap" style="margin-top:22px"><div class="stock">
<div class="stock-h"><h3 style="margin-right:auto">What we are short of today</h3><span class="live"><b></b>Live · Quetta · updated 2 hours ago</span></div>
<div class="groups">${STOCK.map(([g, c, s]) => `<div class="grp ${c}"><div class="g">${g}</div><div class="s">${s}</div></div>`).join('')}</div>
<p style="font-size:14.5px;color:var(--ink-2);margin-top:16px">If your group shows red, a single donation today goes straight to a patient waiting. <a href="#/join/donor" style="font-weight:700">Register as a donor →</a></p>
</div></div>

<section class="blk"><div class="wrap">
<div style="max-width:660px;margin-bottom:40px"><div class="qlab" style="margin-bottom:12px">What we do</div><h2>Four things, done since 1999</h2><p class="lead" style="margin-top:13px">Blood is never purchased. The only source is exchange from relatives of the patient and registered members.</p></div>
<div class="g4">${PILLARS.map(([t, b, d]) => `<div class="pil"><div class="ic"><svg viewBox="0 0 24 24"><path d="${d}"/></svg></div><h3>${t}</h3><p>${b}</p></div>`).join('')}</div>
</div></section>

<section class="blk" style="background:var(--surf);border-block:1px solid var(--line)"><div class="wrap">
<div style="max-width:660px;margin-bottom:36px"><div class="qlab" style="margin-bottom:12px">The record</div><h2>Twenty-seven years, counted</h2><p class="lead" style="margin-top:13px">Every bag transfused since the first year of operation. Figures published to June 2012; later years are being entered.</p></div>
<div class="chart">${CHART.map(([y, b, h]) => `<div class="bar${y === 2011 ? ' pk' : ''}" style="height:${h}%"><span>${y} · ${b.toLocaleString()} bags</span></div>`).join('')}</div>
<div class="axis"><span>1999</span><span>2011 — peak year</span><span>June 2012</span></div>
</div></section>

<section class="blk"><div class="wrap"><div class="g2" style="gap:34px;align-items:center">
<div><div class="qlab" style="margin-bottom:12px">Where we are</div><h2 style="margin-bottom:16px">Six offices.<br>Fourteen towns.</h2>
<p class="lead" style="margin-bottom:24px">From the head office beside the Quetta Press Club out to Zhob, Chaman and Loralai — and to the towns in between that have no blood bank of their own.</p>
<a href="#/branches" class="btn btn-o">See every branch</a></div>
<div class="ph" style="aspect-ratio:4/3;border-radius:var(--rl)"><image-slot id="home-map" shape="rect" placeholder="Drop a map of Balochistan showing the six branches"></image-slot></div>
</div></div></section>

<section class="blk" style="padding-top:0"><div class="wrap">
<div class="row" style="margin-bottom:32px"><div><div class="qlab" style="margin-bottom:10px">Announcements &amp; events</div><h2>What is happening now</h2></div><a href="#/news" class="btn btn-o btn-s" style="margin-left:auto">All announcements</a></div>
<div class="g3">${[['Blood camp', '12 September', 'Free donation camp, Pishin', 'Band Road branch, 9am to 4pm. Walk in or register to attend.', 'no'], ['Notice', '3 September', 'New building — final stage', 'Construction of the new Quetta premises has entered its last phase.', 'gy'], ['Appeal', 'Runs to 20 June', 'Eid ul Adha hide collection', 'Volunteers collect cattle hides across all branches.', 'ok']].map(([k, d, t, b, c], i) => `<div class="card" style="padding:0;overflow:hidden"><div class="ph" style="aspect-ratio:16/9;border-radius:0"><image-slot id="home-news-${i + 1}" shape="rect" placeholder="Drop a cover photo"></image-slot></div><div style="padding:22px"><div class="row" style="gap:9px"><span class="tag ${c}">${k}</span><span style="font-size:13px;color:var(--mid);font-weight:600">${d}</span></div><h3 style="margin:12px 0 8px">${t}</h3><p class="muted" style="font-size:14px">${b}</p></div></div>`).join('')}</div>
</div></section>

<section class="blk" style="padding-top:0"><div class="wrap"><div class="probteaser">
<div><div class="qlab" style="margin-bottom:12px">The problem</div><h2 style="margin-bottom:14px">Blood exists. It just<br>does not reach people in time.</h2>
<p class="lead" style="max-width:54ch">No national register, almost no voluntary donors, bags expiring in one town while a patient waits in the next. Twelve gaps — and what we do about them.</p>
<a href="#/problem" class="btn btn-d" style="margin-top:22px">Read the twelve gaps</a></div>
<div class="probnums">${[['0', 'national blood group databases'], ['200', 'children depending on us alone'], ['1999', 'the year we started counting']].map(([n, l]) => `<div><div class="pn">${n}</div><div class="pl">${l}</div></div>`).join('')}</div>
</div></div></section>

<div class="wrap"><div class="closer">
<div><h2>Donate blood. Save a life.</h2><p>It takes fifteen minutes, and for two hundred children in Balochistan it is the difference between a normal month and a hospital one.</p></div>
<a href="#/join" class="btn btn-w">Get involved</a>
</div></div>`;

/* ---------------- ROUTER ---------------- */
let step = 0;
const TITLES = {
  '': 'Pashtoonkhwa Blood Bank — Quetta, Balochistan',
  about: 'Our story',
  services: 'Services',
  branches: 'Our branches',
  thalassemia: 'Thalassemia children',
  people: 'Committee & staff',
  gallery: 'Photos & videos',
  news: 'Announcements & events',
  donate: 'Donate',
  'request-blood': 'Request blood',
  'register-donor': 'Register as a donor',
  contact: 'Contact',
  problem: 'The problem we are solving',
  supporters: 'Who stands with us',
  publications: 'Publications',
  faq: 'Questions',
  partners: 'Work with us',
  privacy: 'Privacy',
  terms: 'Terms',
  branch: 'Branch',
  '404': 'Page not found',
  join: 'Get involved',
  'join/requester': 'Request blood',
  'join/donor': 'Register as a donor',
  'join/volunteer': 'Volunteer',
  'join/partner': 'Partner with us',
  'join/organisation': 'Register an organisation'
};
const NAVMAP = {
  about: 'About',
  people: 'About',
  branches: 'About',
  problem: 'About',
  supporters: 'About',
  services: 'Services',
  thalassemia: 'Services',
  'register-donor': 'Get involved',
  needs: 'Get involved',
  donate: 'Get involved',
  join: 'Get involved',
  'join/requester': 'Get involved',
  'join/donor': 'Get involved',
  'join/volunteer': 'Get involved',
  'join/partner': 'Get involved',
  'join/organisation': 'Get involved',
  gallery: 'Media',
  news: 'Media',
  publications: 'Media',
  faq: 'Media',
  partners: 'Get involved',
  contact: 'Contact',
  '': 'Home'
};
function route() {
  const r = (location.hash.replace(/^#\/?/, '') || '').split('?')[0];
  const admin = r.indexOf('admin') === 0;
  document.body.classList.toggle('adminmode', admin);
  document.querySelectorAll('#sheet,#sheetOv').forEach(x => x.classList.remove('open', 'on'));
  if (admin && !/^admin\/(login|forgot|sent)$/.test(r) && !sessionStorage.getItem('pbb-auth')) {
    location.hash = '#/admin/login';
    return;
  }
  if (admin && !/^admin\/(login|forgot|sent)$/.test(r) && window.PBBCAN && !window.PBBCAN(r.replace('admin/', ''))) {
    location.hash = '#/admin/' + window.PBBLANDING();
    return;
  }
  const page = PAGES[r] || (r ? PAGES['404'] : PAGES['']);
  window._sid = 0;
  /* If a page throws, say so. Leaving the previous page on screen under a new title makes a
     broken button look like a dead one, and nobody can tell us what went wrong. */
  try {
    document.getElementById('page').innerHTML = page();
  } catch (err) {
    console.error('Page failed to render:', r, err);
    document.getElementById('page').innerHTML = `<section class="blk"><div class="wrap narrow" style="text-align:center;padding:60px 0">
  <h1 class="h1" style="margin-bottom:12px">This page did not load</h1>
  <p class="lede" style="margin-bottom:26px">Something went wrong at our end, not yours. Please tell us what you were trying to do — or telephone 081-2836820, which is answered at any hour.</p>
  <div class="row" style="justify-content:center;gap:10px"><a href="#/" class="btn btn-p">Home</a><a href="tel:0812836820" class="btn btn-o">Call the head office</a></div></div></section>`;
  }
  const at = {
    needs: 'Who needs blood now',
    'me/signin': 'Your record',
    'me/code': 'Type the code',
    me: 'Your record',
    'me/remove': 'Take yourself off the register',
    'admin/login': 'Sign in',
    'admin/forgot': 'Forgotten password',
    'admin/sent': 'Check your email',
    'admin/overview': 'Overview',
    'admin/requests': 'Blood requests',
    'admin/find': 'Find donors',
    'admin/inventory': 'Inventory',
    'admin/inbox': 'Inbox',
    'admin/donors': 'Donors',
    'admin/volunteers': 'Volunteers',
    'admin/thalassemia': 'Thalassemia',
    'admin/ledger': 'Donations ledger',
    'admin/record': 'Record a donation',
    'admin/homepage': 'Homepage',
    'admin/pages': 'Pages',
    'admin/announcements': 'Announcements',
    'admin/events': 'Events',
    'admin/media': 'Media',
    'admin/network': 'All towns',
    'admin/partners': 'Partners & organisations',
    'admin/reports': 'Reports',
    'admin/branches': 'Branches',
    'admin/settings': 'Site settings',
    'admin/roles': 'Roles & access',
    'admin/accounts': 'Accounts & hierarchy',
    'admin/whatsapp': 'WhatsApp',
    'admin/profile': 'Your account',
    'admin/data': 'Data',
    'admin/audit': 'Log'
  }[r];
  const t = TITLES[r] || at || (PAGES[r] ? 'Pashtoonkhwa Blood Bank' : null);
  document.title = !r ? TITLES[''] : t ? t === 'Pashtoonkhwa Blood Bank' ? t : t + ' — Pashtoonkhwa Blood Bank' : 'Page not found — Pashtoonkhwa Blood Bank';
  document.querySelectorAll('.menu>li').forEach(li => li.classList.toggle('on', li.dataset.nav === NAVMAP[r]));
  window.scrollTo(0, 0);
  step = 0;
}
window.addEventListener('hashchange', route);
route();
function submitJoin(e, kind) {
  e.preventDefault();
  const f = e.target,
    d = new FormData(f);
  if (kind === 'requester') {
    const g = d.get('group');
    if (!g) {
      alert('Please choose the blood group needed.');
      return false;
    }
    const full = {};
    d.forEach((v, k) => {
      if (v) full[k] = v;
    });
    const id = window.PBBSTORE.addRequest(Object.assign(full, {
      pt: d.get('patient'),
      hosp: d.get('hospital'),
      g: g,
      u: +d.get('units') || 1,
      c: d.get('city'),
      urg: d.get('urgency'),
      by: d.get('att') || 'Attendant',
      ph: d.get('phone'),
      src: 'web'
    }));
    done(f, `<div class="tick">✓</div><h2>Request received</h2>
  <p class="lead" style="margin-top:12px">A coordinator will call you shortly. Keep your phone nearby.</p>
  <div class="code">${id}</div>
  <p class="muted" style="font-size:14px">Save this number. Quote it when you call the branch.</p>
  <p class="muted" style="font-size:13px;margin-top:10px">It is already on the coordinator's screen. <a href="#/admin/requests"><b>See it in the admin →</b></a></p>
  <div class="row" style="justify-content:center;margin-top:22px"><a href="tel:0812836820" class="btn btn-p">Call the head office</a><a href="#/" class="btn btn-o">Home</a></div>`);
    return false;
  }
  if (kind === 'donor') {
    const g = d.get('group');
    if (!g) {
      alert('Please choose your blood group.');
      return false;
    }
    window.PBBSTORE.addDonor({
      n: d.get('name'),
      g: g === 'unknown' ? 'O+' : g,
      p: d.get('phone'),
      c: d.get('city'),
      last: d.get('last') || null
    });
    done(f, `<div class="tick">✓</div><h2>You are on the register</h2>
  <p class="lead" style="margin-top:12px">Your branch will confirm your details by phone. When someone near you needs your group, we call.</p>
  <div class="code">D-${Math.floor(1000 + Math.random() * 9000)}</div>
  <p class="muted" style="font-size:13px">Your name is now on the ${d.get('city')} register. <a href="#/admin/donors"><b>See it in the admin →</b></a></p>
  <div class="row" style="justify-content:center;margin-top:22px"><a href="#/services" class="btn btn-o">How donation works</a><a href="#/" class="btn btn-p">Done</a></div>`);
    return false;
  }
  const rec = {
    kind: {
      volunteer: 'Volunteer',
      partner: 'Partner',
      organisation: 'Organisation'
    }[kind],
    at: Date.now()
  };
  d.forEach((v, k) => {
    if (v && k !== 'group') rec[k] = v;
  });
  if (window.PBBSTORE && window.PBBSTORE.addSubmission) window.PBBSTORE.addSubmission(rec);
  const label = {
    volunteer: 'Thank you for offering',
    partner: 'Thank you',
    organisation: 'Thank you'
  }[kind];
  const body = {
    volunteer: 'A volunteer lead from your town will call you. Camps are usually arranged a fortnight ahead.',
    partner: 'The head office will be in touch to arrange a meeting.',
    organisation: 'The organising committee reviews every request for a new branch. Somebody will call you to talk it through.'
  }[kind];
  done(f, `<div class="tick">✓</div><h2>${label}</h2><p class="lead" style="margin-top:12px">${body}</p>
 <p class="muted" style="font-size:13px;margin-top:10px">It is in the office inbox now. <a href="#/admin/inbox"><b>See it in the admin →</b></a></p>
 <div class="row" style="justify-content:center;margin-top:22px"><a href="#/" class="btn btn-p">Back to home</a></div>`);
  return false;
}

/* ---------------- SIGN IN ---------------- */
/* The account knows the town and the role. Sign in asks who you are, never what you are. */
const STAFF = {
  'admin@pashtoonkhwabloodbank.org': {
    role: 'head',
    name: 'Abdul Samad Kakar'
  },
  'zhob@pashtoonkhwabloodbank.org': {
    role: 'mgr',
    name: 'Sabir Khan'
  },
  'pishin@pashtoonkhwabloodbank.org': {
    role: 'emp',
    name: 'Naveed Ahmed'
  }
};
function loginShell(inner) {
  return `<div class="login">
<div class="brandside">
<a href="#/" class="brand"><img src="assets/pbb-logo.png" alt="" style="box-shadow:0 0 0 1px #2B2D33"><span><span class="nm" style="color:#fff">Pashtoonkhwa Blood Bank</span><span class="ur" style="color:#71757D">پښتونخوا د وینې زېرمه</span></span></a>
<div><h1 style="color:#fff;font-size:clamp(30px,4vw,46px)">The register,<br>since <em style="color:#FF6B60">1999</em>.</h1>
<p style="color:#A7ABB3;font-size:17px;margin-top:16px;max-width:44ch">Fourteen towns, one book. Sign in to add donors, answer requests and record what has been given.</p></div>
<p style="color:#5E626A;font-size:13px">Zainab Chamber, Shara-e-Adalat, Quetta · 081-2836820</p>
</div>
<div class="formside"><div class="box">${inner}</div></div></div>`;
}
PAGES['admin/login'] = () => loginShell(`
<h2 style="margin-bottom:6px">Sign in</h2>
<p class="muted" style="margin-bottom:24px;font-size:14.5px">Use the email address your office was given. Your town and what you can do are already set on your account.</p>
<div id="loginErr" class="loginerr" hidden>That email and password do not match an account.</div>
<div class="fgrp"><label class="lb">Email address</label><input class="fld" id="liEmail" type="email" placeholder="name@pashtoonkhwabloodbank.org" autocomplete="username" onkeydown="if(event.key==='Enter')doLogin()"></div>
<div class="fgrp"><div class="row" style="justify-content:space-between;align-items:baseline"><label class="lb">Password</label><a href="#/admin/forgot" class="minilink">Forgotten it?</a></div>
<div class="pwwrap"><input class="fld" id="liPass" type="password" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin()"><button type="button" class="pweye" onclick="togglePw(this)" aria-label="Show password">Show</button></div></div>
<label class="chk" style="margin:2px 0 18px"><input type="checkbox" checked><span>Keep me signed in on this device</span></label>
<button class="btn btn-p" style="width:100%;padding:15px" onclick="doLogin()">Sign in</button>
<a href="#/" class="btn btn-o" style="width:100%;margin-top:10px">Back to the website</a>
<div class="demobox"><div class="qlab" style="margin-bottom:8px">For this demonstration</div>
<p class="sm" style="margin-bottom:12px">Real accounts are created by the head office. Tap one to fill the form — each lands in a different part of the panel, because the account decides that, not the person signing in.</p>
${Object.entries(STAFF).map(([e, s]) => `<button type="button" class="demorow" onclick="fillLogin('${e}')"><b>${e}</b><span>${ROLES[s.role].who} · ${ROLES[s.role].sub}</span></button>`).join('')}
</div>`);
PAGES['admin/forgot'] = () => loginShell(`
<h2 style="margin-bottom:6px">Forgotten password</h2>
<p class="muted" style="margin-bottom:24px;font-size:14.5px">Type your email address. If it belongs to an account, a link to set a new password is sent to it. For safety we do not say whether it did.</p>
<div class="fgrp"><label class="lb">Email address</label><input class="fld" type="email" placeholder="name@pashtoonkhwabloodbank.org"></div>
<button class="btn btn-p" style="width:100%;padding:15px" onclick="location.hash='#/admin/sent'">Send the link</button>
<a href="#/admin/login" class="btn btn-o" style="width:100%;margin-top:10px">Back to sign in</a>
<div class="ahint" style="margin-top:22px">No email? Telephone the head office on 081-2836820. They can reset it, but they cannot see your old one.</div>`);
PAGES['admin/sent'] = () => loginShell(`
<div class="tick">✓</div>
<h2 style="margin-bottom:6px">Check your email</h2>
<p class="muted" style="margin-bottom:24px;font-size:14.5px">If that address belongs to an account, a link is on its way. It stops working after one hour, or as soon as you have used it.</p>
<a href="#/admin/login" class="btn btn-p" style="width:100%;padding:15px">Back to sign in</a>
<p class="sm" style="margin-top:18px">Nothing after a few minutes? Look in the spam folder, then telephone 081-2836820.</p>`);
function togglePw(b) {
  const i = b.previousElementSibling;
  const s = i.type === 'password';
  i.type = s ? 'text' : 'password';
  b.textContent = s ? 'Hide' : 'Show';
}
function fillLogin(e) {
  document.getElementById('liEmail').value = e;
  document.getElementById('liPass').value = 'demo1234';
  document.getElementById('loginErr').hidden = true;
}
function doLogin() {
  const e = (document.getElementById('liEmail').value || '').trim().toLowerCase();
  const p = document.getElementById('liPass').value || '';
  const acct = STAFF[e];
  if (!acct || p.length < 4) {
    const x = document.getElementById('loginErr');
    x.hidden = false;
    x.textContent = acct ? 'That password is not right.' : 'We have no account with that email address.';
    return;
  }
  sessionStorage.setItem('pbb-auth', acct.role);
  setRole(acct.role);
  location.hash = '#/admin/' + (window.PBBLANDING ? window.PBBLANDING() : 'overview');
}

/* ---------------- FORM BEHAVIOUR ---------------- */
function pickG(b, name) {
  const box = b.closest('[data-bg]');
  box.querySelectorAll('.bgp').forEach(x => x.classList.remove('on'));
  b.classList.add('on');
  const hidden = box.parentElement.querySelector('input[type=hidden]');
  if (hidden) hidden.value = b.dataset.g;
}
function tog(b) {
  const sibs = [...b.parentElement.querySelectorAll('.pill')];
  if (sibs.length === 2) {
    sibs.forEach(x => x.classList.remove('on'));
    b.classList.add('on');
  } else b.classList.toggle('on');
}
function ctPick(b) {
  [...b.parentElement.children].forEach(x => x.classList.remove('on'));
  b.classList.add('on');
  const v = document.getElementById('volFields');
  if (v) v.style.display = b.textContent === 'Volunteer' ? 'block' : 'none';
}
function galPick(b) {
  [...b.parentElement.children].forEach(x => x.classList.remove('on'));
  b.classList.add('on');
}
function copyAcct(b, a) {
  navigator.clipboard && navigator.clipboard.writeText(a);
  const t = b.textContent;
  b.textContent = 'Copied';
  b.classList.add('btn-d');
  setTimeout(() => {
    b.textContent = t;
    b.classList.remove('btn-d');
  }, 1400);
}

/* live eligibility on the donor form */
function checkAge(i) {
  const dob = new Date(i.value);
  if (isNaN(dob)) return;
  const age = Math.floor((Date.now() - dob) / 31557600000);
  const m = document.getElementById('eligMsg');
  if (age < 18) m.innerHTML = '<div class="msg no">You must be at least 18 to donate. You can register when you turn 18.</div>';else if (age > 60) m.innerHTML = '<div class="msg no">Donors over 60 are asked to speak to the branch before registering.</div>';else m.innerHTML = '<div class="msg ok">✓ Age ' + age + ' — within the donating range.</div>';
}
function checkWeight(i) {
  const w = parseFloat(i.value);
  if (isNaN(w)) return;
  const m = document.getElementById('eligMsg');
  if (w < 50) m.innerHTML = '<div class="msg no">Donors must weigh at least 50 kg. Please speak to your branch.</div>';
}

/* multi-step */
function stepGo(d) {
  const boxes = document.querySelectorAll('.stepbox'),
    stps = document.querySelectorAll('.stp');
  if (d > 0) {
    const cur = boxes[step];
    for (const f of cur.querySelectorAll('[required]')) {
      if (!f.value) {
        f.focus();
        f.style.borderColor = 'var(--red)';
        return;
      }
    }
  }
  step = Math.max(0, Math.min(boxes.length - 1, step + d));
  boxes.forEach((b, i) => b.classList.toggle('on', i === step));
  stps.forEach((s, i) => {
    s.classList.toggle('on', i === step);
    s.classList.toggle('done', i < step);
  });
  document.getElementById('backBtn').style.display = step ? '' : 'none';
  document.getElementById('nextBtn').style.display = step < boxes.length - 1 ? '' : 'none';
  document.getElementById('doneBtn').style.display = step === boxes.length - 1 ? '' : 'none';
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/* submissions */
function ref(p) {
  return p + '-' + Math.floor(1000 + Math.random() * 9000);
}
function done(form, html) {
  form.innerHTML = '<div class="done">' + html + '</div>';
  window.scrollTo({
    top: form.offsetTop - 120,
    behavior: 'smooth'
  });
}
function submitRequest(e) {
  e.preventDefault();
  const f = e.target;
  const g = f.querySelector('input[name=group]').value;
  if (!g) {
    alert('Please choose the blood group needed.');
    return false;
  }
  const d = new FormData(f);
  const id = window.PBBSTORE ? window.PBBSTORE.addRequest({
    pt: d.get('patient'),
    hosp: d.get('hospital'),
    g: g,
    u: +d.get('units') || 1,
    c: d.get('city'),
    urg: d.get('urgency'),
    by: d.get('relation') || 'Requester',
    ph: d.get('phone'),
    src: 'web'
  }) : ref('PBB');
  done(f, `<div class="tick">✓</div><h2>Request received</h2>
 <p class="lead" style="margin-top:12px">A coordinator will call you shortly. Keep your phone nearby.</p>
 <div class="code">${id}</div>
 <p class="muted" style="font-size:14px">Save this number. Quote it when you call the branch.</p>
 <p class="muted" style="font-size:13px;margin-top:10px">This request is now on the branch coordinator's screen. <a href="#/admin/requests"><b>See it in the admin →</b></a></p>
 <div class="row" style="justify-content:center;margin-top:22px"><a href="tel:0812836820" class="btn btn-p">Call the head office</a><a href="#/" class="btn btn-o">Back to home</a></div>`);
  return false;
}
function submitDonor(e) {
  e.preventDefault();
  const f = e.target;
  const d = new FormData(f);
  if (window.PBBSTORE) window.PBBSTORE.addDonor({
    n: d.get('name'),
    g: d.get('group') === 'unknown' ? 'O+' : d.get('group'),
    p: d.get('phone'),
    c: d.get('city'),
    last: d.get('last') || null
  });
  done(f, `<div class="tick">✓</div><h2>You are on the register</h2>
 <p class="lead" style="margin-top:12px">Your branch will confirm your details by phone. When someone near you needs your blood group, we will call.</p>
 <div class="code">${ref('D')}</div>
 <p class="muted" style="font-size:14px">Your donor number. Bring it, or just your name, when you come in.</p>
 <div class="row" style="justify-content:center;margin-top:22px"><a href="#/services" class="btn btn-o">How donation works</a><a href="#/" class="btn btn-p">Done</a></div>`);
  return false;
}
function submitDonation(e) {
  e.preventDefault();
  const dd = new FormData(e.target);
  const dr = {
    kind: 'Donation',
    at: Date.now()
  };
  dd.forEach((v, k) => {
    if (v) dr[k] = v;
  });
  if (window.PBBSTORE && window.PBBSTORE.addSubmission) window.PBBSTORE.addSubmission(dr);
  done(e.target, `<div class="tick">✓</div><h2>Thank you</h2>
 <p class="lead" style="margin-top:12px">Your details have been sent to the accounts desk. A receipt follows once the transfer is matched.</p>
 <div class="row" style="justify-content:center;margin-top:22px"><a href="#/" class="btn btn-p">Back to home</a></div>`);
  return false;
}
function submitContact(e) {
  e.preventDefault();
  const cd = new FormData(e.target);
  const cr = {
    kind: 'Message',
    at: Date.now()
  };
  cd.forEach((v, k) => {
    if (v) cr[k] = v;
  });
  if (window.PBBSTORE && window.PBBSTORE.addSubmission) window.PBBSTORE.addSubmission(cr);
  done(e.target, `<div class="tick">✓</div><h2>Message sent</h2>
 <p class="lead" style="margin-top:12px">Someone from the office will reply. For anything urgent, please call 081-2836820.</p>
 <div class="row" style="justify-content:center;margin-top:22px"><a href="#/" class="btn btn-p">Back to home</a></div>`);
  return false;
}

/* ---------------- LANGUAGE ---------------- */
const UR = {
  'Home': 'ہوم',
  'About': 'تعارف',
  'Services': 'خدمات',
  'Get involved': 'شامل ہوں',
  'Media': 'میڈیا',
  'Contact': 'رابطہ',
  'Request Blood': 'خون کی درخواست',
  'Register as a Donor': 'عطیہ دہندہ رجسٹریشن',
  'Get involved ': 'شامل ہوں',
  'The problem we are solving': 'ہم کون سا مسئلہ حل کر رہے ہیں',
  'Our story': 'ہماری کہانی',
  'Our leadership': 'ہماری قیادت',
  'Who stands with us': 'ہمارے ساتھی ادارے',
  'Our branches': 'ہماری شاخیں',
  'Committee & staff': 'کمیٹی اور عملہ',
  'Everything in one place': 'سب کچھ ایک جگہ',
  'Request blood': 'خون کی درخواست',
  'Register as a donor': 'عطیہ دہندہ بنیں',
  'Volunteer with us': 'رضاکار بنیں',
  'Partner organisation': 'شراکت دار ادارہ',
  'Register an organisation': 'ادارہ رجسٹر کریں',
  'Donate': 'عطیہ کریں',
  'What we provide': 'ہماری خدمات',
  'Thalassemia children': 'تھیلیسیمیا کے بچے',
  'Photos & videos': 'تصاویر و ویڈیوز',
  'Announcements & events': 'اعلانات اور تقریبات',
  'Staff sign in': 'عملہ لاگ ان'
};
let LANG = localStorage.getItem('pbb-lang') || 'en';
function applyLang() {
  const ur = LANG === 'ur';
  document.documentElement.lang = ur ? 'ur' : 'en';
  document.body.classList.toggle('urdu', ur);
  document.querySelectorAll('[data-t]').forEach(el => {
    const k = el.dataset.t;
    el.textContent = ur && UR[k] ? UR[k] : k;
  });
  document.querySelectorAll('.lang').forEach(b => b.textContent = ur ? 'اردو ▾' : 'EN ▾');
}
function toggleLang() {
  LANG = LANG === 'en' ? 'ur' : 'en';
  localStorage.setItem('pbb-lang', LANG);
  buildNav();
  applyLang();
}

/* re-label nav through data-t so the toggle can swap it */
const DICON = {
  '#/problem': 'M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  '#/about': 'M12 8v8m-4-4h8M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  '#/people': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  '#/supporters': 'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z',
  '#/branches': 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Zm0-9h.01',
  '#/services': 'M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
  '#/thalassemia': 'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z',
  '#/join': 'M4 5h16M4 12h16M4 19h10',
  '#/join/requester': 'M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
  '#/join/donor': 'M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6M12 3v12m0 0 4-4m-4 4-4-4',
  '#/join/volunteer': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  '#/join/partner': 'M8 7h8M8 12h8M8 17h5M4 3h16v18H4z',
  '#/join/organisation': 'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6',
  '#/partners': 'M8 7h8M8 12h8M8 17h5M4 3h16v18H4z',
  '#/donate': 'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z',
  '#/gallery': 'M3 5h18v14H3zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm13 8-6-7-5 6-3-3-3 4',
  '#/news': 'M4 4h12v16H4zM16 8h4v10a2 2 0 0 1-4 0V8ZM7 8h6M7 12h6M7 16h4',
  '#/publications': 'M4 4h9a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-4v14h2a2 2 0 0 1 2 2z',
  '#/faq': 'M9.1 9a3 3 0 1 1 4.5 2.6c-.9.5-1.6 1.3-1.6 2.4m0 4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z'
};
function buildNav() {
  document.getElementById('menu').innerHTML = NAV.map(([l, h, sub]) => `<li data-nav="${l}">${h ? `<a href="${h}" data-t="${l}">${l}</a>` : `<a href="${sub[0][1]}"><span data-t="${l}">${l}</span> <i class="chev"></i></a>`}
  ${sub ? `<div class="dd">${sub.map(([t, u, d]) => `<a href="${u}"><span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${DICON[u] || DICON['#/join']}"/></svg></span><span><b data-t="${t}">${t}</b><span>${d}</span></b></span></a>`).join('')}</div>` : ''}</li>`).join('');
  buildMob();
  document.querySelectorAll('.lang').forEach(b => b.onclick = toggleLang);
}
buildNav();
applyLang();

/* ---------------- WHATSAPP ---------------- */
document.body.insertAdjacentHTML('beforeend', '<a class="wa" href="https://wa.me/923003815590" target="_blank" rel="noopener" aria-label="Message us on WhatsApp">' + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.9-2.9-1.6-4-3.5-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.7.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.5-.3z"/><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z"/></svg>' + '<span>WhatsApp</span></a>');

/* ---------------- COUNTERS + REVEAL ---------------- */
function enhance() {
  /* The reveal is decoration. It must never be the reason something cannot be read:
     anything already on screen shows at once, and everything shows regardless after a moment. */
  const reveal = el => {
    el.classList.add('in');
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
      reveal(e.target);
      io.unobserve(e.target);
    }
  }), {
    threshold: .12
  });
  const items = document.querySelectorAll('.pil,.gapcard,.suppcard,.card,.era,.brc,.joincard');
  items.forEach(el => {
    el.classList.add('rev');
    if (el.getBoundingClientRect().top < innerHeight * 1.1) {
      reveal(el);
      return;
    }
    io.observe(el);
  });
  setTimeout(() => document.querySelectorAll('.rev:not(.in)').forEach(reveal), 1400);
  document.querySelectorAll('.stats .n,.pn').forEach(el => {
    if (el.dataset.counted) return;
    const raw = (el.dataset.target || el.textContent).trim(),
      m = raw.match(/^([\d,]+)(\+?)$/);
    if (!m) return;
    const end = +m[1].replace(/,/g, ''),
      suf = m[2];
    if (end < 10) return;
    el.dataset.counted = '1';
    el.dataset.target = raw;
    let t0 = null;
    el.textContent = '0' + suf;
    const fallback = setTimeout(() => {
      el.textContent = raw;
    }, 1600);
    const io2 = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io2.unobserve(e.target);
      clearTimeout(fallback);
      const step = ts => {
        t0 = t0 || ts;
        const k = Math.min(1, (ts - t0) / 900);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString() + suf;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), {
      threshold: .5
    });
    io2.observe(el);
  });
}
const _route = route;
route = function () {
  _route();
  applyLang();
  enhance();
};
window.removeEventListener('hashchange', _route);
window.addEventListener('hashchange', route);
enhance();
})(); } catch (e) { __ds_ns.__errors.push({ path: "pbb-app.js", error: String((e && e.message) || e) }); }

// pbb-forms.js
try { (() => {
/* PBB admin — the forms behind every "+ Add" button.
   One builder, so a new form is a description rather than a new sheet of markup. */

const F = {
  t: (n, l, ph, req) => `<div class="fgrp"><label class="lb">${l}${req ? ' *' : ''}</label><input class="fld" name="${n}"${req ? ' required' : ''}${ph ? ` placeholder="${ph}"` : ''}></div>`,
  tel: (n, l) => `<div class="fgrp"><label class="lb">${l}</label><input class="fld" type="tel" name="${n}" placeholder="0300 0000000"></div>`,
  date: (n, l, req) => `<div class="fgrp"><label class="lb">${l}${req ? ' *' : ''}</label><input class="fld" type="date" name="${n}"${req ? ' required' : ''}></div>`,
  num: (n, l, v) => `<div class="fgrp"><label class="lb">${l}</label><input class="fld" type="number" name="${n}" value="${v || ''}"></div>`,
  area: (n, l, ph) => `<div class="fgrp"><label class="lb">${l}</label><textarea class="fld" name="${n}" rows="3"${ph ? ` placeholder="${ph}"` : ''}></textarea></div>`,
  sel: (n, l, opts) => `<div class="fgrp"><label class="lb">${l}</label><select class="fld" name="${n}">${opts.map(o => `<option>${o}</option>`).join('')}</select></div>`,
  town: (n = 'c') => `<div class="fgrp"><label class="lb">Town *</label><select class="fld" name="${n}">${(SCOPE ? [SCOPE] : TOWNS14).map(t => `<option>${t}</option>`).join('')}</select></div>`,
  group: () => `<div class="fgrp"><label class="lb">Blood group *</label><div class="row" style="gap:7px" id="adG">${GROUPS_A.map(g => `<button type="button" class="bgp sm2" onclick="pickAdd(this)">${g}</button>`).join('')}</div></div>`,
  two: (a, b) => `<div class="g2" style="gap:12px">${a}${b}</div>`,
  tog: (n, l, on) => `<label class="togrow"><span>${l}</span><input type="checkbox" name="${n}"${on ? ' checked' : ''}><i></i></label>`,
  hint: h => `<div class="ahint" style="margin:16px 0">${h}</div>`,
  lab: l => `<div class="qlab" style="margin:22px 0 10px">${l}</div>`
};
const FORMS = {
  addVolunteer: {
    title: 'Add a volunteer',
    sub: 'Somebody who has offered to help. The first thing that matters is that they get called.',
    body: () => F.t('n', 'Full name', '', 1) + F.two(F.tel('p', 'Telephone'), F.town()) + F.sel('sk', 'What they can do', ['Camps', 'Outreach', 'Driving', 'Translation', 'Fundraising', 'Office work', 'Anything needed']) + F.sel('av', 'When they are free', ['Weekends', 'Evenings', 'Any time', 'By arrangement']) + F.area('note', 'Anything else', 'Skills, a vehicle, languages spoken') + F.hint('A volunteer is recorded as <b>not yet contacted</b> until somebody marks otherwise. That count sits first on the volunteers screen, in red.'),
    save: d => {
      VOLS.unshift({
        n: d.n || 'Unnamed',
        c: d.c || SCOPE || 'Quetta',
        sk: d.sk || 'Anything needed',
        st: 'new'
      });
      return d.n + ' added, and marked not yet contacted.';
    }
  },
  addChild: {
    title: 'Register a child',
    sub: 'Thalassemia care is free and needs no exchange donor. Nothing on this form changes that.',
    body: () => F.two(F.t('n', 'Child\u2019s name', '', 1), F.num('a', 'Age in years')) + F.two(F.group(), F.town()) + F.t('guard', 'Parent or guardian') + F.tel('p', 'Telephone') + F.two(F.sel('sp', 'Transfusion needed every', ['2 weeks', '3 weeks', '4 weeks', '6 weeks']), F.date('due', 'Next transfusion due')) + F.t('hosp', 'Hospital where transfused') + F.lab('Consent') + F.tog('ph', 'Photograph may be used publicly', 0) + F.hint('Photo consent is <b>off</b> unless a signed form is held from the family. A child without it is still counted and still transfused — they simply never appear on the website.'),
    save: d => {
      THAL.unshift({
        id: 'T-' + String(THAL.length + 40).padStart(3, '0'),
        n: d.n || 'Unnamed',
        a: +d.a || 0,
        g: pickedG() || 'O+',
        c: d.c || SCOPE || 'Quetta',
        due: +7,
        sp: 0,
        ph: d.ph ? 1 : 0
      });
      return d.n + ' registered. Transfusion schedule set.';
    }
  },
  addPartner: {
    title: 'Add an organisation',
    sub: 'A hospital, laboratory, foundation, welfare society, university or another blood bank.',
    body: () => F.t('n', 'Name of the organisation', '', 1) + F.two(F.sel('k', 'Kind', ['Hospital', 'Laboratory', 'Foundation', 'Welfare society', 'University or college', 'Another blood bank', 'Government body']), F.town()) + F.lab('Who we speak to') + F.two(F.t('cn', 'Named person'), F.tel('cp', 'Direct line')) + F.t('em', 'Email') + F.area('note', 'What they are asking for, or offering') + F.hint('An organisation stays <b>pending</b> until the head office approves it. Approval gives them a named coordinator and a direct line — never a login to the register.'),
    save: d => {
      PARTNERS.unshift({
        n: d.n || 'Unnamed',
        k: d.k || 'Hospital',
        c: d.c || SCOPE || 'Quetta',
        st: 'pending',
        since: '\u2014',
        note: d.note || 'Added by ' + ROLES[ROLE].who
      });
      return d.n + ' added, and waiting for the head office.';
    }
  },
  addTown: {
    title: 'Add a town',
    sub: 'A town PBB will serve, with or without an office of its own.',
    body: () => F.t('n', 'Town', '', 1) + F.sel('k', 'Standing', ['Branch with its own office', 'Served from another office']) + F.sel('from', 'Served from', OFFICES) + F.hint('A town added here appears in every town list across the site at once — the request form, the donor form, the branch list and every filter in the admin.'),
    save: d => {
      if (d.n && !window.PBBTOWNS.includes(d.n)) window.PBBTOWNS.push(d.n);
      return d.n + ' added. It now appears in every town list on the site — the public request and donor forms, the branch list, the network table and every filter in the admin.';
    }
  },
  addBranch: {
    title: 'Add a branch',
    sub: 'An office with its own staff, its own shelf and its own register.',
    body: () => F.t('n', 'Town', '', 1) + F.area('a', 'Address', 'Street, landmark') + F.two(F.tel('p', 'Telephone'), F.t('bank', 'Bank account', 'For donations')) + F.tog('amb', 'Has an ambulance', 0) + F.hint('A new branch starts with an empty shelf and no stock update recorded. It will show as <b>never updated</b> until somebody enters figures — which is the point.'),
    save: d => d.n + ' added. Create its branch manager account next.'
  },
  newPage: {
    title: 'New page',
    sub: 'A page on the public website. It stays unpublished until you say otherwise.',
    body: () => F.two(F.t('n', 'Page title', '', 1), F.t('u', 'Address', '/about-us')) + F.sel('m', 'Where it sits in the menu', ['About', 'Services', 'Get involved', 'Media', 'Not in the menu']) + F.area('d', 'What this page is for', 'One line, for whoever edits it next') + F.lab('Languages') + F.tog('en', 'English', 1) + F.tog('ur', '\u0627\u0631\u062f\u0648 Urdu', 1) + F.tog('ps', '\u067e\u069a\u062a\u0648 Pashto', 0) + F.hint('A page missing a language shows the English text rather than an empty page, and is listed as incomplete until it is translated.'),
    save: d => {
      SITEPAGES.push([d.n || 'Untitled', d.u || '/new', 0, d.m || 'Not in the menu', 'EN', 'draft']);
      return d.n + ' created as a draft. Nobody can see it yet.';
    }
  },
  newAnnouncement: {
    title: 'New announcement',
    sub: 'A notice, a camp, or something urgent. It can appear in several places at once.',
    body: () => F.area('msg', 'The message', 'Kept short — this runs across the top of every page', 1) + F.two(F.sel('k', 'Kind', ['Camp', 'Notice', 'Urgent appeal', 'Holiday hours']), F.date('from', 'Starts')) + F.date('to', 'Ends') + F.lab('Where it appears') + F.tog('strip', 'Strip across the top of every page', 1) + F.tog('home', 'Card on the home page', 1) + F.tog('news', 'The announcements page', 1) + F.hint('An end date is <b>required</b> on anything urgent. The commonest failing of a small organisation\u2019s website is a banner from two years ago that nobody remembered to remove.'),
    save: d => (d.msg || 'The announcement') + ' scheduled.'
  },
  newEvent: {
    title: 'New event',
    sub: 'A camp, a drive or a gathering. People can register to attend from the website.',
    body: () => F.t('n', 'What it is called', '', 1) + F.two(F.sel('k', 'Kind', ['Blood camp', 'Awareness drive', 'Training', 'Meeting', 'Eid hide collection']), F.town()) + F.two(F.date('d', 'Date', 1), F.t('time', 'Time', '9am to 4pm')) + F.t('place', 'Where', 'School, hall, university') + F.area('d2', 'Description', 'What people should expect') + F.tog('reg', 'Take registrations on the website', 1) + F.hint('A camp should grow the register. Anybody who registers here can be added to the donor list in one press, which is the whole reason to take registrations on the site instead of on paper.'),
    save: d => d.n + ' created. It appears on the events page immediately.'
  },
  upload: {
    title: 'Upload',
    sub: 'Photographs, posters and documents. Everything on the site picks from this one library.',
    body: () => `<div class="dropzone" style="margin-bottom:18px">Drop files here<br><span class="sm">or press to choose them</span></div>` + F.t('cap', 'Caption', 'What this shows, and where') + F.two(F.sel('k', 'Kind', ['Photograph', 'Poster', 'Report', 'Form', 'Video']), F.town()) + F.lab('Consent') + F.tog('consent', 'A signed consent form is held for anybody identifiable', 0) + F.hint('A photograph of a patient or a child <b>cannot be published</b> without this. The flag travels with the file, so it cannot be lost when somebody else uses the picture later.'),
    save: d => 'Uploaded. It is now available to every page and gallery.'
  },
  newRole: {
    title: 'New role',
    sub: 'A set of permissions somebody can be given. Roles are easier to reason about than individual switches.',
    body: () => F.t('n', 'What the role is called', '', 1) + F.area('d', 'What this role is for', 'One line — the person granting it should not have to guess') + F.sel('scope', 'What it can see', ['One town only', 'All fourteen towns', 'Only what it created']) + F.lab('It may') + F.tog('p1', 'See donors', 1) + F.tog('p2', 'Add and edit donors', 0) + F.tog('p3', 'See telephone numbers', 0) + F.tog('p4', 'Answer blood requests', 0) + F.tog('p5', 'Edit the website', 0) + F.tog('p6', 'Create accounts', 0) + F.hint('A new role starts with <b>everything switched off</b>. Nobody is given more than somebody deliberately turned on.'),
    save: d => d.n + ' created, with everything switched off until you grant it.'
  }
};
function pickedG() {
  const g = document.querySelector('#adG .bgp.on');
  return g ? g.textContent : '';
}
function openForm(key) {
  const f = FORMS[key];
  if (!f) return;
  sheet(`<h2 style="margin-bottom:4px">${f.title}</h2><p class="sm" style="margin-bottom:22px">${f.sub}</p>
 <form onsubmit="return saveForm(event,'${key}')">${f.body()}
 <button class="btn btn-p" style="width:100%;padding:14px;margin-top:6px">Save</button>
 <button type="button" class="btn btn-o" style="width:100%;margin-top:9px" onclick="closeSheet()">Cancel</button></form>`);
}
function saveForm(e, key) {
  e.preventDefault();
  const f = FORMS[key],
    fd = new FormData(e.target),
    d = {};
  fd.forEach((v, k) => d[k] = v);
  e.target.querySelectorAll('input[type=checkbox]').forEach(c => d[c.name] = c.checked);
  const msg = f.save ? f.save(d) : 'Saved.';
  sheet(`<div class="tick">\u2713</div><h2 style="margin-bottom:6px">Saved</h2>
 <p class="sm" style="margin-bottom:22px">${msg}</p>
 <button class="btn btn-p" style="width:100%" onclick="closeSheet();route()">Done</button>
 <button class="btn btn-o" style="width:100%;margin-top:9px" onclick="openForm('${key}')">Add another</button>`);
  return false;
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "pbb-forms.js", error: String((e && e.message) || e) }); }

// pbb-me.js
try { (() => {
/* Donor self-service — the donor's own record, without telephoning a branch. */

/* ---- sign in with a phone number and a code ---- */
PAGES['me/signin'] = () => `<section class="blk"><div class="wrap narrow">
<a href="#/" class="backlink">← Back to the website</a>
<h1 class="h1" style="margin:14px 0 10px">Your record</h1>
<p class="lede" style="margin-bottom:34px">See what we hold about you, change your telephone number, tell us you have donated somewhere else, or take yourself off the register. No password to remember.</p>
<div class="card" style="max-width:520px">
<div class="fgrp"><label class="lb">The telephone number we have for you</label><input class="fld" type="tel" placeholder="03XX XXXXXXX" value="0300 3815590"></div>
<button class="btn btn-p" style="width:100%;padding:15px" onclick="location.hash='#/me/code'">Send me a code</button>
<p class="sm" style="margin-top:14px">A six-figure code arrives by SMS. It is the only way in, so nobody can open your record from a number that is not yours.</p>
</div>
<div class="ahint" style="max-width:520px;margin-top:18px">Number changed, or never given one? Telephone any branch — the list is on <a href="#/branches">Our branches</a>.</div>
</div></section>`;
PAGES['me/code'] = () => `<section class="blk"><div class="wrap narrow">
<a href="#/me/signin" class="backlink">← Back</a>
<h1 class="h1" style="margin:14px 0 10px">Type the code</h1>
<p class="lede" style="margin-bottom:34px">Sent to 0300 3815590 a moment ago.</p>
<div class="card" style="max-width:520px">
<div class="otp">${Array.from({
  length: 6
}, (_, i) => `<input class="otpbox" maxlength="1" inputmode="numeric" value="${'482913'[i]}">`).join('')}</div>
<button class="btn btn-p" style="width:100%;padding:15px;margin-top:20px" onclick="location.hash='#/me'">Open my record</button>
<div class="row" style="justify-content:space-between;margin-top:16px"><span class="sm">Nothing after a minute?</span><a href="#/me/code" class="minilink">Send it again</a></div>
</div>
</div></section>`;

/* ---- the record itself ---- */
PAGES['me'] = () => `<section class="blk"><div class="wrap">
<div class="row" style="justify-content:space-between;align-items:flex-start;gap:18px;flex-wrap:wrap;margin-bottom:30px">
<div><h1 class="h1" style="margin-bottom:6px">Abdul Samad Kakar</h1><p class="lede">On the Quetta register since March 2019 · <b>O negative</b></p></div>
<a href="#/" class="btn btn-o">Sign out</a></div>

<div class="mecards">
<div class="card mestat ok"><div class="l">You can donate</div><div class="n">Now</div><div class="sm">Your last donation was 118 days ago. Ninety days is the minimum.</div>
<a href="#/needs" class="btn btn-p btn-s" style="margin-top:14px">See who needs O− now</a></div>
<div class="card mestat"><div class="l">You have given</div><div class="n">14 times</div><div class="sm">Roughly forty-two people have had some part of your blood since 2019.</div></div>
<div class="card mestat"><div class="l">Called on</div><div class="n">6 times</div><div class="sm">You answered five. O negative is asked for more often than any other group.</div></div>
</div>

<div class="g2" style="gap:20px;align-items:start;margin-top:22px">
<div>
<div class="card"><h3 style="margin-bottom:6px">What we hold</h3><p class="sm" style="margin-bottom:20px">Change anything here yourself. It takes effect at once.</p>
<div class="fgrp"><label class="lb">Name</label><input class="fld" value="Abdul Samad Kakar"></div>
<div class="g2" style="gap:14px"><div class="fgrp"><label class="lb">Telephone</label><input class="fld" type="tel" value="0300 3815590"></div>
<div class="fgrp"><label class="lb">Town</label><select class="fld"><option>Quetta</option><option>Pishin</option><option>Loralai</option><option>Zhob</option><option>Chaman</option></select></div></div>
<div class="fgrp"><label class="lb">Blood group</label><input class="fld" value="O negative (O−)" disabled style="opacity:.6"><div class="sm" style="margin-top:6px">Only a branch can change this, and only after a fresh test. Telephone 081-2836820 if it is wrong.</div></div>
<button class="btn btn-p" style="width:100%">Save</button></div>

<div class="card" style="margin-top:20px"><h3 style="margin-bottom:6px">Donated somewhere else?</h3><p class="sm" style="margin-bottom:16px">Tell us and we will stop calling you until you are eligible again. It costs you nothing and it stops a wasted telephone call at three in the morning.</p>
<div class="g2" style="gap:14px"><div class="fgrp"><label class="lb">When</label><input class="fld" type="date"></div>
<div class="fgrp"><label class="lb">Where</label><input class="fld" placeholder="Hospital or blood bank"></div></div>
<button class="btn btn-o" style="width:100%">Record it</button></div>
</div>

<div>
<div class="card"><h3 style="margin-bottom:16px">When we may call you</h3>
${[['Any hour, for an emergency', 'on'], ['Only between 8am and 9pm', 'off'], ['By SMS as well as a telephone call', 'on'], ['About camps and events near me', 'on'], ['Never — take me off the calling list', 'off']].map(([t, s]) => `<label class="togrow"><span>${t}</span><input type="checkbox" ${s === 'on' ? 'checked' : ''}><i></i></label>`).join('')}
<p class="sm" style="margin-top:14px">O negative can be given to anybody, so you are called more than most. Turning the first one off is understood — say so rather than letting the phone ring.</p></div>

<div class="card" style="margin-top:20px"><h3 style="margin-bottom:16px">Your donations</h3>
${[['12 Apr 2026', 'Quetta', 'Whole blood'], ['21 Nov 2025', 'Quetta', 'Whole blood'], ['03 Jun 2025', 'Pishin camp', 'Whole blood'], ['14 Jan 2025', 'Quetta', 'Platelets']].map(([d, w, k]) => `<div class="listrow"><div><b>${d}</b><span class="sm">${w} · ${k}</span></div><span class="tag ok">Recorded</span></div>`).join('')}
<button class="btn btn-o btn-s" style="width:100%;margin-top:16px">All fourteen</button></div>

<div class="card" style="margin-top:20px;border-color:#F0BDB6"><h3 style="margin-bottom:6px;color:var(--red-d)">Take me off the register</h3><p class="sm">Your record is removed the same day and we will not ask you to justify it. Your past donations stay in the yearly totals as a number, without your name.</p>
<button class="btn btn-o" style="width:100%;margin-top:14px" onclick="location.hash='#/me/remove'">Remove my record</button></div>
</div></div>
</div></section>`;
PAGES['me/remove'] = () => `<section class="blk"><div class="wrap narrow">
<a href="#/me" class="backlink">← Back to my record</a>
<h1 class="h1" style="margin:14px 0 10px">Take yourself off the register</h1>
<p class="lede" style="margin-bottom:30px">You do not owe us a reason. Read what happens, then confirm.</p>
<div class="card" style="max-width:560px">
${[['Your name, telephone number and address are deleted today.', 'Not hidden or archived — deleted.'], ['We stop calling you.', 'Nobody at any branch can look you up again.'], ['Your fourteen donations stay as a number.', 'They count towards the yearly total. Your name is not attached to them.'], ['You can come back whenever you like.', 'Walk into any branch. You will be starting a new record.']].map(([a, b]) => `<div class="listrow"><div><b>${a}</b><span class="sm">${b}</span></div></div>`).join('')}
<div class="fgrp" style="margin-top:20px"><label class="lb">If you would like to tell us why (you need not)</label><textarea class="fld" rows="3" placeholder="Optional"></textarea></div>
<button class="btn btn-d" style="width:100%">Remove my record</button>
<a href="#/me" class="btn btn-o" style="width:100%;margin-top:10px">Keep my record</a>
</div></div></section>`;

/* ---- the public board: what is being asked for right now ----
   Names are never shown. A patient's identity is not the public's business;
   the blood group, the hospital and the hour are what a donor needs to decide. */
const NEEDS = [{
  g: 'O−',
  u: 3,
  h: 'Civil Hospital, Quetta',
  c: 'Quetta',
  urg: 'Critical — today',
  ago: '22 minutes ago'
}, {
  g: 'B−',
  u: 2,
  h: 'Bolan Medical Complex, Quetta',
  c: 'Quetta',
  urg: 'Urgent — within 2 days',
  ago: '1 hour ago'
}, {
  g: 'A+',
  u: 1,
  h: 'DHQ Hospital, Zhob',
  c: 'Zhob',
  urg: 'Planned — a date is set',
  ago: '3 hours ago'
}, {
  g: 'O+',
  u: 2,
  h: 'Sandeman Hospital, Quetta',
  c: 'Quetta',
  urg: 'Urgent — within 2 days',
  ago: '4 hours ago'
}];
let needG = 'All';
function pickNeed(b, g) {
  needG = g;
  route();
}
PAGES.needs = () => {
  const rows = needG === 'All' ? NEEDS : NEEDS.filter(n => n.g === needG);
  return `
${hero('Right now', 'Who needs blood today', 'Every open request across the fourteen towns. No names — a blood group, a hospital and an hour is all a donor needs to decide.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="row" style="gap:8px;margin-bottom:24px;flex-wrap:wrap">${[['All', 'All groups'], ['O−', 'O−'], ['O+', 'O+'], ['A−', 'A−'], ['A+', 'A+'], ['B−', 'B−'], ['B+', 'B+'], ['AB−', 'AB−'], ['AB+', 'AB+']].map(([g, l]) => {
    const c = g === 'All' ? NEEDS.length : NEEDS.filter(n => n.g === g).length;
    return `<button class="pill${g === needG ? ' on' : ''}" onclick="pickNeed(this,'${g}')">${l}${c ? ` <b style="font-variant-numeric:tabular-nums">${c}</b>` : ''}</button>`;
  }).join('')}</div>
${rows.length ? `<div class="g2" style="gap:16px">` : ''}${rows.map(n => `<div class="card needcard ${n.urg.startsWith('Critical') ? 'crit' : ''}">
<div class="row" style="justify-content:space-between;align-items:flex-start;gap:14px">
<div><div class="needg">${n.g}</div><div class="sm" style="margin-top:4px">${n.u} ${n.u === 1 ? 'bag' : 'bags'} needed</div></div>
<span class="tag ${n.urg.startsWith('Critical') ? 'no' : n.urg.startsWith('Urgent') ? 'wt' : 'gy'}">${n.urg}</span></div>
<h3 style="margin:16px 0 4px">${n.h}</h3><p class="sm">${n.c} · asked ${n.ago}</p>
<a href="tel:0812836820" class="btn btn-p btn-s" style="margin-top:16px;width:100%">Call the branch to give</a></div>`).join('')}${rows.length ? '</div>' : ''}
${rows.length ? '' : `<div class="card" style="text-align:center;padding:52px 26px">
<div class="needg" style="color:var(--grn)">${needG}</div>
<h3 style="margin:14px 0 6px">No open requests for ${needG} right now</h3>
<p class="sm" style="max-width:44ch;margin:0 auto">Other groups are still being asked for — check <b>All groups</b> above. This board changes through the day, so it is worth looking again.</p>
<button class="btn btn-o btn-s" style="margin-top:18px" onclick="pickNeed(this,'All')">Show every group</button></div>`}
<div class="notice" style="margin-top:26px">A request leaves this board the moment a branch marks it arranged, so nobody travels to a hospital that no longer needs them. When every group is clear, this board is empty — and that is good news.</div>
<div class="closer" style="margin-top:34px"><div><h2>Not on the register yet?</h2><p>Three minutes now means a telephone call can reach you the next time your group is the one being asked for.</p></div><a href="#/join/donor" class="btn btn-w">Register as a donor</a></div>
</div></section>`;
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "pbb-me.js", error: String((e && e.message) || e) }); }

// pbb-pages.js
try { (() => {
/* PBB website — page templates. Rendered into #page by the router in the shell. */
const TOWNS = window.PBBTOWNS;
const GROUPS = ['O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−'];
const BRANCHES = [{
  n: 'Quetta',
  head: 1,
  a: 'Zainab Chamber, Shara-e-Adalat, near Quetta Press Club',
  t: ['081-2836820', '081-2839500'],
  amb: 1
}, {
  n: 'Loralai',
  a: 'Sayed Abdul Qadir Road',
  t: ['0824-662066'],
  bank: 'UBL Loralai · A/C 2101-1'
}, {
  n: 'Pishin',
  a: 'Band Road',
  t: ['0826-421288'],
  bank: 'NBP Pishin · A/C 4589-93'
}, {
  n: 'Zhob',
  a: 'Sharbat Khan Road',
  t: ['0822-413902'],
  bank: 'Bank Islami Zhob · A/C 1048-0088676-0001'
}, {
  n: 'Chaman',
  a: 'Taj Road',
  t: []
}, {
  n: 'Muslim Bagh',
  a: 'Aryan Market, Muslim Bagh Bazar',
  t: []
}];
const YEARS = [[1999, 360], [2000, 720], [2001, 1080], [2002, 1440], [2003, 2160], [2004, 2747], [2005, 3118], [2006, 3968], [2007, 4582], [2008, 5905], [2009, 5920], [2010, 6937], [2011, 9484], [2012, 5120]];
const hero = (eyebrow, title, lead) => `<header class="ph-hero"><div class="wrap">
<span class="eyebrow"><b></b>${eyebrow}</span><h1>${title}</h1>${lead ? `<p class="lead" style="margin-top:18px;max-width:62ch">${lead}</p>` : ''}
</div></header>`;
window._sid = 0;
const slot = (txt, ar = '16/9', st = '') => `<div class="ph" style="aspect-ratio:${ar};${st}"><image-slot id="s${++window._sid}-${location.hash.replace(/\W/g, '') || 'home'}" shape="rect" placeholder="${txt.replace(/<[^>]+>/g, ' ').replace(/"/g, '')}"></image-slot></div>`;
const bgBtns = name => GROUPS.map(g => `<button type="button" class="bgp" data-g="${g}" onclick="pickG(this,'${name}')">${g}</button>`).join('');

/* ---------------- ABOUT / STORY ---------------- */
const era = (y, kick, title, body, figs, cls = '') => `<div class="era ${cls}"><div class="wrap"><div class="era-in">
<div class="yr">${kick ? `<small>${kick}</small>` : ''}${y}</div>
<div><h3>${title}</h3><p>${body}</p></div><div class="fig">${figs}</div></div></div></div>`;
const quiet = (lab, rows) => `<div class="quiet"><div class="wrap"><div class="quiet-in"><div class="qlab">${lab}</div><div class="yrs">${rows.map(([y, b]) => `<div><div class="y">${y}</div><div class="b">${b}</div></div>`).join('')}</div></div></div></div>`;
PAGES.about = () => `
<header class="ph-hero"><div class="wrap" style="display:grid;grid-template-columns:1.15fr .85fr;gap:56px;align-items:end" id="storyHero">
<div><span class="eyebrow"><b></b>Our story</span>
<h1 style="margin:20px 0 18px">Twenty-seven years,<br>kept on the <em>record</em>.</h1>
<p class="lead">Pashtoonkhwa Blood Bank and Welfare Society was inaugurated by the Chairman of Pashtoonkhwa Milli Awami Party, Mr. Mehmood Khan Achakzai, on 24th March 1999. It has served the people, irrespective of language, colour, religion, race and ethnicity, since its first day.</p>
<div class="tl-meta"><div>Inaugurated<b>24 March 1999</b></div><div>Head office<b>Quetta</b></div><div>Branches<b>Six offices</b></div><div>Supervised by<b>Three members</b></div></div></div>
${slot('archive photograph<br>the inauguration, or the original premises', '4/3.4')}
</div></header>
${era('1999', 'The beginning', 'Inaugurated beside the Quetta Press Club', 'Three members of an organising committee — Olus Yar, Mr. Faqir Khushal Khan Kasi and Dr. Hamid Khan Achakzai — began collecting and screening blood on an exchange basis. They have supervised it ever since.', '<div class="v">360</div><div class="k">bags in the first year</div><div class="v2">180,000 CCs</div>')}
${quiet('Steady growth', [['2000', '720 bags'], ['2001', '1,080'], ['2002', '1,440'], ['2003', '2,160'], ['2004', '2,747']])}
${era('2005', 'Disaster response', 'Abbottabad earthquake', 'When the deadliest earthquake in the country\u2019s history struck, PBB was among the most active blood banks supplying pure, tested blood to the victims through local organisations.', '<div class="v">3,118</div><div class="k">bags that year</div>')}
${quiet('Expansion', [['2006', '3,968 bags'], ['2007', '4,582']])}
${era('2008', 'Disaster response', 'Ziarat earthquake — ambulances, doctors, volunteers', 'PBB\u2019s ambulance service, doctors and volunteers provided emergency services to the people of Ziarat. The same teams have since responded to terror attacks, bomb blasts and target killings across Balochistan.', '<div class="v">5,905</div><div class="k">bags that year</div>')}
${quiet('Consolidation', [['2009', '5,920 bags'], ['2010', '6,937']])}
${era('2011', 'Peak year', 'The busiest twelve months on record', 'Nearly ten thousand bags transfused in a single year, and the first year platelets and fresh frozen plasma were counted separately.', '<div class="v" style="color:var(--red)">9,484</div><div class="k">bags · 4,742,000 CCs</div><div class="v2">1,670 platelet + FFP</div>')}
${era('2012', 'The network', 'Six towns, three ambulances', 'The network reached Loralai, Muslim Bagh, Pishin, Zhob and Chaman. Three ambulances began running twenty-four hours a day out of Quetta, with the rest of the branches to follow.', '<div class="v">5,120</div><div class="k">bags to June 2012</div><div class="v2">Published figures end here</div>')}
${era('Today', 'Now', 'Two hundred children, fourteen towns, a new building', 'PBB transfuses 200 registered thalassemia children free of cost and without exchange, and vaccinates scavenger and garbage-picking children against Hepatitis B. The new Quetta premises are in their final stage of construction.', '<div class="v">200</div><div class="k">thalassemia children</div><div class="v2">14 towns served</div>', 'now')}
<section class="blk"><div class="wrap"><div class="closer">
<div><h2>The record continues.</h2><p>Funded entirely by members\u2019 contributions, charity, Zakat, and cattle hides collected by volunteers each Eid ul Adha.</p></div>
<a href="#/register-donor" class="btn btn-w">Register as a Donor</a></div></div></section>`;

/* ---------------- SERVICES ---------------- */
PAGES.services = () => `
${hero('Services', 'What we provide', 'Blood is never purchased. The only source is exchange from relatives of the patient and from registered members.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="g2" style="gap:20px">
<div class="card"><span class="tag gy">On exchange</span><h3 style="margin:14px 0 10px">Screened blood for any patient</h3><p class="muted">Every bag is tested before it reaches a patient. A relative or a registered member gives in exchange.</p>
<div class="row" style="margin-top:16px;gap:7px">${['Hepatitis B', 'Hepatitis C', 'HIV/AIDS', 'MP', 'ELISA method'].map(x => `<span class="chip">${x}</span>`).join('')}</div></div>
<div class="card" style="border-color:#CBE6D5;background:var(--grn-t)"><span class="tag ok">Free · no exchange</span><h3 style="margin:14px 0 10px">Thalassemia, pregnancy, emergency, disaster</h3><p class="muted">In these four cases blood is provided free of cost and without any exchange requirement. This has been the rule since 1999.</p></div>
</div>
<div class="g3" style="margin-top:20px">
${[['Ambulance service', 'Three vehicles running out of Quetta, twenty-four hours a day, for anyone who needs them. The remaining branches follow.'], ['Hepatitis B vaccination', 'Scavenger and garbage-picking children are vaccinated against Hepatitis B at no cost.'], ['Disaster response', 'Abbottabad 2005, Ziarat 2008, and every bomb blast, target killing and emergency since.']].map(([t, b]) => `<div class="card"><h3>${t}</h3><p class="muted" style="margin-top:9px">${b}</p></div>`).join('')}
</div>
<h2 style="margin:56px 0 8px">Who can donate</h2><p class="lead" style="margin-bottom:24px">If all four are true, you can give today.</p>
<div class="g4">${[['18–60', 'years of age'], ['50 kg', 'minimum weight'], ['90 days', 'since your last donation'], ['Good health', 'no fever, no recent surgery']].map(([n, l]) => `<div class="card" style="text-align:center"><div class="bignum">${n}</div><div class="muted" style="margin-top:6px;font-size:14px">${l}</div></div>`).join('')}</div>
<div class="closer" style="margin-top:44px"><div><h2>Not sure if you can give?</h2><p>Register anyway. The form checks as you go and tells you the date you next become eligible.</p></div><a href="#/register-donor" class="btn btn-w">Register as a Donor</a></div>
</div></section>`;

/* ---------------- BRANCHES ---------------- */
PAGES.branches = () => `
${hero('Our branches', 'Six offices.<br>Fourteen towns.', 'From the head office beside the Quetta Press Club out to Zhob, Chaman and Loralai — and to the towns in between that have no blood bank of their own.')}
<section class="blk" style="padding-top:0"><div class="wrap"><div class="g2" style="gap:34px;align-items:start">
<div style="display:grid;gap:12px">${BRANCHES.map(b => `<div class="brc">
<div style="flex:1"><div class="bn">${b.n}${b.head ? ' <span class="hd-tag">HEAD OFFICE</span>' : ''}</div>
<div class="ba">${b.a}</div>
${b.t.length ? `<div class="bt">${b.t.map(t => `<a href="tel:${t.replace(/-/g, '')}">${t}</a>`).join(' · ')}</div>` : '<div class="bt muted">Phone number to follow</div>'}
${b.bank ? `<div class="bbank">${b.bank}</div>` : ''}
${b.amb ? '<span class="tag ok" style="margin-top:9px">Ambulance service · 24 hours</span>' : ''}</div>
<a class="btn btn-o btn-s" href="https://maps.google.com/?q=${encodeURIComponent(b.n + ' Balochistan')}" target="_blank" rel="noopener">Directions</a></div>`).join('')}</div>
${slot('map slot<br>Balochistan — six branch pins, eight more towns served<br>click a pin to jump to its card', '3/4', 'min-height:520px')}
</div>
<div style="margin-top:32px"><div class="qlab" style="margin-bottom:12px">Also serving, without a permanent office</div>
${TOWNS.slice(6).map(t => `<span class="chip">${t}</span>`).join('')}</div>
</div></section>`;

/* ---------------- THALASSEMIA ---------------- */
PAGES.thalassemia = () => `
${hero('Thalassemia', 'Two hundred children,<br>every month.', 'Registered children are transfused free of cost and without exchange. For a child with thalassemia a monthly transfusion is not optional — it is the difference between a normal month and a hospital one.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="g2" style="gap:34px;align-items:center">
<div><h2 style="margin-bottom:16px">What it costs to keep one child alive for a year</h2>
<p class="muted" style="margin-bottom:22px">Sponsorship covers screening, bags and handling for one child\u2019s full year of transfusions.</p>
<div class="g3" style="gap:12px">${[['12', 'transfusions a year'], ['—', 'cost per screened bag'], ['—', 'a year, per child']].map(([n, l]) => `<div class="card" style="padding:18px"><div class="bignum" style="font-size:28px">${n}</div><div class="muted" style="font-size:13px;margin-top:4px">${l}</div></div>`).join('')}</div>
<p class="muted" style="font-size:13.5px;margin-top:14px">Figures to be supplied by the head office.</p>
<a href="#/donate" class="btn btn-p" style="margin-top:22px">Sponsor a child</a></div>
${slot('photograph slot<br><b>consented portraits only</b><br>no names unless the family has agreed', '4/3.6')}
</div>
<div class="notice" style="margin-top:44px"><b>On photographs.</b> Children appear on this page only where a signed consent form is held by the head office. A child without consent is still counted among the two hundred, and still transfused, but never shown.</div>
</div></section>`;

/* ---------------- PEOPLE ---------------- */
const person = (n, r, d, extra = '') => `<div class="card" style="padding:0;overflow:hidden">${slot('portrait', '1/1', 'border-radius:0;border:0;border-bottom:1px solid var(--line)')}
<div style="padding:20px"><h3>${n}</h3><div class="muted" style="font-size:13.5px;margin-top:5px">${r}</div>${d ? `<p class="muted" style="font-size:13.5px;margin-top:10px">${d}</p>` : ''}${extra}</div></div>`;
PAGES.people = () => `
${hero('Committee &amp; staff', 'The people who run it', 'Pashtoonkhwa Blood Bank has been supervised by the same three-member organising committee since the day it opened.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="qlab" style="margin-bottom:16px">Organising committee</div>
<div class="g3">
${person('Olus Yar', 'Olus Yar, PBB', 'Heads the organisation. Every branch, every account and every register answers upward to this office.', '<div class="bt" style="margin-top:10px"><a href="tel:03003815590">0300-3815590</a></div>')}
${person('Mr. Faqir Khushal Khan Kasi', 'Organizer, PBB', 'Member of the organising committee since 1999.')}
${person('Dr. Hamid Khan Achakzai', 'Member, organising committee', 'Provincial Secretary and Member of the Central Committee, Pashtoonkhwa Milli Awami Party.')}
</div>
<div class="qlab" style="margin:48px 0 16px">Medical staff</div>
<div class="g3">
${person('Dr. Naseer Muhammad', 'Pathologist, PBB · MD, DCP (PGMI Quetta)', 'Senior Pathologist at Pashtoonkhwa Blood Bank. Previously Senior Medical Officer with the Health Department for ten years, and Pathologist at Health Department Zhob for two.')}
<div class="card" style="border-style:dashed;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--mid);min-height:200px">Further staff to be added<br>by the head office</div>
</div>
</div></section>`;

/* ---------------- GALLERY ---------------- */
PAGES.gallery = () => `
${hero('Photos &amp; videos', 'The work, as it happens')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="row" style="gap:8px;margin-bottom:26px" id="galFilter">
${['All', 'Blood camps', 'Awareness', 'Ambulance', 'New building', 'Eid ul Adha', 'Videos'].map((f, i) => `<button class="pill${i ? '' : ' on'}" onclick="galPick(this)">${f}</button>`).join('')}
</div>
<div class="gal">${Array.from({
  length: 11
}, (_, i) => slot(i % 5 === 3 ? '▶ video' : 'photograph', [1, 1, 1.4, 1, .8, 1, 1, 1.3, 1, 1, 1][i] || 1, 'border-radius:18px'))}</div>
<div style="text-align:center;margin-top:30px"><button class="btn btn-o">Load more</button></div>
</div></section>`;

/* ---------------- NEWS ---------------- */
const NEWS = [{
  t: 'Free donation camp, Pishin',
  k: 'Blood camp',
  d: '12 September',
  b: 'Band Road branch, 9am to 4pm. Walk in, or register to attend so we know how many to expect.',
  f: 1
}, {
  t: 'New building — final stage',
  k: 'Notice',
  d: '3 September',
  b: 'Construction of the new Quetta premises has entered its last phase.'
}, {
  t: 'Eid ul Adha hide collection',
  k: 'Appeal',
  d: 'Runs to 20 June',
  b: 'Volunteers collect cattle hides across all branches. Request a collection from your area.'
}, {
  t: 'Thalassemia transfusion schedule, September',
  k: 'Notice',
  d: '28 August',
  b: 'Guardians of registered children can collect the month\u2019s schedule from their branch.'
}, {
  t: 'Awareness drive, Quetta university',
  k: 'Awareness',
  d: '14 August',
  b: 'Students registered as first-time donors over two days on campus.'
}, {
  t: 'Ambulance service extended',
  k: 'Notice',
  d: '2 August',
  b: 'A third vehicle joined the Quetta fleet, taking the service to twenty-four hours.'
}];
PAGES.news = () => `
${hero('Announcements &amp; events', 'What is happening now')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="card" style="padding:0;overflow:hidden;margin-bottom:26px"><div class="feat">
${slot('event cover photograph', '16/10', 'border-radius:0;border:0;height:100%')}
<div style="padding:38px">
<div class="row" style="gap:10px"><span class="tag no">${NEWS[0].k}</span><span class="muted" style="font-size:13.5px;font-weight:600">${NEWS[0].d}</span></div>
<h2 style="margin:16px 0 12px">${NEWS[0].t}</h2><p class="lead">${NEWS[0].b}</p>
<div class="row" style="margin-top:24px"><a href="#/contact" class="btn btn-p">Register to attend</a><a href="#/branches" class="btn btn-o">Find the branch</a></div>
</div></div></div>
<div class="g3">${NEWS.slice(1).map(n => `<div class="card" style="padding:0;overflow:hidden">${slot('cover', '16/9', 'border-radius:0;border:0;border-bottom:1px solid var(--line)')}
<div style="padding:22px"><div class="row" style="gap:9px"><span class="tag gy">${n.k}</span><span class="muted" style="font-size:13px;font-weight:600">${n.d}</span></div>
<h3 style="margin:12px 0 8px">${n.t}</h3><p class="muted" style="font-size:14px">${n.b}</p></div></div>`).join('')}</div>
</div></section>`;

/* ---------------- DONATE ---------------- */
PAGES.donate = () => `
${hero('Donate', 'Keep the register running', 'Pashtoonkhwa Blood Bank has never purchased blood. It runs on members\u2019 contributions, charity, Zakat, and cattle hides collected by volunteers each Eid ul Adha.')}
<section class="blk" style="padding-top:0"><div class="wrap"><div class="g2" style="gap:34px;align-items:start">
<div>
<h3 style="margin-bottom:14px">Bank transfer</h3>
<div style="display:grid;gap:10px">${[['National Bank, City Branch, Jinnah Road, Quetta', '6359-6'], ['United Bank, Loralai', '2101-1'], ['National Bank, Pishin', '4589-93'], ['Bank Islami, Zhob', '1048-0088676-0001']].map(([b, a]) => `<div class="acct"><div><div style="font-weight:700;font-size:14.5px">${b}</div><div class="mono">${a}</div></div><button class="btn btn-o btn-s" onclick="copyAcct(this,'${a}')">Copy</button></div>`).join('')}</div>
<div class="notice" style="margin-top:20px"><b>After transferring,</b> send us the receipt using the form so it can be matched and receipted. Zakat-eligible donations are recorded separately.</div>
<h3 style="margin:38px 0 14px">Eid ul Adha — cattle hides</h3>
<p class="muted">Volunteers collect hides across every branch during the three days of Eid. A large share of the year\u2019s running cost comes from this collection alone.</p>
<a href="#/contact" class="btn btn-o" style="margin-top:16px">Request a collection</a>
</div>
<form class="card" onsubmit="return submitDonation(event)">
<h3 style="margin-bottom:6px">Tell us about your donation</h3><p class="muted" style="font-size:13.5px;margin-bottom:22px">So we can match it and send a receipt.</p>
<div class="fgrp"><label class="lb">Your name *</label><input class="fld" name="name" required></div>
<div class="fgrp"><label class="lb">Phone *</label><input class="fld" name="phone" required placeholder="0300 0000000"></div>
<div class="g2" style="gap:14px"><div class="fgrp"><label class="lb">Amount (PKR) *</label><input class="fld" name="amount" required inputmode="numeric"></div>
<div class="fgrp"><label class="lb">Purpose</label><select class="fld" name="purpose"><option>Where most needed</option><option>Sponsor a thalassemia child</option><option>Screening kits</option><option>Ambulance fuel and upkeep</option><option>Zakat</option></select></div></div>
<div class="fgrp"><label class="lb">Which account did you send to?</label><select class="fld" name="acct"><option>National Bank, Quetta</option><option>United Bank, Loralai</option><option>National Bank, Pishin</option><option>Bank Islami, Zhob</option></select></div>
<div class="fgrp"><label class="lb">Receipt <span class="muted" style="font-weight:500">— photograph or screenshot</span></label><div class="drop">Tap to attach the transfer receipt</div></div>
<button class="btn btn-p" style="width:100%;padding:15px">Send details</button>
</form>
</div></div></section>`;

/* ---------------- REQUEST BLOOD ---------------- */
/* old website addresses people may still have bookmarked */
PAGES['request-blood'] = () => {
  location.hash = '#/join/requester';
  return '';
};
PAGES['register-donor'] = () => {
  location.hash = '#/join/donor';
  return '';
};

/* ---------------- CONTACT ---------------- */
PAGES.contact = () => `
${hero('Contact', 'Talk to us')}
<section class="blk" style="padding-top:0"><div class="wrap"><div class="g2" style="gap:34px;align-items:start">
<div>
<div class="card" style="margin-bottom:14px"><h3>Head office</h3><div class="ba" style="margin-top:8px">Zainab Chamber, Shara-e-Adalat,<br>near Quetta Press Club, Quetta, Balochistan</div>
<div class="bt" style="margin-top:12px;font-size:17px"><a href="tel:0812836820">081-2836820</a><br><a href="tel:0812839500">081-2839500</a></div>
<div class="mono" style="margin-top:10px">admin@pashtoonkhwabloodbank.org</div></div>
<div class="g2" style="gap:14px"><div class="card"><div class="qlab">Organizer</div><div style="font-weight:700;margin-top:6px">Olus Yar</div><div class="bt"><a href="tel:03003815590">0300-3815590</a></div></div>
<div class="card"><div class="qlab">Web administrator</div><div class="bt" style="margin-top:6px"><a href="tel:03327828121">0332-7828121</a></div><div class="mono" style="font-size:12px;margin-top:4px">wakeeltareen@pashtoonkhwabloodbank.org</div></div></div>
${slot('map — head office', '16/10', 'margin-top:14px')}
</div>
<form class="card" onsubmit="return submitContact(event)">
<h3 style="margin-bottom:18px">Send a message</h3>
<div class="fgrp"><label class="lb">What is this about?</label><div class="row" style="gap:8px" id="ctMode">${['General', 'Volunteer', 'Hospital or partner', 'Press'].map((m, i) => `<button type="button" class="pill${i ? '' : ' on'}" onclick="ctPick(this)">${m}</button>`).join('')}</div></div>
<div class="fgrp"><label class="lb">Name *</label><input class="fld" name="name" required></div>
<div class="fgrp"><label class="lb">Phone *</label><input class="fld" name="phone" required></div>
<div class="fgrp"><label class="lb">Email <span class="muted" style="font-weight:500">— optional</span></label><input class="fld" name="email" type="email"></div>
<div id="volFields" style="display:none">
<div class="fgrp"><label class="lb">Town</label><select class="fld" name="city">${TOWNS.map(t => `<option>${t}</option>`).join('')}</select></div>
<div class="fgrp"><label class="lb">What can you help with?</label><div class="row" style="gap:7px">${['Camps', 'Outreach', 'Driving', 'Office work', 'Design'].map(s => `<button type="button" class="pill" onclick="tog(this)">${s}</button>`).join('')}</div></div>
</div>
<div class="fgrp"><label class="lb">Message *</label><textarea class="fld" name="msg" rows="4" required></textarea></div>
<button class="btn btn-p" style="width:100%;padding:15px">Send</button>
</form>
</div></div></section>`;

/* ---------------- JOIN HUB ---------------- */
const JOINTYPES = [['requester', 'Need blood', 'Request blood for a patient', 'Tell us the group, the hospital and your number. A coordinator calls you back. In an emergency, phone 081-2836820 first.'], ['donor', 'Give blood', 'Register as a donor', 'Join the register for your town. When someone nearby needs your group, we call. You are free to say no, every time.'], ['volunteer', 'Give time', 'Volunteer with us', 'Camps, outreach, driving, office work. Volunteers collect the Eid hides that fund a large share of the year.'], ['partner', 'Work with us', 'Partner organisation', 'Hospitals, laboratories and clinics that refer patients or share screening capacity.'], ['organisation', 'Bring us to your town', 'Register an organisation', 'Welfare societies and community groups who want a PBB branch, or to run a camp under our name.']];
PAGES.join = () => `
${hero('Get involved', 'Everything in one place', 'Five ways to be part of it — asking for blood, giving it, giving time, or bringing the blood bank to your town.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="joingrid">
${JOINTYPES.map((t, i) => `<a href="#/join/${t[0]}" class="joincard${i ? '' : ' urgent'}"><div class="jn">${t[1]}</div><h3>${t[2]}</h3><p>${t[3]}</p><span class="btn ${i ? 'btn-o' : 'btn-w'} btn-s">${i ? 'Continue' : 'Request blood'}</span></a>`).join('')}
<div class="joincard" style="background:var(--ink);border-color:var(--ink)"><div class="jn" style="color:#FF6B60">Give money</div><h3 style="color:#fff">Donate</h3><p style="color:#A7ABB3">Bank transfer, Zakat, or cattle hides at Eid ul Adha. PBB has never purchased blood — this is what keeps it running.</p><a href="#/donate" class="btn btn-w btn-s">How to donate</a></div>
</div>
<div class="notice" style="margin-top:26px"><b>Not sure which one?</b> If someone is in hospital right now, use <a href="#/join/requester">request blood</a> — or call <a href="tel:0812836820">081-2836820</a>, where somebody answers at any hour.</div>
</div></section>`;

/* one form, five kinds */
const FORMFIELDS = {
  requester: [['__section', 'Who the blood is for'], ['Patient name', 'patient', 'text', 1], ['Gender', 'gender', 'select', 1, ['Male', 'Female']], ['Age', 'age', 'number', 1], ['Case or disease', 'disease', 'text', 1], ['Do you have the medical report?', 'report', 'select', 1, ['Yes, I have it', 'No, not yet']], ['__section', 'What is needed'], ['Type of blood', 'btype', 'select', 1, ['Whole blood', 'RCC — red cell concentrate', 'Platelets', 'FFP — fresh frozen plasma', 'Not sure, the doctor will say']], ['Number of bags', 'units', 'number', 1], ['Date needed', 'date', 'date', 1], ['Time', 'time', 'time', 0], ['How urgent', 'urgency', 'select', 1, ['Critical — today', 'Urgent — within 2 days', 'Planned — a date is set']], ['__section', 'Where'], ['Hospital', 'hospital', 'text', 1], ['__section', 'The attendant'], ['Attendant name', 'att', 'text', 1], ['Attendant phone', 'phone', 'tel', 1], ['Attendant blood group', 'attgroup', 'select', 0, ['Do not know yet', 'O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−']], ['Can the attendant donate?', 'attdonate', 'select', 1, ['Yes, available to donate', 'No', 'Somebody else in the family can']], ['Can you arrange an exchange donor?', 'exchange', 'select', 1, ['Yes', 'No', 'Not sure']], ['Can the donor be brought to the branch?', 'transport', 'select', 1, ['Yes, we have transport', 'No, we need help with transport']], ['Full address', 'address', 'textarea', 0]],
  donor: [['Full name', 'name', 'text', 1], ['Date of birth', 'dob', 'date', 1], ['Weight (kg)', 'weight', 'number', 1], ['Phone', 'phone', 'tel', 1], ['Area or mohalla', 'address', 'text', 0], ['When did you last give?', 'last', 'date', 0]],
  volunteer: [['Full name', 'name', 'text', 1], ['Phone', 'phone', 'tel', 1], ['Email', 'email', 'email', 0], ['Hours you can give a week', 'hours', 'select', 0, ['A few hours', 'Half a day', 'One day', 'More']], ['Anything you are good at', 'skills', 'text', 0]],
  partner: [['Organisation name', 'org', 'text', 1], ['Kind', 'kind', 'select', 1, ['Hospital', 'Laboratory', 'Clinic', 'Welfare society', 'Other']], ['Contact person', 'name', 'text', 1], ['Phone', 'phone', 'tel', 1], ['Email', 'email', 'email', 0], ['What are you hoping to do together?', 'notes', 'textarea', 0]],
  organisation: [['Organisation name', 'org', 'text', 1], ['Registration number', 'reg', 'text', 0], ['Contact person', 'name', 'text', 1], ['Role in the organisation', 'role', 'text', 0], ['Phone', 'phone', 'tel', 1], ['Email', 'email', 'email', 0], ['Why does your town need a branch?', 'notes', 'textarea', 1]]
};
const NEEDGROUP = {
  requester: 'Blood group needed',
  donor: 'Your blood group'
};
const NEEDTOWN = {
  requester: 'Town',
  donor: 'Town',
  volunteer: 'Town',
  partner: 'Town',
  organisation: 'Town'
};
function joinPage(kind) {
  const t = JOINTYPES.find(x => x[0] === kind) || JOINTYPES[0];
  const f = FORMFIELDS[kind];
  return `<section class="blk" style="padding-top:40px"><div class="wrap" style="max-width:820px">
 ${kind === 'requester' ? '<div class="callfirst" style="margin-bottom:24px"><div><h3 style="color:#fff">In an emergency, call first.</h3><p style="color:#FFD9D5;margin-top:6px;font-size:14.5px">A form is the wrong instrument for an emergency. Someone answers at any hour.</p></div><a href="tel:0812836820" class="btn btn-w">081-2836820</a></div>' : ''}
 <div class="typetabs">${JOINTYPES.map(x => `<a href="#/join/${x[0]}" class="pill${x[0] === kind ? ' on' : ''}">${x[2].replace('Register as a ', '').replace('Register an ', '').replace('Request blood', 'Need blood')}</a>`).join('')}</div>
 <h1 style="margin-bottom:12px">${t[2]}</h1><p class="lead" style="margin-bottom:28px">${t[3]}</p>
 <form class="card" onsubmit="return submitJoin(event,'${kind}')">
 ${NEEDGROUP[kind] ? `<div class="fgrp"><label class="lb">${NEEDGROUP[kind]} *</label><div class="row" style="gap:8px" data-bg="group">${bgBtns('group')}${kind === 'donor' ? '<button type="button" class="bgp wide" data-g="unknown" onclick="pickG(this,\'group\')">I don\'t know</button>' : ''}</div><input type="hidden" name="group" required></div>` : ''}
 ${f.map(([lab, n, ty, req, opts]) => lab === '__section' ? `<div class="fsec"><span>${n}</span></div>` : ty === 'select' ? `<div class="fgrp"><label class="lb">${lab}${req ? ' *' : ''}</label><select class="fld" name="${n}">${opts.map(o => `<option>${o}</option>`).join('')}</select></div>` : ty === 'textarea' ? `<div class="fgrp"><label class="lb">${lab}${req ? ' *' : ''}</label><textarea class="fld" name="${n}" rows="3" ${req ? 'required' : ''}></textarea></div>` : `<div class="fgrp"><label class="lb">${lab}${req ? ' *' : ''}</label><input class="fld" name="${n}" type="${ty}" ${req ? 'required' : ''}></div>`).join('')}
 <div class="fgrp"><label class="lb">${NEEDTOWN[kind]} *</label><select class="fld" name="city">${TOWNS.map(t => `<option>${t}</option>`).join('')}</select></div>
 ${kind === 'donor' ? '<label class="chk"><input type="checkbox" checked name="crosscity"><span>I am willing to be called if another town urgently needs my blood group.</span></label>' : ''}
 <label class="chk"><input type="checkbox" required checked><span>What I have entered is accurate, and I agree to be contacted about it.</span></label>
 <button class="btn btn-p" style="width:100%;padding:16px;font-size:16px;margin-top:14px">${kind === 'requester' ? 'Submit the request' : 'Send'}</button>
 </form>
 </div></section>`;
}
JOINTYPES.forEach(t => {
  PAGES['join/' + t[0]] = () => joinPage(t[0]);
});

/* ---------------- THE PROBLEM ---------------- */
const GAPS = [['Poor research and data', 'Almost nothing is measured. Without records of who gives, who needs and where the shortages fall, every decision is a guess.', 'M3 3v18h18M7 15l4-4 3 3 5-6'], ['No national blood group database', 'There is no register a hospital can search. Finding an O− donor at two in the morning still means phoning down a list somebody wrote by hand.', 'M4 7h16M4 12h16M4 17h10'], ['Very little voluntary donation', 'Most blood is given by a relative under pressure on the day. Regular, voluntary donors — the people a blood bank can rely on — are rare.', 'M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z'], ['Blood-consumptive disorders', 'Thalassemia, haemophilia and the rest need transfusion every few weeks for life. Two hundred children depend on PBB alone.', 'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z'], ['Prescribing habits', 'Whole blood is often ordered where a single component would do, and transfusion is sometimes prescribed where it is not needed at all.', 'M9 2h6v4h4v6h-4v10H9V12H5V6h4V2Z'], ['Blood bank capacity', 'Screening equipment, cold storage and trained staff are concentrated in a few cities. Smaller towns work with far less.', 'M6 3h12v6l-3 3 3 3v6H6v-6l3-3-3-3V3Z'], ['Blood discarded', 'Bags expire on a shelf in one town while a patient waits in the next. Nobody can see both at once.', 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13'], ['Everything routed through the cities', 'A family in Sherani or Musakhel travels to Quetta for something that ought to be available in their own district hospital.', 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z M12 10h.01'], ['No respect for the donor', 'Somebody gives blood, hears nothing again, and does not come back. The single cheapest fix in the entire system.', 'M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6M12 3v12m0 0 4-4m-4 4-4-4'], ['Little government attention', 'Blood services are largely left to charities and welfare societies to fund and run.', 'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6'], ['Everyone works alone', 'Blood banks, hospitals and welfare societies each keep their own list. None of them can see the others.', 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.9'], ['Getting the donor there', 'A willing donor forty minutes away with no transport is, in practice, no donor at all.', 'M3 17V7a1 1 0 0 1 1-1h9v11M13 10h4l4 4v3h-3M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z']];
PAGES.problem = () => `
${hero('The problem', 'What keeps blood from<br>reaching people in time', 'Twelve gaps between a patient who needs blood and a person willing to give it. Pashtoonkhwa Blood Bank was built to close them in Balochistan, one town at a time.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="gapgrid">${GAPS.map((g, i) => `<div class="gapcard" style="--i:${i}">
<div class="gapnum">${String(i + 1).padStart(2, '0')}</div>
<div class="gapic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${g[2]}"/></svg></div>
<h3>${g[0]}</h3><p>${g[1]}</p></div>`).join('')}</div>
<div class="answer">
<div><div class="qlab" style="color:#FFD9D5">Our answer</div><h2 style="color:#fff;margin:12px 0 14px">A register anyone can search,<br>kept in fourteen towns.</h2>
<p style="color:#FFD9D5;font-size:17px;line-height:1.65;max-width:60ch">Not a national programme — a working one. Every donor recorded, every request logged, every branch able to see who in their own town can give today. It has run since 1999 on exchange, charity and Zakat, and has never purchased a single bag.</p>
<div class="row" style="margin-top:26px;gap:12px"><a href="#/join/donor" class="btn btn-w">Join the register</a><a href="#/about" class="btn" style="border-color:rgba(255,255,255,.4);color:#fff">How it started</a></div></div>
</div>
</div></section>`;

/* ---------------- SUPPORTERS ---------------- */
const SUPPORTERS = [['Pashtoonkhwa Milli Awami Party', 'Founding support since 1999'], ['Quetta Press Club', 'Neighbour and long-standing partner'], ['Civil Hospital, Quetta', 'Referring hospital'], ['Bolan Medical Complex', 'Referring hospital'], ['Sandeman Provincial Hospital', 'Referring hospital'], ['DHQ Hospital, Zhob', 'Branch partner'], ['Local welfare societies', 'Camps and hide collection'], ['Individual members', 'The largest source of all']];
PAGES.supporters = () => `
${hero('Who stands with us', 'The organisations who<br>keep this running', 'Pashtoonkhwa Blood Bank has no government funding. It runs on members\u2019 contributions, charity, Zakat, and cattle hides collected by volunteers each Eid ul Adha — and on the institutions below.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="qlab" style="margin-bottom:16px">Supporting organisations</div>
<div class="suppgrid">${SUPPORTERS.map((s, i) => `<div class="suppcard"><div class="supplogo"><image-slot id="supp-${i + 1}" shape="rect" placeholder="Drop the logo"></image-slot></div><div><b>${s[0]}</b><span>${s[1]}</span></div></div>`).join('')}</div>
<div class="g2" style="gap:20px;margin-top:44px">
<div class="card"><div class="qlab" style="margin-bottom:12px">Become a partner</div><h3 style="margin-bottom:10px">Hospitals, laboratories and clinics</h3><p class="muted">Refer patients, share screening capacity, or host a camp. Partner hospitals get a named coordinator and a direct line to the branch.</p><a href="#/join/partner" class="btn btn-o" style="margin-top:18px">Partner with us</a></div>
<div class="card"><div class="qlab" style="margin-bottom:12px">Bring us to your town</div><h3 style="margin-bottom:10px">Welfare societies and community groups</h3><p class="muted">Eight towns are served without a permanent office. If your community wants a branch, the organising committee will talk it through with you.</p><a href="#/join/organisation" class="btn btn-o" style="margin-top:18px">Register an organisation</a></div>
</div>
<div class="closer" style="margin-top:44px"><div><h2>Support the register</h2><p>Bank transfer, Zakat, or hides at Eid ul Adha. Every rupee goes to screening kits, bags and fuel.</p></div><a href="#/donate" class="btn btn-w">How to donate</a></div>
</div></section>`;

/* ---------------- LEADERSHIP (extends people) ---------------- */
PAGES.leadership = () => {
  location.hash = '#/people';
  return '';
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "pbb-pages.js", error: String((e && e.message) || e) }); }

// pbb-pages2.js
try { (() => {
/* PBB — remaining public pages. */

/* ---------------- PUBLICATIONS ---------------- */
const PUBS = [['Eid ul Adha hide collection', 'Poster · Urdu', 'Appeal'], ['Who can donate blood', 'Poster · Urdu, Pashto', 'Awareness'], ['Thalassemia — what parents should know', 'Booklet · Urdu', 'Awareness'], ['Annual report 2012', 'Report · English', 'Report'], ['Hepatitis B vaccination drive', 'Poster · Urdu', 'Awareness'], ['Blood camp — how to organise one', 'Guide · Urdu', 'Guide']];
PAGES.publications = () => `
${hero('Publications', 'Posters, appeals and reports', 'Printed material from twenty-seven years of work. Everything here can be downloaded and printed for your own mosque, school or union council.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="row" style="gap:8px;margin-bottom:26px">${['All', 'Appeals', 'Awareness', 'Reports', 'Guides'].map((f, i) => `<button class="pill${i ? '' : ' on'}" onclick="galPick(this)">${f}</button>`).join('')}</div>
<div class="g3">${PUBS.map((p, i) => `<div class="card" style="padding:0;overflow:hidden">
<div class="ph" style="aspect-ratio:16/11"><image-slot id="pub-${i + 1}" shape="rect" placeholder="Drop the poster artwork"></image-slot></div>
<div style="padding:20px"><span class="tag gy">${p[2]}</span><h3 style="margin:12px 0 6px">${p[0]}</h3><p class="sm">${p[1]}</p>
<div class="row" style="gap:8px;margin-top:16px"><button class="btn btn-o btn-s">Download</button><button class="btn btn-o btn-s">Print</button></div></div></div>`).join('')}</div>
<div class="notice" style="margin-top:26px">Posters are shown at their real proportions, never cropped square — the Urdu and Pashto lettering <b>is</b> the artwork.</div>
</div></section>`;

/* ---------------- FAQ ---------------- */
const FAQS = [['Who can give blood?', 'Anyone between 18 and 60, weighing at least 50 kg, in good health, and at least 90 days since their last donation. If you are unsure, come to a branch — the screening takes a few minutes.'], ['Does it cost anything?', 'No. Pashtoonkhwa Blood Bank has never sold blood and never purchased it. Blood is given on exchange — a relative or friend of the patient donates in return.'], ['What if nobody can donate in exchange?', 'In four cases there is no exchange requirement at all: thalassemia, pregnancy, emergencies and natural disasters. That has been the rule since 1999.'], ['Is the blood tested?', 'Every bag is screened by the ELISA method for Hepatitis B, Hepatitis C, HIV/AIDS and malarial parasite before it reaches a patient.'], ['Does giving blood make me weak?', 'No. Your body replaces the volume within a day and the cells within weeks. The 90-day gap exists precisely so that it does you no harm.'], ['Can women donate?', 'Yes, under the same conditions. Women who are pregnant, breastfeeding or menstruating are asked to wait.'], ['How often will you call me?', 'Rarely, and never more than twice in one day. The register calls whoever has gone longest without giving, so the same few people are not asked over and over.'], ['Can I say no?', 'Always, and without explanation. You stay on the register.'], ['Where does the money go?', 'Screening kits, blood bags, ambulance fuel and branch running costs. Funding comes from members, charity, Zakat, and cattle hides collected at Eid ul Adha.'], ['Do you serve my town?', 'Six towns have a permanent office and eight more are served from them. If yours is not listed, ask — or register your organisation and we will talk about a branch.']];
PAGES.faq = () => `
${hero('Questions', 'Things people ask us', 'If your question is not here, call 081-2836820 or send a message. Somebody answers at any hour.')}
<section class="blk" style="padding-top:0"><div class="wrap" style="max-width:840px">
${FAQS.map((f, i) => `<div class="faq" onclick="this.classList.toggle('open')"><div class="fq"><span>${f[0]}</span><i>+</i></div><div class="fa"><p>${f[1]}</p></div></div>`).join('')}
<div class="closer" style="margin-top:36px"><div><h2>Still unsure?</h2><p>Come to the head office beside the Quetta Press Club, or phone us. No appointment needed.</p></div><a href="tel:0812836820" class="btn btn-w">081-2836820</a></div>
</div></section>`;

/* ---------------- PARTNER / LAB / FOUNDATION ---------------- */
const PARTNERKINDS = [['Hospitals', 'Refer patients, get a named coordinator at the nearest branch, and a direct line for emergencies. Your requests go straight onto the branch board instead of through a switchboard.', 'M12 4v16m8-8H4'], ['Laboratories', 'Share screening capacity, or take our overflow. Results are recorded against the bag, so a unit can be traced from donor to patient.', 'M9 2v7L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L15 9V2M9 2h6M8 15h8'], ['Foundations and donors', 'Fund screening kits, an ambulance, or a year of transfusions for a named child. You receive the figures, not a thank-you letter.', 'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z'], ['Welfare societies', 'Run a camp under our name, collect hides at Eid, or open a branch in a town that has none. Eight towns are served today without an office.', 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'], ['Universities and colleges', 'Two-day drives on campus register more first-time donors than anything else we do. We bring the staff and the equipment.', 'M22 10 12 5 2 10l10 5 10-5ZM6 12v5c3 3 9 3 12 0v-5'], ['Other blood banks', 'Nobody can see anyone else\u2019s shelf. If your bank keeps a register too, we would rather share a shortage than discard a bag.', 'M8 7h8M8 12h8M8 17h5M4 3h16v18H4z']];
PAGES.partners = () => `
${hero('Work with us', 'Six ways an organisation<br>can be useful', 'A blood bank that only talks to individuals stays small. Most of what PBB can do next depends on institutions.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="g3">${PARTNERKINDS.map(k => `<div class="pil"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${k[2]}"/></svg></div><h3>${k[0]}</h3><p>${k[1]}</p></div>`).join('')}</div>
<div class="g2" style="gap:20px;margin-top:34px">
<div class="card"><div class="qlab" style="margin-bottom:12px">What you get</div>
${['A named coordinator at your nearest branch', 'A direct line, not a switchboard', 'Your requests on the branch board within seconds', 'Quarterly figures on what was supplied and to whom', 'Your logo on the supporters page'].map(x => `<div class="tick-row"><span>✓</span>${x}</div>`).join('')}</div>
<div class="card"><div class="qlab" style="margin-bottom:12px">What we ask</div>
${['One person we can reach', 'Honest numbers on what you need', 'Notice before a planned requirement, where possible', 'No selling of blood, ever, under any arrangement'].map(x => `<div class="tick-row"><span>✓</span>${x}</div>`).join('')}</div>
</div>
<div class="closer" style="margin-top:34px"><div><h2>Start the conversation</h2><p>Tell us what kind of organisation you are and what you are hoping to do. The head office replies within a few days.</p></div><a href="#/join/partner" class="btn btn-w">Register your organisation</a></div>
</div></section>`;

/* ---------------- BRANCH DETAIL ---------------- */
PAGES['branch'] = () => {
  const b = BRANCHES[0];
  return `${hero('Branch', 'Quetta — head office', 'Zainab Chamber, Shara-e-Adalat, beside the Quetta Press Club. Open every day; blood requests answered at any hour.')}
 <section class="blk" style="padding-top:0"><div class="wrap"><div class="g2" style="gap:34px;align-items:start">
 <div>
 <div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:12px">Contact</h3>
 <div class="drow"><span>Telephone</span><b><a href="tel:0812836820">081-2836820</a></b></div>
 <div class="drow"><span>Second line</span><b><a href="tel:0812839500">081-2839500</a></b></div>
 <div class="drow"><span>Email</span><b>admin@pashtoonkhwabloodbank.org</b></div>
 <div class="drow"><span>Ambulance</span><b>Three vehicles, 24 hours</b></div></div>
 <div class="card"><h3 style="margin-bottom:12px">What we hold today</h3>
 <div class="groups">${['O−,cr,Critical', 'AB−,lo,Low', 'B−,lo,Low', 'A−,ok,Available', 'O+,ok,Available', 'A+,ok,Available', 'B+,ok,Available', 'AB+,ok,Available'].map(s => {
    const [g, c, l] = s.split(',');
    return `<div class="grp ${c}"><div class="g">${g}</div><div class="s">${l}</div></div>`;
  }).join('')}</div></div>
 </div>
 <div>${slot('photograph of the branch', '4/3')}
 <div class="card" style="margin-top:14px"><h3 style="margin-bottom:10px">Serving</h3>
 ${['Quetta city', 'Kuchlak', 'Qila Abdullah', 'Ziarat'].map(t => `<span class="chip">${t}</span>`).join('')}</div></div>
 </div></div></section>`;
};

/* ---------------- LEGAL + 404 ---------------- */
const legal = (t, body) => `${hero('', t)}<section class="blk" style="padding-top:0"><div class="wrap" style="max-width:760px">${body.map(([h2, p]) => `<h3 style="margin:26px 0 10px">${h2}</h3><p class="muted" style="font-size:15.5px;line-height:1.7">${p}</p>`).join('')}</div></section>`;
PAGES.privacy = () => legal('Privacy', [['What we hold', 'Your name, blood group, telephone number and town. If you tell us, your date of birth, weight and the date you last donated. Nothing else.'], ['Why we hold it', 'So that when a patient near you needs your blood group, somebody can telephone you. That is the only purpose.'], ['Who sees it', 'Staff at your own branch, and the head office in Quetta. Branch staff cannot see another town\u2019s register. Nobody outside Pashtoonkhwa Blood Bank is given your number.'], ['We never sell it', 'Your details are not sold, rented, shared with political parties, or used for anything other than blood.'], ['Removing yourself', 'Telephone any branch and ask. Your record is removed the same day, and we will not ask you to justify it.'], ['Photographs', 'Photographs of patients and of thalassemia children appear on this website only where a signed consent form is held by the head office.']]);
PAGES.terms = () => legal('Terms', [['Blood is not sold', 'Pashtoonkhwa Blood Bank has never purchased or sold blood and will not. Blood is provided on exchange, and free without exchange in cases of thalassemia, pregnancy, emergency and natural disaster.'], ['This website is not a medical service', 'A request submitted here is a message to a coordinator, not a guarantee that blood is available. In an emergency, telephone 081-2836820.'], ['Accuracy', 'We ask donors to answer the health questions honestly. A wrong answer puts a patient at risk.'], ['Registration', 'Being on the register places no obligation on you. You may decline any request, at any time, without explanation.']]);
PAGES['404'] = () => `<section class="blk" style="padding:90px 0"><div class="wrap" style="max-width:620px;text-align:center">
<div class="bignum" style="font-size:76px;color:var(--red)">404</div>
<h1 style="margin:18px 0 14px">That page is not here</h1>
<p class="lead" style="margin-bottom:28px">It may have moved. If you were looking for something on the old website, it is probably one of these.</p>
<div class="row" style="justify-content:center;gap:10px"><a href="#/" class="btn btn-p">Home</a><a href="#/branches" class="btn btn-o">Our branches</a><a href="#/join/requester" class="btn btn-o">Request blood</a><a href="#/contact" class="btn btn-o">Contact</a></div>
</div></section>`;
})(); } catch (e) { __ds_ns.__errors.push({ path: "pbb-pages2.js", error: String((e && e.message) || e) }); }

})();
