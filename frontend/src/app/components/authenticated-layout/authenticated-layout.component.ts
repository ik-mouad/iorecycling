import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShellComponent } from '../app-shell/app-shell.component';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [CommonModule, AppShellComponent],
  template: `
    <app-app-shell>
      <div class="authenticated-content">
        <ng-content></ng-content>
      </div>
    </app-app-shell>
  `,
  styles: [`
    .authenticated-content {
      min-height: calc(100vh - 80px);
    }
  `]
})
export class AuthenticatedLayoutComponent {}
