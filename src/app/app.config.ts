// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthGuard } from './guards/auth_guard';
import { RegisterComponent } from './components/login/register/register';


// Define las rutas con el tipo correcto
const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
   { path: 'register', component: RegisterComponent },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full' // ← Esto debe ser 'full' o 'prefix', no string genérico
  },
  {
    path: '**',
    redirectTo: '/dashboard',
    pathMatch: 'full' // ← Agrega pathMatch también aquí
  }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    AuthGuard
  ]
};
