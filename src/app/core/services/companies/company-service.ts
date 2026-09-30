import { Service } from '@angular/core';
import { Observable, of as observableOf } from 'rxjs';
import { Company } from '../../models/companies/company';
import { CompanyCreate } from '../../models/companies/company-create';
@Service()
export class CompanyService {

    getAll(): Company[] {
        const companies: Company[] = [
            {
                id: 1,
                legalName: 'Alfa Comércio Ltda.',
                tradeName: 'Alfa Comércio',
                cnpj: '12.345.678/0001-90',
                sector: 'Comércio varejista',
                score: 824,
                risk: 'low',
                status: 'active',
                lastScoreDate: '21/09/2026 às 14:32',
                occurrences: [
                    {
                        id: 1,
                        type: 'Atraso de pagamento',
                        description: 'Registro de atraso em obrigação financeira.',
                        date: '18/09/2026',

                    },
                    {
                        id: 2,
                        type: 'Consulta realizada',
                        description: 'Consulta registrada no histórico da empresa.',
                        date: '12/09/2026',

                    },
                    {
                        id: 3,
                        type: 'Pendência financeira',
                        description: 'Pendência registrada durante análise financeira.',
                        date: '05/09/2026',
                    }
                ]
            },

            {
                id: 2,
                legalName: 'Beta Serviços S.A.',
                tradeName: 'Beta Serviços',
                cnpj: '23.456.789/0001-81',
                sector: 'Serviços empresariais',
                score: 641,
                risk: 'medium',
                status: 'active',
                lastScoreDate: '20/09/2026 às 10:15',
                occurrences: [
                    {
                        id: 4,
                        type: 'Atraso de pagamento',
                        description: 'Pagamento realizado após o vencimento.',
                        date: '17/09/2026',

                    },
                    {
                        id: 5,
                        type: 'Consulta realizada',
                        description: 'Nova consulta registrada no histórico.',
                        date: '10/09/2026',

                    }
                ]
            },

            {
                id: 3,
                legalName: 'Gamma Indústria Ltda.',
                tradeName: 'Gamma Indústria',
                cnpj: '34.567.890/0001-72',
                sector: 'Indústria',
                score: 312,
                risk: 'high',
                status: 'active',
                lastScoreDate: '19/09/2026 às 16:48',
                occurrences: [
                    {
                        id: 6,
                        type: 'Pendência financeira',
                        description: 'Pendência identificada durante análise financeira.',
                        date: '19/09/2026',
                    },
                    {
                        id: 7,
                        type: 'Atraso de pagamento',
                        description: 'Obrigação financeira em atraso.',
                        date: '15/09/2026',
                    },
                    {
                        id: 8,
                        type: 'Restrição identificada',
                        description: 'Restrição identificada durante consulta.',
                        date: '08/09/2026',
                    }
                ]
            },

            {
                id: 4,
                legalName: 'Delta Tecnologia Ltda.',
                tradeName: 'Delta Tecnologia',
                cnpj: '45.678.901/0001-63',
                sector: 'Tecnologia da informação',
                score: 756,
                risk: 'low',
                status: 'active',
                lastScoreDate: '18/09/2026 às 09:21',
                occurrences: [
                    {
                        id: 9,
                        type: 'Consulta realizada',
                        description: 'Consulta registrada no histórico da empresa.',
                        date: '18/09/2026',

                    }
                ]
            },

            {
                id: 5,
                legalName: 'Epsilon Logística S.A.',
                tradeName: 'Epsilon Logística',
                cnpj: '56.789.012/0001-54',
                sector: 'Transporte e logística',
                score: 587,
                risk: 'medium',
                status: 'active',
                lastScoreDate: '17/09/2026 às 11:40',
                occurrences: [
                    {
                        id: 10,
                        type: 'Atraso de pagamento',
                        description: 'Atraso identificado em obrigação financeira.',
                        date: '16/09/2026',

                    },
                    {
                        id: 11,
                        type: 'Consulta realizada',
                        description: 'Consulta registrada no histórico.',
                        date: '11/09/2026',

                    }
                ]
            }
        ];
        return companies;
    }

    getById(id: number): Company | null {
        const companies = this.getAll();
        const company = companies.find(company => company.id === id);
        return company ?? null;
    }

    create(formValue: CompanyCreate): Observable<Company> {
        const company: Company = {
            id: 1,
            legalName: 'Alfa Comércio Ltda.',
            tradeName: 'Alfa Comércio',
            cnpj: '12.345.678/0001-90',
            sector: 'Comércio varejista',
            score: 824,
            risk: 'low',
            status: 'active',
            lastScoreDate: '21/09/2026 às 14:32',
            occurrences: [
                {
                    id: 1,
                    type: 'Atraso de pagamento',
                    description: 'Registro de atraso em obrigação financeira.',
                    date: '18/09/2026',

                },
                {
                    id: 2,
                    type: 'Consulta realizada',
                    description: 'Consulta registrada no histórico da empresa.',
                    date: '12/09/2026',

                },
                {
                    id: 3,
                    type: 'Pendência financeira',
                    description: 'Pendência registrada durante análise financeira.',
                    date: '05/09/2026',
                }
            ]
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
}


