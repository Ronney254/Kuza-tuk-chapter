import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { MembershipCategory } from '@/types/database';

const YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Postgraduate'];

const CATEGORY_OPTIONS: { value: MembershipCategory; label: string }[] = [
  { value: 'ACTIVE_STUDENT', label: 'Active Student' },
  { value: 'ALUMNI', label: 'Alumni' },
  { value: 'EXECUTIVE', label: 'Executive' },
  { value: 'HONORARY', label: 'Honorary / Other' },
];

export default function ApplyPage() {
  useSeo({
    title: 'Membership Application',
    description: 'Complete your KUZA TUK membership application.',
    path: '/apply',
  });

  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingApplication, setExistingApplication] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name ?? '',
    email: user?.email ?? '',
    phone: '',
    admission_number: '',
    course: '',
    department: '',
    year_of_study: '',
    school_faculty: '',
    skills: '',
    areas_of_interest: '',
    linkedin_url: '',
    github_url: '',
    short_bio: '',
    membership_category: 'ACTIVE_STUDENT' as MembershipCategory,
  });

  // Check for existing application
  useState(() => {
    if (user) {
      supabase
        .from('membership_applications')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setExistingApplication(true);
          }
        });
    }
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to submit an application.');
      return;
    }

    if (!formData.full_name.trim() || !formData.email.trim()) {
      setError('Full name and email are required.');
      return;
    }

    setLoading(true);

    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const interestsArray = formData.areas_of_interest
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const { error: insertError } = await supabase
      .from('membership_applications')
      .insert({
        user_id: user.id,
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        admission_number: formData.admission_number.trim() || null,
        course: formData.course.trim() || null,
        department: formData.department.trim() || null,
        year_of_study: formData.year_of_study || null,
        school_faculty: formData.school_faculty.trim() || null,
        skills: skillsArray.length > 0 ? skillsArray : null,
        areas_of_interest: interestsArray.length > 0 ? interestsArray : null,
        linkedin_url: formData.linkedin_url.trim() || null,
        github_url: formData.github_url.trim() || null,
        short_bio: formData.short_bio.trim() || null,
        membership_category: formData.membership_category,
        status: 'PENDING',
      });

    setLoading(false);

    if (insertError) {
      if (insertError.code === '23505') {
        setError('You have already submitted a membership application.');
        setExistingApplication(true);
      } else {
        setError(insertError.message);
      }
      return;
    }

    // Update profile membership status to PENDING
    await supabase
      .from('profiles')
      .update({ membership_status: 'PENDING' })
      .eq('user_id', user.id);

    toast({
      title: 'Application submitted!',
      description: 'Your membership application has been submitted for review.',
    });

    navigate('/dashboard');
  }

  if (existingApplication) {
    return (
      <>
        <PageHero
          eyebrow="Membership"
          title="Application Already Submitted"
          description="You have already submitted a membership application. It is currently being reviewed by the KUZA TUK leadership team."
        />
        <section className="bg-background py-16 sm:py-24">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold">Application Pending Review</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your membership application has been submitted and is awaiting
              review. You'll be notified once a decision is made.
            </p>
            <Button className="mt-6" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Membership"
        title="Membership Application"
        description="Complete your membership application to join the KUZA TUK community. Please provide accurate information — this will be reviewed by our leadership team."
      />

      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Application Form</h2>
                <p className="text-sm text-muted-foreground">
                  All fields marked with * are required.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="border-b border-border pb-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+254..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admission_number">Admission Number</Label>
                    <Input
                      id="admission_number"
                      value={formData.admission_number}
                      onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="border-b border-border pb-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Input
                      id="course"
                      placeholder="e.g. Geospatial Engineering"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="year_of_study">Year of Study</Label>
                    <Select
                      value={formData.year_of_study}
                      onValueChange={(v) => setFormData({ ...formData, year_of_study: v })}
                    >
                      <SelectTrigger id="year_of_study">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school_faculty">School / Faculty</Label>
                    <Input
                      id="school_faculty"
                      value={formData.school_faculty}
                      onChange={(e) => setFormData({ ...formData, school_faculty: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Skills & Interests */}
              <div className="space-y-4">
                <h3 className="border-b border-border pb-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Skills & Interests
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    placeholder="e.g. GIS, Python, Remote Sensing, QGIS"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areas_of_interest">Areas of Interest (comma-separated)</Label>
                  <Input
                    id="areas_of_interest"
                    placeholder="e.g. Earth Observation, AI, Drones, Climate"
                    value={formData.areas_of_interest}
                    onChange={(e) => setFormData({ ...formData, areas_of_interest: e.target.value })}
                  />
                </div>
              </div>

              {/* Online Presence */}
              <div className="space-y-4">
                <h3 className="border-b border-border pb-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Online Presence
                </h3>
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
              </div>

              {/* Bio & Category */}
              <div className="space-y-4">
                <h3 className="border-b border-border pb-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  About You
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="short_bio">Short Bio</Label>
                  <Textarea
                    id="short_bio"
                    rows={4}
                    placeholder="Tell us a bit about yourself and why you want to join KUZA..."
                    value={formData.short_bio}
                    onChange={(e) => setFormData({ ...formData, short_bio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="membership_category">Membership Category</Label>
                  <Select
                    value={formData.membership_category}
                    onValueChange={(v) => setFormData({ ...formData, membership_category: v as MembershipCategory })}
                  >
                    <SelectTrigger id="membership_category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      Submit Application
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Your application will be reviewed by the KUZA TUK leadership
                  team. You'll be notified once a decision is made.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
