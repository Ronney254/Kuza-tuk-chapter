import { useEffect, useState, type FormEvent } from 'react';
import { Save, Loader2, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSeo } from '@/lib/seo';
import { supabase } from '@/integrations/supabase/client';
import type { SiteSettings } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  useSeo({
    title: 'Admin — Settings',
    description: 'Manage KUZA TUK site settings.',
    path: '/admin/settings',
  });

  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    organization_name: '',
    short_name: '',
    tagline: '',
    contact_email: '',
    about_text: '',
    vision: '',
    mission: '',
    footer_text: '',
    social_x_url: '',
    social_instagram_url: '',
    social_linkedin_url: '',
    homepage_stats: {},
  });

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        if (data) {
          const s = data as SiteSettings;
          setSettings(s);
          setFormData({
            organization_name: s.organization_name,
            short_name: s.short_name,
            tagline: s.tagline,
            contact_email: s.contact_email,
            about_text: s.about_text ?? '',
            vision: s.vision ?? '',
            mission: s.mission ?? '',
            footer_text: s.footer_text,
            social_x_url: s.social_x_url ?? '',
            social_instagram_url: s.social_instagram_url ?? '',
            social_linkedin_url: s.social_linkedin_url ?? '',
            homepage_stats: s.homepage_stats && typeof s.homepage_stats === 'object'
              ? s.homepage_stats
              : {},
          });
        }
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!settings) return;

    setSaving(true);

    const homepageStats = formData.homepage_stats && typeof formData.homepage_stats === 'object'
      ? JSON.parse(JSON.stringify(formData.homepage_stats))
      : {};

    const { data: updatedSettings, error: updateError } = await supabase
      .from('site_settings')
      .update({
        organization_name: formData.organization_name.trim(),
        short_name: formData.short_name.trim(),
        tagline: formData.tagline.trim(),
        contact_email: formData.contact_email.trim(),
        about_text: formData.about_text.trim() || null,
        vision: formData.vision.trim() || null,
        mission: formData.mission.trim() || null,
        footer_text: formData.footer_text.trim(),
        social_x_url: formData.social_x_url.trim() || null,
        social_instagram_url: formData.social_instagram_url.trim() || null,
        social_linkedin_url: formData.social_linkedin_url.trim() || null,
        homepage_stats: homepageStats,
      })
      .eq('id', settings.id)
      .select('*')
      .maybeSingle();

    setSaving(false);

    if (updateError || !updatedSettings) {
      setError('Could not save settings. Please try again.');
      return;
    }

    setSettings(updatedSettings as SiteSettings);
    setFormData((current) => ({
      ...current,
      homepage_stats: (updatedSettings as SiteSettings).homepage_stats ?? {},
    }));

    toast({
      title: 'Settings saved',
      description: 'Site settings have been updated successfully.',
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 pt-16">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Site Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your KUZA TUK website content. Changes here update the site
            without requiring code changes.
          </p>
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
              <Settings className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-semibold">Organization</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organization_name">Organization Name</Label>
              <Input
                id="organization_name"
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short_name">Short Name</Label>
              <Input
                id="short_name"
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_text">Footer Text</Label>
            <Input
              id="footer_text"
              value={formData.footer_text}
              onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 border-b border-border pb-4 pt-2">
            <h2 className="font-display text-lg font-semibold">Content</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="about_text">About Text</Label>
            <Textarea
              id="about_text"
              rows={3}
              value={formData.about_text}
              onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vision">Vision</Label>
            <Textarea
              id="vision"
              rows={2}
              value={formData.vision}
              onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission">Mission</Label>
            <Textarea
              id="mission"
              rows={2}
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 border-b border-border pb-4 pt-2">
            <h2 className="font-display text-lg font-semibold">Social Links</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="social_x_url">X (Twitter) URL</Label>
              <Input
                id="social_x_url"
                placeholder="https://x.com/..."
                value={formData.social_x_url}
                onChange={(e) => setFormData({ ...formData, social_x_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_instagram_url">Instagram URL</Label>
              <Input
                id="social_instagram_url"
                placeholder="https://instagram.com/..."
                value={formData.social_instagram_url}
                onChange={(e) => setFormData({ ...formData, social_instagram_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_linkedin_url">LinkedIn URL</Label>
              <Input
                id="social_linkedin_url"
                placeholder="https://linkedin.com/..."
                value={formData.social_linkedin_url}
                onChange={(e) => setFormData({ ...formData, social_linkedin_url: e.target.value })}
              />
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
              Leave a field blank to hide that social icon from the site.
            </p>
          </div>

          <div className="flex items-center border-t border-border pt-5">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
