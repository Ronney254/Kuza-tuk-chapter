import { Link } from 'react-router-dom';
import { Mail, ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';
import { SITE_CONFIG, NAV_ITEMS } from '@/lib/constants';

export function Footer() {
  const footerLinks = NAV_ITEMS.filter(
    (item) => item.label !== 'Home'
  );

  return (
    <footer className="border-t border-border bg-navy text-navy-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo variant="light" />
            <p className="mt-4 max-w-xs text-sm text-white/60">
              {SITE_CONFIG.tagline}
            </p>
            <p className="mt-3 max-w-xs text-sm text-white/50">
              A student-led geospatial, surveying, space science, technology and
              innovation ecosystem at the Technical University of Kenya.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/80">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.slice(0, 5).map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/80">
              Engage
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.slice(5).map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/80">
              Connect
            </h3>
            <a
              href={`mailto:${SITE_CONFIG.contactEmail}`}
              className="mt-4 flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4" />
              {SITE_CONFIG.contactEmail}
            </a>

            <Link
              to="/join"
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              Join KUZA
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/50">{SITE_CONFIG.footerText}</p>
          <p className="text-sm text-white/40">
            Technical University of Kenya
          </p>
        </div>
      </div>
    </footer>
  );
}
