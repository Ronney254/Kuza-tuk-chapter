import { FolderKanban, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSeo } from '@/lib/seo';
import { PageHero } from '@/components/shared/PageHero';
import { EmptyState } from '@/components/shared/EmptyState';

const PROJECT_CATEGORIES = [
  'GIS',
  'Remote Sensing',
  'Surveying',
  'AI/ML',
  'Space',
  'Drones',
  'Climate',
  'Smart Cities',
  'Land Administration',
  'Community Mapping',
];

export default function ProjectsPage() {
  useSeo({
    title: 'Projects',
    description:
      'Discover KUZA TUK student projects in GIS, remote sensing, surveying, AI, space, drones, climate, smart cities, and community mapping.',
    path: '/projects',
  });

  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="KUZA Projects"
        description="Student-led projects applying geospatial science, technology, and innovation to real-world challenges. From GIS analyses to drone mapping, our projects turn ideas into impact."
      />

      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Category pills */}
          <div className="mb-10 flex flex-wrap gap-2">
            {PROJECT_CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {cat}
              </span>
            ))}
          </div>

          <EmptyState
            icon={FolderKanban}
            title="Projects will appear here once published"
            description="Our members are working on exciting geospatial projects. Once projects are reviewed and published by the KUZA TUK team, they'll be showcased here with full details — problem, objectives, methodology, technology, results, and impact."
            action={
              <Link
                to="/join"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
              >
                Join KUZA to contribute projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      </section>
    </>
  );
}
