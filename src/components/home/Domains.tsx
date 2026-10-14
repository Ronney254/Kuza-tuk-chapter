import { DOMAINS } from '@/lib/constants';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';

export function Domains() {
  return (
    <section className="relative border-b border-border bg-secondary/30 py-16 sm:py-24">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Our Domains"
            title="Where Geospatial Meets Innovation"
            description="From satellite imagery to smart cities, KUZA TUK spans the full spectrum of geospatial science, technology, and innovation."
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DOMAINS.map((domain, index) => (
            <Reveal key={domain.title} delay={index * 60}>
              <div className="group relative h-full overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 transition-all group-hover:bg-primary/10 group-hover:scale-150" />
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <domain.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                    {domain.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {domain.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
