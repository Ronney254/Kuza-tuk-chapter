import { QRCodeSVG } from 'qrcode.react';
import { Logo } from '@/components/shared/Logo';
import type { Profile, Membership } from '@/types/database';

interface MembershipCardProps {
  profile: Profile;
  membership: Membership;
}

export function MembershipCard({ profile, membership }: MembershipCardProps) {
  const verifyUrl = `${window.location.origin}/verify/member/${membership.member_id}`;
  const categoryLabel = membership.membership_category.replace(/_/g, ' ');
  const validFrom = new Date(membership.valid_from).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-navy p-6 text-navy-foreground shadow-2xl">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      {/* Glow accents */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-[60px]" />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-accent/15 blur-[60px]" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Logo variant="light" showText={false} />
          <div className="text-right">
            <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-white/60">
              Membership Card
            </p>
            <p className="text-xs text-white/40">KUZA TUK</p>
          </div>
        </div>

        {/* Member info */}
        <div className="mt-6">
          <p className="text-[0.625rem] font-medium uppercase tracking-wider text-white/40">
            Member
          </p>
          <p className="mt-1 font-display text-xl font-bold text-white">
            {profile.full_name ?? 'Unknown'}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[0.625rem] font-medium uppercase tracking-wider text-white/40">
              Member ID
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-primary">
              {membership.member_id}
            </p>
          </div>
          <div>
            <p className="text-[0.625rem] font-medium uppercase tracking-wider text-white/40">
              Category
            </p>
            <p className="mt-1 text-sm font-semibold capitalize text-white">
              {categoryLabel.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[0.625rem] font-medium uppercase tracking-wider text-white/40">
              Status
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-accent">
              <span className="h-2 w-2 rounded-full bg-accent" />
              {membership.status}
            </p>
          </div>
          <div>
            <p className="text-[0.625rem] font-medium uppercase tracking-wider text-white/40">
              Valid From
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{validFrom}</p>
          </div>
        </div>

        {/* QR code */}
        <div className="mt-6 flex items-end justify-between">
          <div className="rounded-lg bg-white p-2">
            <QRCodeSVG
              value={verifyUrl}
              size={80}
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="text-right text-[0.625rem] text-white/40">
            Scan to verify
            <br />
            membership
          </p>
        </div>
      </div>
    </div>
  );
}
