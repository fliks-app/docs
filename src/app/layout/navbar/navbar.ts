import { Component, DOCUMENT, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideMenu, LucideMoon, LucideSearch, LucideSun } from '@lucide/angular';
import { ThemeService } from '../../core/theme';
import { SearchOverlayService } from '../../core/search-overlay';
import { FIRST_PLUGINS_PAGE_URL, FIRST_SECTION_PAGE_URL } from '../../../generated/manifest';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, LucideMenu, LucideMoon, LucideSearch, LucideSun],
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly theme = inject(ThemeService);
  protected readonly searchOverlay = inject(SearchOverlayService);
  private readonly document = inject(DOCUMENT);

  protected readonly userGuideUrl = FIRST_SECTION_PAGE_URL;
  protected readonly developersUrl = FIRST_PLUGINS_PAGE_URL;

  protected openDrawer(): void {
    this.document.getElementById('docs-drawer')?.click();
  }

  protected readonly logo = computed(() =>
    this.theme.isDark() ? 'fliks-logo-ondark.svg' : 'fliks-logo.svg',
  );
}
