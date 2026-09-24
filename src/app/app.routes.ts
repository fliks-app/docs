import { Routes } from '@angular/router';
import { DOC_ROUTES } from '../generated/routes.generated';

const NOT_FOUND_TITLE = 'Page not found | Fliks docs';

export const routes: Routes = [
  { path: '', title: 'Fliks docs', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  ...DOC_ROUTES,
  { path: '404', title: NOT_FOUND_TITLE, loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound) },
  { path: '**', title: NOT_FOUND_TITLE, loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound) },
];
