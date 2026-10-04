import { FormulaType } from '../weights/formula-type';

export interface WeightRequest {
    formulaType: FormulaType;
    revenueWeight: number;
    timeWeight: number;
    defaultWeight: number;
    maxRevenueReference: number;
    maxTimeReferenceMonths: number;
    lowRiskThreshold: number;
    mediumRiskThreshold: number;
    updatedByUserId: number;
}

