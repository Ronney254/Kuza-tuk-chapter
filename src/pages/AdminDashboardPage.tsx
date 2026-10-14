import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  CalendarDays,
  GraduationCap,
  Award,
  FolderKanban,
  Newspaper,
  LayoutDashboard,
  Mail,
  Handshake,
  Settings,
  ArrowRight,
  Loader2,
  Crown,
} from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface Stats {
  totalMembers: number;
  activeMembers: number;
  pendingApplications: number;
  upcomingEvents: number;
  contactMessages: number;
  partnershipRequests: number;
}

interface AdminNavItem {
  label: string;
  href: string;
  icon: typeof Users;
}

const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Members', href: '/admin/members', icon: Users },
  { label: 'Events', href: '/admin/events', icon: CalendarDays },
  { label: 'Messages', href: '/admin/messages', icon: Mail },
  { label: 'Partnership Requests', href: '/admin/partnerships', icon: Handshake },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Admins', href: '/admin/admins', icon: Crown },
];

export default function AdminDashboardPage() {
  useSeo({
    title: 'Admin Dashboard',
    description: 'KUZA TUK administration dashboard.',
    path: '/admin',
  });

  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === 'SUPER_ADMIN';
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [profilesRes, activeRes, pendingRes, eventsRes, messagesRes, partnershipRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('membership_status', 'ACTIVE'),
        supabase.from('membership_applications').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
        supabase.from('events').select('*', { count: 'exact', head: true }).gte('start_date', new Date().toISOString()),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('partnership_requests').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalMembers: profilesRes.count ?? 0,
        activeMembers: activeRes.count ?? 0,
        pendingApplications: pendingRes.count ?? 0,
        upcomingEvents: eventsRes.count ?? 0,
        contactMessages: messagesRes.count ?? 0,
        partnershipRequests: partnershipRes.count ?? 0,
      });
      setLoading(false);
    }

    loadStats();
  }, []);

  const statCards = [
    { label: 'Total Members', value: stats?.totalMembers ?? 0, icon: Users, color: 'text-primary' },
    { label: 'Active Members', value: stats?.activeMembers ?? 0, icon: UserCheck, color: 'text-accent' },
    { label: 'Pending Applications', value: stats?.pendingApplications ?? 0, icon: Clock, color: 'text-yellow-600' },
    { label: 'Upcoming Events', value: stats?.upcomingEvents ?? 0, icon: CalendarDays, color: 'text-blue-600' },
    { label: 'Contact Messages', value: stats?.contactMessages ?? 0, icon: Mail, color: 'text-muted-foreground' },
    { label: 'Partnership Requests', value: stats?.partnershipRequests ?? 0, icon: Handshake, color: 'text-muted-foreground' },
  ];

  const quickLinks = [
    { label: 'Review Members', href: '/admin/members', icon: Users, desc: 'Approve, reject, or suspend membership applications' },
    { label: 'Manage Events', href: '/admin/events', icon: CalendarDays, desc: 'Create events, track registrations, and check in attendees' },
    { label: 'Messages', href: '/admin/messages', icon: Mail, desc: 'Read contact form submissions' },
    { label: 'Partnership Requests', href: '/admin/partnerships', icon: Handshake, desc: 'Review partnership inquiries' },
    { label: 'Site Settings', href: '/admin/settings', icon: Settings, desc: 'Update site content and configuration' },
    ...(isSuperAdmin
      ? [{ label: 'Manage Admins', href: '/admin/admins', icon: Crown, desc: 'Change user roles and access levels' }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-secondary/20 pt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of KUZA TUK platform activity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="sticky top-24 space-y-1 rounded-xl border border-border bg-card p-3">
              {ADMIN_NAV.filter((item) => item.href !== '/admin/admins' || isSuperAdmin).map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted',
                    item.href === '/admin'
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                  {statCards.map((card) => (
                    <div key={card.label} className="rounded-xl border border-border bg-card p-5">
                      <card.icon className={cn('h-5 w-5', card.color)} />
                      <div className="mt-3 font-display text-2xl font-bold tabular-nums">
                        {card.value}
                      </div>
                      <div className="mt-1 text-xs font-medium text-muted-foreground">
                        {card.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick links */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <link.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold">{link.label}</h3>
                          <p className="mt-0.5 text-xs text-muted-foreground">{link.desc}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  ))}
                </div>


              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
