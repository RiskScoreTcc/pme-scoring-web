import { ClassificationType } from '../classification-type';
import { CompanySummary } from '../companies/company-summary';
import { OccurrenceStatus } from './occurrence-status';

export interface Occurrence {
  id?: number;
  firm?: CompanySummary;
  type?: string;
  averageRevenue?: number;
  description?: string;
  status?: OccurrenceStatus;
  date?: string;
}
