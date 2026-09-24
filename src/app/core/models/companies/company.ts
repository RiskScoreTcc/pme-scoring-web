import { Occurrence } from "../occurences/occurrence";
import { CompanyStatus } from "./company-status";
import { ClassificationType } from '../classification-type';

export interface Company {
  id: number;
  legalName: string;
  tradeName: string;
  cnpj: string;
  sector: string;

  score: number | null;
  risk: ClassificationType | null;

  status: CompanyStatus;

  lastScoreDate: string | null;

  occurrences: Occurrence[];
}
