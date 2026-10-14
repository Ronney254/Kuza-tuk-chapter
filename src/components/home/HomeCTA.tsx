import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';

export function HomeCTA() {
  return (
    <section className="relative overflow-hidden bg-navy py-20 text-navy-foreground sm:py-28">
      <div className="absolute inset-0 grid-bg opacity-15" />
      <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Ready to Join the Geospatial
            <br className="hidden sm:block" />{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Revolution?
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            Become part of a student-led ecosystem that's shaping the future of
            geospatial science, technology, and innovation in Kenya and beyond.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/join"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl"
            >
              <UserPlus className="h-5 w-5" />
              Join KUZA
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
