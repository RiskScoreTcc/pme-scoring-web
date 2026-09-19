import { Routes } from '@angular/router';
import { Home } from  './features/home/home';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: Home },
    { path: 'firms', component: Home },
    { path: 'scores', component: Home },
    { path: 'occurrences', component: Home },
    { path: 'weights', component: Home },
    { path: 'users', component: Home },
    { path: '**', redirectTo: 'dashboard' }
];
