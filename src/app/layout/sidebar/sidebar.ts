import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { LucideChevronRight } from '@lucide/angular';
import { DocSection, SECTIONS } from '../../../generated/manifest';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, LucideChevronRight],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly router = inject(Router);

  protected readonly sections = SECTIONS;
  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected sectionsInGroup(group: string): DocSection[] {
    return this.sections.filter((s) => s.group === group);
  }

  protected isCurrentSection(section: DocSection): boolean {
    return section.pages.some((p) => p.url === this.currentUrl());
  }
}
