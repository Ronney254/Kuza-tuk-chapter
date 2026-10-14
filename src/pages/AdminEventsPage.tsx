import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Plus,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Users,
  Eye,
  EyeOff,
  MapPin,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  QrCode,
  Download,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { supabase } from '@/integrations/supabase/client';
import type { Event, EventType, EventRegistrationWithProfile, RegistrationStatus } from '@/types/database';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const EVENT_TYPES: EventType[] = ['WORKSHOP', 'TRAINING', 'TALK', 'HACKATHON', 'COMMUNITY', 'OTHER'];

const TYPE_COLORS: Record<EventType, string> = {
  WORKSHOP: 'bg-primary/10 text-primary border-primary/20',
  TRAINING: 'bg-accent/10 text-accent border-accent/20',
  TALK: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  HACKATHON: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  COMMUNITY: 'bg-green-500/10 text-green-600 border-green-500/20',
  OTHER: 'bg-muted text-muted-foreground border-border',
};

const REG_STATUS_COLORS: Record<RegistrationStatus, string> = {
  REGISTERED: 'bg-primary/10 text-primary border-primary/20',
  ATTENDED: 'bg-accent/10 text-accent border-accent/20',
  CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20',
  NO_SHOW: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface EventFormData {
  title: string;
  description: string;
  event_type: EventType;
  start_date: string;
  end_date: string;
  venue: string;
  location_url: string;
  capacity: string;
  is_published: boolean;
}

const EMPTY_FORM: EventFormData = {
  title: '',
  description: '',
  event_type: 'WORKSHOP',
  start_date: '',
  end_date: '',
  venue: '',
  location_url: '',
  capacity: '',
  is_published: false,
};

export default function AdminEventsPage() {
  useSeo({
    title: 'Admin — Events',
    description: 'Manage KUZA TUK events, registrations, and check-in.',
    path: '/admin/events',
  });

  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [registrations, setRegistrations] = useState<EventRegistrationWithProfile[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regEvent, setRegEvent] = useState<Event | null>(null);
  const [regOpen, setRegOpen] = useState(false);

  const ADMIN_NAV = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Members', href: '/admin/members' },
    { label: 'Events', href: '/admin/events' },
    { label: 'Messages', href: '/admin/messages' },
    { label: 'Partnerships', href: '/admin/partnerships' },
    { label: 'Settings', href: '/admin/settings' },
  ];

  const loadEvents = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .order('start_date', { ascending: false });

    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
    }

    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, error, count } = await query;

    if (error) {
      toast({ title: 'Error loading events', description: error.message });
      setLoading(false);
      return;
    }

    setEvents((data as Event[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [search, page, toast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  function openCreate() {
    setEditingEvent(null);
    setFormData(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(event: Event) {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description ?? '',
      event_type: event.event_type,
      start_date: event.start_date.slice(0, 16),
      end_date: event.end_date ? event.end_date.slice(0, 16) : '',
      venue: event.venue ?? '',
      location_url: event.location_url ?? '',
      capacity: event.capacity?.toString() ?? '',
      is_published: event.is_published,
    });
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);

    const slug = slugify(formData.title);
    const payload = {
      title: formData.title.trim(),
      slug,
      description: formData.description.trim() || null,
      event_type: formData.event_type,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      venue: formData.venue.trim() || null,
      location_url: formData.location_url.trim() || null,
      capacity: formData.capacity.trim() ? parseInt(formData.capacity, 10) : null,
      is_published: formData.is_published,
    };

    if (!payload.title || !payload.start_date) {
      toast({ title: 'Validation error', description: 'Title and start date are required.' });
      setFormLoading(false);
      return;
    }

    if (editingEvent) {
      const { error } = await supabase
        .from('events')
        .update(payload)
        .eq('id', editingEvent.id);

      setFormLoading(false);

      if (error) {
        toast({ title: 'Update failed', description: error.message });
        return;
      }

      toast({ title: 'Event updated', description: 'Changes have been saved.' });
    } else {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('events')
        .insert({
          ...payload,
          created_by: userData.user?.id ?? null,
        });

      setFormLoading(false);

      if (error) {
        toast({ title: 'Create failed', description: error.message });
        return;
      }

      toast({ title: 'Event created', description: 'The event has been added successfully.' });
    }

    setFormOpen(false);
    loadEvents();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);

    const { error } = await supabase.from('events').delete().eq('id', deleteId);

    setDeleteLoading(false);
    setDeleteId(null);

    if (error) {
      toast({ title: 'Delete failed', description: error.message });
      return;
    }

    toast({ title: 'Event deleted', description: 'The event and all its registrations have been removed.' });
    loadEvents();
  }

  async function togglePublish(event: Event) {
    const { error } = await supabase
      .from('events')
      .update({ is_published: !event.is_published })
      .eq('id', event.id);

    if (error) {
      toast({ title: 'Update failed', description: error.message });
      return;
    }

    toast({
      title: event.is_published ? 'Event unpublished' : 'Event published',
      description: event.is_published
        ? 'The event is no longer visible to the public.'
        : 'The event is now visible to the public.',
    });
    loadEvents();
  }

  async function openRegistrations(event: Event) {
    setRegEvent(event);
    setRegOpen(true);
    setRegLoading(true);

    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        profiles!event_registrations_user_id_fkey (full_name)
      `)
      .eq('event_id', event.id)
      .order('registered_at', { ascending: true });

    if (error) {
      toast({ title: 'Error loading registrations', description: error.message });
      setRegLoading(false);
      return;
    }

    const regs = (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      event_id: r.event_id as string,
      user_id: r.user_id as string,
      status: r.status as RegistrationStatus,
      registered_at: r.registered_at as string,
      cancelled_at: r.cancelled_at as string | null,
      checked_in_at: r.checked_in_at as string | null,
      checked_in_by: r.checked_in_by as string | null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
      full_name: (r.profiles as { full_name: string | null })?.full_name ?? 'Unknown',
      email: '',
    }));

    setRegistrations(regs as EventRegistrationWithProfile[]);
    setRegLoading(false);
  }

  async function handleCheckIn(regId: string) {
    const { error } = await supabase.rpc('check_in_attendee', {
      p_registration_id: regId,
    });

    if (error) {
      toast({ title: 'Check-in failed', description: error.message });
      return;
    }

    toast({ title: 'Checked in', description: 'Attendee has been marked as present.' });
    if (regEvent) openRegistrations(regEvent);
  }

  async function handleRevertCheckIn(regId: string) {
    const { error } = await supabase.rpc('revert_check_in', {
      p_registration_id: regId,
    });

    if (error) {
      toast({ title: 'Revert failed', description: error.message });
      return;
    }

    toast({ title: 'Check-in reverted', description: 'Attendee status set back to registered.' });
    if (regEvent) openRegistrations(regEvent);
  }

  async function handleNoShow(regId: string) {
    const { error } = await supabase.rpc('mark_no_show', {
      p_registration_id: regId,
    });

    if (error) {
      toast({ title: 'Update failed', description: error.message });
      return;
    }

    toast({ title: 'Marked as no-show', description: 'The attendee has been marked as absent.' });
    if (regEvent) openRegistrations(regEvent);
  }

  function exportRegistrations() {
    if (!registrations.length) return;

    const headers = ['Name', 'Status', 'Registered At', 'Checked In At'];
    const rows = registrations.map((r) => [
      r.full_name ?? 'Unknown',
      r.status,
      new Date(r.registered_at).toLocaleString(),
      r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : '—',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${regEvent?.slug ?? 'event'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

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
                    item.href === '/admin/events'
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
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold">Event Management</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create and manage events, track registrations, and check in attendees.
                </p>
              </div>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                New Event
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events by title..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            {/* Events table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No events found.</p>
                  <Button className="mt-4" size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    Create your first event
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden sm:table-cell">Type</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="hidden lg:table-cell">Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => {
                      const regCount = registrations.length;
                      return (
                        <TableRow key={event.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{event.title}</div>
                              {event.is_published ? (
                                <Eye className="h-3.5 w-3.5 text-accent" />
                              ) : (
                                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </div>
                            {event.venue && (
                              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {event.venue}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className={cn(TYPE_COLORS[event.event_type])}>
                              {event.event_type.toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {new Date(event.start_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {event.capacity ?? 'Unlimited'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={event.is_published
                                ? 'bg-accent/10 text-accent border-accent/20'
                                : 'bg-muted text-muted-foreground border-border'
                              }
                            >
                              {event.is_published ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openRegistrations(event)}
                                title="View registrations"
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePublish(event)}
                                title={event.is_published ? 'Unpublish' : 'Publish'}
                              >
                                {event.is_published
                                  ? <EyeOff className="h-4 w-4" />
                                  : <Eye className="h-4 w-4" />
                                }
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(event)}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteId(event.id)}
                                title="Delete"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Introduction to GIS Workshop"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(v) => setFormData({ ...formData, event_type: v as EventType })}
                >
                  <SelectTrigger id="event_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0) + t.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (leave blank for unlimited)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  placeholder="e.g. 50"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date & Time *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date & Time</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  placeholder="e.g. TUK Main Hall"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_url">Location URL (optional)</Label>
                <Input
                  id="location_url"
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.location_url}
                  onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe the event..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <div>
                <Label htmlFor="is_published" className="cursor-pointer">Publish event</Label>
                <p className="text-xs text-muted-foreground">
                  Published events are visible to the public and open for registration.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingEvent ? (
                  'Save Changes'
                ) : (
                  'Create Event'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground px-6">
            This will permanently delete the event and all its registrations. This action cannot be undone.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Registrations dialog */}
      <Dialog open={regOpen} onOpenChange={setRegOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Registrations — {regEvent?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {registrations.filter((r) => r.status === 'REGISTERED' || r.status === 'ATTENDED').length} registered
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                {registrations.filter((r) => r.status === 'ATTENDED').length} attended
              </span>
            </div>
            {registrations.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportRegistrations}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>

          {regLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">No registrations yet for this event.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">
                      {reg.full_name ?? 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(REG_STATUS_COLORS[reg.status])}>
                        {reg.status.replace(/_/g, ' ').toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {new Date(reg.registered_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {reg.status === 'REGISTERED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCheckIn(reg.id)}
                            title="Check in"
                            className="text-accent hover:text-accent"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        {reg.status === 'ATTENDED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevertCheckIn(reg.id)}
                            title="Revert check-in"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        {reg.status === 'REGISTERED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleNoShow(reg.id)}
                            title="Mark as no-show"
                            className="text-yellow-600 hover:text-yellow-600"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
