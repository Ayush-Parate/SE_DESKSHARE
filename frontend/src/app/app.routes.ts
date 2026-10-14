import { Routes } from '@angular/router';

import { BookingFormComponent } from './features/booking-form/booking-form.component';
import { BookingsComponent } from './features/bookings/bookings';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { HomeComponent } from './features/home/home';
import { SpaceDetailComponent } from './features/space-detail/space-detail.component';
import { SpacesComponent } from './features/spaces/spaces';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'spaces', component: SpacesComponent },
  { path: 'spaces/:id', component: SpaceDetailComponent },
  { path: 'bookings', component: BookingsComponent },
  { path: 'bookings/new', component: BookingFormComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '/home' },
];
