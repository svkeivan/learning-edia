import type { IqaCheck, IqaCheckStatus, IqaTutor, IqaCategory } from '@/lib/iqa-data';
import type { StudentSubmission } from '@/lib/mock-data';
import { assessments } from '@/lib/mock-data';

export type Tab = 'all' | 'queue' | 'not-queue';
export type SortKey = 'student' | 'package' | 'assessment' | 'result' | 'assessor' | 'reviewer' | 'cohort';
export type Assessment = (typeof assessments)[number];

export const PAGE_SIZE = 20;

export const tradeColors: Record<string, string> = {
  'Gas Engineering': 'bg-orange-100 text-orange-700',
  Electrical: 'bg-yellow-100 text-yellow-700',
  Plumbing: 'bg-blue-100 text-blue-700',
};

export const statusStyles: Record<IqaCheckStatus, string> = {
  Pending: 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export interface EnrichedSubmission {
  submission: StudentSubmission;
  assessment: Assessment | undefined;
  assessor: IqaTutor | undefined;
  check: IqaCheck | undefined;
  assignedReviewer: IqaTutor | undefined;
  category: IqaCategory | undefined;
  isSkipped: boolean;
  cohort: string | undefined;
}

export type { IqaCheck, IqaTutor, IqaCategory };
