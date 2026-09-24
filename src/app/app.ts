import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ViewportScroller } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Navbar } from './layout/navbar/navbar';
import { Sidebar } from './layout/sidebar/sidebar';
import { SearchModal } from './layout/search-modal/search-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Sidebar, SearchModal],
  templateUrl: './app.html',
})
export class App {
  private readonly drawerToggle = viewChild<ElementRef<HTMLInputElement>>('drawerToggle');

  constructor() {
    // Keeps router-driven anchor scrolls clear of the sticky navbar (matches scroll-padding-top).
    inject(ViewportScroller).setOffset([0, 80]);
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        const toggle = this.drawerToggle()?.nativeElement;
        if (toggle) toggle.checked = false;
      });
  }
}
