import { Injectable } from '@angular/core';
import type { SearchEntry } from '../../generated/search-index';

/** Loaded lazily (only when the search modal first opens) to keep it out of the main bundle. */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private index: SearchEntry[] | null = null;

  private async load(): Promise<SearchEntry[]> {
    if (!this.index) {
      const mod = await import('../../generated/search-index');
      this.index = mod.SEARCH_INDEX;
    }
    return this.index;
  }

  async search(query: string): Promise<SearchEntry[]> {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];

    const index = await this.load();
    const scored: { entry: SearchEntry; score: number }[] = [];
    for (const entry of index) {
      const titleLc = entry.title.toLowerCase();
      const textLc = entry.text.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (titleLc.includes(term)) score += 5;
        if (textLc.includes(term)) score += 1;
      }
      if (score > 0) scored.push({ entry, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 20).map((r) => r.entry);
  }
}
