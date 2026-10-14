import { useEffect, useState } from 'react';
import { Mail, Loader2, Trash2, Check, Circle } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { supabase } from '@/integrations/supabase/client';
import type { ContactMessage } from '@/types/database';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminMessagesPage() {
  useSeo({
    title: 'Admin — Messages',
    description: 'View contact form submissions.',
    path: '/admin/messages',
  });

  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message });
    } else {
      setMessages((data as ContactMessage[]) ?? []);
    }
    setLoading(false);
  }

  async function markAsRead(msg: ContactMessage) {
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', msg.id);

    if (error) {
      toast({ title: 'Error', description: error.message });
      return;
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
    );
  }

  async function deleteMessage(id: string) {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message });
      return;
    }

    setMessages((prev) => prev.filter((m) => m.id !== id));
    setOpen(false);
    toast({ title: 'Message deleted' });
  }

  function openMessage(msg: ContactMessage) {
    setSelected(msg);
    setOpen(true);
    if (!msg.is_read) markAsRead(msg);
  }

  return (
    <div className="min-h-screen bg-secondary/20 pt-16">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Contact Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Messages submitted through the public contact form.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mail className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">No messages yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Subject</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((msg) => (
                  <TableRow
                    key={msg.id}
                    className={cn('cursor-pointer hover:bg-muted/50', !msg.is_read && 'bg-primary/5')}
                    onClick={() => openMessage(msg)}
                  >
                    <TableCell>
                      {msg.is_read ? (
                        <Check className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Circle className="h-3 w-3 fill-primary text-primary" />
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{msg.name}</p>
                      <p className="text-xs text-muted-foreground">{msg.email}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{msg.subject}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {new Date(msg.created_at).toLocaleDateString()}
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
                <DialogTitle>{selected.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{selected.name}</p>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {selected.email}
                    </a>
                  </div>
                  <Badge variant="outline">
                    {new Date(selected.created_at).toLocaleDateString()}
                  </Badge>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMessage(selected.id)}
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
