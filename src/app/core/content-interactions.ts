import { Router } from '@angular/router';

/** Routes internal links in rendered doc HTML through the router and wires copy buttons and step sliders. */
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

    const stepBtn = target.closest<HTMLElement>('.doc-steps-prev, .doc-steps-next');
    const track = stepBtn?.closest('.doc-steps')?.querySelector<HTMLElement>('.doc-steps-track');
    if (stepBtn && track) {
      const dir = stepBtn.classList.contains('doc-steps-next') ? 1 : -1;
      track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' });
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

  // scroll doesn't bubble: capture it to keep each slider's counter and buttons in step.
  const onScroll = (event: Event) => {
    const track = event.target as HTMLElement;
    const nav = track.classList?.contains('doc-steps-track') && track.nextElementSibling;
    if (!nav) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    const last = track.children.length - 1;
    nav.querySelector('.doc-steps-pos')!.textContent = `${index + 1} / ${last + 1}`;
    nav.querySelector<HTMLButtonElement>('.doc-steps-prev')!.disabled = index === 0;
    nav.querySelector<HTMLButtonElement>('.doc-steps-next')!.disabled = index === last;
  };

  container.addEventListener('click', onClick);
  container.addEventListener('scroll', onScroll, true);
  return () => {
    container.removeEventListener('click', onClick);
    container.removeEventListener('scroll', onScroll, true);
  };
}
