import { Handshake, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSeo } from '@/lib/seo';
import { PageHero } from '@/components/shared/PageHero';
import { EmptyState } from '@/components/shared/EmptyState';

const PARTNER_CATEGORIES = [
  'Academic',
  'Government',
  'Research',
  'Industry',
  'Technology',
  'Professional',
  'International',
];

export default function PartnersPage() {
  useSeo({
    title: 'Partners',
    description:
      'The KUZA TUK ecosystem — academic, government, research, industry, technology, and professional partners. Only verified partnerships are displayed.',
    path: '/partners',
  });

  return (
    <>
      <PageHero
        eyebrow="Partners"
        title="KUZA Ecosystem Partners"
        description="Our partners span academic institutions, government agencies, research organizations, industry leaders, technology companies, and professional bodies. Only organizations that have been formally entered and approved by KUZA administrators are displayed here."
      />

      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap gap-2">
            {PARTNER_CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {cat}
              </span>
            ))}
          </div>

          <EmptyState
            icon={Handshake}
            title="No public partners have been added yet"
            description="Partner organizations will appear here once they are entered and approved by KUZA TUK administrators. We do not display potential collaborators as confirmed partners."
            action={
              <Link
                to="/get-involved"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
              >
                Partner with KUZA
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          {/* Partner info */}
          <div className="mt-16 rounded-xl border border-border bg-secondary/30 p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold">
              About KUZA Partnerships
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              KUZA TUK welcomes partnerships with organizations that share our
              vision of advancing geospatial science, technology, and innovation
              in Kenya and Africa. We categorize our partners into academic,
              government, research, industry, technology, professional, and
              international organizations.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Important: We only display organizations that have been formally
              entered and approved by KUZA administrators. We do not label
              potential collaborators as partners, and we never fabricate
              partnerships.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
