import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { PageHero } from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

export default function ResetPasswordPage() {
  useSeo({
    title: 'Reset Password',
    description: 'Reset your KUZA TUK account password.',
    path: '/reset-password',
  });

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <>
      <PageHero
        eyebrow="Account"
        title="Reset Password"
        description="Enter your email address and we'll send you a link to reset your password."
      />

      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card p-8">
            {success ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="mt-5 font-display text-xl font-bold">Check Your Email</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  If an account exists for {email}, you'll receive a password
                  reset link shortly.
                </p>
                <Link
                  to="/login"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
                >
                  Back to Login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-bold">Reset Password</h2>
                </div>

                {error && (
                  <div className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-5 text-center text-sm text-muted-foreground">
                  Remember your password?{' '}
                  <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
