// Wave-0 placeholder home. T4 replaces this with the pixel-ported public site
// (Server Components, EN/UR/PS). Kept intentionally minimal so the monorepo builds now.
export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
      <p style={{ color: '#E02B20', fontWeight: 700, letterSpacing: '.12em', fontSize: 12 }}>
        PASHTOONKHWA BLOOD BANK
      </p>
      <h1 style={{ fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
        Platform foundation is live.
      </h1>
      <p style={{ fontSize: 18, color: '#4A4D55', lineHeight: 1.6 }}>
        Wave 0 (schema, migrations, eligibility view, seed) is built and verified. The public
        site (Track&nbsp;T4) renders here next, ported pixel-for-pixel from the Modernist
        prototype. See <code>docs/BUILD-PLAN.md</code>.
      </p>
    </main>
  );
}
