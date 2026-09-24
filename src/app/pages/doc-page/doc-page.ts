import { Location } from '@angular/common';
import { DomSanitizer, Meta } from '@angular/platform-browser';
import { Component, ElementRef, afterRenderEffect, computed, effect, inject, input, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { wireDocContent } from '../../core/content-interactions';
import { Toc } from '../../layout/toc/toc';
import { PAGES_BY_URL } from '../../../generated/manifest';

@Component({
  selector: 'app-doc-page',
  imports: [RouterLink, Toc],
  templateUrl: './doc-page.html',
})
export class DocPage {
  readonly pageUrl = input.required<string>();
  readonly html = input.required<string>();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly container = viewChild<ElementRef<HTMLElement>>('container');
  protected readonly meta = computed(() => PAGES_BY_URL[this.pageUrl()] ?? null);
  // Content paths are root-absolute without the base href; prefix them here so the prerendered HTML is right too.
  protected readonly safeHtml = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      this.html().replace(
        /(href|src)="(\/(?!\/)[^"]*)"/g,
        (_, attr: string, path: string) =>
          `${attr}="${this.location.prepareExternalUrl(path)}"` + (attr === 'href' ? ` data-path="${path}"` : ''),
      ),
    ),
  );

  constructor() {
    const metaTags = inject(Meta);
    effect(() => metaTags.updateTag({ name: 'description', content: this.meta()?.description ?? '' }));
    afterRenderEffect((onCleanup) => {
      this.safeHtml();
      const el = this.container()?.nativeElement;
      if (el) onCleanup(wireDocContent(el, this.router));
    });
  }
}
