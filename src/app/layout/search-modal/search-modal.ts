import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LucideCornerDownLeft, LucideSearch } from '@lucide/angular';
import { SearchOverlayService } from '../../core/search-overlay';
import { SearchService } from '../../core/search';
import type { SearchEntry } from '../../../generated/search-index';

@Component({
  selector: 'app-search-modal',
  imports: [LucideSearch, LucideCornerDownLeft],
  templateUrl: './search-modal.html',
  host: {
    '(document:keydown)': 'onGlobalKeydown($event)',
  },
})
export class SearchModal {
  protected readonly overlay = inject(SearchOverlayService);
  private readonly search = inject(SearchService);
  private readonly router = inject(Router);

  protected readonly query = signal('');
  protected readonly results = signal<SearchEntry[]>([]);
  protected readonly active = signal(0);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');
  private requestId = 0;

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.overlay.isOpen() && !dialog.open) {
        dialog.showModal();
        this.input().nativeElement.select();
      }
      if (!this.overlay.isOpen() && dialog.open) dialog.close();
    });
  }

  protected onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.overlay.toggle();
    }
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    const count = this.results().length;
    if (!count) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.active.update((i) => (i + (event.key === 'ArrowDown' ? 1 : count - 1)) % count);
      this.list()?.nativeElement.children[this.active()]?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.go(this.results()[this.active()].url);
    }
  }

  protected async onInput(value: string): Promise<void> {
    this.query.set(value);
    const id = ++this.requestId;
    const results = await this.search.search(value);
    if (id !== this.requestId) return;
    this.results.set(results);
    this.active.set(0);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.overlay.close();
  }

  protected go(url: string): void {
    this.overlay.close();
    void this.router.navigateByUrl(url);
  }
}
