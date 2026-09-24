import { effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta } from '@angular/platform-browser';

export const SITE_URL = 'https://fliks-app.github.io/docs/';
const OG_IMAGE = { url: `${SITE_URL}og-image.png`, width: 1200, height: 630, alt: 'Fliks documentation' };

export interface SeoData {
  /** Route path segment with a trailing slash, no leading slash; '' for the home page. */
  path: string;
  title: string;
  description: string;
  type: 'website' | 'article';
  jsonLd: Record<string, unknown>;
}

function upsertCanonical(doc: Document, href: string): void {
  let link = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    doc.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLd(doc: Document, data: Record<string, unknown>): void {
  let script = doc.getElementById('seo-jsonld') as HTMLScriptElement | null;
  if (!script) {
    script = doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'seo-jsonld';
    doc.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

/** Canonical link, Open Graph, Twitter card and JSON-LD for the current page. Call from a component constructor. */
export function setSeo(factory: () => SeoData | null): void {
  const meta = inject(Meta);
  const doc = inject(DOCUMENT);

  effect(() => {
    const d = factory();
    if (!d) return;
    const url = `${SITE_URL}${d.path}`;

    meta.updateTag({ name: 'description', content: d.description });
    upsertCanonical(doc, url);

    meta.updateTag({ property: 'og:type', content: d.type });
    meta.updateTag({ property: 'og:site_name', content: 'Fliks docs' });
    meta.updateTag({ property: 'og:title', content: d.title });
    meta.updateTag({ property: 'og:description', content: d.description });
    meta.updateTag({ property: 'og:url', content: url });
    meta.updateTag({ property: 'og:image', content: OG_IMAGE.url });
    meta.updateTag({ property: 'og:image:width', content: String(OG_IMAGE.width) });
    meta.updateTag({ property: 'og:image:height', content: String(OG_IMAGE.height) });
    meta.updateTag({ property: 'og:image:alt', content: OG_IMAGE.alt });
    meta.updateTag({ property: 'og:locale', content: 'en_US' });

    meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    meta.updateTag({ name: 'twitter:title', content: d.title });
    meta.updateTag({ name: 'twitter:description', content: d.description });
    meta.updateTag({ name: 'twitter:image', content: OG_IMAGE.url });
    meta.updateTag({ name: 'twitter:image:alt', content: OG_IMAGE.alt });

    upsertJsonLd(doc, d.jsonLd);
  });
}
