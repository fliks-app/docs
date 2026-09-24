import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/theme';
import { setSeo, SITE_URL } from '../../core/seo';
import { FIRST_PLUGINS_PAGE_URL, SECTIONS } from '../../../generated/manifest';

const DESCRIPTION = 'Install, run and extend Fliks, the self-hosted media server.';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class Home {
  private readonly theme = inject(ThemeService);

  protected readonly sections = SECTIONS;
  protected readonly developersUrl = FIRST_PLUGINS_PAGE_URL;
  protected readonly logo = computed(() => (this.theme.isDark() ? 'fliks-logo-ondark.svg' : 'fliks-logo.svg'));

  constructor() {
    setSeo(() => ({
      path: '',
      title: 'Fliks docs',
      description: DESCRIPTION,
      type: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Fliks docs',
        url: SITE_URL,
      },
    }));
  }
}
