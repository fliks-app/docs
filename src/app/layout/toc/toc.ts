import { afterRenderEffect, Component, input, signal } from '@angular/core';
import type { DocHeading } from '../../../generated/manifest';

@Component({
  selector: 'app-toc',
  templateUrl: './toc.html',
})
export class Toc {
  readonly headings = input<DocHeading[]>([]);

  protected readonly activeId = signal<string | null>(null);
  private observer?: IntersectionObserver;

  constructor() {
    afterRenderEffect(() => {
      this.observer?.disconnect();
      this.observer = undefined;

      const heads = this.headings();
      if (!heads.length || typeof IntersectionObserver === 'undefined') return;

      const elements = heads
        .map((h) => document.getElementById(h.id))
        .filter((el): el is HTMLElement => el !== null);
      if (!elements.length) return;

      this.observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]) this.activeId.set(visible[0].target.id);
        },
        { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
      );
      elements.forEach((el) => this.observer!.observe(el));
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
