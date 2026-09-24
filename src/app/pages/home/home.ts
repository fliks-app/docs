import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/theme';
import { SECTIONS } from '../../../generated/manifest';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class Home {
  private readonly theme = inject(ThemeService);

  protected readonly sections = SECTIONS.filter((s) => s.pages.length > 0);
  protected readonly logo = computed(() => (this.theme.isDark() ? 'fliks-logo-ondark.svg' : 'fliks-logo.svg'));
}
