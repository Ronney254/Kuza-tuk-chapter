import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useSeo } from '@/lib/seo';

export default function NotFoundPage() {
  useSeo({
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
  });

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy px-4 text-center text-navy-foreground">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[100px]" />

      <div className="relative">
        <p className="font-display text-7xl font-bold text-primary sm:text-9xl">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
          Page Not Found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/60 sm:text-base">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>
      </div>
    </section>
  );
}
