import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { LucideChevronRight } from '@lucide/angular';
import { DocSection, SECTIONS } from '../../../generated/manifest';

const pathOf = (url: string) => url.split(/[?#]/)[0];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, LucideChevronRight],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly router = inject(Router);

  protected readonly groups = [
    { label: 'Documentation', sections: SECTIONS.filter((s) => s.group === 'user') },
    { label: 'Developers', sections: SECTIONS.filter((s) => s.group === 'dev') },
  ].filter((g) => g.sections.length);

  protected readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => pathOf(e.urlAfterRedirects)),
    ),
    { initialValue: pathOf(this.router.url) },
  );

  protected isCurrentSection(section: DocSection): boolean {
    return section.pages.some((p) => p.url === this.currentPath());
  }
}
