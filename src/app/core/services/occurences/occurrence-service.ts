import { Service } from '@angular/core';
import { Occurrence } from '../../models/occurences/occurrence';
import { OccurrenceCreate } from '../../models/occurences/occurrence-create';
import { Observable, of as observableOf } from 'rxjs';

@Service()
export class OccurrenceService {
    getAll(): Occurrence[] {
        const occurrences: Occurrence[] = [
            {
                id: 1,
                companyId: 1,
                companyName: 'Alfa Comércio Ltda.',
                cnpj: '12.345.678/0001-90',
                type: 'Atraso de pagamento',
                description: 'Pagamento de obrigação financeira realizado após o prazo estabelecido.',
                status: 'resolved',
                date: '2026-09-18',
            },
            {
                id: 2,
                companyId: 3,
                companyName: 'Gamma Indústria Ltda.',
                cnpj: '34.567.890/0001-72',
                type: 'Restrição financeira',
                description: 'Identificada restrição financeira associada ao CNPJ da empresa.',
                status: 'in_analysis',
                date: '2026-09-20',
            },
            {
                id: 3,
                companyId: 2,
                companyName: 'Beta Serviços S.A.',
                cnpj: '23.456.789/0001-81',
                type: 'Atraso de pagamento',
                description: 'Registro de atraso em obrigação financeira.',
                status: 'resolved',
                date: '2026-09-12',
            },
            {
                id: 4,
                companyId: 5,
                companyName: 'Epsilon Logística S.A.',
                cnpj: '56.789.012/0001-54',
                type: 'Inconsistência cadastral',
                description: 'Informação cadastral divergente identificada durante análise.',
                status: 'open',
                date: '2026-09-21',
            },
            {
                id: 5,
                companyId: 4,
                companyName: 'Delta Tecnologia Ltda.',
                cnpj: '45.678.901/0001-63',
                type: 'Documento pendente',
                description: 'Documento necessário para análise de risco ainda não foi disponibilizado.',
                status: 'open',
                date: '2026-09-22'
            },
            {
                id: 6,
                companyId: 3,
                companyName: 'Gamma Indústria Ltda.',
                cnpj: '34.567.890/0001-72',
                type: 'Atraso de pagamento',
                description: 'Atraso identificado em obrigação financeira da empresa.',
                status: 'open',
                date: '2026-09-22'
            }
        ];

        return occurrences;
    }

    create(occurrenceData: OccurrenceCreate): Observable<Occurrence> {
        console.log(
            'Registrando ocorrência para empresa:',
            occurrenceData.companyId
        );
        const occurrence: Occurrence =
        {
            id: 1,
            companyId: 1,
            companyName: 'Alfa Comércio Ltda.',
            cnpj: '12.345.678/0001-90',
            type: 'Atraso de pagamento',
            description: 'Pagamento de obrigação financeira realizado após o prazo estabelecido.',
            status: 'resolved',
            date: '2026-09-18',
        }
        // Implement the actual creation logic here
        return observableOf(occurrence);
    }
}
