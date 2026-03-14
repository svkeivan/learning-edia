'use client';

import Link from 'next/link';
import type { ReviewerWorkload, IqaCategory } from '../types';

interface Props {
  workloads: ReviewerWorkload[];
  categories: IqaCategory[];
  filterCategory: string;
  collapsed: boolean;
  onToggle: () => void;
}

export function WorkloadPanel({ workloads, categories, filterCategory, collapsed, onToggle }: Props) {
  const visible = filterCategory
    ? workloads.filter(w => w.tutor.categoryId === filterCategory)
    : workloads;

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-5 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Reviewer Workload</h2>
          {filterCategory && (
            <span className="text-xs text-gray-400">
              (filtered to {categories.find(c => c.id === filterCategory)?.name})
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/iqa/people"
            onClick={e => e.stopPropagation()}
            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
          >
            Manage reviewers
          </Link>
          <svg
            width="16" height="16" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}
            className={`text-gray-400 transition-transform ${collapsed ? '-rotate-90' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {!collapsed && (
        <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {visible.map(w => {
            const pct = w.capacity > 0 ? Math.round((w.activeCount / w.capacity) * 100) : 0;
            const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';
            const textColor = pct >= 90 ? 'text-red-700' : pct >= 70 ? 'text-amber-700' : 'text-green-700';
            return (
              <div key={w.tutor.id} className="border border-gray-100 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-800 truncate mb-2">{w.tutor.name}</p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${textColor}`}>{w.activeCount}/{w.capacity}</span>
                  <span className="text-[10px] text-gray-400">{w.category?.name ?? '—'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
