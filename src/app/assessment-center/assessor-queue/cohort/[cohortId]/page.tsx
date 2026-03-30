'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { submissions, cohorts, assessments } from '@/lib/mock-data';

const tradeColors: Record<string, string> = {
  'Gas Engineering': 'bg-orange-100 text-orange-700',
  Electrical: 'bg-yellow-100 text-yellow-700',
  Plumbing: 'bg-blue-100 text-blue-700',
};

export default function AssessorCohortDetailPage() {
  const params = useParams();
  const cohortId = params.cohortId as string;
  const cohort = cohorts.find(c => c.id === cohortId);

  const [search, setSearch] = useState('');
  const [filterExam, setFilterExam] = useState('all');

  const cohortSubs = useMemo(() => {
    if (!cohort) return [];
    const studentEmails = new Set(cohort.students.map(s => s.email));
    return submissions
      .filter(s => studentEmails.has(s.email) && cohort.examIds.includes(s.assessmentId) && !s.id.includes('-v'))
      .map(s => {
        const assessment = assessments.find(a => a.id === s.assessmentId);
        const examIdx = cohort.examIds.indexOf(s.assessmentId);
        const examDate = examIdx >= 0 ? cohort.examDates[examIdx] : undefined;
        return { submission: s, assessment, examDate };
      });
  }, [cohort]);

  const filteredSubs = useMemo(() => {
    let list = cohortSubs;
    if (filterExam !== 'all') {
      list = list.filter(item => item.submission.assessmentId === filterExam);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(item => {
        const hay = [item.submission.student, item.assessment?.title].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }, [cohortSubs, filterExam, search]);

  const totalPending = cohortSubs.length;

  if (!cohort) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <h3 className="text-gray-900 font-semibold mb-1">Cohort not found</h3>
          <Link href="/assessment-center/assessor-queue" className="text-orange-600 hover:underline text-sm mt-2 inline-block">
            Back to Assessor Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-5">
        <Link href="/assessment-center/assessor-queue" className="text-gray-400 hover:text-gray-600 transition-colors">Assessor Queue</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium">{cohort.name}</span>
      </nav>

      {/* Cohort Header */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm mb-6">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{cohort.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{cohort.packageName}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tradeColors[cohort.trade] ?? 'bg-gray-100 text-gray-600'}`}>
              {cohort.trade}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Students</p>
              <p className="text-sm font-semibold text-gray-900">{cohort.students.length}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Exams</p>
              <p className="text-sm font-semibold text-gray-900">{cohort.examIds.length}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Total Submissions</p>
              <p className="text-sm font-semibold text-gray-900">{cohortSubs.length}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Status</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {totalPending} pending review
              </span>
            </div>
          </div>

          {/* Exam Dates */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Exam Schedule</p>
            <div className="flex flex-wrap gap-3">
              {cohort.examIds.map((eid, i) => {
                const exam = assessments.find(a => a.id === eid);
                return (
                  <div key={eid} className="bg-gray-50 rounded-lg border border-gray-100 px-3 py-2">
                    <p className="text-xs font-medium text-gray-900">{exam?.title ?? eid}</p>
                    <p className="text-[11px] text-gray-500">{cohort.examDates[i]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          />
        </div>
        <select
          value={filterExam}
          onChange={e => setFilterExam(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
        >
          <option value="all">All Exams</option>
          {cohort.examIds.map(eid => {
            const exam = assessments.find(a => a.id === eid);
            return <option key={eid} value={eid}>{exam?.title ?? eid}</option>;
          })}
        </select>
        {(filterExam !== 'all' || search) && (
          <button
            onClick={() => { setFilterExam('all'); setSearch(''); }}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Submissions Table */}
      {filteredSubs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-500 text-sm">No submissions match your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Assessment</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Exam Date</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Submitted</th>
                  <th className="py-3 px-5 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map(item => (
                    <tr
                      key={item.submission.id}
                      className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors cursor-pointer"
                      onClick={() => { window.location.href = `/assessment-center/assessor-queue/${item.submission.id}`; }}
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
                        <span className="text-sm text-gray-600">{item.examDate ?? '—'}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-sm text-gray-500">{item.submission.submittedAt}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Pending
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Click a submission to view the student&apos;s work and fill out the assessment form.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
