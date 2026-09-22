import { Routes } from '@angular/router';
import { Home } from  './features/home/home';
import { Companies } from './features/companies/companies';
import { CompanyForm } from './features/company-form/company-form';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: Home },
    { path: 'companies', component: Companies },
    { path: 'companies/new', component: CompanyForm },
    { path: 'companies', component: Companies },
    { path: 'companies/:id/edit', component: CompanyForm },
    { path: 'occurrences', component: Home },
    { path: 'weights', component: Home },
    { path: 'users', component: Home },
    { path: '**', redirectTo: 'dashboard' }
];
