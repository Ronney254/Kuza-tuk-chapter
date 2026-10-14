import { useSeo } from '@/lib/seo';
import { Hero } from '@/components/home/Hero';
import { AtAGlance } from '@/components/home/AtAGlance';
import { Domains } from '@/components/home/Domains';
import { WhatWeDo } from '@/components/home/WhatWeDo';
import { HomeEvents } from '@/components/home/HomeEvents';
import { KuzaMap } from '@/components/home/KuzaMap';
import { HomeCTA } from '@/components/home/HomeCTA';

export default function HomePage() {
  useSeo({
    path: '/',
    description:
      'KUZA TUK is a student-led geospatial, surveying, space science, technology and innovation ecosystem at the Technical University of Kenya.',
  });

  return (
    <>
      <Hero />
      <AtAGlance />
      <Domains />
      <WhatWeDo />
      <HomeEvents />
      <KuzaMap />
      <HomeCTA />
    </>
  );
}
