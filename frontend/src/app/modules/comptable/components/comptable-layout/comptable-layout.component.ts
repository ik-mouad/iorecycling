import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-comptable-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="comptable-layout">
      <header>
        <h1>Module Comptabilité</h1>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .comptable-layout {
      padding: 24px;
    }
    header {
      margin-bottom: 24px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 16px;
    }
    header h1 {
      margin: 0;
      color: #1976d2;
    }
  `]
})
export class ComptableLayoutComponent {}

