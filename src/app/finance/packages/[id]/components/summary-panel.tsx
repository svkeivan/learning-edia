'use client';

import { ActivityType, FinancePackage, FinanceStage } from '@/lib/finance-data';
import { activityTypeStyle } from './constants';
import { EditableField } from './editable-field';
import { countActivitiesByType, fmtPrice } from './utils';

export function SummaryPanel({
  pkg,
  stages,
  digitalAccessPct,
  onUpdateDigitalAccessPct,
}: {
  pkg: FinancePackage;
  stages: FinanceStage[];
  digitalAccessPct: number;
  onUpdateDigitalAccessPct: (val: number) => void;
}) {
  const revTotal = stages.reduce((s, st) => s + st.revenueRecognition, 0);
  const revOk = revTotal === 100;
  const totalRefund = stages.reduce((s, st) => s + st.exposedRefund, 0);
  const sumOfStagePrices = stages.reduce((s, st) => s + st.price, 0);
  const digitalAssetValue = Math.round((sumOfStagePrices * digitalAccessPct) / 100);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Revenue Distribution</p>
        <div className="flex items-end gap-2 mb-2">
          <span
            className={`text-3xl font-bold tabular-nums ${revOk ? 'text-emerald-600' : revTotal > 100 ? 'text-red-500' : 'text-amber-500'}`}
          >
            {revTotal}%
          </span>
          <span className="text-xs text-gray-400 pb-1">of 100% allocated</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all ${revOk ? 'bg-emerald-500' : revTotal > 100 ? 'bg-red-500' : 'bg-orange-400'}`}
            style={{ width: `${Math.min(revTotal, 100)}%` }}
          />
        </div>
        {revOk ? (
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Balanced
          </p>
        ) : (
          <p className="text-xs text-amber-600">
            {revTotal < 100 ? `${100 - revTotal}% unallocated` : `${revTotal - 100}% over-allocated`}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Price Breakdown</p>

        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-xs text-gray-500">Package price (modules)</span>
          <span className="text-xs font-semibold tabular-nums text-gray-800">{fmtPrice(sumOfStagePrices)}</span>
        </div>

        <div className="py-2 border-b border-gray-100">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-500">Digital assets share</span>
            <p className="text-[10px] text-gray-400 leading-snug">
              For reporting — not included in package price.
            </p>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <EditableField
                  value={digitalAccessPct}
                  suffix="%"
                  min={0}
                  max={100}
                  step={1}
                  onConfirm={onUpdateDigitalAccessPct}
                  size="sm"
                />
                <span className="text-[10px] text-gray-400 shrink-0">of delivery</span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-blue-600 shrink-0">{fmtPrice(digitalAssetValue)}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          {[
            { label: 'Total Refund', value: fmtPrice(totalRefund), highlight: totalRefund > 200 },
            { label: 'Total Duration', value: `${pkg.totalDurationHours}h`, highlight: false },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{label}</span>
              <span className={`text-xs font-semibold tabular-nums ${highlight ? 'text-red-500' : 'text-gray-700'}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Delivery Mix</p>
        {(['Webinar', 'Practical', 'Video', 'Exam', 'Reading'] as ActivityType[]).map(type => {
          const count = countActivitiesByType(stages, type);
          if (!count) return null;
          const total = stages.flatMap(s => s.activities).length;
          const pct = Math.round((count / total) * 100);
          const style = activityTypeStyle[type];
          return (
            <div key={type} className="flex items-center gap-2 mb-2 last:mb-0">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${style} w-16 text-center`}>{type}</span>
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-gray-400 opacity-50" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-gray-400 tabular-nums w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-400 text-center px-2 leading-relaxed">
        Click any value to edit · Activities are read-only
      </p>
    </div>
  );
}
