import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { BookingFormComponent } from './features/booking-form/booking-form.component';
import { BookingsComponent } from './features/bookings/bookings';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { HomeComponent } from './features/home/home';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { SpaceDetailComponent } from './features/space-detail/space-detail.component';
import { SpacesComponent } from './features/spaces/spaces';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'spaces', component: SpacesComponent },
  { path: 'spaces/:id', component: SpaceDetailComponent },
  { path: 'bookings', component: BookingsComponent, canActivate: [authGuard] },
  { path: 'bookings/new', component: BookingFormComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: '**', redirectTo: '/home' },
];