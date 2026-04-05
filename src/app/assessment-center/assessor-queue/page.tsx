'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { getIqaChecks, getIqaTutors } from '@/lib/iqa-data';
import { submissions, cohorts, assessments } from '@/lib/mock-data';
import type { IqaCheck } from '@/lib/iqa-data';

const ASSESSOR_STORAGE_KEY = 'iqa-assessor-queue-assessor-id';

const tradeColors: Record<string, string> = {
  'Gas Engineering': 'bg-orange-100 text-orange-700',
  Electrical: 'bg-yellow-100 text-yellow-700',
  Plumbing: 'bg-blue-100 text-blue-700',
};

type TabKey = 'cohorts' | 'rejected';

function AssessorQueueContent() {
  const [mounted, setMounted] = useState(false);
  const [checks, setChecks] = useState<IqaCheck[]>([]);
  const [tab, setTab] = useState<TabKey>('cohorts');
  const [search, setSearch] = useState('');
  const [rejSearch, setRejSearch] = useState('');
  const [rejCohortFilter, setRejCohortFilter] = useState('all');
  const [resubmitted, setResubmitted] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState<string | null>(null);

  const tutors = getIqaTutors();
  const assessors = useMemo(() => tutors.filter(t => t.role === 'assessor' || t.role === 'both'), [tutors]);

  const [assessorId, setAssessorId] = useState('');

  useEffect(() => {
    setMounted(true);
    try {
      const list = getIqaTutors().filter(t => t.role === 'assessor' || t.role === 'both');
      const saved = sessionStorage.getItem(ASSESSOR_STORAGE_KEY);
      if (saved && list.some(a => a.id === saved)) setAssessorId(saved);
      else if (list[0]) setAssessorId(list[0].id);
    } catch {
      const list = getIqaTutors().filter(t => t.role === 'assessor' || t.role === 'both');
      if (list[0]) setAssessorId(list[0].id);
    }
  }, []);

  useEffect(() => {
    const refresh = () => setChecks(getIqaChecks());
    refresh();
    window.addEventListener('iqa-checks-updated', refresh);
    return () => window.removeEventListener('iqa-checks-updated', refresh);
  }, []);

  const cohortStats = useMemo(() => {
    return cohorts
      .filter(coh => coh.assessorId === assessorId)
      .map(coh => {
        const studentEmails = new Set(coh.students.map(s => s.email));
        const cohortSubs = submissions.filter(
          s => studentEmails.has(s.email) && coh.examIds.includes(s.assessmentId) && !s.id.includes('-v'),
        );
        const examNames = coh.examIds.map(eid => assessments.find(a => a.id === eid)?.title ?? eid);
        return { cohort: coh, totalSubs: cohortSubs.length, pending: cohortSubs.length, examNames };
      });
  }, [assessorId]);

  const rejectedItems = useMemo(() => {
    return checks
      .filter(c => c.status === 'Rejected' && c.assessorId === assessorId)
      .map(c => {
        const sub = submissions.find(s => s.id === c.submissionId);
        if (!sub) return null;
        const assessment = assessments.find(a => a.id === sub.assessmentId);
        const coh = cohorts.find(co =>
          co.students.some(st => st.email === sub.email) && co.examIds.includes(sub.assessmentId),
        );
        return { check: c, submission: sub, assessment, cohort: coh };
      })
      .filter(Boolean) as {
        check: IqaCheck;
        submission: (typeof submissions)[number];
        assessment: (typeof assessments)[number] | undefined;
        cohort: (typeof cohorts)[number] | undefined;
      }[];
  }, [checks, assessorId]);

  const filteredRejected = useMemo(() => {
    let list = rejectedItems;
    if (rejCohortFilter !== 'all') {
      list = list.filter(item => item.cohort?.id === rejCohortFilter);
    }
    if (rejSearch) {
      const q = rejSearch.toLowerCase();
      list = list.filter(item => {
        const hay = [item.submission.student, item.submission.email, item.assessment?.title].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }, [rejectedItems, rejSearch, rejCohortFilter]);

  const rejectedCohortOptions = useMemo(() => {
    const ids = new Set(rejectedItems.map(i => i.cohort?.id).filter(Boolean));
    return cohorts.filter(c => ids.has(c.id));
  }, [rejectedItems]);

  const filteredCohorts = useMemo(() => {
    if (!search) return cohortStats;
    const q = search.toLowerCase();
    return cohortStats.filter(cs => {
      const hay = [cs.cohort.name, cs.cohort.trade, cs.cohort.packageName].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [cohortStats, search]);

  if (!mounted || !assessorId) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-12 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  const selectedName = assessors.find(a => a.id === assessorId)?.name ?? 'Assessor';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">Assessment Center</p>
        <h1 className="text-2xl font-bold text-gray-900">Assessor Queue</h1>
        <p className="text-gray-500 text-sm mt-1">
          Cohorts assigned to <span className="font-medium text-gray-700">{selectedName}</span> for assessment.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
        {([
          { key: 'cohorts' as const, label: 'Cohorts', count: cohortStats.length },
          { key: 'rejected' as const, label: 'Rejected by IQA', count: rejectedItems.length },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              tab === t.key
                ? t.key === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cohorts Tab */}
      {tab === 'cohorts' && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="relative">
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
          </div>

          {filteredCohorts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
              <h3 className="text-gray-900 font-semibold mb-1">No cohorts found</h3>
              <p className="text-gray-500 text-sm">
                {cohortStats.length === 0
                  ? `No cohorts assigned to ${selectedName}.`
                  : 'Try adjusting your search.'}
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
                      <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide min-w-[100px]">Students / exams</th>
                      <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Exam Dates</th>
                      <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCohorts.map(cs => (
                      <tr
                        key={cs.cohort.id}
                        className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors cursor-pointer"
                        onClick={() => { window.location.href = `/assessment-center/assessor-queue/cohort/${cs.cohort.id}`; }}
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
                          <div className="flex flex-col gap-0.5">
                            {cs.cohort.examDates.map((d, i) => (
                              <span key={i} className="text-xs text-gray-500">{d}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            {cs.totalSubs} pending
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Click a cohort to view student submissions and grade them.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Rejected Tab */}
      {tab === 'rejected' && (
        <>
          {rejectedItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <svg className="text-green-500" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">No rejected items</h3>
              <p className="text-gray-500 text-sm">No IQA reviews have been sent back for re-assessment.</p>
            </div>
          ) : (
            <>
              {/* Search & Filters */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by student name or assessment..."
                    value={rejSearch}
                    onChange={e => setRejSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  />
                </div>
                <select
                  value={rejCohortFilter}
                  onChange={e => setRejCohortFilter(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
                >
                  <option value="all">All Cohorts</option>
                  {rejectedCohortOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {(rejSearch || rejCohortFilter !== 'all') && (
                  <button
                    onClick={() => { setRejSearch(''); setRejCohortFilter('all'); }}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {filteredRejected.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
                  <p className="text-gray-500 text-sm">No rejected items match your filters.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Student</th>
                          <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Assessment</th>
                          <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Cohort</th>
                          <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Rejected At</th>
                          <th className="py-3 px-5 text-right font-semibold text-xs text-gray-500 uppercase tracking-wide">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRejected.map(item => {
                          const isResubmitted = resubmitted.has(item.check.id);
                          const isConfirming = confirming === item.check.id;
                          return (
                            <tr
                              key={item.check.id}
                              className={`border-b border-gray-50 transition-colors ${isResubmitted ? 'bg-green-50/40' : isConfirming ? 'bg-amber-50/40' : 'hover:bg-red-50/30'}`}
                            >
                              <td className="py-3.5 px-5">
                                <p className="font-medium text-gray-900">{item.submission.student}</p>
                                <p className="text-xs text-gray-400">{item.submission.email}</p>
                              </td>
                              <td className="py-3.5 px-5">
                                <p className="font-medium text-gray-900">{item.assessment?.title ?? '—'}</p>
                                <p className="text-xs text-gray-400">{item.assessment?.module}</p>
                              </td>
                              <td className="py-3.5 px-5">
                                <span className="text-sm text-gray-700">{item.cohort?.name ?? '—'}</span>
                              </td>
                              <td className="py-3.5 px-5">
                                <span className="text-sm text-gray-600">{item.check.reviewedAt ?? '—'}</span>
                              </td>
                              <td className="py-3.5 px-5 text-right">
                                {isResubmitted ? (
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 inline-flex items-center gap-1">
                                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                      Resubmitted
                                    </span>
                                    <span className="text-[10px] text-gray-400">Sent back for IQA audit</span>
                                  </div>
                                ) : isConfirming ? (
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left min-w-[200px]">
                                    <p className="text-xs font-semibold text-amber-900 mb-1">Resubmit without changes?</p>
                                    <p className="text-[10px] text-amber-700 mb-2.5">
                                      Your original assessment will be sent back to IQA for re-audit as-is.
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setResubmitted(prev => new Set(prev).add(item.check.id));
                                          setConfirming(null);
                                        }}
                                        className="text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setConfirming(null); }}
                                        className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1.5 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-end gap-2">
                                    <button
                                      onClick={() => { window.location.href = `/assessment-center/assessor-queue/${item.submission.id}`; }}
                                      className="text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                                    >
                                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" /></svg>
                                      Edit &amp; Resubmit
                                    </button>
                             
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      <strong>Edit &amp; Resubmit</strong> lets you update your assessment form before sending it back for IQA audit. <strong>Resubmit without changes</strong> sends your original assessment as-is.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function AssessorQueuePage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <AssessorQueueContent />
    </Suspense>
  );
}
