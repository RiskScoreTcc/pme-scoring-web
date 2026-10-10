import { Company } from "./company";
import { CalculatedScore } from "../score/calculated-score";

export interface FirmWithScore {
  firm: Company;
  calculatedScore: CalculatedScore | null;
}