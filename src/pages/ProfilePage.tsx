import { useState, useEffect, type FormEvent } from 'react';
import { User, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { Membership } from '@/types/database';

export default function ProfilePage() {
  useSeo({
    title: 'My Profile',
    description: 'Manage your KUZA TUK profile.',
    path: '/dashboard/profile',
  });

  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    skills: '',
    interests: '',
    linkedin_url: '',
    github_url: '',
    public_directory: false,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
        skills: profile.skills?.join(', ') ?? '',
        interests: profile.interests?.join(', ') ?? '',
        linkedin_url: profile.linkedin_url ?? '',
        github_url: profile.github_url ?? '',
        public_directory: profile.public_directory,
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setMembership(data as Membership);
      });
  }, [user]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!user || !profile) return;

    if (!formData.full_name.trim()) {
      setError('Full name is required.');
      return;
    }

    setSaving(true);

    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const interestsArray = formData.interests
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim() || null,
        bio: formData.bio.trim() || null,
        skills: skillsArray.length > 0 ? skillsArray : null,
        interests: interestsArray.length > 0 ? interestsArray : null,
        linkedin_url: formData.linkedin_url.trim() || null,
        github_url: formData.github_url.trim() || null,
        public_directory: formData.public_directory,
      })
      .eq('user_id', user.id);

    setSaving(false);

    if (updateError) {
      setError('Could not save your profile. Please try again.');
      return;
    }

    await refreshProfile();
    toast({
      title: 'Profile updated',
      description: 'Your profile has been saved successfully.',
    });
  }

  if (!profile) {
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
          <h1 className="font-display text-2xl font-bold">My Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal information. Some fields are read-only and
            controlled by administrators.
          </p>
        </div>

        {/* Read-only info */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Member ID</p>
            <p className="mt-1 font-mono text-sm font-semibold">
              {membership?.member_id ?? 'Not assigned'}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Membership Status</p>
            <p className="mt-1 text-sm font-semibold">
              {profile.membership_status}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">Role</p>
            <p className="mt-1 text-sm font-semibold">{profile.role}</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-semibold">Editable Information</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="GIS, Python, QGIS"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              <Input
                id="interests"
                placeholder="Earth Observation, AI, Climate"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                placeholder="https://github.com/..."
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">Public Directory</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Allow your name, photo, course, skills, and bio to appear in the
                public member directory. Private information is never shown.
              </p>
            </div>
            <Switch
              checked={formData.public_directory}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, public_directory: checked })
              }
            />
          </div>

          <div className="flex items-center gap-3 border-t border-border pt-5">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
              You can only edit your own profile information.
            </p>
          </div>
        </form>

        {/* Read-only notice */}
        <div className="mt-6 rounded-xl border border-border bg-muted/20 p-5">
          <h3 className="text-sm font-semibold">Fields You Cannot Edit</h3>
          <p className="mt-2 text-xs text-muted-foreground">
            The following fields are managed by administrators and cannot be
            changed from this page: Role, Membership Status, Member ID,
            Administrative permissions, and Approval information.
          </p>
        </div>
      </div>
    </div>
  );
}
