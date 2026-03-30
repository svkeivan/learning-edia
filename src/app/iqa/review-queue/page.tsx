'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, Suspense } from 'react';
import {
  getIqaChecks,
  getIqaTutors,
  getCohortIqaCompletedAt,
  getCohortIqaReviewerOverride,
} from '@/lib/iqa-data';
import { submissions, cohorts } from '@/lib/mock-data';
import type { IqaCheck } from '@/lib/iqa-data';

const REVIEWER_STORAGE_KEY = 'iqa-review-queue-reviewer-id';

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

function ReviewQueueContent() {
  const [checks, setChecks] = useState<IqaCheck[]>([]);
  const [mounted, setMounted] = useState(false);
  const [cohortUiBump, setCohortUiBump] = useState(0);

  const tutors = getIqaTutors();
  const reviewers = useMemo(() => tutors.filter(t => t.role !== 'assessor'), [tutors]);

  const [reviewerId, setReviewerIdState] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    try {
      const list = getIqaTutors().filter(t => t.role !== 'assessor');
      const saved = sessionStorage.getItem(REVIEWER_STORAGE_KEY);
      if (saved && list.some(r => r.id === saved)) {
        setReviewerIdState(saved);
      } else if (list[0]) {
        setReviewerIdState(list[0].id);
      }
    } catch {
      const list = getIqaTutors().filter(t => t.role !== 'assessor');
      if (list[0]) setReviewerIdState(list[0].id);
    }
  }, []);

  const setReviewerId = (id: string) => {
    setReviewerIdState(id);
    try { sessionStorage.setItem(REVIEWER_STORAGE_KEY, id); } catch { /* ignore */ }
  };

  const refresh = () => setChecks(getIqaChecks());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('iqa-checks-updated', handler);
    const cohortHandler = () => setCohortUiBump(b => b + 1);
    window.addEventListener('iqa-cohort-completed-updated', cohortHandler);
    window.addEventListener('iqa-cohort-reviewer-override-updated', cohortHandler);
    return () => {
      window.removeEventListener('iqa-checks-updated', handler);
      window.removeEventListener('iqa-cohort-completed-updated', cohortHandler);
      window.removeEventListener('iqa-cohort-reviewer-override-updated', cohortHandler);
    };
  }, []);

  const cohortStats = useMemo(() => {
    void cohortUiBump;
    return cohorts
      .filter(coh => (getCohortIqaReviewerOverride(coh.id) ?? coh.iqaReviewerId) === reviewerId)
      .map(coh => {
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
          completedAt,
        };
      });
  }, [checks, tutors, reviewerId, cohortUiBump]);

  const [filterTrade, setFilterTrade] = useState('all');
  const [search, setSearch] = useState('');

  const filteredCohortStats = useMemo(() => {
    return cohortStats.filter(cs => {
      if (filterTrade !== 'all' && cs.cohort.trade !== filterTrade) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [cs.cohort.name, cs.cohort.trade, cs.assessor?.name, cs.cohort.packageName]
          .filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [cohortStats, filterTrade, search]);

  if (!mounted || !reviewerId) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-12 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  const selectedReviewerName = reviewers.find(r => r.id === reviewerId)?.name ?? 'Reviewer';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">IQA</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
            <p className="text-gray-500 text-sm mt-1">
              Your assigned cohorts for system review. Open a cohort to manage queue and review assessments.
            </p>
          </div>
          
        </div>
      </div>

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
          {[...new Set(cohortStats.map(c => c.cohort.trade))].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {(filterTrade !== 'all' || search) && (
          <button
            onClick={() => { setFilterTrade('all'); setSearch(''); }}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {filteredCohortStats.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <h3 className="text-gray-900 font-semibold mb-1">No cohorts for this reviewer</h3>
          <p className="text-gray-500 text-sm">
            {cohortStats.length === 0
              ? `No cohorts are assigned to ${selectedReviewerName} yet.`
              : 'Try adjusting search or filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Cohort</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Trade</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Assessor</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Students</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide min-w-[160px]">IQA Progress</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Breakdown</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Finished</th>
                </tr>
              </thead>
              <tbody>
                {filteredCohortStats.map(cs => (
                  <tr
                    key={cs.cohort.id}
                    className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors cursor-pointer"
                    onClick={() => { window.location.href = `/iqa/review-queue/cohort/${cs.cohort.id}`; }}
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
                    <td className="py-3.5 px-5">
                      <span className="text-sm text-gray-600">{cs.cohort.students.length}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <ProgressBar reviewed={cs.reviewed} total={cs.totalSubs} />
                      <p className="text-[11px] text-gray-400 mt-1">
                        {cs.reviewed} / {cs.totalSubs} reviewed
                      </p>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2 flex-wrap">
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
                    </td>
                    <td className="py-3.5 px-5">
                      {cs.completedAt ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                          Complete
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-gray-500">In progress</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-sm text-gray-600">{cs.completedAt ?? '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Open a cohort to manage the queue, review assessments, or finish the cohort.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewQueuePage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ReviewQueueContent />
    </Suspense>
  );
}
