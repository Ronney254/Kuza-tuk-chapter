import { useEffect, useState } from 'react';
import { Handshake, Loader2, Trash2 } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { supabase } from '@/integrations/supabase/client';
import type { PartnershipRequest } from '@/types/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-primary/10 text-primary border-primary/20',
  REVIEWED: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  ACCEPTED: 'bg-accent/10 text-accent border-accent/20',
  DECLINED: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function AdminPartnershipsPage() {
  useSeo({
    title: 'Admin — Partnership Requests',
    description: 'Review partnership requests.',
    path: '/admin/partnerships',
  });

  const { toast } = useToast();
  const [requests, setRequests] = useState<PartnershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PartnershipRequest | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from('partnership_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      setRequests((data as PartnershipRequest[]) ?? []);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('partnership_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message });
      return;
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: status as PartnershipRequest['status'] } : r))
    );
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status: status as PartnershipRequest['status'] } : prev));
    toast({ title: `Status updated to ${status.toLowerCase()}` });
  }

  async function deleteRequest(id: string) {
    const { error } = await supabase
      .from('partnership_requests')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message });
      return;
    }

    setRequests((prev) => prev.filter((r) => r.id !== id));
    setOpen(false);
    toast({ title: 'Request deleted' });
  }

  function openRequest(req: PartnershipRequest) {
    setSelected(req);
    setOpen(true);
  }

  return (
    <div className="min-h-screen bg-secondary/20 pt-16">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Partnership Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organizations that have submitted partnership inquiries.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Handshake className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">No partnership requests yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow
                    key={req.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openRequest(req)}
                  >
                    <TableCell>
                      <p className="font-medium">{req.organization}</p>
                      <p className="text-xs text-muted-foreground">{req.contact_person}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{req.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{req.organization_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('capitalize', STATUS_COLORS[req.status])}>
                        {req.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.organization}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Contact Person</p>
                    <p className="mt-1 text-sm font-semibold">{selected.contact_person}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Email</p>
                    <a href={`mailto:${selected.email}`} className="mt-1 block text-sm text-primary hover:underline">
                      {selected.email}
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Phone</p>
                    <p className="mt-1 text-sm">{selected.phone ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Organization Type</p>
                    <p className="mt-1 text-sm">{selected.organization_type}</p>
                  </div>
                </div>
                {selected.area_of_interest && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Area of Interest</p>
                    <p className="mt-1 text-sm">{selected.area_of_interest}</p>
                  </div>
                )}
                {selected.proposed_collaboration && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Proposed Collaboration</p>
                    <p className="mt-1 text-sm text-muted-foreground">{selected.proposed_collaboration}</p>
                  </div>
                )}
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Message</p>
                  <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{selected.message}</p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Update Status</p>
                  <Select
                    value={selected.status}
                    onValueChange={(v) => updateStatus(selected.id, v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="REVIEWED">Reviewed</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="DECLINED">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteRequest(selected.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
