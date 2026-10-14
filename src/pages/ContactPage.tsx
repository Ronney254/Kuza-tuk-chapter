import { useState, type FormEvent } from 'react';
import { Mail, MapPin, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { PageHero } from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SITE_CONFIG } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';

export default function ContactPage() {
  useSeo({
    title: 'Contact',
    description:
      "Get in touch with KUZA TUK. Send us a message and we'll get back to you. Email us at kuzatukchapter@gmail.com.",
    path: '/contact',
  });

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    const newErrors: Record<string, string> = {};
    if (!data.name.trim()) newErrors.name = 'Please enter your name';
    if (!data.email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!data.subject.trim()) newErrors.subject = 'Please enter a subject';
    if (!data.message.trim()) {
      newErrors.message = 'Please enter a message';
    } else if (data.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const { error: insertError } = await supabase
      .from('contact_messages')
      .insert({
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject.trim(),
        message: data.message.trim(),
      });

    setIsSubmitting(false);

    if (insertError) {
      setErrors({ form: 'Could not send your message. Please try again.' });
      return;
    }

    setIsSubmitted(true);
    toast({
      title: 'Message sent',
      description: "We'll get back to you at the email you provided.",
    });
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in Touch"
        description="Have a question, idea, or want to connect with KUZA TUK? Send us a message and we'll get back to you."
      />

      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Contact info */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-sm font-semibold">
                  Email
                </h3>
                <a
                  href={`mailto:${SITE_CONFIG.contactEmail}`}
                  className="mt-1 block text-sm text-muted-foreground hover:text-primary"
                >
                  {SITE_CONFIG.contactEmail}
                </a>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-sm font-semibold">
                  Location
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Technical University of Kenya
                  <br />
                  Nairobi, Kenya
                </p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/40 p-6">
                <h3 className="font-display text-sm font-semibold">
                  Response Time
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We aim to respond to all inquiries within 2-3 business days.
                  For urgent matters, please mention it in your subject line.
                </p>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                {errors.form && (
                  <div className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-sm text-destructive">{errors.form}</p>
                  </div>
                )}
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="mt-5 font-display text-xl font-bold">
                      Message Sent
                    </h2>
                    <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                      Thank you for reaching out. We'll get back to you at the
                      email you provided as soon as possible.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Your full name"
                          aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                          <p className="text-xs text-destructive">{errors.name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          aria-invalid={!!errors.email}
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What's this about?"
                        aria-invalid={!!errors.subject}
                      />
                      {errors.subject && (
                        <p className="text-xs text-destructive">
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more..."
                        rows={6}
                        aria-invalid={!!errors.message}
                      />
                      {errors.message && (
                        <p className="text-xs text-destructive">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      Your message will be stored securely and only viewed by
                      authorized KUZA TUK administrators.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
