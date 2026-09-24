import { Location } from '@angular/common';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
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
  readonly loadContent = input.required<() => Promise<string>>();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly container = viewChild<ElementRef<HTMLElement>>('container');
  protected readonly html = signal<string | null>(null);
  protected readonly safeHtml = computed(() => {
    const value = this.html();
    return value === null ? null : this.sanitizer.bypassSecurityTrustHtml(value);
  });
  protected readonly meta = computed(() => PAGES_BY_URL[this.pageUrl()] ?? null);

  constructor() {
    afterRenderEffect(() => {
      const value = this.safeHtml();
      const el = this.container()?.nativeElement;
      if (!value || !el) return;
      const cleanup = wireDocContent(el, this.router, this.location);
      this.destroyRef.onDestroy(cleanup);
    });
  }

  async ngOnInit(): Promise<void> {
    const meta = this.meta();
    if (meta) {
      this.titleService.setTitle(`${meta.title} | Fliks docs`);
      this.metaService.updateTag({ name: 'description', content: meta.description || '' });
    }
    const raw = await this.loadContent()();
    this.html.set(raw);
  }
}
