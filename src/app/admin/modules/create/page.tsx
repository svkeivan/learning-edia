'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivityType  = 'assessment' | 'video' | 'reading' | 'bundle' | 'split';
type CompletionType = 'mandatory' | 'passthrough' | 'optional';
type DeliveryMode   = 'none' | 'online' | 'hub' | 'all';

interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  completion: CompletionType;
}

interface ModuleForm {
  name: string;
  description: string;
  image: File | null;
  imagePreview: string | null;
  price: number | '';
  refundableAmount: number | '';
  suggestedDays: number | '';
  // step 2
  activities: Activity[];
  // step 3
  hasAssessments: boolean;
  assessmentCount: number | '';
  selectedForms: (string | '')[];
  // step 4
  isSellable: boolean;
  isCommissionable: boolean;
  isActive: boolean;
  deliveryMode: DeliveryMode;
  numberOfSplits: number | '';
  timePerSplit: number | '';
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const AVAILABLE_ACTIVITIES: Activity[] = [
  { id: 'a1', name: 'Introduction to Basics',       type: 'assessment', completion: 'mandatory'   },
  { id: 'a2', name: 'Welcome!',                      type: 'video',      completion: 'mandatory'   },
  { id: 'a3', name: 'Key Words',                     type: 'reading',    completion: 'passthrough' },
  { id: 'a4', name: 'Safety Induction Video',        type: 'video',      completion: 'mandatory'   },
  { id: 'a5', name: 'Core Concepts Quiz',            type: 'assessment', completion: 'mandatory'   },
  { id: 'a6', name: 'Glossary of Terms',             type: 'reading',    completion: 'optional'    },
  { id: 'a7', name: 'Practical Walkthrough',         type: 'video',      completion: 'passthrough' },
  { id: 'a8', name: 'Final Knowledge Check',         type: 'assessment', completion: 'mandatory'   },
  { id: 'a9', name: 'Reference Guide',               type: 'reading',    completion: 'optional'    },
  { id: 'a10', name: 'Bundle Booking',               type: 'bundle',     completion: 'mandatory'   },
  { id: 'a11', name: 'Split 1 — Instructor Review',  type: 'split',      completion: 'mandatory'   },
  { id: 'a12', name: 'Split 2 — Skills Check',       type: 'split',      completion: 'mandatory'   },
  { id: 'a13', name: 'Split 3 — Daily Evaluation',   type: 'split',      completion: 'mandatory'   },
];

const AVAILABLE_FORMS = [
  'Instructor Evaluation Form',
  'Skill Verification Checklist',
  'Daily Knowledge Check',
  'Progress Review Form',
  'Final Assessment Form',
  'Health & Safety Declaration',
  'Practical Sign-Off Sheet',
];

// ─── Visual config ────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<ActivityType, { label: string; bg: string; text: string; dot: string }> = {
  assessment: { label: 'Assessment',       bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-400' },
  video:      { label: 'Video',            bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  reading:    { label: 'Reading Material', bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
  bundle:     { label: 'Bundle',           bg: 'bg-teal-100',   text: 'text-teal-700',   dot: 'bg-teal-400'   },
  split:      { label: 'Split',            bg: 'bg-rose-100',   text: 'text-rose-700',   dot: 'bg-rose-400'   },
};

const COMPLETION_STYLES: Record<CompletionType, { label: string; bg: string; text: string }> = {
  mandatory:   { label: 'Mandatory',   bg: 'bg-orange-100', text: 'text-orange-700' },
  passthrough: { label: 'Passthrough', bg: 'bg-gray-100',   text: 'text-gray-600'   },
  optional:    { label: 'Optional',    bg: 'bg-green-100',  text: 'text-green-700'  },
};

const DELIVERY_OPTIONS: { key: DeliveryMode; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    key: 'none', label: 'None', sub: 'No specific delivery mode',
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
  },
  {
    key: 'online', label: 'Online', sub: 'Delivered fully online',
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253" /></svg>,
  },
  {
    key: 'hub', label: 'Hub Only', sub: 'Physical hub location',
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  },
  {
    key: 'all', label: 'All Locations', sub: 'Available everywhere',
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>,
  },
];

// ─── Small shared components ──────────────────────────────────────────────────

function DragHandle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-gray-300 group-hover/card:text-gray-400 transition-colors">
      <circle cx="5" cy="4" r="1.2"/><circle cx="5" cy="8" r="1.2"/><circle cx="5" cy="12" r="1.2"/>
      <circle cx="11" cy="4" r="1.2"/><circle cx="11" cy="8" r="1.2"/><circle cx="11" cy="12" r="1.2"/>
    </svg>
  );
}

