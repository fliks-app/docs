import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { Sidebar } from './layout/sidebar/sidebar';
import { SearchModal } from './layout/search-modal/search-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Sidebar, SearchModal],
  templateUrl: './app.html',
})
export class App {}
