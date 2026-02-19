'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Module {
  id: string;
  name: string;
  description: string;
  sellable: boolean;
  commissionable: boolean;
  cost: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  commissionable: boolean;
}

interface CourseForm {
  name: string;
  description: string;
  image: File | null;
  imagePreview: string | null;
  isActive: boolean;
  modules: Module[];
  products: Product[];
  coursePrice: number | '';
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const AVAILABLE_MODULES: Module[] = [
  { id: 'm1', name: 'Onboarding', description: 'Initial onboarding process', sellable: false, commissionable: false, cost: 20, price: 100 },
  { id: 'm2', name: 'Theory 101', description: 'Core theoretical concepts', sellable: true, commissionable: true, cost: 30, price: 100 },
  { id: 'm3', name: 'Introduction', description: 'Basic introduction to the field', sellable: true, commissionable: false, cost: 25, price: 100 },
  { id: 'm4', name: 'Circuit Analysis', description: 'Analyzing DC and AC circuits', sellable: true, commissionable: true, cost: 15, price: 75 },
  { id: 'm5', name: 'Advanced Gas Systems', description: 'Complex gas systems and industrial applications', sellable: true, commissionable: true, cost: 20, price: 100 },
  { id: 'm6', name: 'Pipe Fittings', description: 'Types of pipe fittings and their uses', sellable: false, commissionable: false, cost: 8, price: 40 },
  { id: 'm7', name: 'Health & Safety', description: 'Workplace health and safety regulations', sellable: true, commissionable: false, cost: 12, price: 60 },
  { id: 'm8', name: 'Practical Assessment', description: 'Hands-on practical skills evaluation', sellable: true, commissionable: true, cost: 35, price: 120 },
];

const AVAILABLE_PRODUCTS: Product[] = [
  { id: 'p1', name: 'EWYL', description: 'Earn While You Learn (EWYL) is a marketing term. It allows a student to gain a CSCS card (Construction Skills Certification Scheme) which is the minimum requirement for them to work on a site and therefore make an income.', commissionable: false },
  { id: 'p2', name: 'ToolKit Bundle', description: 'Essential toolkit for field work, includes all required hand tools and safety gear.', commissionable: true },
  { id: 'p3', name: 'Study Materials Pack', description: 'Printed study guides, revision cards and reference manuals for the full course syllabus.', commissionable: false },
  { id: 'p4', name: 'Assessment Voucher', description: 'A pre-paid voucher for one external accredited assessment with an approved awarding body.', commissionable: true },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400 pointer-events-none">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function DragHandle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-gray-300 group-hover/card:text-gray-400 transition-colors">
      <circle cx="5" cy="4" r="1.2" /><circle cx="5" cy="8" r="1.2" /><circle cx="5" cy="12" r="1.2" />
      <circle cx="11" cy="4" r="1.2" /><circle cx="11" cy="8" r="1.2" /><circle cx="11" cy="12" r="1.2" />
    </svg>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = ['Course Details', 'Modules', 'Pricing & Review'];

function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Progress" className="flex items-center">
      {STEPS.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'upcoming';
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                state === 'done' ? 'bg-orange-500 text-white'
                : state === 'active' ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                : 'bg-gray-200 text-gray-500'
              }`}>
                {state === 'done' ? (
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : i + 1}
              </span>
              <span className={`text-sm font-medium whitespace-nowrap ${
                state === 'active' ? 'text-orange-600' : state === 'done' ? 'text-gray-700' : 'text-gray-400'
              }`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-px mx-3 ${i < current ? 'bg-orange-300' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ─── Step 1 – Course Details ──────────────────────────────────────────────────

function StepDetails({ form, onChange }: { form: CourseForm; onChange: (p: Partial<CourseForm>) => void }) {
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ image: file, imagePreview: URL.createObjectURL(file) });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Course Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="e.g. Essential Gas Engineer Course"
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={e => onChange({ description: e.target.value })}
          rows={4}
          placeholder="Describe what this course covers and who it's for…"
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/240</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course Image</label>
        {form.imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange({ image: null, imagePreview: null })}
              className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-orange-50 hover:border-orange-300 transition-colors group">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-gray-400 group-hover:text-orange-400 transition-colors mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-sm text-gray-500 group-hover:text-orange-500 font-medium">Click to upload image</span>
            <span className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 8MB</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </label>
        )}
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <p className="text-sm font-semibold text-gray-800">Active &amp; Visible</p>
          <p className="text-xs text-gray-500 mt-0.5">Students can enrol in this course immediately</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.isActive}
          onClick={() => onChange({ isActive: !form.isActive })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 ${form.isActive ? 'bg-orange-500' : 'bg-gray-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  );
}

// ─── Module card (drag-and-drop) ──────────────────────────────────────────────

function ModuleCard({
  mod,
  index,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onRemove,
}: {
  mod: Module;
  index: number;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={`group/card bg-white rounded-xl overflow-hidden transition-all border-2 ${
        isDragOver
          ? 'border-orange-400 shadow-lg scale-[1.01]'
          : isDragging
          ? 'border-orange-200 opacity-40 shadow-none'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 px-3 py-3">
        {/* Drag handle */}
        <div className="cursor-grab active:cursor-grabbing p-1 shrink-0" aria-hidden>
          <DragHandle />
        </div>

        {/* Order badge */}
        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>

        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{mod.name}</p>
          <p className="text-xs text-gray-400 truncate">{mod.description}</p>
        </div>

        {/* Price */}
        <span className="text-sm font-semibold text-gray-700 shrink-0">£{mod.price}</span>

        {/* Badges */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          {mod.sellable && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Sellable</span>}
          {mod.commissionable && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Comm.</span>}
        </div>

        {/* Expand */}
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
          aria-label="Remove module"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">Sellable</p>
            <p className={`font-semibold ${mod.sellable ? 'text-green-600' : 'text-gray-500'}`}>{mod.sellable ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">Commissionable</p>
            <p className={`font-semibold ${mod.commissionable ? 'text-blue-600' : 'text-gray-500'}`}>{mod.commissionable ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">Cost</p>
            <p className="font-semibold text-gray-700">£{mod.cost}</p>
          </div>
          <div>
            <p className="text-gray-400 font-medium uppercase tracking-wide mb-0.5">Price</p>
            <p className="font-semibold text-gray-700">£{mod.price}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reusable modal shell ─────────────────────────────────────────────────────

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
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
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Reusable search + filter bar ─────────────────────────────────────────────

function SearchFilterBar<T extends string>({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  filters,
  filterLabels,
  filterCount,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  filter: T;
  onFilterChange: (f: T) => void;
  filters: T[];
  filterLabels: Record<T, string>;
  filterCount?: Partial<Record<T, number>>;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { searchRef.current?.focus(); }, []);

  return (
    <div className="px-6 pt-4 pb-3 space-y-3 shrink-0 border-b border-gray-100">
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2"><SearchIcon /></span>
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search by name or description…"
          className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
        />
        {query && (
          <button type="button" onClick={() => onQueryChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map(key => (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(key)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              filter === key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filterLabels[key]}
            {filterCount?.[key] !== undefined && (
              <span className="ml-1.5 opacity-70">{filterCount[key]}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Add Module Modal ─────────────────────────────────────────────────────────

type ModuleFilter = 'all' | 'sellable' | 'commissionable' | 'non-comm';

const MODULE_FILTERS: ModuleFilter[] = ['all', 'sellable', 'commissionable', 'non-comm'];
const MODULE_FILTER_LABELS: Record<ModuleFilter, string> = {
  all: 'All',
  sellable: 'Sellable',
  commissionable: 'Commissionable',
  'non-comm': 'Not Commissionable',
};

function AddModuleModal({
  alreadyAdded,
  onConfirm,
  onClose,
}: {
  alreadyAdded: Set<string>;
  onConfirm: (modules: Module[]) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ModuleFilter>('all');
  const [pending, setPending] = useState<Set<string>>(new Set());

  const visible = AVAILABLE_MODULES.filter(m => {
    const q = query.toLowerCase();
    const matchesSearch = !q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    const matchesFilter =
      filter === 'all' ||
      (filter === 'sellable' && m.sellable) ||
      (filter === 'commissionable' && m.commissionable) ||
      (filter === 'non-comm' && !m.commissionable);
    return matchesSearch && matchesFilter;
  });

  const toggle = (id: string) => {
    if (alreadyAdded.has(id)) return;
    setPending(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <ModalShell title="Add Modules" subtitle="Search and select modules to add to this course" onClose={onClose}>
      <SearchFilterBar
        query={query} onQueryChange={setQuery}
        filter={filter} onFilterChange={setFilter}
        filters={MODULE_FILTERS} filterLabels={MODULE_FILTER_LABELS}
        filterCount={{ all: AVAILABLE_MODULES.length }}
      />

      <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
        {visible.length === 0 ? (
          <div className="py-12 text-center">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} className="text-gray-300 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <p className="text-sm text-gray-500">No modules match your search</p>
            <button type="button" onClick={() => { setQuery(''); setFilter('all'); }} className="text-xs text-orange-500 hover:underline mt-1">Clear filters</button>
          </div>
        ) : visible.map(mod => {
          const isAdded = alreadyAdded.has(mod.id);
          const isSelected = pending.has(mod.id);
          return (
            <button
              key={mod.id}
              type="button"
              disabled={isAdded}
              onClick={() => toggle(mod.id)}
              className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all ${
                isAdded ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                : isSelected ? 'border-orange-400 bg-orange-50'
                : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isAdded ? 'border-gray-300 bg-gray-200'
                  : isSelected ? 'border-orange-500 bg-orange-500'
                  : 'border-gray-300 bg-white'
                }`}>
                  {(isAdded || isSelected) && (
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{mod.name}</span>
                    {isAdded && <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 font-medium">Already added</span>}
                    {mod.sellable && !isAdded && <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Sellable</span>}
                    {mod.commissionable && !isAdded && <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Comm.</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{mod.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-800">£{mod.price}</p>
                  <p className="text-xs text-gray-400">cost £{mod.cost}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
        <p className="text-sm text-gray-500">
          {pending.size > 0
            ? <><span className="font-semibold text-orange-600">{pending.size}</span> module{pending.size !== 1 ? 's' : ''} selected</>
            : 'Select modules above'}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button
            type="button"
            disabled={pending.size === 0}
            onClick={() => onConfirm(AVAILABLE_MODULES.filter(m => pending.has(m.id)))}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add{pending.size > 0 ? ` ${pending.size}` : ''} Module{pending.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Add Product Modal ────────────────────────────────────────────────────────

type ProductFilter = 'all' | 'commissionable' | 'non-comm';

const PRODUCT_FILTERS: ProductFilter[] = ['all', 'commissionable', 'non-comm'];
const PRODUCT_FILTER_LABELS: Record<ProductFilter, string> = {
  all: 'All',
  commissionable: 'Commissionable',
  'non-comm': 'Not Commissionable',
};

function AddProductModal({
  alreadyAdded,
  onConfirm,
  onClose,
}: {
  alreadyAdded: Set<string>;
  onConfirm: (products: Product[]) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ProductFilter>('all');
  const [pending, setPending] = useState<Set<string>>(new Set());

  const visible = AVAILABLE_PRODUCTS.filter(p => {
    const q = query.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchesFilter =
      filter === 'all' ||
      (filter === 'commissionable' && p.commissionable) ||
      (filter === 'non-comm' && !p.commissionable);
    return matchesSearch && matchesFilter;
  });

  const toggle = (id: string) => {
    if (alreadyAdded.has(id)) return;
    setPending(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <ModalShell title="Add Products" subtitle="Search and select add-on products for this course" onClose={onClose}>
      <SearchFilterBar
        query={query} onQueryChange={setQuery}
        filter={filter} onFilterChange={setFilter}
        filters={PRODUCT_FILTERS} filterLabels={PRODUCT_FILTER_LABELS}
        filterCount={{ all: AVAILABLE_PRODUCTS.length }}
      />

      <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
        {visible.length === 0 ? (
          <div className="py-12 text-center">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} className="text-gray-300 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <p className="text-sm text-gray-500">No products match your search</p>
            <button type="button" onClick={() => { setQuery(''); setFilter('all'); }} className="text-xs text-orange-500 hover:underline mt-1">Clear filters</button>
          </div>
        ) : visible.map(prod => {
          const isAdded = alreadyAdded.has(prod.id);
          const isSelected = pending.has(prod.id);
          return (
            <button
              key={prod.id}
              type="button"
              disabled={isAdded}
              onClick={() => toggle(prod.id)}
              className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all ${
                isAdded ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                : isSelected ? 'border-orange-400 bg-orange-50'
                : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isAdded ? 'border-gray-300 bg-gray-200'
                  : isSelected ? 'border-orange-500 bg-orange-500'
                  : 'border-gray-300 bg-white'
                }`}>
                  {(isAdded || isSelected) && (
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold text-gray-900">{prod.name}</span>
                    {isAdded && <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 font-medium">Already added</span>}
                    {prod.commissionable && !isAdded && <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Commissionable</span>}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{prod.description}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 mt-0.5 whitespace-nowrap">Priced separately</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
        <p className="text-sm text-gray-500">
          {pending.size > 0
            ? <><span className="font-semibold text-orange-600">{pending.size}</span> product{pending.size !== 1 ? 's' : ''} selected</>
            : 'Select products above'}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button
            type="button"
            disabled={pending.size === 0}
            onClick={() => onConfirm(AVAILABLE_PRODUCTS.filter(p => pending.has(p.id)))}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add{pending.size > 0 ? ` ${pending.size}` : ''} Product{pending.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Step 2 – Modules ─────────────────────────────────────────────────────────

function StepModules({ form, onChange }: { form: CourseForm; onChange: (p: Partial<CourseForm>) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);
  const selectedIds = new Set(form.modules.map(m => m.id));

  const handleDrop = (targetId: string) => {
    const fromId = dragId.current;
    if (!fromId || fromId === targetId) return;
    const arr = [...form.modules];
    const from = arr.findIndex(m => m.id === fromId);
    const to = arr.findIndex(m => m.id === targetId);
    arr.splice(to, 0, arr.splice(from, 1)[0]);
    onChange({ modules: arr });
    dragId.current = null;
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    dragId.current = null;
    setDragOverId(null);
  };

  return (
    <>
      {showModal && (
        <AddModuleModal
          alreadyAdded={selectedIds}
          onConfirm={mods => { onChange({ modules: [...form.modules, ...mods] }); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {form.modules.length === 0
              ? 'No modules added yet. Add modules to build your course.'
              : `${form.modules.length} module${form.modules.length !== 1 ? 's' : ''} — drag to reorder`}
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Module
          </button>
        </div>

        {form.modules.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-colors"
            onClick={() => setShowModal(true)}
          >
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} className="text-gray-300 mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 3.75 9v.878m16.5-3A2.25 2.25 0 0 1 20.25 9v.878M3.75 9.878V18.75A2.25 2.25 0 0 0 6 21h12a2.25 2.25 0 0 0 2.25-2.25V9.878M3.75 9.878A2.25 2.25 0 0 1 6 9h12a2.25 2.25 0 0 1 2.25.878" />
            </svg>
            <p className="text-sm font-medium text-gray-500">No modules yet</p>
            <p className="text-xs text-gray-400 mt-1">Click here or &quot;Add Module&quot; to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {form.modules.map((mod, i) => (
              <ModuleCard
                key={mod.id}
                mod={mod}
                index={i}
                isDragging={dragId.current === mod.id}
                isDragOver={dragOverId === mod.id}
                onDragStart={() => { dragId.current = mod.id; }}
                onDragOver={e => { e.preventDefault(); setDragOverId(mod.id); }}
                onDragEnd={handleDragEnd}
                onDrop={() => handleDrop(mod.id)}
                onRemove={() => onChange({ modules: form.modules.filter(m => m.id !== mod.id) })}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Step 3 – Pricing & Review ────────────────────────────────────────────────

function StepPricing({ form, onChange }: { form: CourseForm; onChange: (p: Partial<CourseForm>) => void }) {
  const [showProductModal, setShowProductModal] = useState(false);
  const modulesTotal = form.modules.reduce((sum, m) => sum + m.price, 0);
  const addedProductIds = new Set(form.products.map(p => p.id));

  return (
    <>
      {showProductModal && (
        <AddProductModal
          alreadyAdded={addedProductIds}
          onConfirm={prods => { onChange({ products: [...form.products, ...prods] }); setShowProductModal(false); }}
          onClose={() => setShowProductModal(false)}
        />
      )}

      <div className="space-y-6">
        {/* Course summary */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-white">
            <p className="text-sm font-semibold text-gray-800">Course Summary</p>
          </div>
          <div className="px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${form.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {form.isActive ? 'Active' : 'Draft'}
              </span>
              {form.name && <p className="text-sm font-medium text-gray-900">{form.name}</p>}
            </div>
            {form.modules.length === 0 ? (
              <p className="text-xs text-gray-400 py-2 text-center">No modules added</p>
            ) : form.modules.map(mod => (
              <div key={mod.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  <span className="text-sm text-gray-700">{mod.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">£{mod.price}</span>
              </div>
            ))}
          </div>
          {form.modules.length > 0 && (
            <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">Modules subtotal</p>
              <p className="text-sm font-bold text-gray-900">£{modulesTotal}</p>
            </div>
          )}
        </div>

        {/* Products */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-800">Add-on Products</p>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
            </div>
            <button
              type="button"
              onClick={() => setShowProductModal(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Product
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">Products are priced separately and do not affect the course price.</p>

          {form.products.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-colors"
              onClick={() => setShowProductModal(true)}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} className="text-gray-300 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
              <p className="text-sm font-medium text-gray-500">No products added</p>
              <p className="text-xs text-gray-400 mt-0.5">Click here to browse available products</p>
            </div>
          ) : (
            <div className="space-y-2">
              {form.products.map(prod => (
                <div key={prod.id} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-900">{prod.name}</p>
                      {prod.commissionable && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Commissionable</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{prod.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400 whitespace-nowrap">Priced separately</span>
                    <button
                      type="button"
                      onClick={() => onChange({ products: form.products.filter(p => p.id !== prod.id) })}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded hover:bg-red-50"
                      aria-label={`Remove ${prod.name}`}
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course price */}
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Course Price</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Suggested: <span className="font-semibold text-orange-700">£{modulesTotal}</span>{' '}(based on module prices)
            </p>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">£</span>
            <input
              type="number"
              min={0}
              value={form.coursePrice}
              onChange={e => onChange({ coursePrice: e.target.value === '' ? '' : Number(e.target.value) })}
              placeholder={String(modulesTotal)}
              className="w-full pl-8 pr-4 py-2.5 border border-orange-300 rounded-lg text-sm font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreateCoursePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CourseForm>({
    name: 'Essential Gas Engineer Course',
    description: "Access Training's Gas Essentials course is a managed learning programme that's designed for absolute beginners, helping them to become confident gas fitters in a relatively short time.",
    image: null,
    imagePreview: null,
    isActive: true,
    modules: AVAILABLE_MODULES.slice(0, 6),
    products: [AVAILABLE_PRODUCTS[0]],
    coursePrice: 515,
  });

  const handleChange = useCallback((patch: Partial<CourseForm>) => {
    setForm(prev => ({ ...prev, ...patch }));
  }, []);

  const canProceed = step === 0 ? form.name.trim().length > 0 : true;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/courses" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <p className="text-xs text-gray-400">Learning / Courses</p>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Create New Course</h1>
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
            <p className="text-sm text-gray-500 mt-0.5">
              {step === 0 && 'Set up the basic information for this course.'}
              {step === 1 && 'Add and order the modules that make up this course.'}
              {step === 2 && 'Set a price and attach optional products.'}
            </p>
          </div>

          {step === 0 && <StepDetails form={form} onChange={handleChange} />}
          {step === 1 && <StepModules form={form} onChange={handleChange} />}
          {step === 2 && <StepPricing form={form} onChange={handleChange} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'bg-orange-500 w-5' : i < step ? 'bg-orange-300 w-2' : 'bg-gray-200 w-2'}`} />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => alert('Course saved! (mock)')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Save Course
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
