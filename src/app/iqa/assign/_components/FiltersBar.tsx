'use client';

import type { Tab, IqaTutor, IqaCategory, Assessment } from '../types';

interface Props {
  tab: Tab;
  filterStudent: string;
  filterAssessor: string;
  filterCategory: string;
  filterTrade: string;
  filterExam: string;
  filterStatus: string;
  uniqueAssessors: IqaTutor[];
  uniqueCategories: IqaCategory[];
  uniqueExams: Assessment[];
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onStudentChange: (v: string) => void;
  onAssessorChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onTradeChange: (v: string) => void;
  onExamChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onClearFilters: () => void;
}

const selectCls = 'text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300';

export function FiltersBar({
  tab,
  filterStudent, filterAssessor, filterCategory, filterTrade, filterExam, filterStatus,
  uniqueAssessors, uniqueCategories, uniqueExams,
  filteredCount, totalCount, hasActiveFilters,
  onStudentChange, onAssessorChange, onCategoryChange, onTradeChange, onExamChange, onStatusChange,
  onClearFilters,
}: Props) {
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

        <select value={filterExam} onChange={e => onExamChange(e.target.value)} className={selectCls}>
          <option value="">All Exams</option>
          {uniqueExams.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>

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
