import { CalendarDays, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSeo } from '@/lib/seo';
import { PageHero } from '@/components/shared/PageHero';
import { EmptyState } from '@/components/shared/EmptyState';

export default function EventsPage() {
  useSeo({
    title: 'Events',
    description:
      'Stay up to date with KUZA TUK events — workshops, training sessions, talks, and community activities at the Technical University of Kenya.',
    path: '/events',
  });

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="KUZA Events"
        description="Workshops, training sessions, guest talks, hackathons, and community activities organized by KUZA TUK. Register for upcoming events and explore our recent activities."
      />

      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Upcoming Events
            </span>
          </div>

          <EmptyState
            icon={CalendarDays}
            title="No upcoming events yet"
            description="Events will appear here once they are published by the KUZA TUK leadership team. Check back soon — we're planning exciting workshops, training sessions, and community activities."
            action={
              <Link
                to="/get-involved"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
              >
                Get involved to stay updated
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          {/* Event card preview — shows what event cards will look like */}
          <div className="mt-16">
            <h2 className="font-display text-lg font-semibold text-muted-foreground">
              What to Expect
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Once events are published, you'll see them here with:
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: CalendarDays, label: 'Date & Time', desc: 'When the event takes place' },
                { icon: MapPin, label: 'Venue', desc: 'Where the event is held' },
                { icon: Clock, label: 'Registration', desc: 'Sign up to attend' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 text-sm font-semibold">{item.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
