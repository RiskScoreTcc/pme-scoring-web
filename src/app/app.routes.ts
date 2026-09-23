import { Routes } from '@angular/router';
import { Home } from  './features/home/home';
import { Companies } from './features/companies/companies';
import { CompanyForm } from './features/company-form/company-form';
import { Occurrences } from './features/occurrences/occurrences';
import { Weights } from './features/weights/weights';
import { Users } from './features/users/users';
import { Login } from './features/login/login';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    { path: 'overview', component: Home },

    { path: 'companies', component: Companies },
    { path: 'companies/new', component: CompanyForm },
    { path: 'companies/:id/edit', component: CompanyForm },
    { path: 'occurrences', component: Occurrences },

    { path: 'weights', component: Weights },

    { path: 'users', component: Users },

    { path: 'login', component: Login },
    { path: '**', redirectTo: 'login' }
];
