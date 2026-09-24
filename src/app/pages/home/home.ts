import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/theme';
import { FIRST_PLUGINS_PAGE_URL, SECTIONS } from '../../../generated/manifest';

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
}
