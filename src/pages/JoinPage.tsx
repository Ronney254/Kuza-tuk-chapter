import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { PageHero } from '@/components/shared/PageHero';
import { Reveal } from '@/components/shared/Reveal';
import { MEMBERSHIP_JOURNEY } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function JoinPage() {
  useSeo({
    title: 'Join KUZA',
    description:
      'Join KUZA TUK — become a member of the geospatial, surveying, space science, technology and innovation ecosystem at the Technical University of Kenya.',
    path: '/join',
  });

  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);

    if (error) {
      if (error.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(error);
      }
      return;
    }

    setSuccess(true);
    toast({
      title: 'Account created!',
      description: 'Welcome to KUZA TUK. You can now complete your membership application.',
    });
  }

  if (success) {
    return (
      <>
        <PageHero
          eyebrow="Membership"
          title="Welcome to KUZA TUK"
          description="Your account has been created. The next step is to complete your membership application."
        />
        <section className="bg-background py-16 sm:py-24">
          <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="mt-5 font-display text-xl font-bold">Account Created</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Your KUZA TUK account has been created successfully. You're now
                ready to complete your membership application.
              </p>
              <div className="mt-6 space-y-3">
                <Button
                  className="w-full"
                  onClick={() => navigate('/apply')}
                >
                  Complete Membership Application
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Membership"
        title="Join KUZA TUK"
        description="Create your account to start your KUZA TUK journey. After creating an account, you'll complete a membership application that will be reviewed by our leadership team."
      />

      <section className="border-b border-border bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Signup form */}
            <div>
              <div className="rounded-xl border border-border bg-card p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-bold">Create Account</h2>
                </div>

                {error && (
                  <div className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        className="pl-9"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="At least 6 characters"
                        className="pl-9"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        className="pl-9"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-5 text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Journey preview */}
            <div>
              <h3 className="font-display text-lg font-semibold">Your Membership Journey</h3>
              <div className="mt-5 space-y-3">
                {MEMBERSHIP_JOURNEY.map((step) => (
                  <Reveal key={step.step}>
                    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                        {step.step}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{step.title}</h4>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-5">
                <h4 className="text-sm font-semibold">What You Get</h4>
                <ul className="mt-3 space-y-1.5">
                  {[
                    'Unique KUZA member ID',
                    'Digital membership card',
                    'Access to events and training',
                    'Member dashboard',
                    'Certificate eligibility',
                    'Professional network',
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
