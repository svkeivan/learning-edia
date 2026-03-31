'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import {
  getIqaChecks,
  getIqaTutors,
  getCohortIqaCompletedAt,
  getCohortIqaReviewerOverride,
  setCohortIqaReviewerOverride,
} from '@/lib/iqa-data';
import { cohorts, submissions, assessments } from '@/lib/mock-data';
import type { IqaCheck } from '@/lib/iqa-data';

const tradeColors: Record<string, string> = {
  'Gas Engineering': 'bg-orange-100 text-orange-700',
  Electrical: 'bg-yellow-100 text-yellow-700',
  Plumbing: 'bg-blue-100 text-blue-700',
};

function ProgressBar({ reviewed, total }: { reviewed: number; total: number }) {
  const percent = total > 0 ? Math.round((reviewed / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            percent >= 100 ? 'bg-green-500' : percent >= 50 ? 'bg-orange-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-500 w-10 text-right">{percent}%</span>
    </div>
  );
}

export default function SamplingPage() {
  const [checks, setChecks] = useState<IqaCheck[]>([]);
  const [mounted, setMounted] = useState(false);
  const tutors = getIqaTutors();
  const reviewerTutors = useMemo(() => tutors.filter(t => t.role !== 'assessor'), [tutors]);

  const [filterTrade, setFilterTrade] = useState('all');
  const [filterAssessor, setFilterAssessor] = useState('all');
  const [search, setSearch] = useState('');

  const [bump, setBump] = useState(0);
  const [reviewerModal, setReviewerModal] = useState<null | {
    cohortId: string;
    cohortName: string;
    initialLeadId: string;
    step: 'pick' | 'confirm';
    selectedReviewerId: string;
  }>(null);
  const [reviewerToast, setReviewerToast] = useState('');

  useEffect(() => {
    if (!reviewerToast) return;
    const t = setTimeout(() => setReviewerToast(''), 3200);
    return () => clearTimeout(t);
  }, [reviewerToast]);

  useEffect(() => {
    setMounted(true);
    const refresh = () => { setChecks(getIqaChecks()); setBump(b => b + 1); };
    refresh();
    window.addEventListener('iqa-checks-updated', refresh);
    window.addEventListener('iqa-cohort-completed-updated', refresh);
    window.addEventListener('iqa-cohort-reviewer-override-updated', refresh);
    return () => {
      window.removeEventListener('iqa-checks-updated', refresh);
      window.removeEventListener('iqa-cohort-completed-updated', refresh);
      window.removeEventListener('iqa-cohort-reviewer-override-updated', refresh);
    };
  }, []);

  const cohortStats = useMemo(() => {
    return cohorts.map(coh => {
      const studentEmails = new Set(coh.students.map(s => s.email));
      const cohortSubs = submissions.filter(
        s => studentEmails.has(s.email) && coh.examIds.includes(s.assessmentId),
      );
      const subIds = new Set(cohortSubs.map(s => s.id));
      const cohortChecks = checks.filter(c => subIds.has(c.submissionId));
      const approved = cohortChecks.filter(c => c.status === 'Approved').length;
      const rejected = cohortChecks.filter(c => c.status === 'Rejected').length;
      const pending = cohortChecks.filter(c => c.status === 'Pending').length;
      const skipped = cohortChecks.filter(c => c.status === 'Skipped').length;
      const notReviewed = cohortSubs.length - cohortChecks.length;
      const assessor = tutors.find(t => t.id === coh.assessorId);
      const exams = coh.examIds.map(id => assessments.find(a => a.id === id)).filter(Boolean);

      const leadId = getCohortIqaReviewerOverride(coh.id) ?? coh.iqaReviewerId;
      const reviewer = leadId ? tutors.find(t => t.id === leadId) : undefined;
      const completedAt = getCohortIqaCompletedAt(coh.id);

      return {
        cohort: coh,
        totalSubs: cohortSubs.length,
        approved,
        rejected,
        pending,
        skipped,
        notReviewed,
        reviewed: approved + rejected,
        assessor,
        reviewer,
        leadId,
        completedAt,
        exams,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checks, tutors, bump]);

  const uniqueTrades = [...new Set(cohorts.map(c => c.trade))];
  const uniqueAssessors = useMemo(() => {
    const ids = [...new Set(cohorts.map(c => c.assessorId))];
    return ids.map(id => tutors.find(t => t.id === id)).filter(Boolean);
  }, [tutors]);

  const filtered = useMemo(() => {
    return cohortStats.filter(cs => {
      if (filterTrade !== 'all' && cs.cohort.trade !== filterTrade) return false;
      if (filterAssessor !== 'all' && cs.cohort.assessorId !== filterAssessor) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [cs.cohort.name, cs.cohort.trade, cs.assessor?.name, cs.cohort.packageName]
          .filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [cohortStats, filterTrade, filterAssessor, search]);

  const totals = useMemo(() => ({
    cohorts: cohorts.length,
    subs: cohortStats.reduce((s, cs) => s + cs.totalSubs, 0),
    reviewed: cohortStats.reduce((s, cs) => s + cs.reviewed, 0),
    pending: cohortStats.reduce((s, cs) => s + cs.pending, 0),
  }), [cohortStats]);

  const activeFilterCount = [filterTrade !== 'all', filterAssessor !== 'all'].filter(Boolean).length;

  const openReviewerModal = (cs: (typeof cohortStats)[number]) => {
    const initial = cs.leadId ?? '';
    setReviewerModal({
      cohortId: cs.cohort.id,
      cohortName: cs.cohort.name,
      initialLeadId: initial,
      step: 'pick',
      selectedReviewerId: initial || reviewerTutors[0]?.id || '',
    });
  };

  const closeReviewerModal = () => setReviewerModal(null);

  const tutorName = (id: string) => tutors.find(t => t.id === id)?.name ?? '—';

  if (!mounted) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-12 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          <Link href="/iqa/review-queue" className="hover:text-orange-600 transition-colors">IQA</Link>
          {' / '}
          <span className="text-gray-900 font-medium">Cohort View</span>
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Cohort View</h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of cohort IQA review progress and reviewer assignments
        </p>
      </div>

      {reviewerToast && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-5 py-3">
          <p className="text-sm text-green-800 font-medium">{reviewerToast}</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Cohorts', value: totals.cohorts, color: 'text-gray-900' },
          { label: 'Total Submissions', value: totals.subs, color: 'text-gray-900' },
          { label: 'Reviewed', value: totals.reviewed, color: 'text-green-600' },
          { label: 'Pending', value: totals.pending, color: 'text-blue-600' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search cohorts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          />
        </div>

        <select
          value={filterTrade}
          onChange={e => setFilterTrade(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
        >
          <option value="all">All Trades</option>
          {uniqueTrades.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={filterAssessor}
          onChange={e => setFilterAssessor(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
        >
          <option value="all">All Assessors</option>
          {uniqueAssessors.map(t => t && <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        {(activeFilterCount > 0 || search) && (
          <button
            onClick={() => { setFilterTrade('all'); setFilterAssessor('all'); setSearch(''); }}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="text-gray-400" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">No cohorts found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Cohort</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Trade</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Assessor</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide min-w-[120px]">Reviewer</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide min-w-[100px]">Students / exams</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Sent for IQA</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide min-w-[220px]">IQA progress</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(cs => (
                  <tr
                    key={cs.cohort.id}
                    className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors cursor-pointer"
                    onClick={() => { window.location.href = `/iqa/sampling/${cs.cohort.id}`; }}
                  >
                    <td className="py-3.5 px-5">
                      <p className="font-medium text-gray-900">{cs.cohort.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{cs.cohort.packageName}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tradeColors[cs.cohort.trade] ?? 'bg-gray-100 text-gray-600'}`}>
                        {cs.cohort.trade}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-sm text-gray-700">{cs.assessor?.name ?? '—'}</span>
                    </td>
                    <td className="py-3.5 px-5 align-middle">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {cs.reviewer?.name ?? <span className="text-gray-400 font-normal">Not assigned</span>}
                      </p>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium text-gray-900 tabular-nums">
                          {cs.cohort.students.length}
                          <span className="font-normal text-gray-500"> students</span>
                        </p>
                        <p className="text-sm font-medium text-gray-900 tabular-nums">
                          {cs.cohort.examIds.length}
                          <span className="font-normal text-gray-500"> exams</span>
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-sm text-gray-600">{cs.cohort.iqaSentDate ?? '—'}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      {cs.completedAt ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Completed</span>
                      ) : cs.reviewed > 0 ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">In Progress</span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Not Started</span>
                      )}
                    </td>
                
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col gap-2.5 min-w-[200px]">
                        <div>
                          <ProgressBar reviewed={cs.reviewed} total={cs.totalSubs} />
                          <p className="text-[11px] text-gray-400 mt-1.5">
                            {cs.reviewed} / {cs.totalSubs} reviewed
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {cs.approved > 0 && (
                            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                              {cs.approved} approved
                            </span>
                          )}
                          {cs.rejected > 0 && (
                            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                              {cs.rejected} rejected
                            </span>
                          )}
                          {cs.pending > 0 && (
                            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {cs.pending} pending
                            </span>
                          )}
                          {cs.skipped > 0 && (
                            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700">
                              {cs.skipped} skipped
                            </span>
                          )}
                          {cs.notReviewed > 0 && (
                            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              {cs.notReviewed} not in queue
                            </span>
                          )}
                        </div>
                        {cs.reviewed === 0 && !cs.completedAt && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openReviewerModal(cs); }}
                            className="self-start mt-0.5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 text-white px-3 py-2 text-xs font-semibold shadow-sm hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 transition-colors"
                            title="Change reviewer"
                          >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="opacity-90 shrink-0" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                            Reassign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing {filtered.length} of {cohorts.length} cohort{cohorts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {reviewerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reviewer-modal-title"
          >
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 id="reviewer-modal-title" className="text-lg font-bold text-gray-900">
                {reviewerModal.step === 'pick' ? 'Change reviewer' : 'Confirm reviewer change'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{reviewerModal.cohortName}</p>
            </div>

            {reviewerModal.step === 'pick' ? (
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label htmlFor="reviewer-modal-select" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Reviewer
                  </label>
                  <select
                    id="reviewer-modal-select"
                    value={reviewerModal.selectedReviewerId}
                    onChange={e => setReviewerModal(m => m && { ...m, selectedReviewerId: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
                  >
                    {reviewerTutors.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500">
                  While IQA is not started, you can change this cohort&apos;s reviewer.
                </p>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-amber-900 font-medium mb-1">Please confirm</p>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Change reviewer for <strong>{reviewerModal.cohortName}</strong> from{' '}
                    <strong>{reviewerModal.initialLeadId ? tutorName(reviewerModal.initialLeadId) : 'Not assigned'}</strong> to{' '}
                    <strong>{tutorName(reviewerModal.selectedReviewerId)}</strong>?
                  </p>
                  <p className="text-xs text-amber-700 mt-2">
                    New queue items for this cohort will use the updated reviewer where applicable.
                  </p>
                </div>
              </div>
            )}

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              {reviewerModal.step === 'pick' ? (
                <>
                  <button
                    type="button"
                    onClick={closeReviewerModal}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!reviewerModal.selectedReviewerId || reviewerModal.selectedReviewerId === reviewerModal.initialLeadId}
                    onClick={() => {
                      if (reviewerModal.selectedReviewerId === reviewerModal.initialLeadId) return;
                      setReviewerModal(m => m && { ...m, step: 'confirm' });
                    }}
                    className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-45 disabled:pointer-events-none"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setReviewerModal(m => m && { ...m, step: 'pick' })}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCohortIqaReviewerOverride(reviewerModal.cohortId, reviewerModal.selectedReviewerId);
                      setReviewerToast(`Reviewer updated to ${tutorName(reviewerModal.selectedReviewerId)}.`);
                      closeReviewerModal();
                    }}
                    className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    Confirm change
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
