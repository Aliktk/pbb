import Link from 'next/link';
import { notFound } from 'next/navigation';
import { css } from '../../../../lib/style';
import { JOIN_TYPES, type JoinKind } from '../../../../lib/join';
import { JoinForm } from '../../../../components/JoinForm';

const KINDS: JoinKind[] = ['requester', 'donor', 'volunteer', 'partner', 'organisation'];

export function generateStaticParams() {
  return KINDS.map((kind) => ({ kind }));
}

// Short tab labels, mirroring the prototype's typetabs transform.
function tabLabel(title: string): string {
  return title.replace('Register as a ', '').replace('Register an ', '').replace('Request blood for a patient', 'Need blood');
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
    <section className="blk" style={css('padding-top:40px')}>
      <div className="wrap" style={css('max-width:820px')}>
        {k === 'requester' && (
          <div className="callfirst" style={css('margin-bottom:24px')}>
            <div>
              <h3 style={css('color:#fff')}>In an emergency, call first.</h3>
              <p style={css('color:#FFD9D5;margin-top:6px;font-size:14.5px')}>
                A form is the wrong instrument for an emergency. Someone answers at any hour.
              </p>
            </div>
            <a href="tel:0812836820" className="btn btn-w">081-2836820</a>
          </div>
        )}
        <div className="typetabs">
          {JOIN_TYPES.map((t) => (
            <Link key={t.key} href={`/join/${t.key}`} className={`pill${t.key === k ? ' on' : ''}`}>
              {tabLabel(t.title)}
            </Link>
          ))}
        </div>
        <h1 style={css('margin-bottom:12px')}>{type.title}</h1>
        <p className="lead" style={css('margin-bottom:28px')}>{type.description}</p>
        <JoinForm kind={k} />
      </div>
    </section>
  );
}
