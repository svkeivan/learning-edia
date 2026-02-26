'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useState, useRef, useCallback } from 'react';
import {
  financePackages,
  FinancePackage,
  FinanceStage,
  ActivityType,
  PackageStatus,
} from '@/lib/finance-data';

// ─── Colour maps ──────────────────────────────────────────────────────────────

// Colors cycle across stages to give each a distinct visual identity in the timeline
const STAGE_BAR_COLORS = [
  'bg-orange-400',
  'bg-amber-400',
  'bg-teal-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-purple-400',
  'bg-rose-400',
  'bg-slate-400',
] as const;

const activityTypeStyle: Record<ActivityType, string> = {
  Webinar: 'bg-indigo-100 text-indigo-700',
  Video: 'bg-blue-100 text-blue-700',
  Practical: 'bg-teal-100 text-teal-700',
  Exam: 'bg-purple-100 text-purple-700',
  Reading: 'bg-amber-100 text-amber-700',
};

const statusDot: Record<PackageStatus, string> = {
  Pending: 'bg-amber-500',
  'Ready to Sell': 'bg-emerald-500',
};
const statusText: Record<PackageStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  'Ready to Sell': 'bg-emerald-100 text-emerald-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return `£${n.toLocaleString('en-GB')}`;
}

function countActivitiesByType(stages: FinanceStage[], type: ActivityType): number {
  return stages.flatMap(s => s.activities).filter(a => a.type === type).length;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IcCheck = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);
const IcX = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
const IcChevron = ({ open }: { open: boolean }) => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

// ─── Editable field — pill button + floating "I understand" tooltip ───────────
// State machine: idle → editing → confirming → idle
// Layout never shifts: confirming uses an absolutely-positioned popover

type EditState = 'idle' | 'editing' | 'confirming';

function EditableField({
  value,
  prefix = '',
  suffix = '',
  min = 0,
  max = 99999,
  step = 1,
  onConfirm,
  size = 'md',
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  onConfirm: (val: number) => void;
  /** 'sm' compact, 'md' normal, 'lg' prominent for main card fields */
  size?: 'sm' | 'md' | 'lg';
}) {
  const [state, setState] = useState<EditState>('idle');
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(String(value));
    setState('editing');
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const requestConfirm = () => {
    const n = parseFloat(draft);
    if (isNaN(n) || n < min || n > max) { setDraft(String(value)); setState('idle'); return; }
    if (n === value) { setState('idle'); return; }
    setState('confirming');
  };

  const applyChange = () => { onConfirm(parseFloat(draft)); setState('idle'); };
  const cancel = () => { setDraft(String(value)); setState('idle'); };

  const pillBase =
    size === 'sm'
      ? 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold tabular-nums border transition-all cursor-pointer'
      : size === 'lg'
        ? 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold tabular-nums border-2 transition-all cursor-pointer'
        : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold tabular-nums border transition-all cursor-pointer';

  // ── Idle: always-visible pill button ──────────────────────────────────────
  if (state === 'idle') {
    return (
      <button
        onClick={startEdit}
        className={`${pillBase} bg-white border-gray-200 text-gray-800 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 group`}
      >
        {prefix && <span className="font-normal text-gray-400">{prefix}</span>}
        <span>{value}{suffix}</span>
        <svg
          width={size === 'sm' ? 11 : size === 'lg' ? 16 : 13}
          height={size === 'sm' ? 11 : size === 'lg' ? 16 : 13}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          className="text-gray-300 group-hover:text-orange-500 transition-colors shrink-0"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
        </svg>
      </button>
    );
  }

  // ── Editing: compact inline input ─────────────────────────────────────────
  if (state === 'editing') {
    return (
      <span className="inline-flex items-center gap-1.5">
        {prefix && <span className="text-xs text-gray-400">{prefix}</span>}
        <input
          ref={inputRef}
          type="number"
          value={draft}
          min={min}
          max={max}
          step={step}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') requestConfirm(); if (e.key === 'Escape') cancel(); }}
          autoFocus
          className={`border-2 border-orange-400 rounded-lg px-2 py-1 font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-900 bg-white ${
            size === 'lg' ? 'w-20 text-base' : 'w-16 text-sm'
          }`}
        />
        {suffix && <span className="text-xs font-medium text-gray-500">{suffix}</span>}
        <button
          onClick={requestConfirm}
          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <IcCheck /> Apply
        </button>
        <button
          onClick={cancel}
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-xs font-semibold px-2 py-1.5 rounded-lg transition-colors"
        >
          <IcX />
        </button>
      </span>
    );
  }

  // ── Confirming: pill stays in layout, dark tooltip floats above ───────────
  const newVal = parseFloat(draft);
  return (
    <span className="relative inline-block">
      {/* Original pill stays, tinted amber so user sees "pending" state */}
      <span className={`${pillBase} bg-amber-50 border-amber-300 text-amber-700 pointer-events-none`}>
        {prefix && <span className="font-normal text-amber-500">{prefix}</span>}
        <span>{value}{suffix}</span>
        <svg width={size === 'sm' ? 11 : size === 'lg' ? 16 : 13} height={size === 'sm' ? 11 : size === 'lg' ? 16 : 13}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          className="text-amber-400 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
        </svg>
      </span>

      {/* Floating confirmation tooltip — no layout impact */}
      <span className="absolute bottom-full left-0 mb-2.5 z-50 flex flex-col items-start" style={{ minWidth: '220px' }}>
        <span className="bg-gray-900 rounded-xl px-4 py-3 shadow-2xl flex flex-col gap-2.5 w-full">
          <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Confirm change</span>
          {/* Before → After */}
          <span className="flex items-center gap-2">
            <span className="text-sm text-gray-400 line-through tabular-nums">{prefix}{value}{suffix}</span>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-orange-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
            <span className="text-base font-bold text-white tabular-nums">{prefix}{newVal}{suffix}</span>
          </span>
          {/* Action row */}
          <span className="flex items-center gap-2">
            <button
              onClick={applyChange}
              className="flex-1 bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              I understand the impact
            </button>
            <button
              onClick={cancel}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </span>
        </span>
        {/* Arrow pointing down */}
        <span className="ml-4 w-3 h-3 bg-gray-900 rotate-45 -mt-1.5 shrink-0" />
      </span>
    </span>
  );
}

