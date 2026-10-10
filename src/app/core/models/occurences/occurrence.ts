import { ClassificationType } from '../classification-type';
import { CompanySummary } from '../companies/company-summary';
import { OccurrenceStatus } from './occurrence-status';

export interface Occurrence {
  id?: number;
  firm?: CompanySummary;
  type?: string;
  dateOccurrence?:string
  amountDue?: number;
  description?: string;
  statusResolved?: boolean| undefined;
  creationDate?: string;
}
