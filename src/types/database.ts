export type UserRole = 'SUPER_ADMIN' | 'CHAPTER_ADMIN' | 'EXECUTIVE' | 'MEMBER' | 'ALUMNI';

export type MembershipStatus =
  | 'NONE'
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REJECTED'
  | 'DEACTIVATED';

export type MembershipCategory = 'ACTIVE_STUDENT' | 'ALUMNI' | 'EXECUTIVE' | 'HONORARY';

export type ApplicationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export type PartnershipType =
  | 'Research'
  | 'Training'
  | 'Sponsorship'
  | 'Industry Visit'
  | 'Technology'
  | 'Events'
  | 'Community'
  | 'Other';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: string[] | null;
  interests: string[] | null;
  linkedin_url: string | null;
  github_url: string | null;
  role: UserRole;
  membership_status: MembershipStatus;
  public_directory: boolean;
  created_at: string;
  updated_at: string;
}

export interface MembershipApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  admission_number: string | null;
  course: string | null;
  department: string | null;
  year_of_study: string | null;
  school_faculty: string | null;
  skills: string[] | null;
  areas_of_interest: string[] | null;
  linkedin_url: string | null;
  github_url: string | null;
  profile_photo_url: string | null;
  short_bio: string | null;
  membership_category: MembershipCategory;
  status: ApplicationStatus;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  application_id: string | null;
  member_id: string;
  membership_category: MembershipCategory;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  valid_from: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PartnershipRequest {
  id: string;
  organization: string;
  contact_person: string;
  email: string;
  phone: string | null;
  organization_type: PartnershipType;
  area_of_interest: string | null;
  proposed_collaboration: string | null;
  message: string;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'DECLINED';
  created_at: string;
}

export interface SiteSettings {
  id: string;
  organization_name: string;
  short_name: string;
  tagline: string;
  contact_email: string;
  about_text: string | null;
  vision: string | null;
  mission: string | null;
  footer_text: string;
  social_x_url: string | null;
  social_instagram_url: string | null;
  social_linkedin_url: string | null;
  homepage_stats: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export type EventType = 'WORKSHOP' | 'TRAINING' | 'TALK' | 'HACKATHON' | 'COMMUNITY' | 'OTHER';

export type RegistrationStatus = 'REGISTERED' | 'CANCELLED' | 'ATTENDED' | 'NO_SHOW';

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  event_type: EventType;
  start_date: string;
  end_date: string | null;
  venue: string | null;
  location_url: string | null;
  capacity: number | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  registered_at: string;
  cancelled_at: string | null;
  checked_in_at: string | null;
  checked_in_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistrationWithProfile extends EventRegistration {
  full_name: string | null;
  email: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
