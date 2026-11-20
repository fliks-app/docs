import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideSearch } from '@lucide/angular';
import { ThemeService } from '../../core/theme';
import { SearchOverlayService } from '../../core/search-overlay';
import { setSeo, SITE_URL } from '../../core/seo';
import { FIRST_PLUGINS_PAGE_URL } from '../../../generated/manifest';

const DESCRIPTION = 'Install, run and extend Fliks, the self-hosted media server.';

const DOORS = [
  { title: 'I want to watch', text: 'Apps, player and everyday use.', url: '/player/overview' },
  { title: "I'm setting up a server", text: 'Install Fliks and add your first library.', url: '/getting-started/quick-start' },
  { title: "Something isn't working", text: 'Fix the most common problems.', url: '/getting-started/common-problems' },
];

const FEATURES = [
  { title: 'Subtitles in sync', text: 'Shift out-of-sync subtitles from the player while the video plays.', img: 'player-sync-3.webp', url: '/player/subtitles-and-audio' },
  { title: 'Watch party', text: 'Watch the same title together, in sync, with friends.', img: 'home-card-watch-party.webp', url: '/features/watch-party' },
  { title: 'Music with lyrics', text: 'A full music player with synced lyrics and karaoke.', img: 'music-lyrics-synced.webp', url: '/player/music-player' },
  { title: 'Play on another device', text: 'Start on your phone, control and play on any other device.', img: 'music-device-1-anim.webp', url: '/features/pairing-and-remote-control' },
  { title: 'Offline downloads', text: 'Take movies and episodes with you, no connection needed.', img: 'home-card-offline.webp', url: '/features/offline-downloads' },
  { title: 'Live TV', text: 'Watch and browse your live channels next to your library.', img: 'livetv-source-form.webp', url: '/features/live-tv' },
  { title: 'Books and comics', text: 'Read ebooks, listen to audiobooks and follow your comics.', img: 'library.webp', url: '/features/books-and-audiobooks' },
  { title: 'Chromecast', text: 'Cast to a TV from your phone or browser.', img: 'player-menu-devices.webp', url: '/clients/chromecast' },
  { title: 'Library cleanup', text: 'Find and remove what you no longer watch with rules.', img: 'admin-cleanup-7-preview.webp', url: '/administration/library-cleanup' },
  { title: 'Hardware transcoding', text: 'Use your GPU to stream anything to any screen.', img: 'admin-streaming-3-save-anim.webp', url: '/install/hardware-acceleration' },
  { title: 'Plugins', text: 'Add sources, metadata and features from the catalogue.', img: 'plugins-catalog.webp', url: '/administration/plugins' },
  { title: 'Smart playlists', text: 'Build playlists that fill themselves from rules.', img: 'playlist-smart-editor.webp', url: '/features/playlists' },
];

@Component({
  selector: 'app-home',
  imports: [RouterLink, LucideSearch],
  templateUrl: './home.html',
})
export class Home {
  private readonly theme = inject(ThemeService);
  private readonly overlay = inject(SearchOverlayService);

  protected readonly doors = DOORS;
  protected readonly features = FEATURES;
  protected readonly developersUrl = FIRST_PLUGINS_PAGE_URL;
  protected readonly logo = computed(() => (this.theme.isDark() ? 'fliks-logo-ondark.svg' : 'fliks-logo.svg'));

  constructor() {
    setSeo(() => ({
      path: '',
      title: 'Fliks docs',
      description: DESCRIPTION,
      type: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Fliks docs',
        url: SITE_URL,
      },
    }));
  }

  protected search(input: HTMLInputElement): void {
    const value = input.value;
    input.value = '';
    this.overlay.open(value);
  }
}
