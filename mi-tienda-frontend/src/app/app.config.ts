import { ApplicationConfig, provideBrowserGlobalErrorListeners,provideAppInitializer,inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient,withFetch, withInterceptors } from '@angular/common/http'; // <-- 1. AGREGA ESTA IMPORTACIÓN

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './core/auth.interceptor';
import { AuthService } from './core/services/auth.service';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])), // <-- 2. AGREGA ESTA LÍNEA AQUÍ
    provideAppInitializer(() => inject(AuthService).restaurarSesion()),
  ]
};
