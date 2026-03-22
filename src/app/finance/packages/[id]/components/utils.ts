import { ActivityType, FinanceStage } from '@/lib/finance-data';

export function fmtPrice(n: number) {
  return `£${n.toLocaleString('en-GB')}`;
}

export function countActivitiesByType(stages: FinanceStage[], type: ActivityType): number {
  return stages.flatMap(s => s.activities).filter(a => a.type === type).length;
}
