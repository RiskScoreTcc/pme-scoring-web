import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Companies } from './features/companies/companies';
import { CompanyForm } from './features/company-form/company-form';
import { Occurrences } from './features/occurrences/occurrences';
import { Weights } from './features/weights/weights';
import { Users } from './features/users/users';
import { Login } from './features/login/login';

import { authGuard } from './core/guards/auth/auth-guard';
import { roleGuard } from './core/guards/role/role-guard';
import { UserRole } from './core/models/enums/user-role.enum';


export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    { path: 'overview', component: Home, canActivate: [authGuard] },

    { path: 'companies', component: Companies, canActivate: [authGuard] },
    { path: 'companies/new', component: CompanyForm, canActivate: [authGuard] },
    { path: 'companies/:id/edit', component: CompanyForm, canActivate: [authGuard] },
    { path: 'occurrences', component: Occurrences, canActivate: [authGuard] },

    {
        path: 'weights',
        component: Weights,
        canActivate: [authGuard, roleGuard],
        data: { roles: [UserRole.ADMIN] }
    },
    {
        path: 'users',
        component: Users,
        canActivate: [authGuard, roleGuard],
        data: { roles: [UserRole.ADMIN] }
    },

    { path: 'login', component: Login },
    { path: '**', redirectTo: 'login' }
];
