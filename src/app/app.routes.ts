import { Routes } from '@angular/router';

import { Companies } from './features/companies/companies';
import { CompanyForm } from './features/company-form/company-form';

export const routes: Routes = [
  { path: 'companies', component: Companies },
  { path: 'companies/new', component: CompanyForm },
  { path: 'companies/:id/edit', component: CompanyForm }
];
