import { Service } from '@angular/core';

@Service()
export class ScoreService {

    calculateScore(companyId: number): void {
        console.log(
            'Calculando score da empresa:',
            companyId
        );
    }

}
