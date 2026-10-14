import { Link } from 'react-router-dom';
import { Target, Eye, Heart, ArrowRight, Compass } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { PageHero } from '@/components/shared/PageHero';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal } from '@/components/shared/Reveal';
import { CORE_VALUES, SITE_CONFIG } from '@/lib/constants';

export default function AboutPage() {
  useSeo({
    title: 'About',
    description:
      'Learn about KUZA TUK — a student-led geospatial and innovation ecosystem at the Technical University of Kenya. Our vision, mission, values, and purpose.',
    path: '/about',
  });

  return (
    <>
      <PageHero
        eyebrow="About KUZA"
        title="Who is KUZA?"
        description="KUZA Technical University of Kenya Chapter (KUZA TUK) is a student-led geospatial ecosystem, professional community, research community, and technology and innovation platform at the Technical University of Kenya."
      />

      {/* Vision & Mission */}
      <section className="border-b border-border bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="relative h-full overflow-hidden rounded-xl border border-border bg-card p-8">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5" />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 font-display text-2xl font-bold">Vision</h2>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    "To become Africa's most influential student-led geospatial
                    and innovation ecosystem."
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="relative h-full overflow-hidden rounded-xl border border-border bg-card p-8">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/5" />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Target className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 font-display text-2xl font-bold">Mission</h2>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    "To equip students with technical skills, research exposure,
                    professional networks and innovation opportunities that
                    enable them to solve real-world challenges using geospatial
                    science, technology and interdisciplinary approaches."
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Why KUZA Exists */}
      <section className="border-b border-border bg-secondary/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <Reveal>
              <SectionHeading
                eyebrow="Our Purpose"
                title="Why KUZA Exists"
                description="KUZA exists to bridge the gap between academic learning and real-world geospatial practice, creating opportunities for students to grow as innovators, researchers, and leaders."
              />
            </Reveal>
            <Reveal delay={150}>
              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold">
                  What KUZA Offers Students
                </h3>
                <ul className="space-y-3">
                  {[
                    'Practical technical skills in GIS, remote sensing, surveying, and spatial data science',
                    'Research exposure and opportunities to work on real-world projects',
                    'Professional networks connecting students with industry, academia, and government',
                    'Innovation platforms to turn ideas into solutions and ventures',
                    'Leadership development through community-driven initiatives',
                    'A vibrant community of like-minded geospatial enthusiasts',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Compass className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm leading-relaxed text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="border-b border-border bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Our Values"
              title="Core Values"
              description="The principles that guide everything we do as a community."
              align="center"
            />
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CORE_VALUES.map((value, index) => (
              <Reveal key={value.title} delay={index * 60}>
                <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Heart className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* History / Connection */}
      <section className="border-b border-border bg-navy py-20 text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <Reveal>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Our Story
                </span>
                <h2 className="mt-2 font-display text-3xl font-bold text-balance">
                  Building a Geospatial Community
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/60">
                  KUZA TUK was established as a student-led chapter at the
                  Technical University of Kenya, born from a passion for
                  geospatial science and a vision to create a platform where
                  students can learn, build, research, connect, and lead.
                </p>
                <p className="mt-4 text-base leading-relaxed text-white/60">
                  As a student-led chapter and ecosystem, we are not a
                  government organization. We are a community of students
                  passionate about geospatial science, surveying, Earth
                  observation, space science, technology, and innovation —
                  working to solve real-world challenges through spatial
                  thinking.
                </p>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Ecosystem Connection
                </span>
                <h2 className="mt-2 font-display text-3xl font-bold text-balance">
                  Connected to the Geospatial World
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/60">
                  KUZA TUK operates within the broader geospatial ecosystem,
                  engaging with academic institutions, research organizations,
                  industry partners, and the wider geospatial community. We
                  position ourselves as a bridge between students and the
                  professional geospatial world.
                </p>
                <Link
                  to="/get-involved"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
                >
                  Get involved with KUZA
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-balance sm:text-3xl">
              Want to be part of KUZA TUK?
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Join our growing community of geospatial innovators and leaders.
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
