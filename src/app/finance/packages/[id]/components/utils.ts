import { ActivityType, FinanceStage } from '@/lib/finance-data';

/** Share of full package price attributed to course delivery (remainder after digital %). */
export function courseShareOfPackage(digitalPct: number): number {
  return Math.max(0, (100 - digitalPct) / 100);
}

/** Full package price implied by summed course prices and digital access %. */
export function fullPriceFromCourseSum(courseSum: number, digitalPct: number): number {
  const share = courseShareOfPackage(digitalPct);
  if (share <= 0) return courseSum;
  return Math.round(courseSum / share);
}

/** Scale stage prices so their sum matches `targetCourseSum` (fixes rounding on last stage). */
export function scaleStagesToCourseSum(stages: FinanceStage[], targetCourseSum: number): FinanceStage[] {
  const n = stages.length;
  if (n === 0) return stages;
  if (targetCourseSum <= 0) return stages.map(s => ({ ...s, price: 0 }));

  const oldSum = stages.reduce((acc, st) => acc + st.price, 0);
  if (oldSum === 0) {
    const base = Math.floor(targetCourseSum / n);
    const extra = targetCourseSum - base * n;
    return stages.map((s, i) => ({ ...s, price: base + (i === 0 ? extra : 0) }));
  }

  const scaled = stages.map(s => ({
    ...s,
    price: Math.round((s.price * targetCourseSum) / oldSum),
  }));
  const drift = targetCourseSum - scaled.reduce((acc, st) => acc + st.price, 0);
  if (drift === 0) return scaled;
  const last = scaled[n - 1];
  return [...scaled.slice(0, -1), { ...last, price: last.price + drift }];
}

export function fmtPrice(n: number) {
  return `£${n.toLocaleString('en-GB')}`;
}

export function countActivitiesByType(stages: FinanceStage[], type: ActivityType): number {
  return stages.flatMap(s => s.activities).filter(a => a.type === type).length;
}
