import { useEffect, useState, useCallback } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  RotateCcw,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { supabase } from '@/integrations/supabase/client';
import type { MembershipApplication, ApplicationStatus, MembershipCategory } from '@/types/database';
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
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  PENDING: 'bg-primary/10 text-primary border-primary/20',
  APPROVED: 'bg-accent/10 text-accent border-accent/20',
  REJECTED: 'bg-destructive/10 text-destructive border-destructive/20',
  CHANGES_REQUESTED: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  SUSPENDED: 'bg-destructive/10 text-destructive border-destructive/20',
  DEACTIVATED: 'bg-muted text-muted-foreground border-border',
};

export default function AdminMembersPage() {
  useSeo({
    title: 'Admin — Members',
    description: 'Manage KUZA TUK membership applications.',
    path: '/admin/members',
  });

  const { toast } = useToast();
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedApp, setSelectedApp] = useState<MembershipApplication | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('membership_applications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (search.trim()) {
      query = query.or(
        `full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
      );
    }

    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, error, count } = await query;

    if (error) {
      toast({ title: 'Error loading applications', description: error.message });
      setLoading(false);
      return;
    }

    setApplications((data as MembershipApplication[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [search, statusFilter, page, toast]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  function openDetail(app: MembershipApplication) {
    setSelectedApp(app);
    setReviewNotes(app.review_notes ?? '');
    setDetailOpen(true);
  }

  async function handleAction(action: ApplicationStatus) {
    if (!selectedApp) return;
    setActionLoading(true);

    if (action === 'APPROVED') {
      const { data, error } = await supabase.rpc('approve_membership_application', {
        p_application_id: selectedApp.id,
      });

      setActionLoading(false);

      if (error) {
        toast({ title: 'Approval failed', description: error.message });
        return;
      }

      const memberId = Array.isArray(data) && data.length > 0 ? data[0].member_id : null;
      toast({
        title: 'Application approved',
        description: memberId
          ? `Member ID assigned: ${memberId}`
          : 'Membership has been activated.',
      });
    } else {
      const { error } = await supabase
        .from('membership_applications')
        .update({
          status: action,
          review_notes: reviewNotes.trim() || null,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedApp.id);

      setActionLoading(false);

      if (error) {
        toast({ title: 'Action failed', description: error.message });
        return;
      }

      // Update profile status
      const profileStatusMap: Record<string, string> = {
        APPROVED: 'ACTIVE',
        REJECTED: 'REJECTED',
        SUSPENDED: 'SUSPENDED',
        DEACTIVATED: 'DEACTIVATED',
        CHANGES_REQUESTED: 'PENDING',
      };
      const profileStatus = profileStatusMap[action] ?? 'PENDING';

      await supabase
        .from('profiles')
        .update({ membership_status: profileStatus })
        .eq('user_id', selectedApp.user_id);

      toast({
        title: `Application ${action.toLowerCase().replace(/_/g, ' ')}`,
        description: 'The applicant will see the updated status in their dashboard.',
      });
    }

    setDetailOpen(false);
    loadApplications();
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-secondary/20 pt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Member Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and manage membership applications. {pendingCount} pending on this page.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CHANGES_REQUESTED">Changes Requested</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                No applications found.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(app)}>
                    <TableCell className="font-medium">{app.full_name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{app.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground capitalize text-sm">
                      {app.membership_category.replace(/_/g, ' ').toLowerCase()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('capitalize', STATUS_COLORS[app.status])}>
                        {app.status.replace(/_/g, ' ').toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {new Date(app.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(app);
                        }}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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

      {/* Detail / Action dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle>Membership Application</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Full Name</p>
                    <p className="mt-1 text-sm font-semibold">{selectedApp.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Email</p>
                    <p className="mt-1 text-sm font-semibold">{selectedApp.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Phone</p>
                    <p className="mt-1 text-sm">{selectedApp.phone ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Admission Number</p>
                    <p className="mt-1 text-sm">{selectedApp.admission_number ?? '—'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Course</p>
                    <p className="mt-1 text-sm">{selectedApp.course ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Year of Study</p>
                    <p className="mt-1 text-sm">{selectedApp.year_of_study ?? '—'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Department</p>
                    <p className="mt-1 text-sm">{selectedApp.department ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">School/Faculty</p>
                    <p className="mt-1 text-sm">{selectedApp.school_faculty ?? '—'}</p>
                  </div>
                </div>

                {selectedApp.skills && selectedApp.skills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Skills</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {selectedApp.skills.map((s) => (
                        <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApp.areas_of_interest && selectedApp.areas_of_interest.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Areas of Interest</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {selectedApp.areas_of_interest.map((s) => (
                        <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApp.short_bio && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Bio</p>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedApp.short_bio}</p>
                  </div>
                )}

                {selectedApp.linkedin_url && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">LinkedIn</p>
                    <a
                      href={selectedApp.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-primary hover:underline"
                    >
                      {selectedApp.linkedin_url}
                    </a>
                  </div>
                )}

                <div>
                  <Label htmlFor="review_notes" className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Review Notes (visible to applicant)
                  </Label>
                  <Textarea
                    id="review_notes"
                    rows={2}
                    placeholder="Add notes for the applicant..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>

                <div className="border-t border-border pt-4">
                  <p className="mb-3 text-xs font-medium text-muted-foreground">Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.status !== 'APPROVED' && (
                      <Button
                        size="sm"
                        onClick={() => handleAction('APPROVED')}
                        disabled={actionLoading}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Approve
                      </Button>
                    )}
                    {selectedApp.status !== 'REJECTED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction('REJECTED')}
                        disabled={actionLoading}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction('CHANGES_REQUESTED')}
                      disabled={actionLoading}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Request Changes
                    </Button>
                    {selectedApp.status === 'APPROVED' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction('SUSPENDED')}
                          disabled={actionLoading}
                        >
                          <Ban className="h-4 w-4" />
                          Suspend
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction('DEACTIVATED')}
                          disabled={actionLoading}
                        >
                          <Ban className="h-4 w-4" />
                          Deactivate
                        </Button>
                      </>
                    )}
                    {(selectedApp.status === 'SUSPENDED' || selectedApp.status === 'DEACTIVATED') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction('APPROVED')}
                        disabled={actionLoading}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