// ─── Revenue Timeline Bar ─────────────────────────────────────────────────────

function RevenueTimeline({ stages }: { stages: FinanceStage[] }) {
  const total = stages.reduce((s, st) => s + st.revenueRecognition, 0);
  const isBalanced = total === 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Revenue Recognition Flow</h3>
        <span className={`text-xs font-semibold tabular-nums ${isBalanced ? 'text-emerald-600' : total > 100 ? 'text-red-500' : 'text-amber-500'}`}>
          {total}% distributed
        </span>
      </div>

      {/* Segmented bar */}
      <div className="relative h-7 rounded-lg overflow-hidden bg-gray-100 flex">
        {stages.map((stage, i) => {
          const w = Math.max(stage.revenueRecognition, 0);
          const barColor = STAGE_BAR_COLORS[i % STAGE_BAR_COLORS.length];
          return (
            <div
              key={stage.id}
              className="group/seg relative h-full flex items-center justify-center border-r border-white/50 cursor-default"
              style={{ width: `${w}%`, transition: 'width 300ms ease' }}
              title={`${stage.courseName}: ${w}%`}
            >
              <div className={`absolute inset-0 ${barColor} opacity-70 group-hover/seg:opacity-90 transition-opacity`} />
              {w >= 7 && (
                <span className="relative z-10 text-[10px] font-bold text-white drop-shadow-sm">{stage.order}</span>
              )}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/seg:flex flex-col items-center z-20 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl">
                  <p className="font-semibold">{stage.courseName}</p>
                  <p className="text-gray-300 text-[11px]">{w}%</p>
                </div>
                <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
              </div>
            </div>
          );
        })}
        {/* Unallocated remainder */}
        {total < 100 && (
          <div className="h-full bg-gray-200 opacity-60 flex-1" style={{ transition: 'width 300ms ease' }} />
        )}
      </div>

      {/* Cumulative markers */}
      <div className="relative flex mt-1">
        {(() => {
          let cum = 0;
          return stages.map((stage, i) => {
            cum += stage.revenueRecognition;
            const isLast = i === stages.length - 1;
            return (
              <div key={stage.id} style={{ width: `${stage.revenueRecognition}%` }} className="relative">
                {!isLast && cum <= 100 && (
                  <div className="absolute right-0 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-px h-2 bg-gray-300" />
                    <span className="text-[9px] text-gray-400 tabular-nums">{cum}%</span>
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>

      {/* Stage legend */}
      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
        {stages.map((stage, i) => {
          const barColor = STAGE_BAR_COLORS[i % STAGE_BAR_COLORS.length];
          return (
            <div key={stage.id} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`w-2.5 h-2.5 rounded-sm ${barColor} opacity-70`} />
              <span className="truncate max-w-[120px]">{stage.courseName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Activity row ─────────────────────────────────────────────────────────────

function ActivityRow({
  activity,
  index,
}: {
  activity: FinanceStage['activities'][number];
  index: number;
}) {
  const typeStyle = activityTypeStyle[activity.type];

  return (
    <tr className={`border-t border-gray-100 hover:bg-gray-50/50 transition-colors ${index % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
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

// ─── Stage card ───────────────────────────────────────────────────────────────

function StageCard({
  stage,
  stageIndex,
  cumulative,
  onUpdateRevenue,
  onUpdateRefund,
  onUpdatePrice,
}: {
  stage: FinanceStage;
  stageIndex: number;
  cumulative: number;
  onUpdateRevenue: (id: string, val: number) => void;
  onUpdateRefund: (id: string, val: number) => void;
  onUpdatePrice: (id: string, val: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const stageColor = STAGE_BAR_COLORS[stageIndex % STAGE_BAR_COLORS.length];
  const isUnpriced = stage.price === 0;

  return (
    <div className={`bg-white rounded-xl border transition-shadow ${isUnpriced ? 'border-amber-300 border-dashed' : 'border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-stretch">

        {/* Left: content */}
        <div className="flex items-center min-w-0 flex-1">
          <div className="flex items-center gap-3 pl-4 pr-4 py-3 min-w-0 flex-1">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${isUnpriced ? 'bg-amber-400' : stageColor}`}>
              {isUnpriced ? (
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              ) : stage.order}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{stage.courseName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">{stage.durationHours}h{stage.durationMinutes > 0 ? ` ${stage.durationMinutes}m` : ''}</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">{stage.activities.length} activities</span>
                {isUnpriced && (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Needs pricing</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: editable fields — table layout */}
        <div className="flex border-l border-gray-200 bg-gray-50/60 rounded-r-xl ">
          <table className="border-collapse">
            <tbody>
              <tr>
                <td className="px-3 py-2.5 align-middle border-r border-gray-200 w-[90px]">
                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Price</div>
                  <span onClick={e => e.stopPropagation()}>
                    <EditableField value={stage.price} prefix="£" min={0} max={99999} step={50} onConfirm={v => onUpdatePrice(stage.id, v)} size="lg" />
                  </span>
                </td>
                <td className="px-3 py-2.5 align-middle border-r border-gray-200 w-[90px]">
                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    Revenue <span title="Linked to price" className="opacity-50"><svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg></span>
                  </div>
                  <EditableField value={stage.revenueRecognition} suffix="%" min={0} max={100} step={1} onConfirm={v => onUpdateRevenue(stage.id, v)} size="lg" />
                </td>
                <td className="px-3 py-2.5 align-middle border-r border-gray-200 w-[95px]">
                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Cum.</div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold tabular-nums ${cumulative === 100 ? 'text-emerald-600' : cumulative > 100 ? 'text-red-500' : 'text-gray-700'}`}>{cumulative}%</span>
                    <div className="w-8 h-1.5 rounded-full bg-gray-200 overflow-hidden shrink-0">
                      <div className={`h-full rounded-full ${cumulative === 100 ? 'bg-emerald-500' : cumulative > 100 ? 'bg-red-500' : 'bg-orange-400'}`} style={{ width: `${Math.min(cumulative, 100)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 align-middle w-[85px]">
                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Refund</div>
                  <EditableField value={stage.exposedRefund} prefix="£" min={0} max={9999} step={5} onConfirm={v => onUpdateRefund(stage.id, v)} size="lg" />
                </td>
              </tr>
            </tbody>
          </table>
          <button onClick={() => setExpanded(v => !v)} className="flex items-center justify-center w-11 self-stretch shrink-0 hover:bg-gray-100 transition-colors border-l border-gray-200 text-gray-400 hover:text-gray-600">
            <IcChevron open={expanded} />
          </button>
        </div>
      </div>

      {/* Activities table */}
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

// ─── Stage List ───────────────────────────────────────────────────────────────

function StageList({
  stages,
  cumulatives,
  onUpdateRevenue,
  onUpdateRefund,
  onUpdatePrice,
}: {
  stages: FinanceStage[];
  cumulatives: number[];
  onUpdateRevenue: (id: string, val: number) => void;
  onUpdateRefund: (id: string, val: number) => void;
  onUpdatePrice: (id: string, val: number) => void;
}) {
  return (
    <div className="space-y-2">
      {stages.map((stage, i) => (
        <StageCard
          key={stage.id}
          stage={stage}
          stageIndex={i}
          cumulative={cumulatives[i]}
          onUpdateRevenue={onUpdateRevenue}
          onUpdateRefund={onUpdateRefund}
          onUpdatePrice={onUpdatePrice}
        />
      ))}
    </div>
  );
}

// ─── Summary Panel ────────────────────────────────────────────────────────────

function SummaryPanel({
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
  // Additive price model: total = stages (delivery) + digital asset component
  const sumOfStagePrices = stages.reduce((s, st) => s + st.price, 0);
  const digitalAssetValue = Math.round(sumOfStagePrices * digitalAccessPct / 100);
  const computedTotalPrice = sumOfStagePrices + digitalAssetValue;

  return (
    <div className="space-y-3">

      {/* Revenue distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Revenue Distribution</p>
        <div className="flex items-end gap-2 mb-2">
          <span className={`text-3xl font-bold tabular-nums ${revOk ? 'text-emerald-600' : revTotal > 100 ? 'text-red-500' : 'text-amber-500'}`}>
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
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
            Balanced
          </p>
        ) : (
          <p className="text-xs text-amber-600">
            {revTotal < 100 ? `${100 - revTotal}% unallocated` : `${revTotal - 100}% over-allocated`}
          </p>
        )}
      </div>

      {/* Financial summary — additive price breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Price Breakdown</p>

        {/* Stage delivery total */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-xs text-gray-500">Stage delivery</span>
          <span className="text-xs font-semibold tabular-nums text-gray-800">{fmtPrice(sumOfStagePrices)}</span>
        </div>

        {/* Digital asset value — editable */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500">Digital assets</span>
            <div className="flex items-center gap-1">
              <EditableField
                value={digitalAccessPct}
                suffix="%"
                min={0}
                max={100}
                step={1}
                onConfirm={onUpdateDigitalAccessPct}
                size="sm"
              />
              <span className="text-[10px] text-gray-400">of delivery</span>
            </div>
          </div>
          <span className="text-xs font-semibold tabular-nums text-blue-600">+ {fmtPrice(digitalAssetValue)}</span>
        </div>

        {/* Divider + total */}
        <div className="flex justify-between items-center pt-2.5 mt-0.5">
          <span className="text-sm font-semibold text-gray-700">Total Price</span>
          <span className="text-base font-bold tabular-nums text-gray-900">{fmtPrice(computedTotalPrice)}</span>
        </div>

        {/* Visual stacked bar */}
        <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden flex">
          <div
            className="h-full bg-orange-400 transition-all"
            style={{ width: `${computedTotalPrice > 0 ? (sumOfStagePrices / computedTotalPrice) * 100 : 0}%` }}
          />
          <div
            className="h-full bg-blue-400 transition-all"
            style={{ width: `${computedTotalPrice > 0 ? (digitalAssetValue / computedTotalPrice) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-orange-400 inline-block" />
            Delivery
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-blue-400 inline-block" />
            Digital
          </span>
        </div>

        {/* Other stats */}
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          {[
            { label: 'Total Refund', value: fmtPrice(totalRefund), highlight: totalRefund > 200 },
            { label: 'Total Duration', value: `${pkg.totalDurationHours}h`, highlight: false },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{label}</span>
              <span className={`text-xs font-semibold tabular-nums ${highlight ? 'text-red-500' : 'text-gray-700'}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery mix */}
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

      

      {/* Hint */}
      <p className="text-[10px] text-gray-400 text-center px-2 leading-relaxed">
        Click any value to edit · Activities are read-only
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PackageCockpitPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const pkg = financePackages.find(p => p.id === id);

  if (!pkg) notFound();

  const router = useRouter();
  const [stages, setStages] = useState<FinanceStage[]>(pkg.stages);
  const [digitalAccessPct, setDigitalAccessPct] = useState(pkg.digitalAccessPercent);
  const [packageStatus, setPackageStatus] = useState<PackageStatus>(pkg.status);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const recalcAllRevenue = (stages: FinanceStage[]): FinanceStage[] => {
    const total = stages.reduce((s, st) => s + st.price, 0);
    if (total === 0) return stages.map(s => ({ ...s, revenueRecognition: 0 }));
    return stages.map(s => ({ ...s, revenueRecognition: Math.round((s.price / total) * 100) }));
  };

  const updateRevenue = useCallback((stageId: string, val: number) => {
    setStages(prev => {
      const deliverySum = prev.reduce((s, st) => s + st.price, 0);
      const derivedPrice = Math.round(deliverySum * val / 100);
      return prev.map(s =>
        s.id === stageId ? { ...s, revenueRecognition: val, price: derivedPrice } : s
      );
    });
  }, []);

  const updateRefund = useCallback((stageId: string, val: number) => {
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, exposedRefund: val } : s));
  }, []);

  const updatePrice = useCallback((stageId: string, val: number) => {
    setStages(prev => {
      const updated = prev.map(s =>
        s.id === stageId ? { ...s, price: val } : s
      );
      return recalcAllRevenue(updated);
    });
  }, []);

  const updateTotalPrice = useCallback((newTotal: number) => {
    const newDeliverySum = digitalAccessPct > 0
      ? Math.round(newTotal / (1 + digitalAccessPct / 100))
      : newTotal;

    setStages(prev => {
      const revTotal = prev.reduce((s, st) => s + st.revenueRecognition, 0);

      if (revTotal > 0) {
        return prev.map(s => ({
          ...s,
          price: Math.round(newDeliverySum * s.revenueRecognition / revTotal),
        }));
      }

      const even = Math.round(newDeliverySum / prev.length);
      return prev.map(s => ({ ...s, price: even }));
    });
  }, [digitalAccessPct]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    // TODO: persist stages + digitalAccessPct + packageStatus to API
    await new Promise(r => setTimeout(r, 400));
    setIsSaving(false);
    router.push('/finance/packages');
  }, [router]);

  // Cumulative revenue per stage
  let running = 0;
  const cumulatives = stages.map(s => { running += s.revenueRecognition; return running; });

  const revTotal = stages.reduce((s, st) => s + st.revenueRecognition, 0);
  const totalActivities = stages.flatMap(s => s.activities).length;
  const totalRefund = stages.reduce((s, st) => s + st.exposedRefund, 0);

  const sumOfStagePrices = stages.reduce((s, st) => s + st.price, 0);
  const digitalAssetValue = Math.round(sumOfStagePrices * digitalAccessPct / 100);
  const computedTotalPrice = sumOfStagePrices + digitalAssetValue;

  const pricedStages = stages.filter(s => s.price > 0).length;
  const allPriced = pricedStages === stages.length;
  const pricingPct = stages.length > 0 ? Math.round((pricedStages / stages.length) * 100) : 0;

  return (
    <div className="flex flex-col min-h-full">

      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">

        {/* Breadcrumb + title */}
        <div className="flex items-center gap-3 px-6 py-3">
          <Link
            href="/finance/packages"
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Packages
          </Link>
          <span className="text-gray-200">/</span>
          <h1 className="text-sm font-semibold text-gray-900 flex-1 truncate">{pkg.name}</h1>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-gray-500 bg-gray-100">
              {pkg.trade}
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusDropdownOpen(v => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 ${statusText[packageStatus]} hover:border-gray-300`}
              >
                <span className={`w-2 h-2 rounded-full ${statusDot[packageStatus]}`} />
                {packageStatus}
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={`transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {statusDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setStatusDropdownOpen(false)} aria-hidden />
                  <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[180px] rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl">
                    {(['Pending', 'Ready to Sell'] as PackageStatus[]).map((s) => {
                      const disabled = s === 'Ready to Sell' && !allPriced;
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={disabled}
                          onClick={() => { if (!disabled) { setPackageStatus(s); setStatusDropdownOpen(false); } }}
                          className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-sm ${
                            disabled
                              ? 'opacity-40 cursor-not-allowed'
                              : `hover:bg-gray-50 ${packageStatus === s ? 'bg-gray-50 font-semibold text-gray-900' : 'text-gray-700'}`
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusDot[s]}`} />
                          <span className="flex-1">{s}</span>
                          {disabled && (
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400 shrink-0">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                    {!allPriced && (
                      <div className="px-3.5 pt-1.5 pb-1 border-t border-gray-100 mt-1">
                        <p className="text-[10px] text-amber-600">Price all courses to enable</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
        
            <button
              onClick={handleSave}
              disabled={isSaving}
              
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-orange-500 text-white shadow-sm hover:bg-orange-600 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Save
                </>
              )}
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="flex items-stretch border-t border-gray-100 divide-x divide-gray-100">
          {/* Package Price — editable */}
          <div className="flex-1 px-4 py-2.5 min-w-0">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Package Price</p>
            <div className="mt-0.5">
              <EditableField
                value={computedTotalPrice}
                prefix="£"
                min={0}
                max={999999}
                step={100}
                onConfirm={updateTotalPrice}
                size="md"
              />
            </div>
          </div>

          {[
            { label: 'Total Refund', value: fmtPrice(totalRefund) },
            { label: 'Courses', value: String(pkg.courseCount) },
            { label: 'Modules', value: String(pkg.moduleCount) },
            { label: 'Activities', value: String(totalActivities) },
          ].map(({ label, value }) => (
            <div key={label} className="flex-1 px-4 py-2.5 min-w-0">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide truncate">{label}</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-bold text-gray-900 tabular-nums">{value}</span>
              </div>
            </div>
          ))}

          {/* Digital Assets — editable */}
          <div className="flex-1 px-4 py-2.5 min-w-0">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Digital Assets</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs text-blue-400 font-semibold">+</span>
              <span className="text-base font-bold text-gray-900 tabular-nums">{fmtPrice(digitalAssetValue)}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <EditableField
                value={digitalAccessPct}
                suffix="%"
                min={0}
                max={100}
                step={1}
                onConfirm={v => setDigitalAccessPct(v)}
                size="sm"
              />
              <span className="text-[10px] text-gray-400">of delivery</span>
            </div>
          </div>
        </div>

        {/* Pricing progress bar — only shown when not fully priced */}
        {!allPriced && (
          <div className="px-6 py-2 bg-amber-50/80 border-t border-amber-200/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-amber-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <span className="text-xs font-semibold text-amber-700">
                  {pricedStages} of {stages.length} courses priced
                </span>
              </div>
              <div className="flex-1 h-2 rounded-full bg-amber-200/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-orange-400 transition-all"
                  style={{ width: `${pricingPct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-amber-700 tabular-nums shrink-0">{pricingPct}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">

        {/* Left: timeline + stages */}
        <div className="flex-1 min-w-0 p-4 overflow-auto">
          <RevenueTimeline stages={stages} />

          <StageList
            stages={stages}
            cumulatives={cumulatives}
            onUpdateRevenue={updateRevenue}
            onUpdateRefund={updateRefund}
            onUpdatePrice={updatePrice}
          />
        </div>

        {/* Right: summary panel */}
        <div className="w-68 shrink-0 border-l border-gray-200 overflow-auto p-4 bg-gray-50/60" style={{ width: '17rem' }}>
          <SummaryPanel
            pkg={pkg}
            stages={stages}
            digitalAccessPct={digitalAccessPct}
            onUpdateDigitalAccessPct={setDigitalAccessPct}
          />
        </div>
      </div>
    </div>
  );
}
