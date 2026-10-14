import { useState, type FormEvent } from 'react';
import { Handshake, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { PageHero } from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { PartnershipType } from '@/types/database';

const ORG_TYPES: PartnershipType[] = [
  'Research',
  'Training',
  'Sponsorship',
  'Industry Visit',
  'Technology',
  'Events',
  'Community',
  'Other',
];

export default function PartnerPage() {
  useSeo({
    title: 'Partner with KUZA',
    description:
      'Partner with KUZA TUK to support geospatial education, research, innovation, and community development.',
    path: '/partner',
  });

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    organization: '',
    contact_person: '',
    email: '',
    phone: '',
    organization_type: '' as PartnershipType | '',
    area_of_interest: '',
    proposed_collaboration: '',
    message: '',
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!formData.organization.trim() || !formData.contact_person.trim() || !formData.email.trim()) {
      setFormError('Organization name, contact person, and email are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!formData.organization_type) {
      setFormError('Please select an organization type.');
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setFormError('Message must be at least 10 characters.');
      return;
    }

    setLoading(true);

    const { error: insertError } = await supabase
      .from('partnership_requests')
      .insert({
        organization: formData.organization.trim(),
        contact_person: formData.contact_person.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        organization_type: formData.organization_type,
        area_of_interest: formData.area_of_interest.trim() || null,
        proposed_collaboration: formData.proposed_collaboration.trim() || null,
        message: formData.message.trim(),
      });

    setLoading(false);

    if (insertError) {
      setError('Could not submit your request. Please try again.');
      return;
    }

    setSuccess(true);
    toast({
      title: 'Request submitted!',
      description: 'We will review your partnership request and get back to you.',
    });
  }

  if (success) {
    return (
      <>
        <PageHero
          eyebrow="Partnership"
          title="Request Received"
          description="Thank you for your interest in partnering with KUZA TUK."
        />
        <section className="bg-background py-16 sm:py-24">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold">Partnership Request Sent</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              We've received your partnership request. Our team will review it
              and reach out to you at the email you provided.
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Partnership"
        title="Partner with KUZA"
        description="Organizations can partner with KUZA TUK to support geospatial education, research, innovation, and community development. Share your collaboration ideas with us."
      />

      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Handshake className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Partnership Form</h2>
                <p className="text-sm text-muted-foreground">
                  Fields marked with * are required.
                </p>
              </div>
            </div>

            {(formError || error) && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{formError || error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization *</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person *</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@organization.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+254..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization_type">Organization Type *</Label>
                <Select
                  value={formData.organization_type}
                  onValueChange={(v) => setFormData({ ...formData, organization_type: v as PartnershipType })}
                >
                  <SelectTrigger id="organization_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORG_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_of_interest">Area of Interest</Label>
                <Input
                  id="area_of_interest"
                  placeholder="e.g. Training, Research, Technology, Events"
                  value={formData.area_of_interest}
                  onChange={(e) => setFormData({ ...formData, area_of_interest: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposed_collaboration">Proposed Collaboration</Label>
                <Textarea
                  id="proposed_collaboration"
                  rows={3}
                  placeholder="Briefly describe the collaboration you have in mind..."
                  value={formData.proposed_collaboration}
                  onChange={(e) => setFormData({ ...formData, proposed_collaboration: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us more about your organization and why you want to partner with KUZA TUK..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <div className="border-t border-border pt-5">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Your request will be stored securely and only reviewed by
                  authorized KUZA TUK administrators.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
