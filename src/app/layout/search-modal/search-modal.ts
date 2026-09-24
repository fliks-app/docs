import { Component, ElementRef, afterRenderEffect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LucideSearch, LucideX } from '@lucide/angular';
import { SearchOverlayService } from '../../core/search-overlay';
import { SearchService } from '../../core/search';
import type { SearchEntry } from '../../../generated/search-index';

@Component({
  selector: 'app-search-modal',
  imports: [LucideSearch, LucideX],
  templateUrl: './search-modal.html',
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class SearchModal {
  protected readonly overlay = inject(SearchOverlayService);
  private readonly search = inject(SearchService);
  private readonly router = inject(Router);

  protected readonly query = signal('');
  protected readonly results = signal<SearchEntry[]>([]);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');
  private requestId = 0;

  constructor() {
    afterRenderEffect(() => {
      if (this.overlay.isOpen()) {
        this.input()?.nativeElement.focus();
      }
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const isModK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
    if (isModK) {
      event.preventDefault();
      this.overlay.toggle();
      return;
    }
    if (event.key === 'Escape' && this.overlay.isOpen()) {
      this.overlay.close();
    }
  }

  protected async onInput(value: string): Promise<void> {
    this.query.set(value);
    const id = ++this.requestId;
    const results = await this.search.search(value);
    if (id === this.requestId) this.results.set(results);
  }

  protected go(url: string): void {
    this.overlay.close();
    this.query.set('');
    this.results.set([]);
    void this.router.navigateByUrl(url);
  }
}
