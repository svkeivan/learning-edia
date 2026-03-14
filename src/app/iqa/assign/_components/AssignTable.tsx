'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getStudentPackage } from '@/lib/mock-data';
import type { Tab, SortKey, EnrichedSubmission, IqaTutor, ReviewerWorkload } from '../types';
import { tradeColors, statusStyles } from '../types';

interface Props {
  tab: Tab;
  displayItems: EnrichedSubmission[];
  selected: Set<string>;
  allSelected: boolean;
  sortKey: SortKey | null;
  sortDir: 'asc' | 'desc';
  allPage: number;
  totalAllPages: number;
  filteredCount: number;
  hasActiveFilters: boolean;
  tutors: IqaTutor[];
  workloads: ReviewerWorkload[];
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onSortClick: (key: SortKey) => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  onSwitchTab: (tab: Tab) => void;
  onAddToQueue: (submissionId: string) => void;
  onExclude: (submissionId: string) => void;
  onAssignReviewer: (submissionId: string, tutorId: string) => void;
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey | null; sortDir: 'asc' | 'desc' }) {
  return (
    <span className={`ml-1 inline-block transition-opacity ${sortKey === col ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
      {sortKey === col && sortDir === 'asc' ? '↑' : '↓'}
    </span>
  );
}

function SortableTh({ label, col, sortKey, sortDir, onSort }: {
  label: string;
  col: SortKey;
  sortKey: SortKey | null;
  sortDir: 'asc' | 'desc';
  onSort: (key: SortKey) => void;
}) {
  return (
    <th className="py-3 px-4 text-left font-medium text-gray-500">
      <button onClick={() => onSort(col)} className="group flex items-center hover:text-gray-700 transition-colors">
        {label} <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
      </button>
    </th>
  );
}

export function AssignTable({
  tab, displayItems, selected, allSelected,
  sortKey, sortDir, allPage, totalAllPages, filteredCount, hasActiveFilters,
  tutors, workloads,
  onToggleAll, onToggleOne, onSortClick, onPageChange,
  onClearFilters, onSwitchTab,
  onAddToQueue, onExclude, onAssignReviewer,
}: Props) {
  const [inlineAssigningId, setInlineAssigningId] = useState<string | null>(null);
  const [inlineSelectedTutor, setInlineSelectedTutor] = useState('');

  const showCheckboxes = tab !== 'all';
  const reviewerTutors = tutors.filter(t => t.role !== 'assessor');

  const cancelInline = () => { setInlineAssigningId(null); setInlineSelectedTutor(''); };

  const handleSaveInline = (submissionId: string) => {
    onAssignReviewer(submissionId, inlineSelectedTutor);
    cancelInline();
  };

  if (displayItems.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
        <svg className="mx-auto mb-3 text-gray-300" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
        <p className="text-gray-500 font-medium">
          {hasActiveFilters
            ? 'No items match your filters.'
            : tab === 'queue'
              ? 'No assessments in the IQA queue yet.'
              : tab === 'not-queue'
                ? 'All graded assessments have been queued or excluded.'
                : 'No graded assessments found.'}
        </p>
        {hasActiveFilters && (
          <button onClick={onClearFilters} className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-2">
            Clear filters
          </button>
        )}
        {!hasActiveFilters && tab === 'queue' && (
          <p className="text-xs text-gray-400 mt-2">
            Switch to{' '}
            <button
              onClick={() => onSwitchTab('not-queue')}
              className="text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2"
            >
              Not in Queue
            </button>
            {' '}to add assessments.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {showCheckboxes && (
                <th className="py-3 px-4 text-left w-10">
                  <input
                    type="checkbox" checked={allSelected} onChange={onToggleAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
              )}
              <SortableTh label="Student" col="student" sortKey={sortKey} sortDir={sortDir} onSort={onSortClick} />
              <SortableTh label="Course Package" col="package" sortKey={sortKey} sortDir={sortDir} onSort={onSortClick} />
              <SortableTh label="Assessment" col="assessment" sortKey={sortKey} sortDir={sortDir} onSort={onSortClick} />
              <SortableTh label="Graded By" col="gradedBy" sortKey={sortKey} sortDir={sortDir} onSort={onSortClick} />
              {tab !== 'all' && (
                <th className="py-3 px-4 text-left font-medium text-gray-500">Category</th>
              )}
              <SortableTh label="Result" col="result" sortKey={sortKey} sortDir={sortDir} onSort={onSortClick} />
              {tab === 'queue' && (
                <>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Reviewer</th>
                </>
              )}
              {tab === 'all' && (
                <th className="py-3 px-4 text-left font-medium text-gray-500">IQA Status</th>
              )}
              {tab !== 'all' && (
                <th className="py-3 px-4 text-right font-medium text-gray-500">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayItems.map(item => {
              const { submission: sub, assessment, assessor, check, assignedReviewer, category, isSkipped } = item;
              const isAssigning = inlineAssigningId === sub.id;

              return (
                <tr
                  key={sub.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${selected.has(sub.id) ? 'bg-orange-50/40' : ''}`}
                >
                  {showCheckboxes && (
                    <td className="py-3 px-4">
                      <input
                        type="checkbox" checked={selected.has(sub.id)} onChange={() => onToggleOne(sub.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                  )}

                  {/* Student */}
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{sub.student}</p>
                    <p className="text-xs text-gray-400">{sub.email}</p>
                  </td>

                  {/* Course Package + Trade badge */}
                  <td className="py-3 px-4">
                    <p className="text-gray-900 font-medium text-sm">{getStudentPackage(sub.email) ?? '—'}</p>
                    {assessment?.trade && (
                      <span className={`mt-0.5 inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tradeColors[assessment.trade] ?? 'bg-gray-100 text-gray-600'}`}>
                        {assessment.trade}
                      </span>
                    )}
                  </td>

                  {/* Assessment */}
                  <td className="py-3 px-4">
                    <p className="text-gray-900 font-medium">{assessment?.title}</p>
                    <p className="text-xs text-gray-400">{assessment?.module}</p>
                  </td>

                  {/* Graded By */}
                  <td className="py-3 px-4 text-gray-700 text-sm">{assessor?.name ?? '—'}</td>

                  {/* Category */}
                  {tab !== 'all' && (
                    <td className="py-3 px-4">
                      {category ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          category.riskLevel === 'High' ? 'bg-red-100 text-red-700'
                            : category.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                        }`}>
                          {category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  )}

                  {/* Result */}
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sub.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {sub.status === 'Pass' ? 'Pass' : 'Fail'}
                    </span>
                  </td>

                  {/* Queue tab: status + inline reviewer assign */}
                  {tab === 'queue' && (
                    <>
                      <td className="py-3 px-4">
                        {check && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[check.status]}`}>
                            {check.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isAssigning ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={inlineSelectedTutor}
                              onChange={e => setInlineSelectedTutor(e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 w-36"
                            >
                              <option value="">Any</option>
                              {reviewerTutors.map(t => {
                                const wl = workloads.find(w => w.tutor.id === t.id);
                                return (
                                  <option key={t.id} value={t.id}>
                                    {t.name} ({wl ? `${wl.activeCount}/${wl.capacity}` : '—'})
                                  </option>
                                );
                              })}
                            </select>
                            <button
                              onClick={() => handleSaveInline(sub.id)}
                              className="text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1.5 rounded-lg"
                            >
                              Save
                            </button>
                            <button onClick={cancelInline} className="text-xs text-gray-400 hover:text-gray-600 px-1">
                              &times;
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setInlineAssigningId(sub.id); setInlineSelectedTutor(check?.assignedTo ?? ''); }}
                            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                          >
                            {assignedReviewer ? assignedReviewer.name : check?.assignedTo === 'admin' ? 'Admin User' : 'Assign'}
                          </button>
                        )}
                      </td>
                    </>
                  )}

                  {/* All tab: IQA status */}
                  {tab === 'all' && (
                    <td className="py-3 px-4">
                      {check ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[check.status]}`}>
                          {check.status}
                        </span>
                      ) : isSkipped ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          Excluded
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  )}

                  {/* Actions */}
                  {tab !== 'all' && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {tab === 'queue' && check && (
                          <Link
                            href={`/iqa/review-queue/${check.id}`}
                            className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Review
                          </Link>
                        )}
                        {tab === 'not-queue' && (
                          <>
                            <button
                              onClick={() => onAddToQueue(sub.id)}
                              className="text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Add to Queue
                            </button>
                            <button
                              onClick={() => onExclude(sub.id)}
                              className="text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Exclude
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination (All tab only) */}
      {tab === 'all' && totalAllPages > 1 && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Page {allPage} of {totalAllPages} · {filteredCount} total
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, allPage - 1))}
              disabled={allPage === 1}
              className="text-xs font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalAllPages, allPage + 1))}
              disabled={allPage === totalAllPages}
              className="text-xs font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
