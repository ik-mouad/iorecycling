// Polyfill for Buffer (Node.js API not available in browsers)
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/auth/auth.interceptor';
import { traceInterceptor } from './app/core/trace.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([traceInterceptor, authInterceptor])),
    provideAnimations()
  ]
}).catch(err => console.error(err));
