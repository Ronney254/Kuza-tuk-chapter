import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, Compass } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-navy text-navy-foreground">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-25" />

      {/* Glow orbs */}
      <div className="absolute -left-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow" />
      <div className="absolute -right-32 bottom-0 h-[24rem] w-[24rem] rounded-full bg-accent/15 blur-[100px] animate-pulse-slow" />

      {/* Coordinate crosshairs */}
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white" />
        <div className="absolute bottom-0 left-1/2 top-0 w-px bg-white" />
        <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-white" />
        <div className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white" />
        <div className="absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white" />
      </div>

      {/* Floating node dots */}
      <div className="absolute left-[15%] top-[30%] h-2 w-2 rounded-full bg-accent animate-float" />
      <div className="absolute right-[20%] top-[45%] h-1.5 w-1.5 rounded-full bg-primary animate-float [animation-delay:1.5s]" />
      <div className="absolute left-[70%] top-[25%] h-2 w-2 rounded-full bg-accent/70 animate-float [animation-delay:3s]" />
      <div className="absolute left-[30%] bottom-[25%] h-1.5 w-1.5 rounded-full bg-primary/70 animate-float [animation-delay:2s]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pt-20 pb-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
              <Compass className="h-3.5 w-3.5 text-accent" />
              Technical University of Kenya Chapter
            </span>
          </div>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance animate-fade-in-up [animation-delay:0.1s] sm:text-6xl sm:leading-[1.05] lg:text-7xl">
            Where Spatial Meets{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Everything.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 animate-fade-in-up [animation-delay:0.2s] sm:text-xl">
            Building the next generation of geospatial innovators, researchers,
            technologists and problem-solvers.
          </p>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/50 animate-fade-in-up [animation-delay:0.3s]">
            KUZA TUK is a student-led ecosystem at the Technical University of
            Kenya connecting geospatial science, surveying, Earth observation,
            space, AI, technology and innovation to real-world challenges.
          </p>

          <div className="mt-10 flex flex-col gap-3 animate-fade-in-up [animation-delay:0.4s] sm:flex-row">
            <Link
              to="/about"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              Explore KUZA
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/join"
              className="group inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
            >
              <UserPlus className="h-5 w-5" />
              Join KUZA
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
