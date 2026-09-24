import { afterRenderEffect, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { DocHeading } from '../../../generated/manifest';

@Component({
  selector: 'app-toc',
  imports: [RouterLink],
  templateUrl: './toc.html',
})
export class Toc {
  readonly headings = input<DocHeading[]>([]);
  readonly pageUrl = input.required<string>();

  protected readonly activeId = signal<string | null>(null);

  constructor() {
    afterRenderEffect((onCleanup) => {
      const elements = this.headings()
        .map((h) => document.getElementById(h.id))
        .filter((el): el is HTMLElement => el !== null);
      if (!elements.length) return;

      let frame = 0;
      const update = () => {
        frame = 0;
        // Last heading scrolled past the navbar; the first one until then.
        const passed = elements.filter((el) => el.getBoundingClientRect().top <= 96);
        this.activeId.set((passed.at(-1) ?? elements[0]).id);
      };
      const onScroll = () => (frame ||= requestAnimationFrame(update));
      update();
      addEventListener('scroll', onScroll, { passive: true });
      onCleanup(() => {
        removeEventListener('scroll', onScroll);
        cancelAnimationFrame(frame);
      });
    });
  }
}
