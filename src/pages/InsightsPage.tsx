import { Newspaper, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSeo } from '@/lib/seo';
import { PageHero } from '@/components/shared/PageHero';
import { EmptyState } from '@/components/shared/EmptyState';

const INSIGHT_CATEGORIES = [
  'GIS',
  'Space',
  'Surveying',
  'Earth Observation',
  'AI',
  'Climate',
  'Innovation',
  'Research',
  'Industry',
  'Events',
];

export default function InsightsPage() {
  useSeo({
    title: 'Insights',
    description:
      'KUZA TUK Insights — articles, research notes, and perspectives on GIS, space, surveying, earth observation, AI, climate, and innovation in the geospatial world.',
    path: '/insights',
  });

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="KUZA Insights"
        description="An editorial platform for articles, research notes, and perspectives from the KUZA TUK community on geospatial science, technology, and innovation."
      />

      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap gap-2">
            {INSIGHT_CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {cat}
              </span>
            ))}
          </div>

          <EmptyState
            icon={Newspaper}
            title="No articles published yet"
            description="Insights articles will appear here once they are written and published by the KUZA TUK community. Expect articles on GIS, space science, surveying, earth observation, AI, climate, and more."
            action={
              <Link
                to="/join"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
              >
                Join KUZA to contribute
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      </section>
    </>
  );
}
