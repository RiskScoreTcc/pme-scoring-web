import { FormulaType } from '../weights/formula-type';

export interface WeightResponse {
    id: number;
    formulaType: FormulaType;
    revenueWeight: number;
    timeWeight: number;
    defaultWeight: number;
    maxRevenueReference: number;
    maxTimeReferenceMonths: number;
    lowRiskThreshold: number;
    mediumRiskThreshold: number;
    creationDate: string;
    updatedByUserId: number;
}


