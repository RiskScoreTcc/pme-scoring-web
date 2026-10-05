import { CompanyStatus } from "./company-status";
import { ClassificationType } from '../classification-type';

export interface Company {
  id: number;
  registeredCompanyName: string;
  averageRevenue: number;
  cnpj: string;
  ageInMonths: number;

  numberOfEmployees: number ;
  risk: ClassificationType | null;

  status: CompanyStatus;
}