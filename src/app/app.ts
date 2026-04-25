import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <div id="app">
      <app-navbar></app-navbar>
      <main class="container">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    #app {
      position: relative;
      z-index: 1;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 32px;
    }
  `]
})
export class App {}
