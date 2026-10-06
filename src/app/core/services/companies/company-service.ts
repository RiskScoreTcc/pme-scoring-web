import { Service,inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';
import { Company } from '../../models/companies/company';
import { CompanyCreate } from '../../models/companies/company-create';
import { Page } from '../../models/Page';

@Service()
export class CompanyService {
    private readonly API_URL = 'http://localhost:8080';
    private readonly http = inject(HttpClient);

    getAll(): Company[] {
        const companies: Company[] = []
        return companies;
    }

    getById(id: number): Company | null {
        const companies = this.getAll();
        const company = companies.find(company => company.id === id);
        return company ?? null;
    }

    create(formValue: CompanyCreate): Observable<Company> {
        const company: Company = {
            id: Math.floor(Math.random() * 1000), // Gera um ID aleatório para simulação
            registeredCompanyName: formValue.registeredCompanyName,
            averageRevenue: formValue.averageRevenue,
            cnpj: formValue.cnpj,
            ageInMonths: formValue.ageInMonths,
            numberOfEmployees: formValue.numberOfEmployees,
            risk: null,
            status: 'active'
        };

        return observableOf(company);
    }

    update(company: Company): void {
        // ...
    }

    delete(id: number): void {
        console.log(
            'Excluindo empresa:',
            id
        );
    }

    searchCompanies(query: string, page: number = 0, size: number = 10): Observable<Page<Company>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());


        return this.http.get<Page<Company>>(`${this.API_URL}/api/v1/companies/search/${query}?`, { params });
    }
}


