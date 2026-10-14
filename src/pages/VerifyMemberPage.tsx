import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/shared/Logo';

interface VerificationData {
  full_name: string;
  member_id: string;
  membership_status: string;
  membership_category: string;
  valid_from: string;
  valid_until: string | null;
}

export default function VerifyMemberPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [found, setFound] = useState(false);

  useSeo({
    title: 'Verify Member',
    description: 'Verify a KUZA TUK membership by member ID.',
    path: `/verify/member/${memberId ?? ''}`,
  });

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      return;
    }

    supabase
      .rpc('verify_member_by_id', { p_member_id: memberId })
      .then(({ data: result, error }) => {
        if (error) {
          setLoading(false);
          return;
        }
        if (result && Array.isArray(result) && result.length > 0) {
          setData(result[0] as VerificationData);
          setFound(true);
        }
        setLoading(false);
      });
  }, [memberId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy text-navy-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!found || !data) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy px-4 text-center text-navy-foreground">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/15 blur-[100px]" />

        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold">Verification Record Not Found</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-white/50">
            The member ID you searched for could not be verified. This may mean
            the ID is invalid, or the membership is no longer active.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            Back to Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const categoryLabel = data.membership_category.replace(/_/g, ' ').toLowerCase();
  const validFromDate = new Date(data.valid_from).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy px-4 py-12 text-navy-foreground">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[100px]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo variant="light" />
        </div>

        {/* Verified card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold">Membership Verified</h1>
            <p className="mt-2 text-sm text-white/60">
              This is a verified KUZA TUK member in good standing.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm text-white/40">Name</span>
              <span className="text-sm font-semibold text-white">{data.full_name}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm text-white/40">Member ID</span>
              <span className="font-mono text-sm font-semibold text-primary">{data.member_id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm text-white/40">Status</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-accent">
                <span className="h-2 w-2 rounded-full bg-accent" />
                {data.membership_status}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm text-white/40">Category</span>
              <span className="text-sm font-semibold capitalize text-white">{categoryLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">Valid From</span>
              <span className="text-sm font-semibold text-white">{validFromDate}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] py-3">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <p className="text-xs text-white/40">
              Verified via KUZA TUK official system
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-white/40 transition-colors hover:text-white"
          >
            KUZA TUK — Where Spatial Meets Everything.
          </Link>
        </div>
      </div>
    </div>
  );
}
