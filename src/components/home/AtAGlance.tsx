import { STATS } from '@/lib/constants';
import { Reveal } from '@/components/shared/Reveal';

export function AtAGlance() {
  return (
    <section className="relative border-b border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              KUZA at a Glance
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Our Growing Ecosystem
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              These numbers will update as our community grows and activities
              are recorded in the system.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
          {STATS.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 80}>
              <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-md">
                <div className="absolute inset-0 grid-bg-dense opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <stat.icon className="mx-auto h-7 w-7 text-primary/70" />
                  <div className="mt-3 font-display text-4xl font-bold tabular-nums text-foreground">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
