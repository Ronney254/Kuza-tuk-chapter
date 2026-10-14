import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isHome = location.pathname === '/';
  const isAuthed = !!user;
  const isAdmin = profile?.role === 'SUPER_ADMIN' || profile?.role === 'CHAPTER_ADMIN';

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Member';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || !isHome
          ? 'border-b border-border/60 bg-background/80 backdrop-blur-lg'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="z-50" aria-label="KUZA TUK home">
          <Logo variant={!scrolled && isHome ? 'light' : 'dark'} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'relative rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : !scrolled && isHome
                      ? 'text-white/80 hover:text-white'
                      : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 lg:flex">
          {isAuthed ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  !scrolled && isHome
                    ? 'text-white/80 hover:text-white'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {firstName}
                <ChevronDown className="h-4 w-4" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-destructive hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  !scrolled && isHome
                    ? 'text-white/80 hover:text-white'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LogIn className="h-4 w-4" />
                Member Login
              </Link>
              <Link
                to="/join"
                className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                <UserPlus className="h-4 w-4" />
                Join KUZA
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center rounded-md p-2 transition-colors lg:hidden',
            !scrolled && isHome
              ? 'text-white hover:bg-white/10'
              : 'text-foreground hover:bg-muted'
          )}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div
        className={cn(
          'fixed inset-0 top-16 z-40 transform bg-background transition-transform duration-300 lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-[calc(100vh-4rem)] flex-col overflow-y-auto px-4 pb-8 pt-4">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-4 py-3 text-base font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-6">
            {isAuthed ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-base font-medium transition-colors hover:bg-muted"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-base font-medium transition-colors hover:bg-muted"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Admin Panel
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-base font-medium text-destructive transition-colors hover:bg-destructive/20"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-base font-medium transition-colors hover:bg-muted"
                >
                  <LogIn className="h-5 w-5" />
                  Member Login
                </Link>
                <Link
                  to="/join"
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                >
                  <UserPlus className="h-5 w-5" />
                  Join KUZA
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
