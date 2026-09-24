import { ClassificationType } from '../classification-type';
import { OccurrenceStatus } from './occurrence-status';

export interface Occurrence {
  id?: number;
  companyId?: number;
  companyName?: string;
  cnpj?: string;
  type?: string;
  description?: string;
  severity?: ClassificationType;
  status?: OccurrenceStatus;
  date?: string;
  notes?: string;
}
