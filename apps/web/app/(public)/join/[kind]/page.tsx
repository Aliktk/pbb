import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JOIN_TYPES, type JoinKind } from '../../../../lib/join';
import { JoinForm } from '../../../../components/JoinForm';

const KINDS: JoinKind[] = ['requester', 'donor', 'volunteer', 'partner', 'organisation'];

export function generateStaticParams() {
  return KINDS.map((kind) => ({ kind }));
}

function tabLabel(title: string): string {
  if (title.includes('Request blood')) return 'Need Blood';
  if (title.includes('donor')) return 'Donor';
  if (title.includes('Volunteer')) return 'Volunteer With Us';
  if (title.includes('Partner')) return 'Partner Organisation';
  if (title.includes('organisation')) return 'Organisation';
  return title;
}

interface PageProps {
  params: Promise<{ kind: string }>;
}

export default async function JoinKindPage({ params }: PageProps) {
  const { kind } = await params;
  if (!KINDS.includes(kind as JoinKind)) notFound();
  const k = kind as JoinKind;
  const type = JOIN_TYPES.find((t) => t.key === k)!;

  return (
    <section className="section-block-pro" style={{ paddingTop: '48px', paddingBottom: '72px' }}>
      <div className="wrap" style={{ maxWidth: '880px' }}>
        
        {/* Emergency Hotline Banner for Requester */}
        {k === 'requester' && (
          <div className="emergency-call-banner-pro">
            <div className="ecb-left">
              <div className="ecb-icon-ring">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <h3 className="ecb-title">In an emergency, call first.</h3>
                <p className="ecb-desc">
                  A form is slow for an immediate crisis. A coordinator answers our hotline at any hour.
                </p>
              </div>
            </div>
            <a href="tel:0812836820" className="ecb-btn-phone">
              <span>📞 081-2836820</span>
            </a>
          </div>
        )}

        {/* Type Tabs Navigation */}
        <div className="join-type-tabs-pro">
          {JOIN_TYPES.map((t) => (
            <Link key={t.key} href={`/join/${t.key}`} className={`j-tab-item ${t.key === k ? 'active' : ''}`}>
              {tabLabel(t.title)}
            </Link>
          ))}
        </div>

        {/* Page Title Header */}
        <div className="join-kind-header">
          <h1 className="join-kind-title">{type.title}</h1>
          <p className="join-kind-desc">{type.description}</p>
        </div>

        {/* Form Component */}
        <JoinForm kind={k} />

      </div>
    </section>
  );
}

