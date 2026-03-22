'use client';

import { useState } from 'react';
import { FinanceStage } from '@/lib/finance-data';
import { STAGE_BAR_COLORS, activityTypeStyle } from './constants';
import { EditableField } from './editable-field';
import { IcChevron } from './icons';

function ActivityRow({
  activity,
  index,
}: {
  activity: FinanceStage['activities'][number];
  index: number;
}) {
  const typeStyle = activityTypeStyle[activity.type];

  return (
    <tr
      className={`border-t border-gray-100 hover:bg-gray-50/50 transition-colors ${index % 2 === 1 ? 'bg-gray-50/30' : ''}`}
    >
      <td className="py-2 pl-5 pr-2">
        <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold inline-flex items-center justify-center">
          {index + 1}
        </span>
      </td>
      <td className="py-2 px-2 text-gray-800 font-medium">{activity.name}</td>
      <td className="py-2 pl-2 pr-5">
        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${typeStyle}`}>{activity.type}</span>
      </td>
    </tr>
  );
}

export function StageCard({
  stage,
  stageIndex,
  cumulative,
  onUpdateRevenue,
  onUpdateRefund,
  onUpdatePrice,
  onToggleSellable,
  onToggleCommissionable,
}: {
  stage: FinanceStage;
  stageIndex: number;
  cumulative: number;
  onUpdateRevenue: (id: string, val: number) => void;
  onUpdateRefund: (id: string, val: number) => void;
  onUpdatePrice: (id: string, val: number) => void;
  onToggleSellable: (id: string, value: boolean) => void;
  onToggleCommissionable: (id: string, value: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const stageColor = STAGE_BAR_COLORS[stageIndex % STAGE_BAR_COLORS.length];
  const isUnpriced = stage.price === 0;

  return (
    <div
      className={`bg-white rounded-xl border transition-shadow ${isUnpriced ? 'border-amber-300 border-dashed' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <div className="flex items-stretch">
        <div className="flex items-center min-w-0 flex-1">
          <div className="flex items-center gap-3 pl-4 pr-4 py-3 min-w-0 flex-1">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${isUnpriced ? 'bg-amber-400' : stageColor}`}
            >
              {isUnpriced ? (
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              ) : (
                stage.order
              )}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{stage.courseName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">
                  {stage.durationHours}h{stage.durationMinutes > 0 ? ` ${stage.durationMinutes}m` : ''}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">{stage.activities.length} activities</span>
                {isUnpriced && (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                    Needs pricing
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 pt-2 border-t border-gray-100/80">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={stage.isSellable}
                    onChange={e => onToggleSellable(stage.id, e.target.checked)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-400 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-800">Is Sellable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={stage.isCommissionable}
                    onChange={e => onToggleCommissionable(stage.id, e.target.checked)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-400 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-800">
                    Is Commissionable
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-l border-gray-200 bg-gray-50/60 rounded-r-xl ">
          <table className="border-collapse">
            <tbody>
              <tr>
                <td className="px-3 py-2.5 align-middle border-r border-gray-200 w-[90px]">
                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Price</div>
                  <span onClick={e => e.stopPropagation()}>
                    <EditableField
                      value={stage.price}
                      prefix="£"
                      min={0}
                      max={99999}
                      step={50}
                      onConfirm={v => onUpdatePrice(stage.id, v)}
                      size="lg"
                    />
                  </span>
                </td>
                <td className="px-3 py-2.5 align-middle border-r border-gray-200 w-[90px]">
                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    Revenue{' '}
                    <span title="Linked to price" className="opacity-50">
                      <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                        />
                      </svg>
                    </span>
                  </div>
                  <EditableField
                    value={stage.revenueRecognition}
                    suffix="%"
                    min={0}
                    max={100}
                    step={1}
                    onConfirm={v => onUpdateRevenue(stage.id, v)}
                    size="lg"
                  />
                </td>
                <td className="px-3 py-2.5 align-middle border-r border-gray-200 w-[95px]">
                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Cum.</div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-sm font-bold tabular-nums ${cumulative === 100 ? 'text-emerald-600' : cumulative > 100 ? 'text-red-500' : 'text-gray-700'}`}
                    >
                      {cumulative}%
                    </span>
                    <div className="w-8 h-1.5 rounded-full bg-gray-200 overflow-hidden shrink-0">
                      <div
                        className={`h-full rounded-full ${cumulative === 100 ? 'bg-emerald-500' : cumulative > 100 ? 'bg-red-500' : 'bg-orange-400'}`}
                        style={{ width: `${Math.min(cumulative, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 align-middle w-[85px]">
                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Refund</div>
                  <EditableField
                    value={stage.exposedRefund}
                    prefix="£"
                    min={0}
                    max={9999}
                    step={5}
                    onConfirm={v => onUpdateRefund(stage.id, v)}
                    size="lg"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="flex items-center justify-center w-11 self-stretch shrink-0 hover:bg-gray-100 transition-colors border-l border-gray-200 text-gray-400 hover:text-gray-600"
          >
            <IcChevron open={expanded} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 rounded-b-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100/80 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="text-left py-2 pl-5 pr-2 w-8">#</th>
                <th className="text-left py-2 px-2">Activity</th>
                <th className="text-left py-2 pl-2 pr-5 w-24">Type</th>
              </tr>
            </thead>
            <tbody>
              {stage.activities.map((a, i) => (
                <ActivityRow key={a.id} activity={a} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
