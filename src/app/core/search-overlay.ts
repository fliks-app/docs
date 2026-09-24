import { Injectable, signal } from '@angular/core';

/** Shared open/close state so the navbar button, the Ctrl/Cmd+K shortcut and the modal agree. */
@Injectable({ providedIn: 'root' })
export class SearchOverlayService {
  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }
}
