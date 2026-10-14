export interface SeoOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}

const BASE_TITLE = 'KUZA TUK | Geospatial Science, Technology & Innovation';
const DEFAULT_DESCRIPTION =
  'KUZA TUK is a student-led geospatial, surveying, space science, technology and innovation ecosystem at the Technical University of Kenya.';

export function useSeo(options: SeoOptions): void {
  const title = options.title ? `${options.title} | KUZA TUK` : BASE_TITLE;
  const description = options.description || DEFAULT_DESCRIPTION;

  document.title = title;

  setMetaTag('description', description);
  setMetaTag('og:title', title, true);
  setMetaTag('og:description', description, true);
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', description);

  if (options.path) {
    const canonical = `${window.location.origin}${options.path}`;
    setMetaTag('og:url', canonical, true);
    setLinkTag('canonical', canonical);
  }
}

function setMetaTag(name: string, content: string, isProperty = false): void {
  const attr = isProperty ? 'property' : 'name';
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string): void {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}
