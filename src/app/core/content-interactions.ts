import { Location } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Wires up a rendered doc page's raw HTML: internal links navigate through the
 * router (with the base href applied for the visible href), and code-block copy
 * buttons copy their sibling <code>'s text. Returns a cleanup function.
 */
export function wireDocContent(container: HTMLElement, router: Router, location: Location): () => void {
  container.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((a) => {
    const path = a.getAttribute('href')!;
    a.dataset['path'] = path;
    a.setAttribute('href', location.prepareExternalUrl(path));
  });

  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    const link = target.closest<HTMLAnchorElement>('a[data-path]');
    if (link && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      void router.navigateByUrl(link.dataset['path']!);
      return;
    }

    const copyBtn = target.closest<HTMLElement>('.copy-btn');
    if (copyBtn) {
      const code = copyBtn.closest('.code-block')?.querySelector('code');
      if (code && navigator.clipboard) {
        navigator.clipboard.writeText(code.textContent ?? '').catch(() => {});
        copyBtn.classList.add('copied');
        setTimeout(() => copyBtn.classList.remove('copied'), 1500);
      }
    }
  };

  container.addEventListener('click', onClick);
  return () => container.removeEventListener('click', onClick);
}
