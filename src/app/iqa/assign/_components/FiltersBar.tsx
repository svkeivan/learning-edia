'use client';

import { useState, useRef, useEffect } from 'react';
import type { Tab, IqaTutor, IqaCategory, Assessment } from '../types';

interface Props {
  tab: Tab;
  filterStudent: string;
  filterAssessor: string;
  filterCategory: string;
  filterTrade: string;
  filterExam: string;
  filterStatus: string;
  filterReviewer: string;
  filterCohort: string;
  uniqueAssessors: IqaTutor[];
  uniqueCategories: IqaCategory[];
  uniqueExams: Assessment[];
  uniqueReviewers: IqaTutor[];
  uniqueCohorts: string[];
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onStudentChange: (v: string) => void;
  onAssessorChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onTradeChange: (v: string) => void;
  onExamChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onReviewerChange: (v: string) => void;
  onCohortChange: (v: string) => void;
  onClearFilters: () => void;
}

const selectCls = 'text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300';

function SearchableSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: { id: string; label: string }[];
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(o => o.id === value)?.label ?? '';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center">
        <input
          type="text"
          value={open ? search : (value ? selectedLabel : '')}
          placeholder={placeholder}
          onFocus={() => { setOpen(true); setSearch(''); }}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          className={`${selectCls} w-48 pr-7`}
        />
        {value && (
          <button
            onClick={() => { onChange(''); setSearch(''); }}
            className="absolute right-2 text-gray-400 hover:text-gray-600 text-sm leading-none"
          >
            ×
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50"
          >
            {placeholder}
          </button>
          {filtered.map(o => (
            <button
              key={o.id}
              type="button"
              onClick={() => { onChange(o.id); setOpen(false); setSearch(''); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 ${value === o.id ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-700'}`}
            >
              {o.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-400">No matches</p>
          )}
        </div>
      )}
    </div>
  );
}

export function FiltersBar({
  tab,
  filterStudent, filterAssessor, filterCategory, filterTrade, filterExam, filterStatus,
  filterReviewer, filterCohort,
  uniqueAssessors, uniqueCategories, uniqueExams, uniqueReviewers, uniqueCohorts,
  filteredCount, totalCount, hasActiveFilters,
  onStudentChange, onAssessorChange, onCategoryChange, onTradeChange, onExamChange, onStatusChange,
  onReviewerChange, onCohortChange,
  onClearFilters,
}: Props) {
  const examOptions = uniqueExams.map(a => ({ id: a.id, label: a.title }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>

        <input
          type="text"
          value={filterStudent}
          onChange={e => onStudentChange(e.target.value)}
          placeholder="Search student..."
          className={`${selectCls} w-44`}
        />

        <select value={filterAssessor} onChange={e => onAssessorChange(e.target.value)} className={selectCls}>
          <option value="">All Assessors</option>
          {uniqueAssessors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <select value={filterCategory} onChange={e => onCategoryChange(e.target.value)} className={selectCls}>
          <option value="">All Categories</option>
          {uniqueCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select value={filterTrade} onChange={e => onTradeChange(e.target.value)} className={selectCls}>
          <option value="">All Trades</option>
          <option value="Gas Engineering">Gas Engineering</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
        </select>

        <SearchableSelect
          value={filterExam}
          options={examOptions}
          placeholder="All Assessments"
          onChange={onExamChange}
        />

        <select value={filterCohort} onChange={e => onCohortChange(e.target.value)} className={selectCls}>
          <option value="">All Cohorts</option>
          {uniqueCohorts.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {tab === 'all' && (
          <>
            <select value={filterReviewer} onChange={e => onReviewerChange(e.target.value)} className={selectCls}>
              <option value="">All Reviewers</option>
              {uniqueReviewers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            <select value={filterStatus} onChange={e => onStatusChange(e.target.value)} className={selectCls}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Skipped">Skipped</option>
            </select>
          </>
        )}

        {tab === 'queue' && (
          <select value={filterStatus} onChange={e => onStatusChange(e.target.value)} className={selectCls}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        )}

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            Clear filters
          </button>
        )}

        <span className="text-xs text-gray-400 ml-auto">
          {filteredCount} of {totalCount} shown
        </span>
      </div>
    </div>
  );
}
