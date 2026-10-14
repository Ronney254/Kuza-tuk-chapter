import { User, Mail, Linkedin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSeo } from '@/lib/seo';
import { PageHero } from '@/components/shared/PageHero';
import { Reveal } from '@/components/shared/Reveal';
import { TEAM_MEMBERS, TEAM_SECTIONS } from '@/lib/constants';

export default function TeamPage() {
  useSeo({
    title: 'Team',
    description:
      'Meet the leadership of KUZA TUK. Our team of student leaders driving geospatial science, technology, and innovation at the Technical University of Kenya.',
    path: '/team',
  });

  return (
    <>
      <PageHero
        eyebrow="Team"
        title="KUZA Leadership"
        description="The team leading KUZA TUK. Our leadership will grow as more members join and take on roles within the organization."
      />

      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Team sections */}
          {TEAM_SECTIONS.map((section) => {
            const members = TEAM_MEMBERS.filter(
              (m) => m.section === section && m.active
            );

            return (
              <div key={section} className="mb-16 last:mb-0">
                <h2 className="font-display text-xl font-bold">{section}</h2>
                <div className="mt-1 h-px w-full bg-border" />

                {members.length > 0 ? (
                  <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {members.map((member, index) => (
                      <Reveal key={member.name} delay={index * 100}>
                        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                              {member.photoUrl ? (
                                <img
                                  src={member.photoUrl}
                                  alt={member.name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-7 w-7" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-display text-base font-semibold">
                                {member.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {member.position}
                              </p>
                            </div>
                          </div>

                          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            {member.bio}
                          </p>

                          <div className="mt-5 flex items-center gap-3">
                            {member.linkedin && (
                              <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                                aria-label={`${member.name} on LinkedIn`}
                              >
                                <Linkedin className="h-4 w-4" />
                              </a>
                            )}
                            {member.email && (
                              <a
                                href={`mailto:${member.email}`}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                                aria-label={`Email ${member.name}`}
                              >
                                <Mail className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      No members in this section yet. The team will be added
                      through the admin dashboard.
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Join the team CTA */}
          <div className="mt-12 rounded-xl border border-border bg-navy p-8 text-center text-navy-foreground">
            <h2 className="font-display text-xl font-bold">
              Want to Join the Leadership?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/60">
              KUZA TUK is always looking for passionate students to take on
              leadership roles. Join our community and grow as a leader.
            </p>
            <Link
              to="/join"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Join KUZA
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
