import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { PageHero } from '@/components/shared/PageHero';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal } from '@/components/shared/Reveal';
import { PROGRAMS } from '@/lib/constants';

export default function ProgramsPage() {
  useSeo({
    title: 'Programs',
    description:
      'Explore KUZA TUK programs — Academy, Research, Innovation, Industry, Space, and Community. Structured pathways for geospatial learning and development.',
    path: '/programs',
  });

  return (
    <>
      <PageHero
        eyebrow="Programs"
        title="KUZA Programs"
        description="Our programs provide structured pathways for students to develop skills, pursue research, build solutions, connect with industry, explore space science, and serve communities through geospatial technology."
      />

      <section className="border-b border-border bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Our Pathways"
              title="Six Programs, One Ecosystem"
              description="Each program is designed to serve a specific dimension of student development in geospatial science and technology."
            />
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {PROGRAMS.map((program, index) => (
              <Reveal key={program.slug} delay={index * 80}>
                <div className="group relative h-full overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg sm:p-8">
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/5 transition-all group-hover:scale-125" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                        {program.category}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-xl font-bold">
                      {program.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {program.description}
                    </p>

                    <div className="mt-5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                        Objectives
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {program.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            <span className="text-sm text-muted-foreground">
                              {obj}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy py-16 text-navy-foreground sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-balance sm:text-3xl">
              Ready to Start Your Journey?
            </h2>
            <p className="mt-3 text-base text-white/60">
              Join KUZA TUK to access our programs and start building your
              geospatial future.
            </p>
            <Link
              to="/join"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              Join KUZA
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
