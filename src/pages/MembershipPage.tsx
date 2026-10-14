import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IdCard, Clock, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import type { Membership, MembershipApplication } from '@/types/database';
import { MembershipCard } from '@/components/shared/MembershipCard';
import { Button } from '@/components/ui/button';

export default function MembershipPage() {
  useSeo({
    title: 'My Membership',
    description: 'View your KUZA TUK membership details and digital card.',
    path: '/dashboard/membership',
  });

  const { user, profile } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [application, setApplication] = useState<MembershipApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      const [mRes, aRes] = await Promise.all([
        supabase
          .from('memberships')
          .select('*')
          .eq('user_id', user!.id)
          .maybeSingle(),
        supabase
          .from('membership_applications')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (mRes.data) setMembership(mRes.data as Membership);
      if (aRes.data) setApplication(aRes.data as MembershipApplication);
      setLoading(false);
    }

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 pt-16">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">My Membership</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your KUZA TUK membership details and digital membership card.
          </p>
        </div>

        {/* Active member with card */}
        {profile?.membership_status === 'ACTIVE' && membership && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col items-center justify-center">
              <MembershipCard profile={profile} membership={membership} />
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.print()}
              >
                <Download className="h-4 w-4" />
                Print / Save Card
              </Button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                  <div>
                    <h2 className="font-display text-lg font-semibold">Active Member</h2>
                    <p className="text-sm text-muted-foreground">
                      Your membership is active and in good standing.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-sm text-muted-foreground">Member ID</span>
                    <span className="font-mono text-sm font-semibold">{membership.member_id}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm font-semibold capitalize">
                      {membership.membership_category.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-sm font-semibold text-accent">{membership.status}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-sm text-muted-foreground">Valid From</span>
                    <span className="text-sm font-semibold">
                      {new Date(membership.valid_from).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Verification</span>
                    <Link
                      to={`/verify/member/${membership.member_id}`}
                      className="text-sm font-semibold text-primary hover:text-primary/80"
                    >
                      View verification page
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending application */}
        {profile?.membership_status === 'PENDING' && (
          <div className="max-w-md">
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
                <div>
                  <h2 className="font-display text-lg font-semibold">Application Under Review</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your membership application was submitted on{' '}
                    {application
                      ? new Date(application.created_at).toLocaleDateString()
                      : 'recently'}
                    . The KUZA TUK leadership team is reviewing it. You'll be
                    notified once a decision is made.
                  </p>
                </div>
              </div>

              {application && (
                <div className="mt-6 space-y-3 border-t border-border pt-5">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm font-semibold capitalize">
                      {application.membership_category.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-sm font-semibold">{application.status}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No application */}
        {profile?.membership_status === 'NONE' && (
          <div className="max-w-md">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                <div>
                  <h2 className="font-display text-lg font-semibold">No Application Submitted</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You haven't submitted a membership application yet. Complete
                    your application to become a KUZA TUK member.
                  </p>
                  <Button asChild className="mt-4">
                    <Link to="/apply">
                      <IdCard className="h-4 w-4" />
                      Start Application
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejected/suspended */}
        {(profile?.membership_status === 'REJECTED' ||
          profile?.membership_status === 'SUSPENDED' ||
          profile?.membership_status === 'DEACTIVATED') && (
          <div className="max-w-md">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-destructive" />
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    Membership {profile.membership_status.toLowerCase()}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your membership application has been{' '}
                    {profile.membership_status.toLowerCase()}. Please contact the
                    KUZA TUK leadership team for more information.
                  </p>
                  {application?.review_notes && (
                    <div className="mt-4 rounded-lg border border-border bg-card p-3">
                      <p className="text-xs font-semibold text-muted-foreground">Review Notes</p>
                      <p className="mt-1 text-xs text-foreground">{application.review_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
