'use client';

import { useState, useMemo } from 'react';
import { submissions } from '@/lib/mock-data';
import type { IqaCheck, IqaTutor, EnrichedSubmission } from '../types';
import { tradeColors } from '../types';

interface Props {
  items: EnrichedSubmission[];
  allChecks: IqaCheck[];
  tutors: IqaTutor[];
  onClose: () => void;
  onSkip: (submissionId: string, checkId: string) => void;
  onBulkAssign: (submissionIds: string[], tutorId: string) => void;
}

interface RowData {
  item: EnrichedSubmission;
  priorIqaCount: number;
  priorIqaTotal: number;
  cohortChecked: number;
  cohortTotal: number;
  cohortPct: number;
  currentCheck: IqaCheck | undefined;
}

export function IqaHistoryModal({ items, allChecks, tutors, onClose, onSkip, onBulkAssign }: Props) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(items.map(i => i.submission.id)));
  const [priorIqaFilter, setPriorIqaFilter] = useState(false);
  const [cohortCoverageFilter, setCohortCoverageFilter] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const [reviewerSearch, setReviewerSearch] = useState('');
  const [selectedReviewer, setSelectedReviewer] = useState<string | null>(null);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const reviewerTutors = useMemo(
    () => tutors.filter(t => t.role !== 'assessor'),
    [tutors],
  );

  const filteredReviewers = useMemo(() => {
    const q = reviewerSearch.toLowerCase();
    if (!q) return reviewerTutors;
    return reviewerTutors.filter(
      t => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q),
    );
  }, [reviewerTutors, reviewerSearch]);

  const checkedSubmissionIds = useMemo(
    () => new Set(allChecks.map(c => c.submissionId)),
    [allChecks],
  );

  const rows: RowData[] = useMemo(() => items.map(item => {
    const { submission: sub } = item;
    const studentOtherSubs = submissions.filter(
      s => s.email === sub.email && s.id !== sub.id && s.gradedBy && s.score !== null,
    );
    const priorIqaCount = studentOtherSubs.filter(s => checkedSubmissionIds.has(s.id)).length;
    const priorIqaTotal = studentOtherSubs.length;
    const cohortSubs = submissions.filter(
      s => s.assessmentId === sub.assessmentId && s.gradedBy && s.score !== null,
    );
    const cohortChecked = cohortSubs.filter(s => checkedSubmissionIds.has(s.id)).length;
    const cohortTotal = cohortSubs.length;
    const cohortPct = cohortTotal > 0 ? Math.round((cohortChecked / cohortTotal) * 100) : 0;
    const currentCheck = allChecks.find(c => c.submissionId === sub.id);
    return { item, priorIqaCount, priorIqaTotal, cohortChecked, cohortTotal, cohortPct, currentCheck };
  }), [items, allChecks, checkedSubmissionIds]);

  const activeRows = rows.filter(r => !skippedIds.has(r.item.submission.id));

  const handleApplyFilters = () => {
    let newChecked = new Set(activeRows.map(r => r.item.submission.id));

    if (priorIqaFilter) {
      for (const row of activeRows) {
        if (row.priorIqaCount > 0) {
          newChecked.delete(row.item.submission.id);
        }
      }
    }

    if (cohortCoverageFilter) {
      const cohortGroups = new Map<string, RowData[]>();
      for (const row of activeRows) {
        const cohort = row.item.cohort ?? row.item.assessment?.title ?? 'unknown';
        if (!cohortGroups.has(cohort)) cohortGroups.set(cohort, []);
        cohortGroups.get(cohort)!.push(row);
      }
      for (const [, cohortItems] of cohortGroups) {
        const hasAny = cohortItems.some(r => newChecked.has(r.item.submission.id));
        if (!hasAny && cohortItems.length > 0) {
          newChecked.add(cohortItems[0].item.submission.id);
        }
      }
    }

    setChecked(newChecked);
    setFiltersApplied(true);
  };

  const handleResetFilters = () => {
    setPriorIqaFilter(false);
    setCohortCoverageFilter(false);
    setChecked(new Set(activeRows.map(r => r.item.submission.id)));
    setFiltersApplied(false);
  };

  const handleToggleRow = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleToggleAll = () => {
    const allIds = activeRows.map(r => r.item.submission.id);
    const allCheckedNow = allIds.every(id => checked.has(id));
    if (allCheckedNow) {
      setChecked(new Set());
    } else {
      setChecked(new Set(allIds));
    }
  };

  const handleSkipRow = (submissionId: string, checkId: string) => {
    setSkippedIds(prev => new Set([...prev, submissionId]));
    setChecked(prev => { const n = new Set(prev); n.delete(submissionId); return n; });
    onSkip(submissionId, checkId);
  };

  const handleAssign = () => {
    if (!selectedReviewer) return;
    const ids = activeRows
      .filter(r => checked.has(r.item.submission.id) && r.currentCheck)
      .map(r => r.item.submission.id);
    if (ids.length === 0) return;
    onBulkAssign(ids, selectedReviewer);
  };

  const checkedCount = activeRows.filter(r => checked.has(r.item.submission.id)).length;
  const allRowsChecked = activeRows.length > 0 && activeRows.every(r => checked.has(r.item.submission.id));
  const selectedReviewerName = reviewerTutors.find(t => t.id === selectedReviewer)?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Smart Selection &amp; Assign</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {items.length} assessment{items.length !== 1 ? 's' : ''} selected — refine with filters, then assign to a reviewer
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters panel */}
        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filters</span>

            <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
              priorIqaFilter ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="checkbox"
                checked={priorIqaFilter}
                onChange={e => { setPriorIqaFilter(e.target.checked); setFiltersApplied(false); }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Remove Prior IQA</span>
                <p className="text-[10px] text-gray-400 leading-tight">Uncheck exams where student already had IQA review</p>
              </div>
            </label>

            <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
              cohortCoverageFilter ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="checkbox"
                checked={cohortCoverageFilter}
                onChange={e => { setCohortCoverageFilter(e.target.checked); setFiltersApplied(false); }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Ensure Cohort Coverage</span>
                <p className="text-[10px] text-gray-400 leading-tight">Keep at least one exam per cohort selected</p>
              </div>
            </label>

            <button
              onClick={handleApplyFilters}
              disabled={!priorIqaFilter && !cohortCoverageFilter}
              className="px-4 py-2 text-sm font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Apply
            </button>

            {filtersApplied && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
              >
                Reset
              </button>
            )}

            {filtersApplied && (
              <span className="text-xs text-green-600 font-medium ml-auto">
                {checkedCount} of {activeRows.length} selected after filters
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="py-3 px-4 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allRowsChecked}
                    onChange={handleToggleAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Student</th>
                <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Assessment</th>
                <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Cohort</th>
                <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Result</th>
                <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Prior IQA</th>
                <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Cohort Coverage</th>
                <th className="py-3 px-4 text-right font-semibold text-xs text-gray-500 uppercase tracking-wide w-20"></th>
              </tr>
            </thead>
            <tbody>
              {activeRows.map(({ item, priorIqaCount, priorIqaTotal, cohortChecked, cohortTotal, cohortPct, currentCheck }) => {
                const { submission: sub, assessment, cohort } = item;
                const isChecked = checked.has(sub.id);

                return (
                  <tr
                    key={sub.id}
                    className={`border-b border-gray-50 transition-colors ${
                      isChecked ? 'bg-white hover:bg-gray-50/40' : 'bg-gray-50/30 opacity-60'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRow(sub.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{sub.student}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub.email}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 text-sm">{assessment?.title ?? '—'}</p>
                      {assessment?.trade && (
                        <span className={`mt-0.5 inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tradeColors[assessment.trade] ?? 'bg-gray-100 text-gray-600'}`}>
                          {assessment.trade}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-700">
                      {cohort ?? <span className="text-gray-400">—</span>}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sub.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {sub.status === 'Pass' ? 'Pass' : 'Fail'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {priorIqaTotal === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : priorIqaCount === 0 ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">None</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {priorIqaCount}
                          </span>
                          <span className="text-xs text-gray-400">of {priorIqaTotal}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          cohortPct >= 50 ? 'bg-purple-100 text-purple-700' : cohortPct > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {cohortPct}%
                        </span>
                        <span className="text-xs text-gray-400">{cohortChecked}/{cohortTotal}</span>
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cohortPct >= 50 ? 'bg-purple-500' : cohortPct > 0 ? 'bg-amber-400' : 'bg-gray-300'}`}
                            style={{ width: `${cohortPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {currentCheck && (
                        <button
                          onClick={() => handleSkipRow(sub.id, currentCheck.id)}
                          className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
                          title="Skip this assessment"
                        >
                          Skip
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Reviewer selection + assign */}
        <div className="border-t border-gray-200 bg-gray-50/50 shrink-0">
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Assign to Reviewer</p>
            <div className="flex gap-4">
              {/* Reviewer picker */}
              <div className="flex-1 min-w-0">
                <div className="relative mb-2">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input
                    type="text"
                    value={reviewerSearch}
                    onChange={e => setReviewerSearch(e.target.value)}
                    placeholder="Search reviewer..."
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden max-h-36 overflow-y-auto bg-white">
                  {filteredReviewers.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No reviewers found</p>
                  ) : (
                    filteredReviewers.map(t => {
                      const isSelected = selectedReviewer === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedReviewer(t.id)}
                          className={`w-full text-left px-3 py-2.5 transition-colors ${
                            isSelected ? 'bg-orange-50 border-l-2 border-orange-500' : 'hover:bg-gray-50 border-l-2 border-transparent'
                          }`}
                        >
                          <p className={`text-sm ${isSelected ? 'font-semibold text-orange-900' : 'text-gray-800'}`}>{t.name}</p>
                          <p className="text-[10px] text-gray-400">{t.email}</p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Summary + actions */}
              <div className="w-56 shrink-0 flex flex-col justify-between">
                <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 mb-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs text-gray-500">Selected</span>
                    <span className="text-lg font-bold text-gray-900">{checkedCount}</span>
                  </div>
                  {skippedIds.size > 0 && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-gray-500">Skipped</span>
                      <span className="text-sm font-semibold text-gray-400">{skippedIds.size}</span>
                    </div>
                  )}
                  {selectedReviewerName && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">Reviewer</span>
                      <p className="text-sm font-semibold text-orange-700">{selectedReviewerName}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleAssign}
                    disabled={checkedCount === 0 || !selectedReviewer}
                    className="w-full py-2.5 text-sm font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {checkedCount > 0 && selectedReviewerName
                      ? `Assign ${checkedCount} to ${selectedReviewerName}`
                      : checkedCount === 0
                        ? 'No items selected'
                        : 'Select a reviewer'}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
