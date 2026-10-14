import { useState } from 'react';
import { KUZA_MAP_NODES } from '@/lib/constants';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { cn } from '@/lib/utils';

export function KuzaMap() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const activeNodeData = KUZA_MAP_NODES.find((n) => n.id === activeNode);

  // Positions around the center in a radial layout
  const positions = [
    { top: '8%', left: '50%' },
    { top: '22%', left: '82%' },
    { top: '50%', left: '92%' },
    { top: '78%', left: '82%' },
    { top: '92%', left: '50%' },
    { top: '78%', left: '18%' },
    { top: '50%', left: '8%' },
    { top: '22%', left: '18%' },
    { top: '50%', left: '50%' },
  ];

  // Only use first 9 positions (center is the last)
  const centerPos = positions[positions.length - 1];

  return (
    <section className="relative border-b border-border bg-secondary/30 py-20 sm:py-24">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Ecosystem"
            title="The KUZA Map"
            description="KUZA TUK sits at the center of a connected ecosystem spanning students, research, industry, government, and more. Explore the network."
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Visualization */}
          <Reveal delay={150} className="lg:col-span-3">
            <div className="relative mx-auto aspect-square max-w-md rounded-xl border border-border bg-card/50 backdrop-blur-sm sm:max-w-lg">
              <div className="absolute inset-0 grid-bg-dense opacity-30 rounded-xl" />

              {/* Connecting lines via SVG */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {positions.slice(0, 8).map((pos, i) => {
                  const cx = parseFloat(centerPos.left);
                  const cy = parseFloat(centerPos.top);
                  const px = parseFloat(pos.left);
                  const py = parseFloat(pos.top);
                  return (
                    <line
                      key={i}
                      x1={cx}
                      y1={cy}
                      x2={px}
                      y2={py}
                      stroke="hsl(var(--primary))"
                      strokeWidth="0.3"
                      strokeOpacity={activeNode === KUZA_MAP_NODES[i].id ? '0.8' : '0.2'}
                      className="transition-opacity duration-300"
                    />
                  );
                })}
              </svg>

              {/* Center node */}
              <button
                type="button"
                onClick={() => setActiveNode(null)}
                className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ top: centerPos.top, left: centerPos.left }}
                aria-label="KUZA TUK center node"
              >
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse-slow rounded-full bg-primary/30 blur-md" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-navy font-display text-xs font-bold text-white shadow-lg">
                    KUZA
                    <br />
                    TUK
                  </div>
                </div>
              </button>

              {/* Surrounding nodes */}
              {KUZA_MAP_NODES.slice(0, 8).map((node, i) => {
                const pos = positions[i];
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setActiveNode(node.id)}
                    className={cn(
                      'absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-all',
                      activeNode === node.id
                        ? 'h-14 w-14 border-accent bg-accent/15 text-accent scale-110 shadow-lg'
                        : 'h-11 w-11 border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary'
                    )}
                    style={{ top: pos.top, left: pos.left }}
                    aria-label={node.label}
                  >
                    <span className="px-1 text-center text-[0.6rem] font-semibold leading-tight">
                      {node.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* Info panel */}
          <Reveal delay={250} className="lg:col-span-2">
            <div className="flex h-full flex-col justify-center rounded-xl border border-border bg-card p-6 sm:p-8">
              {activeNodeData ? (
                <div className="animate-fade-in">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Ecosystem Node
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
                    {activeNodeData.label}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {activeNodeData.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveNode(null)}
                    className="mt-5 text-sm font-medium text-primary hover:text-primary/80"
                  >
                    ← Back to overview
                  </button>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Interactive Network
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
                    A Connected Ecosystem
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    KUZA TUK connects students with research, industry,
                    government, academia, technology, space, innovation, and
                    communities. Click any node to learn more about that part of
                    our ecosystem.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {KUZA_MAP_NODES.slice(0, 8).map((node) => (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setActiveNode(node.id)}
                        className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        {node.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
