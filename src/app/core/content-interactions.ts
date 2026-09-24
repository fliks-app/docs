import { Router } from '@angular/router';

/** Routes internal links in rendered doc HTML through the router and wires code-block copy buttons. */
export function wireDocContent(container: HTMLElement, router: Router): () => void {
  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    const link = target.closest<HTMLAnchorElement>('a[data-path]');
    if (link) {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      void router.navigateByUrl(link.dataset['path']!);
      return;
    }

    const copyBtn = target.closest<HTMLElement>('.copy-btn');
    const code = copyBtn?.closest('.code-block')?.querySelector('code');
    if (copyBtn && code && navigator.clipboard) {
      const label = copyBtn.querySelector('.copy-btn-label')!;
      navigator.clipboard.writeText(code.textContent ?? '').then(() => {
        label.textContent = 'Copied';
        setTimeout(() => (label.textContent = 'Copy'), 1500);
      }, () => {});
    }
  };

  container.addEventListener('click', onClick);
  return () => container.removeEventListener('click', onClick);
}
