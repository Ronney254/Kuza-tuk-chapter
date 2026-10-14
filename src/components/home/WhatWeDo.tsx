import { PILLARS } from '@/lib/constants';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';

export function WhatWeDo() {
  return (
    <section className="relative border-b border-border bg-navy py-20 text-navy-foreground sm:py-28">
      <div className="absolute inset-0 grid-bg opacity-15" />
      <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-primary/15 blur-[100px]" />
      <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-accent/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="What We Do"
            title="Five Pillars of KUZA"
            description="Everything we do is built on five foundational pillars that shape how students learn, build, research, connect, and lead."
            align="center"
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 100}>
              <div className="group relative h-full rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-white/[0.06]">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary transition-all group-hover:scale-110">
                  <pillar.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-white">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {pillar.description}
                </p>
                <div className="mt-4 h-0.5 w-8 rounded-full bg-primary/40 transition-all group-hover:w-full" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
