import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  IdCard,
  CalendarDays,
  GraduationCap,
  Award,
  FolderKanban,
  Megaphone,
  Settings,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import type { Membership, MembershipApplication } from '@/types/database';
import { cn } from '@/lib/utils';

interface DashboardCard {
  icon: typeof User;
  label: string;
  value: string | number;
  hint?: string;
  color: string;
}

export default function DashboardPage() {
  useSeo({
    title: 'Dashboard',
    description: 'Your KUZA TUK member dashboard.',
    path: '/dashboard',
  });

  const { user, profile } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [application, setApplication] = useState<MembershipApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      const [membershipRes, applicationRes] = await Promise.all([
        supabase
          .from('memberships')
          .select('*')
          .eq('user_id', user!.id)
          .maybeSingle(),
        supabase
          .from('membership_applications')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (membershipRes.data) setMembership(membershipRes.data as Membership);
      if (applicationRes.data) setApplication(applicationRes.data as MembershipApplication);
      setLoading(false);
    }

    loadData();
  }, [user]);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Member';

  const cards: DashboardCard[] = [
    {
      icon: IdCard,
      label: 'Member ID',
      value: membership?.member_id ?? 'Not assigned',
      hint: membership ? 'Active' : 'Pending approval',
      color: 'text-primary',
    },
    {
      icon: User,
      label: 'Membership Status',
      value: profile?.membership_status ?? 'NONE',
      hint: profile?.membership_status === 'ACTIVE'
        ? 'You are an active member'
        : profile?.membership_status === 'PENDING'
          ? 'Application under review'
          : 'No application submitted',
      color: profile?.membership_status === 'ACTIVE' ? 'text-accent' : 'text-muted-foreground',
    },
    {
      icon: CalendarDays,
      label: 'Events Attended',
      value: 0,
      hint: 'Coming in Phase 4',
      color: 'text-muted-foreground',
    },
    {
      icon: CalendarDays,
      label: 'Events Registered',
      value: 0,
      hint: 'Coming in Phase 4',
      color: 'text-muted-foreground',
    },
    {
      icon: GraduationCap,
      label: 'Training Completed',
      value: 0,
      hint: 'Coming in Phase 5',
      color: 'text-muted-foreground',
    },
    {
      icon: Award,
      label: 'Certificates',
      value: 0,
      hint: 'Coming in Phase 5',
      color: 'text-muted-foreground',
    },
    {
      icon: FolderKanban,
      label: 'Projects',
      value: 0,
      hint: 'Coming in Phase 7',
      color: 'text-muted-foreground',
    },
    {
      icon: Megaphone,
      label: 'Announcements',
      value: 0,
      hint: 'No announcements yet',
      color: 'text-muted-foreground',
    },
  ];

  const navItems = [
    { label: 'My Profile', href: '/dashboard/profile', icon: User },
    { label: 'My Membership', href: '/dashboard/membership', icon: IdCard },
    { label: 'Events', href: '/dashboard/events', icon: CalendarDays },
    { label: 'Training', href: '/dashboard/training', icon: GraduationCap },
    { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 pt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">
            Welcome, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile?.membership_status === 'ACTIVE'
              ? 'You are an active KUZA TUK member.'
              : profile?.membership_status === 'PENDING'
                ? 'Your membership application is under review.'
                : 'Complete your membership application to become a member.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="sticky top-24 space-y-1 rounded-xl border border-border bg-card p-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Status banner */}
            {profile?.membership_status === 'NONE' && (
              <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold">Complete Your Membership Application</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submit your application to become a KUZA TUK member.
                    </p>
                  </div>
                </div>
                <Link
                  to="/apply"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Apply Now
                </Link>
              </div>
            )}

            {profile?.membership_status === 'PENDING' && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-5">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <h3 className="text-sm font-semibold">Application Under Review</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your membership application was submitted on{' '}
                    {application
                      ? new Date(application.created_at).toLocaleDateString()
                      : 'recently'}{' '}
                    and is being reviewed by the KUZA TUK leadership team.
                  </p>
                </div>
              </div>
            )}

            {profile?.membership_status === 'ACTIVE' && membership && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <h3 className="text-sm font-semibold">Active Member</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your member ID is <span className="font-mono font-semibold">{membership.member_id}</span>.
                    Category: {membership.membership_category.replace(/_/g, ' ')}.
                  </p>
                </div>
              </div>
            )}

            {/* Cards grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-center justify-between">
                    <card.icon className={cn('h-5 w-5', card.color)} />
                  </div>
                  <div className="mt-3 font-display text-2xl font-bold tabular-nums">
                    {card.value}
                  </div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground">
                    {card.label}
                  </div>
                  {card.hint && (
                    <div className="mt-2 text-[0.6875rem] text-muted-foreground/70">
                      {card.hint}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Quick Actions</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <CalendarDays className="h-4 w-4" />
                  Browse Events
                </Link>
                <Link
                  to="/programs"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <GraduationCap className="h-4 w-4" />
                  View Programs
                </Link>
                {profile?.membership_status === 'NONE' && (
                  <Link
                    to="/apply"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <FileText className="h-4 w-4" />
                    Complete Application
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
