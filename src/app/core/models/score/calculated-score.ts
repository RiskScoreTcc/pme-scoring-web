import { FactorsJsonScore } from "./factors-json-score";
export interface CalculatedScore {
  id: number;
  firmId: number;
  userId: number;
  scoreValue: number;
  riskBand: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  factorsJson: FactorsJsonScore
  justification: string;
  calculationDate: string;
  disclaimer:string
}