function ActivityTypeIcon({ type }: { type: ActivityType }) {
  if (type === 'assessment') return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
  );
  if (type === 'video') return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
  if (type === 'bundle') return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
    </svg>
  );
  if (type === 'split') return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: () => void; label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <button
        type="button" role="switch" aria-checked={checked} onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 shrink-0 ml-4 ${checked ? 'bg-orange-500' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = ['Module Info', 'Activities', 'Assessments', 'Settings & Delivery'];

function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Progress" className="flex items-center flex-wrap gap-y-2">
      {STEPS.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'upcoming';
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                state === 'done' ? 'bg-orange-500 text-white' :
                state === 'active' ? 'bg-orange-500 text-white ring-4 ring-orange-100' :
                'bg-gray-200 text-gray-500'
              }`}>
                {state === 'done'
                  ? <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  : i + 1}
              </span>
              <span className={`text-sm font-medium whitespace-nowrap ${
                state === 'active' ? 'text-orange-600' : state === 'done' ? 'text-gray-700' : 'text-gray-400'
              }`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`w-8 h-px mx-2 ${i < current ? 'bg-orange-300' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </nav>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

function ModalShell({ title, subtitle, onClose, children }: {
  title: string; subtitle: string; onClose: () => void; children: React.ReactNode;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Close">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Add Activity Modal ───────────────────────────────────────────────────────

type ActivityFilter = 'all' | ActivityType;
const ACTIVITY_FILTERS: ActivityFilter[] = ['all', 'assessment', 'video', 'reading', 'bundle', 'split'];

function AddActivityModal({ alreadyAdded, onConfirm, onClose }: {
  alreadyAdded: Set<string>;
  onConfirm: (a: Activity[]) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [pending, setPending] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { searchRef.current?.focus(); }, []);

  const visible = AVAILABLE_ACTIVITIES.filter(a => {
    const q = query.toLowerCase();
    return (!q || a.name.toLowerCase().includes(q)) && (filter === 'all' || a.type === filter);
  });

  const toggle = (id: string) => {
    if (alreadyAdded.has(id)) return;
    setPending(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <ModalShell title="Add Activities" subtitle="Search and select activities for this module" onClose={onClose}>
      {/* Search + filters */}
      <div className="px-6 pt-4 pb-3 space-y-3 shrink-0 border-b border-gray-100">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
            </svg>
          </span>
          <input ref={searchRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search activities…"
            className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {ACTIVITY_FILTERS.map(f => {
            const s = f !== 'all' ? TYPE_STYLES[f] : null;
            return (
              <button key={f} type="button" onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s && <span className={`w-1.5 h-1.5 rounded-full ${filter === f ? 'bg-white/70' : s.dot}`} />}
                {f === 'all' ? 'All' : TYPE_STYLES[f].label}
                {f === 'all' && <span className="opacity-60">{AVAILABLE_ACTIVITIES.length}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
        {visible.length === 0 ? (
          <div className="py-12 text-center">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} className="text-gray-300 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
            </svg>
            <p className="text-sm text-gray-500">No activities match</p>
            <button type="button" onClick={() => { setQuery(''); setFilter('all'); }} className="text-xs text-orange-500 hover:underline mt-1">Clear filters</button>
          </div>
        ) : visible.map(act => {
          const isAdded = alreadyAdded.has(act.id);
          const isSel   = pending.has(act.id);
          const ts = TYPE_STYLES[act.type];
          const cs = COMPLETION_STYLES[act.completion];
          return (
            <button key={act.id} type="button" disabled={isAdded} onClick={() => toggle(act.id)}
              className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all ${
                isAdded ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                : isSel ? 'border-orange-400 bg-orange-50'
                : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                  isAdded ? 'border-gray-300 bg-gray-200' : isSel ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-white'
                }`}>
                  {(isAdded || isSel) && <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ts.bg} ${ts.text}`}>
                  <ActivityTypeIcon type={act.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{act.name}</span>
                    {isAdded && <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 font-medium">Already added</span>}
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide ${ts.bg} ${ts.text}`}>{ts.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cs.bg} ${cs.text}`}>{cs.label}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
        <p className="text-sm text-gray-500">
          {pending.size > 0
            ? <><span className="font-semibold text-orange-600">{pending.size}</span> activit{pending.size !== 1 ? 'ies' : 'y'} selected</>
            : 'Select activities above'}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="button" disabled={pending.size === 0}
            onClick={() => onConfirm(AVAILABLE_ACTIVITIES.filter(a => pending.has(a.id)))}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Add{pending.size > 0 ? ` ${pending.size}` : ''} Activit{pending.size !== 1 ? 'ies' : 'y'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Activity card (drag-and-drop) ────────────────────────────────────────────

function ActivityCard({ act, index, isDragging, isDragOver, onDragStart, onDragOver, onDragEnd, onDrop, onRemove }: {
  act: Activity; index: number; isDragging: boolean; isDragOver: boolean;
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void; onDrop: () => void; onRemove: () => void;
}) {
  const ts = TYPE_STYLES[act.type];
  const cs = COMPLETION_STYLES[act.completion];
  return (
    <div draggable onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDrop={onDrop}
      className={`group/card flex items-center gap-3 px-3 py-3 bg-white rounded-xl border-2 transition-all ${
        isDragOver ? 'border-orange-400 shadow-lg scale-[1.01]' :
        isDragging  ? 'border-orange-200 opacity-40' :
                      'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="cursor-grab active:cursor-grabbing p-1 shrink-0"><DragHandle /></div>
      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ts.bg} ${ts.text}`}>
        <ActivityTypeIcon type={act.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{act.name}</p>
        <div className="flex gap-1.5 mt-0.5">
          <span className={`text-xs px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide ${ts.bg} ${ts.text}`}>{ts.label}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cs.bg} ${cs.text}`}>{cs.label}</span>
        </div>
      </div>
      <button type="button" onClick={onRemove}
        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-md hover:bg-red-50 shrink-0">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  );
}

// ─── STEP 1 — Module Info ─────────────────────────────────────────────────────

function StepInfo({ form, onChange }: { form: ModuleForm; onChange: (p: Partial<ModuleForm>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Module Name <span className="text-red-500">*</span></label>
        <input type="text" value={form.name} onChange={e => onChange({ name: e.target.value })}
          placeholder="e.g. Introduction to Gas Engineering"
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
        <textarea value={form.description} onChange={e => onChange({ description: e.target.value })} rows={3}
          placeholder="What will students learn in this module?"
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none" />
        <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/240</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Module Image <span className="text-xs font-normal text-gray-400">(Optional)</span>
        </label>
        {form.imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 h-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange({ image: null, imagePreview: null })}
              className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-orange-50 hover:border-orange-300 transition-colors group">
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-gray-400 group-hover:text-orange-400 mb-2 transition-colors">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/>
            </svg>
            <span className="text-sm text-gray-500 group-hover:text-orange-500 font-medium">Click to upload image</span>
            <span className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 5MB</span>
            <input type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onChange({ image: f, imagePreview: URL.createObjectURL(f) }); }} />
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">£</span>
            <input type="number" min={0} value={form.price} placeholder="0"
              onChange={e => onChange({ price: e.target.value === '' ? '' : Number(e.target.value) })}
              className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Refundable Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">£</span>
            <input type="number" min={0} value={form.refundableAmount} placeholder="0"
              onChange={e => onChange({ refundableAmount: e.target.value === '' ? '' : Number(e.target.value) })}
              className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Suggested Time</label>
        <div className="flex items-center gap-3">
          <input type="number" min={1} value={form.suggestedDays} placeholder="1"
            onChange={e => onChange({ suggestedDays: e.target.value === '' ? '' : Number(e.target.value) })}
            className="w-28 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
          <span className="text-sm text-gray-500 font-medium">days</span>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 2 — Activities ──────────────────────────────────────────────────────

function StepActivities({ form, onChange }: { form: ModuleForm; onChange: (p: Partial<ModuleForm>) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);
  const addedIds = new Set(form.activities.map(a => a.id));

  const handleDrop = (targetId: string) => {
    const fromId = dragId.current;
    if (!fromId || fromId === targetId) return;
    const arr = [...form.activities];
    const from = arr.findIndex(a => a.id === fromId);
    const to   = arr.findIndex(a => a.id === targetId);
    arr.splice(to, 0, arr.splice(from, 1)[0]);
    onChange({ activities: arr });
    dragId.current = null;
    setDragOverId(null);
  };

  // Breakdown by type for the legend
  const counts = form.activities.reduce<Partial<Record<ActivityType, number>>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + 1; return acc;
  }, {});

  return (
    <>
      {showModal && (
        <AddActivityModal alreadyAdded={addedIds}
          onConfirm={acts => { onChange({ activities: [...form.activities, ...acts] }); setShowModal(false); }}
          onClose={() => setShowModal(false)} />
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {form.activities.length === 0
              ? 'No activities added yet.'
              : `${form.activities.length} activit${form.activities.length !== 1 ? 'ies' : 'y'} — drag to reorder`}
          </p>
          <button type="button" onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Add Activity
          </button>
        </div>

        {/* Type legend (only when activities exist) */}
        {form.activities.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            {(Object.entries(counts) as [ActivityType, number][]).map(([type, count]) => {
              const s = TYPE_STYLES[type];
              return (
                <div key={type} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                  <ActivityTypeIcon type={type} />
                  {count}× {s.label}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {form.activities.length === 0 ? (
          <div onClick={() => setShowModal(true)}
            className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} className="text-gray-300 mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"/>
            </svg>
            <p className="text-sm font-medium text-gray-500">No activities yet</p>
            <p className="text-xs text-gray-400 mt-1">Click here or &quot;Add Activity&quot; to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {form.activities.map((act, i) => (
              <ActivityCard key={act.id} act={act} index={i}
                isDragging={dragId.current === act.id}
                isDragOver={dragOverId === act.id}
                onDragStart={() => { dragId.current = act.id; }}
                onDragOver={e => { e.preventDefault(); setDragOverId(act.id); }}
                onDragEnd={() => { dragId.current = null; setDragOverId(null); }}
                onDrop={() => handleDrop(act.id)}
                onRemove={() => onChange({ activities: form.activities.filter(a => a.id !== act.id) })}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── STEP 3 — Assessments ─────────────────────────────────────────────────────

function StepAssessments({ form, onChange }: { form: ModuleForm; onChange: (p: Partial<ModuleForm>) => void }) {
  const count = Number(form.assessmentCount) || 0;

  const handleCountChange = (val: number | '') => {
    const n = Number(val) || 0;
    // Trim or extend selectedForms array to match
    const forms = [...form.selectedForms];
    while (forms.length < n) forms.push('');
    onChange({ assessmentCount: val, selectedForms: forms.slice(0, n) });
  };

  const setForm = (index: number, value: string) => {
    const updated = [...form.selectedForms];
    updated[index] = value;
    onChange({ selectedForms: updated });
  };

  return (
    <div className="space-y-6">
      {/* Toggle card */}
      <div className={`rounded-xl border-2 transition-all overflow-hidden ${form.hasAssessments ? 'border-orange-300' : 'border-gray-200'}`}>
        <div className={`flex items-center justify-between px-5 py-4 ${form.hasAssessments ? 'bg-orange-50' : 'bg-white'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${form.hasAssessments ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Assessments</p>
              <p className="text-xs text-gray-500 mt-0.5">This module requires students to complete assessment forms</p>
            </div>
          </div>
          <button type="button" role="switch" aria-checked={form.hasAssessments}
            onClick={() => onChange({ hasAssessments: !form.hasAssessments, assessmentCount: !form.hasAssessments ? 1 : '', selectedForms: !form.hasAssessments ? [''] : [] })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 shrink-0 ${form.hasAssessments ? 'bg-orange-500' : 'bg-gray-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.hasAssessments ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Expanded config */}
        {form.hasAssessments && (
          <div className="px-5 pb-5 pt-4 bg-white border-t border-orange-100 space-y-5">
            {/* Count input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Number of Assessments <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">Defines how many assessment forms students must complete</p>
              <input type="number" min={1} max={20} value={form.assessmentCount}
                onChange={e => handleCountChange(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
            </div>

            {/* Form selectors */}
            {count > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Selected Forms</p>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{count} FORM{count !== 1 ? 'S' : ''}</span>
                </div>
                <div className="space-y-2.5">
                  {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <div className="relative flex-1">
                        <select
                          value={form.selectedForms[i] ?? ''}
                          onChange={e => setForm(i, e.target.value)}
                          className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 pr-9 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                        >
                          <option value="">Select a form…</option>
                          {AVAILABLE_FORMS.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {form.selectedForms.some(f => f === '') && (
                  <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-3">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>
                    Some forms have not been selected yet
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info callout when disabled */}
      {!form.hasAssessments && (
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="shrink-0 mt-0.5 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>
          </svg>
          Enable assessments if students need to complete graded forms as part of this module. Forms are managed under <strong className="text-gray-700 mx-1">Form Builder</strong>.
        </div>
      )}
    </div>
  );
}

// ─── STEP 4 — Settings & Delivery ────────────────────────────────────────────

function StepSettings({ form, onChange }: { form: ModuleForm; onChange: (p: Partial<ModuleForm>) => void }) {
  const [generated, setGenerated] = useState(false);

  // Split activities currently in the form
  const existingSplits = form.activities.filter(a => a.type === 'split');

  const handleGenerate = () => {
    if (!form.numberOfSplits) return;
    const n = Number(form.numberOfSplits);
    const hrs = form.timePerSplit ? `${form.timePerSplit}h` : null;
    const splits: Activity[] = Array.from({ length: n }, (_, i) => ({
      id: `gen-split-${i + 1}-${Date.now() + i}`,
      name: `Split ${i + 1}${hrs ? ` (${hrs})` : ''}`,
      type: 'split' as ActivityType,
      completion: 'mandatory' as CompletionType,
    }));
    onChange({ activities: [...form.activities.filter(a => a.type !== 'split'), ...splits] });
    setGenerated(true);
  };

  const removeGeneratedSplit = (id: string) => {
    onChange({ activities: form.activities.filter(a => a.id !== id) });
  };

  return (
    <div className="space-y-6">
      {/* Module summary strip */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">Module Summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div><p className="text-xs text-gray-400 mb-0.5">Name</p><p className="font-medium text-gray-900 truncate">{form.name || '—'}</p></div>
          <div><p className="text-xs text-gray-400 mb-0.5">Price</p><p className="font-medium text-gray-900">{form.price !== '' ? `£${form.price}` : '—'}</p></div>
          <div><p className="text-xs text-gray-400 mb-0.5">Duration</p><p className="font-medium text-gray-900">{form.suggestedDays ? `${form.suggestedDays}d` : '—'}</p></div>
          <div><p className="text-xs text-gray-400 mb-0.5">Activities</p><p className="font-medium text-gray-900">{form.activities.length}</p></div>
        </div>
      </div>

      {/* Visibility toggles */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 px-4">
        <Toggle checked={form.isSellable}       onChange={() => onChange({ isSellable: !form.isSellable })}             label="Sellable"        sub="Can be sold independently" />
        <Toggle checked={form.isCommissionable} onChange={() => onChange({ isCommissionable: !form.isCommissionable })} label="Commissionable"  sub="Eligible for commission" />
        <Toggle checked={form.isActive}         onChange={() => onChange({ isActive: !form.isActive })}                 label="Active"          sub="Visible in the system" />
      </div>

      {/* Delivery mode */}
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-3">Delivery Mode</p>
        <div className="grid grid-cols-2 gap-3">
          {DELIVERY_OPTIONS.map(({ key, label, sub, icon }) => {
            const active = form.deliveryMode === key;
            return (
              <button key={key} type="button" onClick={() => onChange({ deliveryMode: key })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                  active ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/40'
                }`}
              >
                <span className={active ? 'text-orange-500' : 'text-gray-400'}>{icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${active ? 'text-orange-700' : 'text-gray-800'}`}>{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
                {active && (
                  <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                    <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hub Only — splits config */}
      {form.deliveryMode === 'hub' && (
        <div className="rounded-xl border-2 border-orange-300 overflow-hidden">
          {/* Panel header */}
          <div className="px-5 py-3 bg-orange-50 border-b border-orange-200 flex items-center gap-2">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-orange-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
            </svg>
            <p className="text-sm font-semibold text-orange-800">Hub Split Configuration</p>
            {existingSplits.length > 0 && (
              <span className="ml-auto text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                {existingSplits.length} activit{existingSplits.length !== 1 ? 'ies' : 'y'} generated
              </span>
            )}
          </div>

          {/* Inputs */}
          <div className="px-5 pt-4 pb-3 bg-white space-y-4">
            <p className="text-xs text-gray-500">Configure the split sessions. Click <strong>Approve &amp; Generate</strong> to create them as module activities.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
                  Number of Splits
                </label>
                <input type="number" min={1} max={20} value={form.numberOfSplits} placeholder="e.g. 8"
                  onChange={e => { setGenerated(false); onChange({ numberOfSplits: e.target.value === '' ? '' : Number(e.target.value) }); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
                  Time per Split (hrs)
                </label>
                <input type="number" min={0.5} step={0.5} value={form.timePerSplit} placeholder="e.g. 7"
                  onChange={e => { setGenerated(false); onChange({ timePerSplit: e.target.value === '' ? '' : Number(e.target.value) }); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
              </div>
            </div>

            {/* Preview strip — shows before clicking generate */}
            {form.numberOfSplits && !generated && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
                Will generate <strong className="text-gray-700 mx-1">{form.numberOfSplits}</strong> Split activities
                {form.timePerSplit ? <>, each <strong className="text-gray-700 mx-1">{form.timePerSplit}h</strong></> : ''}
              </div>
            )}

            {/* Generate button */}
            <button type="button" onClick={handleGenerate} disabled={!form.numberOfSplits}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                generated
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {generated ? (
                <>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  Regenerate Activities
                </>
              ) : (
                <>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/></svg>
                  Approve &amp; Generate Activities
                </>
              )}
            </button>
          </div>

          {/* Generated activities list */}
          {existingSplits.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="px-5 py-2.5 bg-gray-50 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Generated Activities</p>
                <button type="button"
                  onClick={() => { onChange({ activities: form.activities.filter(a => a.type !== 'split') }); setGenerated(false); }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium hover:underline"
                >
                  Remove all
                </button>
              </div>
              <ul className="divide-y divide-gray-100 bg-white">
                {existingSplits.map((act, i) => (
                  <li key={act.id} className="flex items-center gap-3 px-5 py-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${TYPE_STYLES.split.bg} ${TYPE_STYLES.split.text}`}>
                      <ActivityTypeIcon type="split" />
                    </div>
                    <span className="flex-1 text-sm text-gray-800 font-medium">{act.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${COMPLETION_STYLES.mandatory.bg} ${COMPLETION_STYLES.mandatory.text}`}>
                      Mandatory
                    </span>
                    <button type="button" onClick={() => removeGeneratedSplit(act.id)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded hover:bg-red-50 shrink-0"
                      aria-label={`Remove ${act.name}`}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreateModulePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ModuleForm>({
    name: 'Onboarding',
    description: '',
    image: null,
    imagePreview: null,
    price: 100,
    refundableAmount: 0,
    suggestedDays: 1,
    activities: AVAILABLE_ACTIVITIES.slice(0, 3),
    hasAssessments: false,
    assessmentCount: '',
    selectedForms: [],
    isSellable: false,
    isCommissionable: false,
    isActive: true,
    deliveryMode: 'none',
    numberOfSplits: '',
    timePerSplit: '',
  });

  const handleChange = useCallback((patch: Partial<ModuleForm>) => {
    setForm(prev => ({ ...prev, ...patch }));
  }, []);

  const canProceed = step === 0 ? form.name.trim().length > 0 : true;

  const stepSubtitles = [
    'Set the basic details and pricing for this module.',
    'Add and order the learning activities in this module.',
    'Configure any assessment forms students must complete.',
    'Set delivery mode, visibility settings and generate activities.',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/modules" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
            </Link>
            <div>
              <p className="text-xs text-gray-400">Learning / Modules</p>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Create New Module</h1>
            </div>
          </div>
          <button type="button" className="px-3.5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Save Draft
          </button>
        </div>
      </header>

      {/* Step indicator */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <StepIndicator current={step} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">{STEPS[step]}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{stepSubtitles[step]}</p>
          </div>
          {step === 0 && <StepInfo        form={form} onChange={handleChange} />}
          {step === 1 && <StepActivities  form={form} onChange={handleChange} />}
          {step === 2 && <StepAssessments form={form} onChange={handleChange} />}
          {step === 3 && <StepSettings    form={form} onChange={handleChange} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
            Back
          </button>

          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'bg-orange-500 w-5' : i < step ? 'bg-orange-300 w-2' : 'bg-gray-200 w-2'}`} />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canProceed}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Continue
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
            </button>
          ) : (
            <button type="button" onClick={() => alert('Module saved! (mock)')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
              Save Module
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
