import { ClassificationType } from '../classification-type';
import { OccurrenceStatus } from './occurrence-status';

export interface Occurrence {
  id?: number;
  companyId?: number;
  companyName?: string;
  cnpj?: string;
  type?: string;
  averageRevenue?: number;
  description?: string;
  status?: OccurrenceStatus;
  date?: string;
}
