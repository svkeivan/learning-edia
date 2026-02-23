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
  Active: 'bg-emerald-500',
  Draft: 'bg-amber-500',
  Inactive: 'bg-gray-400',
};
const statusText: Record<PackageStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Draft: 'bg-amber-100 text-amber-700',
  Inactive: 'bg-gray-100 text-gray-500',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function fmtPrice(n: number) {
  return `£${n.toLocaleString('en-GB')}`;
}

function countActivitiesByType(stages: FinanceStage[], type: ActivityType): number {
  return stages.flatMap(s => s.activities).filter(a => a.type === type).length;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IcEdit = () => (
  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
  </svg>
);
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
const IcGrip = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-gray-300">
    <circle cx="5" cy="4" r="1.3" /><circle cx="5" cy="8" r="1.3" /><circle cx="5" cy="12" r="1.3" />
    <circle cx="11" cy="4" r="1.3" /><circle cx="11" cy="8" r="1.3" /><circle cx="11" cy="12" r="1.3" />
  </svg>
);
const IcClock = () => (
  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="opacity-50">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
const IcGlobe = () => (
  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="opacity-60">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253" />
  </svg>
);
const IcPin = () => (
  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="opacity-60">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
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
  const isInPerson = activity.delivery === 'In-Person';

  return (
    <tr className={`border-t border-gray-100 hover:bg-gray-50/50 transition-colors ${index % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
      <td className="py-2 pl-5 pr-2">
        <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold inline-flex items-center justify-center">
          {index + 1}
        </span>
      </td>
      <td className="py-2 px-2 text-gray-800 font-medium">{activity.name}</td>
      <td className="py-2 px-2 text-gray-500 tabular-nums text-xs">
        <span className="inline-flex items-center gap-1"><IcClock /> {fmtDuration(activity.durationMinutes)}</span>
      </td>
      <td className="py-2 px-2">
        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${typeStyle}`}>{activity.type}</span>
      </td>
      <td className={`py-2 pl-2 pr-5 text-xs ${isInPerson ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
        <span className="inline-flex items-center gap-1">{isInPerson ? <IcPin /> : <IcGlobe />}{activity.delivery}</span>
      </td>
    </tr>
  );
}

// ─── Stage card ───────────────────────────────────────────────────────────────

function StageCard({
  stage,
  stageIndex,
  cumulative,
  dragHandleProps,
  isDragging,
  onUpdateRevenue,
  onUpdateRefund,
  onUpdatePrice,
}: {
  stage: FinanceStage;
  stageIndex: number;
  cumulative: number;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
  onUpdateRevenue: (id: string, val: number) => void;
  onUpdateRefund: (id: string, val: number) => void;
  onUpdatePrice: (id: string, val: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const stageColor = STAGE_BAR_COLORS[stageIndex % STAGE_BAR_COLORS.length];
  const totalActivityDuration = stage.activities.reduce((s, a) => s + a.durationMinutes, 0);

  return (
    <div
      className={`bg-white rounded-xl border transition-shadow ${isDragging
          ? 'border-orange-300 shadow-xl rotate-1 scale-[1.01]'
          : 'border-gray-200 hover:border-gray-300'
        }`}
    >
      <div className="flex items-stretch">

        {/* Left: drag + content */}
        <div className="flex items-center min-w-0 flex-1">
          <div
            {...dragHandleProps}
            className="flex items-center justify-center w-9 shrink-0 self-stretch cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors border-r border-gray-100 rounded-l-xl"
            title="Drag to reorder"
          >
            <IcGrip />
          </div>

          <div className="flex items-center gap-3 pl-4 pr-4 py-3 min-w-0 flex-1">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${stageColor}`}>
              {stage.order}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{stage.courseName}</p>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                <span className="flex items-center gap-1"><IcClock /> {fmtDuration(totalActivityDuration)}</span>
                <span>{stage.activities.length} activities</span>
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
                <th className="text-left py-2 px-2 w-20">Duration</th>
                <th className="text-left py-2 px-2 w-24">Type</th>
                <th className="text-left py-2 pl-2 pr-5 w-24">Delivery</th>
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

// ─── Native Drag-and-Drop Sortable List ───────────────────────────────────────

function SortableStageList({
  stages,
  cumulatives,
  onReorder,
  onUpdateRevenue,
  onUpdateRefund,
  onUpdatePrice,
}: {
  stages: FinanceStage[];
  cumulatives: number[];
  onReorder: (newStages: FinanceStage[]) => void;
  onUpdateRevenue: (id: string, val: number) => void;
  onUpdateRefund: (id: string, val: number) => void;
  onUpdatePrice: (id: string, val: number) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const dragIndexRef = useRef<number>(-1);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDragId(id);
    dragIndexRef.current = stages.findIndex(s => s.id === id);
    e.dataTransfer.effectAllowed = 'move';
    // Hide the default ghost by setting an invisible element
    const ghost = document.createElement('div');
    ghost.style.position = 'absolute';
    ghost.style.top = '-9999px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  }, [stages]);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverId(id);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return; }
    const from = stages.findIndex(s => s.id === dragId);
    const to = stages.findIndex(s => s.id === targetId);
    if (from === -1 || to === -1) return;
    const next = [...stages];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    // Re-assign order numbers
    const reordered = next.map((s, i) => ({ ...s, order: i + 1 }));
    onReorder(reordered);
    setDragId(null);
    setOverId(null);
  }, [dragId, stages, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setOverId(null);
  }, []);

  return (
    <div className="space-y-2">
      {stages.map((stage, i) => {
        const isDragging = dragId === stage.id;
        const isOver = overId === stage.id && dragId !== stage.id;

        return (
          <div
            key={stage.id}
            draggable
            onDragStart={e => handleDragStart(e, stage.id)}
            onDragOver={e => handleDragOver(e, stage.id)}
            onDrop={e => handleDrop(e, stage.id)}
            onDragEnd={handleDragEnd}
            className={`transition-all ${isDragging ? 'opacity-40' : 'opacity-100'} ${isOver ? 'ring-2 ring-orange-400 ring-offset-1 rounded-xl' : ''
              }`}
          >
            <StageCard
              stage={stage}
              stageIndex={i}
              cumulative={cumulatives[i]}
              isDragging={isDragging}
              onUpdateRevenue={onUpdateRevenue}
              onUpdateRefund={onUpdateRefund}
              onUpdatePrice={onUpdatePrice}
            />
          </div>
        );
      })}
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
  const maxRefund = stages[0]?.exposedRefund ?? 0;
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
            { label: 'Max Refund Exposure', value: `£${maxRefund}`, highlight: maxRefund > 60 },
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
        Click any value to edit · Drag stages to reorder · Activities are read-only
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

  const updateRevenue = useCallback((stageId: string, val: number) => {
    setStages(prev => {
      // Base = current sum of all stage prices (delivery total, excluding digital)
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
      // New delivery sum = replace this stage's old price with the new one
      const newDeliverySum = prev.reduce((s, st) => s + (st.id === stageId ? val : st.price), 0);
      const derivedRevenue = newDeliverySum > 0
        ? Math.round((val / newDeliverySum) * 100)
        : 0;
      return prev.map(s =>
        s.id === stageId ? { ...s, price: val, revenueRecognition: derivedRevenue } : s
      );
    });
  }, []);

  const reorderStages = useCallback((newStages: FinanceStage[]) => {
    setStages(newStages);
  }, []);

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
  const webinarCount = countActivitiesByType(stages, 'Webinar');
  const examCount = countActivitiesByType(stages, 'Exam');
  const maxRefund = stages[0]?.exposedRefund ?? 0;

  // Total price = delivery (sum of stages) + digital asset component
  const sumOfStagePrices = stages.reduce((s, st) => s + st.price, 0);
  const digitalAssetValue = Math.round(sumOfStagePrices * digitalAccessPct / 100);
  const computedTotalPrice = sumOfStagePrices + digitalAssetValue;

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
                  <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[150px] rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl">
                    {(['Active', 'Inactive', 'Draft'] as PackageStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setPackageStatus(s); setStatusDropdownOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-sm hover:bg-gray-50 ${packageStatus === s ? 'bg-gray-50 font-semibold text-gray-900' : 'text-gray-700'}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${statusDot[s]}`} />
                        {s}
                      </button>
                    ))}
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
          {/* Static metrics */}
          {[
            { label: 'Package Price', value: fmtPrice(computedTotalPrice), sub: null },
            { label: 'Max Refund', value: `£${maxRefund}`, sub: 'at purchase' },
            { label: 'Modules', value: String(pkg.moduleCount), sub: null },
            { label: 'Activities', value: String(totalActivities), sub: `${pkg.courseCount} courses` },
            { label: 'Webinars', value: String(webinarCount), sub: 'live sessions' },
            { label: 'Assessments', value: String(examCount), sub: 'exams' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="flex-1 px-4 py-2.5 min-w-0">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide truncate">{label}</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-bold text-gray-900 tabular-nums">{value}</span>
                {sub && <span className="text-[10px] text-gray-400">{sub}</span>}
              </div>
            </div>
          ))}

          {/* Digital Asset Value — editable, additive */}
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

          {/* Rev. Recognition — read-only glance */}
          <div className="flex-1 px-4 py-2.5 min-w-0">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Rev. Recognition</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-base font-bold tabular-nums ${revTotal === 100 ? 'text-emerald-600' : 'text-amber-500'}`}>
                {revTotal}%
              </span>
              {revTotal === 100 && (
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-emerald-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      

      {/* Main content */}
      <div className="flex flex-1 min-h-0">

        {/* Left: timeline + stages */}
        <div className="flex-1 min-w-0 p-4 overflow-auto">
          <RevenueTimeline stages={stages} />

          <SortableStageList
            stages={stages}
            cumulatives={cumulatives}
            onReorder={reorderStages}
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
