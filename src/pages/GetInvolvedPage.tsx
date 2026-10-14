import { Link } from 'react-router-dom';
import {
  UserPlus,
  Handshake,
  HeartHandshake,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { PageHero } from '@/components/shared/PageHero';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal } from '@/components/shared/Reveal';
import { MEMBERSHIP_JOURNEY } from '@/lib/constants';

const INVOLVEMENT_OPTIONS = [
  {
    icon: UserPlus,
    title: 'Join KUZA',
    description:
      'Become a member of KUZA TUK. Create an account, complete your membership application, and join our community of geospatial innovators.',
    cta: 'Start Your Application',
    href: '/join',
  },
  {
    icon: Handshake,
    title: 'Partner with KUZA',
    description:
      'Organizations can partner with KUZA TUK to support geospatial education, research, innovation, and community development.',
    cta: 'Partner with Us',
    href: '/partner',
  },
  {
    icon: HeartHandshake,
    title: 'Volunteer',
    description:
      'Contribute your time and skills to support KUZA events, training programs, community mapping, and outreach activities.',
    cta: 'Get in Touch',
    href: '/contact',
  },
  {
    icon: Users,
    title: 'Collaborate',
    description:
      "Are you a student group, research lab, or organization? Let's explore how we can collaborate on geospatial projects and initiatives.",
    cta: 'Start a Conversation',
    href: '/contact',
  },
];

export default function GetInvolvedPage() {
  useSeo({
    title: 'Get Involved',
    description:
      'Join KUZA TUK, partner with us, volunteer, or collaborate. Discover how to become part of the geospatial ecosystem at the Technical University of Kenya.',
    path: '/get-involved',
  });

  return (
    <>
      <PageHero
        eyebrow="Get Involved"
        title="Join the Movement"
        description="There are many ways to be part of KUZA TUK. Whether you're a student looking to join, an organization seeking partnership, or someone who wants to volunteer — there's a place for you in our ecosystem."
      >
        <Link
          to="/join"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
        >
          <UserPlus className="h-5 w-5" />
          Join KUZA
        </Link>
      </PageHero>

      {/* Involvement options */}
      <section className="border-b border-border bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {INVOLVEMENT_OPTIONS.map((option, index) => (
              <Reveal key={option.title} delay={index * 80}>
                <div className="group relative h-full overflow-hidden rounded-xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/5 transition-all group-hover:scale-125" />
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <option.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-bold">
                      {option.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {option.description}
                    </p>
                    <Link
                      to={option.href}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
                    >
                      {option.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Membership journey */}
      <section className="border-b border-border bg-navy py-20 text-navy-foreground sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Membership Journey"
              title="How to Join KUZA"
              description="A clear, step-by-step journey from creating an account to accessing your member dashboard."
              align="center"
            />
          </Reveal>

          <div className="mt-14">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {MEMBERSHIP_JOURNEY.map((step, index) => (
                <Reveal key={step.step} delay={index * 100}>
                  <div className="relative h-full rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-display text-sm font-bold text-primary">
                      {step.step}
                    </div>
                    <h3 className="mt-4 font-display text-sm font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/50">
                      {step.description}
                    </p>
                    {index < MEMBERSHIP_JOURNEY.length - 1 && (
                      <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-white/20 xl:block" />
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={200}>
            <div className="mt-12 flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center sm:flex-row sm:text-left">
              <CheckCircle2 className="h-8 w-8 shrink-0 text-accent" />
              <p className="text-sm text-white/60">
                Once approved, you'll receive a unique KUZA member ID, a digital
                membership card with QR verification, and full access to your
                member dashboard.
              </p>
              <Link
                to="/join"
                className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Start Now
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
