import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden border-b border-border bg-navy pt-28 pb-16 text-navy-foreground sm:pt-32 sm:pb-20',
        className
      )}
    >
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      {/* Glow accents */}
      <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {eyebrow && (
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
