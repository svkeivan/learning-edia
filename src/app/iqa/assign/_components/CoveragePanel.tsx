'use client';

import type { IqaCategory, IqaTutor, EnrichedSubmission } from '../types';

interface Props {
  categories: IqaCategory[];
  tutors: IqaTutor[];
  allItems: EnrichedSubmission[];
}

export function CoveragePanel({ categories, tutors, allItems }: Props) {
  if (categories.length === 0) return null;

  const rows = categories.map(cat => {
    const catAssessorIds = new Set(tutors.filter(t => t.categoryId === cat.id).map(t => t.id));
    const catSubs = allItems.filter(i => i.assessor && catAssessorIds.has(i.assessor.id));
    const total = catSubs.length;
    const required = Math.ceil(total * (cat.recheckPercent / 100));
    const done = catSubs.filter(
      i => i.check && (i.check.status === 'Approved' || i.check.status === 'Rejected'),
    ).length;
    const pct = required > 0 ? Math.min(100, Math.round((done / required) * 100)) : 100;
    const barColor = pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-orange-400' : 'bg-red-400';
    return { cat, total, required, done, pct, barColor };
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">IQA Coverage by Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rows.map(({ cat, total, required, done, pct, barColor }) => (
          <div key={cat.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">{cat.name}</span>
              <span className="text-xs text-gray-500">
                {done}/{required} reviewed ({cat.recheckPercent}% target)
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{total} total submissions</p>
          </div>
        ))}
      </div>
    </div>
  );
}
