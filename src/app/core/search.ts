import { Injectable } from '@angular/core';
import MiniSearch from 'minisearch';
import type { SearchEntry } from '../../generated/search-index';

export interface SearchResult extends SearchEntry {
  excerpt: string;
}

// Readers ask in their own words, often in French: map those to the words the pages use.
const SYNONYMS: Record<string, string[]> = {
  late: ['sync', 'timing'], early: ['sync', 'timing'], offset: ['sync', 'timing'], delay: ['sync', 'timing'],
  lag: ['buffering', 'stutter'], buffering: ['stutter', 'transcode'], stutter: ['buffering', 'transcode'],
  slow: ['buffering', 'transcode'], poster: ['artwork', 'metadata'], cover: ['artwork', 'poster'],
  missing: ['unidentified', 'scan'], login: ['sign', 'password'], admin: ['administration'],
  tv: ['tizen', 'webos', 'android', 'apple'], cast: ['chromecast'], torrent: ['download', 'indexer'],
  tracker: ['indexer'], gpu: ['hardware', 'acceleration'],
  'sous-titre': ['subtitles'], soustitre: ['subtitles'], decale: ['sync', 'timing'], decalage: ['sync', 'timing'],
  bibliotheque: ['library'], utilisateur: ['user'], mot: ['password'], passe: ['password'], film: ['movie'],
  serie: ['series'], telecharger: ['download'], telechargement: ['download'], lecteur: ['player'],
  musique: ['music'], parole: ['lyrics'], sauvegarde: ['backup'], traduire: ['translate'],
  traduction: ['translate'], qualite: ['quality'], langue: ['language'], chaine: ['channel', 'live'],
  tele: ['tv'], affiche: ['poster', 'artwork'], pochette: ['cover', 'artwork'], lent: ['buffering', 'transcode'],
  saccade: ['buffering', 'stutter'], livre: ['book'], extension: ['plugin'],
};

/** Accents and a plural `s` don't change which synonyms apply. */
const synonymKey = (term: string) => term.normalize('NFD').replace(/\p{M}/gu, '').replace(/(?<=..)[sx]$/, '');

const STOP_WORDS = new Set(
  'a an and are as at be can do does for from how i in is it my of on or the to what when where why with you your le la les un une des de du et est comment pourquoi ou je mon ma mes'.split(' '),
);

/** Loaded lazily (only when the search modal first opens) to keep it out of the main bundle. */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private engine: MiniSearch<SearchEntry & { id: number }> | null = null;

  private async load(): Promise<MiniSearch<SearchEntry & { id: number }>> {
    if (!this.engine) {
      const { SEARCH_INDEX } = await import('../../generated/search-index');
      this.engine = new MiniSearch({
        fields: ['title', 'section', 'text'],
        storeFields: ['url', 'title', 'section', 'text'],
        searchOptions: { boost: { title: 4, section: 1.5 }, prefix: true, fuzzy: 0.2 },
      });
      this.engine.addAll(SEARCH_INDEX.map((e, id) => ({ ...e, id })));
    }
    return this.engine;
  }

  async search(query: string): Promise<SearchResult[]> {
    const terms = query
      .toLowerCase()
      .split(/[\s,.?!;:'"()]+/)
      .filter((t) => t && !STOP_WORDS.has(t));
    if (!terms.length) return [];

    const engine = await this.load();
    const perTerm = terms.map((t) => ({ combineWith: 'OR' as const, queries: [t, ...(SYNONYMS[synonymKey(t)] ?? [])] }));
    // Every word must match when that still finds something; a long question falls back to any word.
    let hits = engine.search({ combineWith: 'AND', queries: perTerm });
    if (hits.length < 3) hits = engine.search({ combineWith: 'OR', queries: perTerm });

    return hits.slice(0, 20).map((h) => {
      const entry = { url: h['url'], title: h['title'], section: h['section'], text: h['text'] } as SearchEntry;
      return { ...entry, excerpt: excerpt(entry.text, h.terms) };
    });
  }
}

/** The sentence around the first matched word, so the result shows why it matched. */
function excerpt(text: string, matched: string[]): string {
  const lower = text.toLowerCase();
  const at = matched.map((t) => lower.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, at - 60);
  return (start > 0 ? '... ' : '') + text.slice(start, start + 180);
}
