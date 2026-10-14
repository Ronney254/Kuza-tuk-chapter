import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Crown,
  Users,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  LayoutDashboard,
  CalendarDays,
  Mail,
  Handshake,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, UserRole } from '@/types/database';
import { useAuth } from '@/hooks/use-auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', description: 'Full access including managing other admins' },
  { value: 'CHAPTER_ADMIN', label: 'Chapter Admin', description: 'Manage members, events, messages, and partnerships' },
  { value: 'EXECUTIVE', label: 'Executive', description: 'Staff-level access to events and registrations' },
  { value: 'MEMBER', label: 'Member', description: 'Standard member access' },
  { value: 'ALUMNI', label: 'Alumni', description: 'Alumni member access' },
];

const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: 'bg-primary/10 text-primary border-primary/20',
  CHAPTER_ADMIN: 'bg-accent/10 text-accent border-accent/20',
  EXECUTIVE: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  MEMBER: 'bg-muted text-muted-foreground border-border',
  ALUMNI: 'bg-green-500/10 text-green-600 border-green-500/20',
};

const ROLE_ICONS: Record<UserRole, typeof Crown> = {
  SUPER_ADMIN: Crown,
  CHAPTER_ADMIN: ShieldCheck,
  EXECUTIVE: Shield,
  MEMBER: Users,
  ALUMNI: Users,
};

const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Members', href: '/admin/members' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Messages', href: '/admin/messages' },
  { label: 'Partnerships', href: '/admin/partnerships' },
  { label: 'Admins', href: '/admin/admins' },
  { label: 'Settings', href: '/admin/settings' },
];

function initials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AdminAdminsPage() {
  useSeo({
    title: 'Admin — Admin Management',
    description: 'Manage admin roles and access levels.',
    path: '/admin/admins',
  });

  const { toast } = useToast();
  const { profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const [editTarget, setEditTarget] = useState<Profile | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('MEMBER');
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter);
    }

    if (search.trim()) {
      query = query.ilike('full_name', `%${search.trim()}%`);
    }

    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, error, count } = await query;

    if (error) {
      toast({ title: 'Error loading users', description: error.message });
      setLoading(false);
      return;
    }

    setProfiles((data as Profile[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [search, roleFilter, page, toast]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  function openEdit(profile: Profile) {
    setEditTarget(profile);
    setEditRole(profile.role);
    setEditOpen(true);
  }

  async function handleSaveRole() {
    if (!editTarget) return;
    if (editRole === editTarget.role) {
      setEditOpen(false);
      return;
    }

    setSaving(true);

    const { data, error } = await supabase.rpc('update_user_role', {
      p_target_user_id: editTarget.user_id,
      p_new_role: editRole,
    });

    setSaving(false);

    if (error) {
      toast({ title: 'Failed to update role', description: error.message });
      return;
    }

    toast({
      title: 'Role updated',
      description: `${editTarget.full_name ?? 'User'} is now ${ROLES.find((r) => r.value === editRole)?.label}.`,
    });

    setEditOpen(false);
    loadProfiles();
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const adminCount = profiles.filter(
    (p) => p.role === 'SUPER_ADMIN' || p.role === 'CHAPTER_ADMIN'
  ).length;

  const roleCounts: Record<string, number> = {
    SUPER_ADMIN: 0,
    CHAPTER_ADMIN: 0,
    EXECUTIVE: 0,
    MEMBER: 0,
    ALUMNI: 0,
  };
  profiles.forEach((p) => {
    roleCounts[p.role] = (roleCounts[p.role] ?? 0) + 1;
  });

  return (
    <div className="min-h-screen bg-secondary/20 pt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="sticky top-24 space-y-1 rounded-xl border border-border bg-card p-3">
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted',
                    item.href === '/admin/admins'
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-primary" />
                <h1 className="font-display text-2xl font-bold">Admin Management</h1>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage user roles and access levels. Only super admins can change roles.
              </p>
            </div>

            {/* Role distribution cards */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {ROLES.map((role) => {
                const Icon = ROLE_ICONS[role.value];
                return (
                  <div
                    key={role.value}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <Icon className={cn('h-4 w-4', ROLE_COLORS[role.value].split(' ').find((c) => c.startsWith('text')))}
                    />
                    <div className="mt-2 font-display text-xl font-bold tabular-nums">
                      {roleCounts[role.value] ?? 0}
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-muted-foreground">
                      {role.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(v) => {
                  setRoleFilter(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Users table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : profiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No users found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">Membership</TableHead>
                      <TableHead className="hidden lg:table-cell">Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((p) => {
                      const Icon = ROLE_ICONS[p.role];
                      const isSelf = p.user_id === profile?.user_id;
                      return (
                        <TableRow key={p.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                  {initials(p.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {p.full_name ?? 'Unknown'}
                                  {isSelf && (
                                    <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('gap-1', ROLE_COLORS[p.role])}>
                              <Icon className="h-3 w-3" />
                              {ROLES.find((r) => r.value === p.role)?.label ?? p.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm text-muted-foreground capitalize">
                              {p.membership_status.toLowerCase()}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(p)}
                              disabled={isSelf && p.role === 'SUPER_ADMIN'}
                              title={isSelf && p.role === 'SUPER_ADMIN' ? 'You cannot change your own role' : 'Change role'}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change role dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update the access level for {editTarget?.full_name ?? 'this user'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {ROLES.map((role) => {
              const Icon = ROLE_ICONS[role.value];
              const isSelected = editRole === role.value;
              const isSelf = editTarget?.user_id === profile?.user_id;
              const wouldSelfDemote = isSelf && role.value !== 'SUPER_ADMIN';
              return (
                <button
                  key={role.value}
                  type="button"
                  disabled={wouldSelfDemote}
                  onClick={() => setEditRole(role.value)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50',
                    wouldSelfDemote && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <div className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    ROLE_COLORS[role.value]
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{role.label}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {role.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-1 h-4 w-4 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}

            {editTarget?.user_id === profile?.user_id && (
              <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                <p className="text-xs text-yellow-700">
                  You cannot demote your own super admin account. This prevents
                  accidentally removing the last super admin.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
