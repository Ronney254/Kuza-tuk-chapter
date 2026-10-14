import {
  Satellite,
  Map,
  ScanLine,
  Rocket,
  BrainCircuit,
  Cpu,
  Building2,
  CloudSun,
  FileText,
  Sprout,
  HardHat,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Domain {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Pillar {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
}

export interface CoreValue {
  title: string;
  description: string;
}

export interface Program {
  name: string;
  slug: string;
  description: string;
  objectives: string[];
  category: string;
}

export interface TeamMember {
  name: string;
  position: string;
  section: string;
  bio: string;
  photoUrl: string | null;
  linkedin: string | null;
  email: string | null;
  displayOrder: number;
  active: boolean;
}

export interface SocialLink {
  platform: 'x' | 'instagram' | 'linkedin';
  url: string;
}

export interface SiteConfig {
  organizationName: string;
  shortName: string;
  tagline: string;
  contactEmail: string;
  socialLinks: SocialLink[];
  footerText: string;
}

export const SITE_CONFIG: SiteConfig = {
  organizationName: 'KUZA Technical University of Kenya Chapter',
  shortName: 'KUZA TUK',
  tagline: 'Where Spatial Meets Everything.',
  contactEmail: 'kuzatukchapter@gmail.com',
  socialLinks: [],
  footerText: '© 2026 KUZA TUK. All rights reserved.',
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Programs', href: '/programs' },
  { label: 'Events', href: '/events' },
  { label: 'Projects', href: '/projects' },
  { label: 'Insights', href: '/insights' },
  { label: 'Partners', href: '/partners' },
  { label: 'Team', href: '/team' },
  { label: 'Get Involved', href: '/get-involved' },
  { label: 'Contact', href: '/contact' },
];

export const DOMAINS: Domain[] = [
  {
    icon: Map,
    title: 'GIS & Spatial Intelligence',
    description:
      'Geographic information systems, spatial analysis, and mapping for real-world problem solving.',
  },
  {
    icon: ScanLine,
    title: 'Surveying & Geodesy',
    description:
      'Land measurement, positioning, and geodetic science for accurate spatial data.',
  },
  {
    icon: Satellite,
    title: 'Remote Sensing & Earth Observation',
    description:
      'Satellite and aerial imagery analysis for environmental and developmental insights.',
  },
  {
    icon: Rocket,
    title: 'Space Science & Technology',
    description:
      'Exploring space technology, orbital mechanics, and satellite systems for Africa.',
  },
  {
    icon: BrainCircuit,
    title: 'AI & Data Science',
    description:
      'Machine learning, spatial data science, and AI-driven geospatial solutions.',
  },
  {
    icon: Cpu,
    title: 'Drones & Robotics',
    description:
      'UAV technology, autonomous systems, and robotics for surveying and mapping.',
  },
  {
    icon: Building2,
    title: 'Smart Cities',
    description:
      'Urban informatics, digital twins, and spatial planning for smarter cities.',
  },
  {
    icon: CloudSun,
    title: 'Climate Intelligence',
    description:
      'Climate monitoring, environmental analytics, and sustainability through spatial data.',
  },
  {
    icon: FileText,
    title: 'Land Administration',
    description:
      'Land governance, cadastre, and property management using modern spatial tools.',
  },
  {
    icon: Sprout,
    title: 'AgriTech',
    description:
      'Precision agriculture, crop monitoring, and food security through geospatial technology.',
  },
  {
    icon: HardHat,
    title: 'Built Environment',
    description:
      'Infrastructure, construction, and urban development through spatial planning.',
  },
  {
    icon: Lightbulb,
    title: 'Entrepreneurship & Innovation',
    description:
      'Turning geospatial ideas into ventures, startups, and innovative solutions.',
  },
];

export const PILLARS: Pillar[] = [
  {
    icon: BrainCircuit,
    title: 'LEARN',
    description:
      'Develop practical technical and professional skills through training, workshops, and mentorship.',
  },
  {
    icon: Cpu,
    title: 'BUILD',
    description:
      'Turn ideas into projects, prototypes, and solutions that address real-world challenges.',
  },
  {
    icon: Satellite,
    title: 'RESEARCH',
    description:
      'Explore real-world problems through data, scientific inquiry, and geospatial analysis.',
  },
  {
    icon: Map,
    title: 'CONNECT',
    description:
      'Create relationships with academia, industry, government, and the wider ecosystem.',
  },
  {
    icon: Rocket,
    title: 'LEAD',
    description:
      'Develop the next generation of technical and community leaders in geospatial science.',
  },
];

export const STATS: StatItem[] = [
  { label: 'Members', value: 0, icon: Map },
  { label: 'Events', value: 0, icon: Rocket },
  { label: 'Projects', value: 0, icon: Cpu },
  { label: 'Training Sessions', value: 0, icon: BrainCircuit },
  { label: 'Research Initiatives', value: 0, icon: Satellite },
];

export const CORE_VALUES: CoreValue[] = [
  {
    title: 'Innovation',
    description:
      'We push boundaries and embrace new approaches to geospatial problem-solving.',
  },
  {
    title: 'Collaboration',
    description:
      'We believe the best solutions emerge from working together across disciplines.',
  },
  {
    title: 'Integrity',
    description:
      'We uphold honesty, transparency, and ethical practice in everything we do.',
  },
  {
    title: 'Curiosity',
    description:
      'We foster a culture of questioning, exploring, and continuous discovery.',
  },
  {
    title: 'Impact',
    description:
      'We measure our success by the real-world difference we create in our communities.',
  },
  {
    title: 'Leadership',
    description:
      'We develop leaders who inspire, guide, and empower others in the geospatial field.',
  },
  {
    title: 'Continuous Learning',
    description:
      'We commit to lifelong growth, skill development, and knowledge sharing.',
  },
  {
    title: 'African Solutions',
    description:
      'We believe in developing solutions rooted in African contexts and needs.',
  },
];

export const PROGRAMS: Program[] = [
  {
    name: 'KUZA Academy',
    slug: 'kuza-academy',
    description:
      'Structured training and skills development in geospatial science, surveying, GIS, remote sensing, and related technologies.',
    objectives: [
      'Equip students with practical technical skills',
      'Provide industry-relevant training and certifications',
      'Bridge the gap between academic theory and real-world application',
    ],
    category: 'Training',
  },
  {
    name: 'KUZA Research',
    slug: 'kuza-research',
    description:
      'A research community advancing geospatial science, earth observation, and spatial data innovation for African challenges.',
    objectives: [
      'Support student-led research projects',
      'Publish insights and findings',
      'Connect students with research opportunities',
    ],
    category: 'Research',
  },
  {
    name: 'KUZA Innovation',
    slug: 'kuza-innovation',
    description:
      'An innovation platform for building geospatial solutions, prototypes, and technology ventures.',
    objectives: [
      'Support project development and prototyping',
      'Foster entrepreneurship in geospatial technology',
      'Build solutions for real-world problems',
    ],
    category: 'Innovation',
  },
  {
    name: 'KUZA Industry',
    slug: 'kuza-industry',
    description:
      'A bridge between students and the geospatial industry through partnerships, internships, and professional development.',
    objectives: [
      'Create industry connections and opportunities',
      'Facilitate mentorship and professional guidance',
      'Organize industry visits and engagements',
    ],
    category: 'Industry',
  },
  {
    name: 'KUZA Space',
    slug: 'kuza-space',
    description:
      'A space science and technology program exploring satellites, orbital systems, and space technology for Africa.',
    objectives: [
      'Introduce students to space science and technology',
      'Support space-related projects and research',
      'Connect with the broader African space community',
    ],
    category: 'Space',
  },
  {
    name: 'KUZA Community',
    slug: 'kuza-community',
    description:
      'Community mapping, outreach, and engagement programs that apply geospatial skills to local needs.',
    objectives: [
      'Apply geospatial skills to community challenges',
      'Organize mapping drives and outreach events',
      'Build a vibrant student community',
    ],
    category: 'Community',
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Ronney Ochieng',
    position: 'Chairperson — KUZA TUK Chapter',
    section: 'Chairperson',
    bio: 'Leading KUZA TUK as a student-led geospatial and innovation ecosystem at the Technical University of Kenya.',
    photoUrl: null,
    linkedin: null,
    email: null,
    displayOrder: 1,
    active: true,
  },
];

export const TEAM_SECTIONS = [
  'Chairperson',
  'Board',
  'Executive Committee',
  'Program Leads',
  'Technical Team',
  'Communications Team',
  'Research Team',
] as const;

export const MEMBERSHIP_JOURNEY = [
  {
    step: 1,
    title: 'Create Account',
    description: 'Sign up with your email and create your KUZA TUK account.',
  },
  {
    step: 2,
    title: 'Complete Application',
    description:
      'Fill out the membership application with your academic and skills information.',
  },
  {
    step: 3,
    title: 'Application Reviewed',
    description:
      'The KUZA leadership team reviews your application and qualifications.',
  },
  {
    step: 4,
    title: 'Approval',
    description: 'Once approved, your membership is activated in the system.',
  },
  {
    step: 5,
    title: 'Receive Member ID',
    description:
      'Get your unique KUZA member ID and digital membership card.',
  },
  {
    step: 6,
    title: 'Access Dashboard',
    description:
      'Unlock your member dashboard with events, training, projects, and more.',
  },
];

export const KUZA_MAP_NODES = [
  { id: 'students', label: 'Students', description: 'The heart of KUZA — students passionate about geospatial science and technology.' },
  { id: 'research', label: 'Research', description: 'Research initiatives exploring real-world problems through data and spatial analysis.' },
  { id: 'industry', label: 'Industry', description: 'Partnerships and connections with geospatial industry leaders and companies.' },
  { id: 'government', label: 'Government', description: 'Engagement with government agencies on spatial data and national development.' },
  { id: 'academia', label: 'Academia', description: 'Academic collaborations with universities, research institutions, and educators.' },
  { id: 'technology', label: 'Technology', description: 'Technology and innovation driving geospatial solutions and tools.' },
  { id: 'space', label: 'Space', description: 'Space science and satellite technology for Earth observation and beyond.' },
  { id: 'innovation', label: 'Innovation', description: 'Innovation hub for building solutions, prototypes, and ventures.' },
  { id: 'communities', label: 'Communities', description: 'Community mapping and outreach applying geospatial skills locally.' },
];
