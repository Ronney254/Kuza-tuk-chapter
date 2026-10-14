import { Link } from 'react-router-dom';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { EmptyState } from '@/components/shared/EmptyState';

export function HomeEvents() {
  return (
    <section className="relative border-b border-border bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Events"
              title="Upcoming Events"
              description="Workshops, training sessions, talks, and community activities organized by KUZA TUK."
            />
            <Link
              to="/events"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              View all events
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-10">
            <EmptyState
              icon={CalendarDays}
              title="No upcoming events yet"
              description="Events will appear here once they are published by the KUZA TUK leadership team. Check back soon or follow us for updates."
              action={
                <Link
                  to="/get-involved"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
                >
                  Get notified — Get Involved
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
