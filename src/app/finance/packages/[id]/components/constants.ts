import { ActivityType, PackageStatus } from '@/lib/finance-data';

export const STAGE_BAR_COLORS = [
  'bg-orange-400',
  'bg-amber-400',
  'bg-teal-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-purple-400',
  'bg-rose-400',
  'bg-slate-400',
] as const;

export const activityTypeStyle: Record<ActivityType, string> = {
  Webinar: 'bg-indigo-100 text-indigo-700',
  Video: 'bg-blue-100 text-blue-700',
  Practical: 'bg-teal-100 text-teal-700',
  Exam: 'bg-purple-100 text-purple-700',
  Reading: 'bg-amber-100 text-amber-700',
};

export const statusDot: Record<PackageStatus, string> = {
  Pending: 'bg-amber-500',
  'Ready to Sell': 'bg-emerald-500',
};

export const statusText: Record<PackageStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  'Ready to Sell': 'bg-emerald-100 text-emerald-700',
};
