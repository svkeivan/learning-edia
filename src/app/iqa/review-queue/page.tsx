'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { getIqaChecks, getIqaTutors, getIqaCategories } from '@/lib/iqa-data';
import { submissions, assessments } from '@/lib/mock-data';
import type { IqaCheck, IqaCheckStatus } from '@/lib/iqa-data';

const tradeColors: Record<string, string> = {
  'Gas Engineering': 'bg-orange-100 text-orange-700',
  'Electrical': 'bg-yellow-100 text-yellow-700',
  'Plumbing': 'bg-blue-100 text-blue-700',
};

const statusStyles: Record<IqaCheckStatus, string> = {
  Pending: 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

function ReviewQueueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = (searchParams.get('status') as IqaCheckStatus | null) || 'All';

  const [checks, setChecks] = useState<IqaCheck[]>([]);
  const tutors = getIqaTutors();
  const categories = getIqaCategories();

  const refresh = () => setChecks(getIqaChecks());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('iqa-checks-updated', handler);
    return () => window.removeEventListener('iqa-checks-updated', handler);
  }, []);

  const displayItems = useMemo(() => {
    if (statusFilter === 'All') return checks;
    return checks.filter(c => c.status === statusFilter);
  }, [checks, statusFilter]);

  const pendingCount = useMemo(() => checks.filter(c => c.status === 'Pending').length, [checks]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">IQA</p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
            {pendingCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
            {pendingCount === 0 && checks.length > 0 && (
              <span className="bg-green-100 text-green-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                All reviewed
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Approve or reject tutor assessments based on grading quality
          </p>
        </div>
        <Link
          href="/iqa/assign"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Assign Recheck
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap items-center gap-3">
        {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(status => {
          const isActive = statusFilter === status;
          const count = status === 'All' ? checks.length : checks.filter(c => c.status === status).length;
          return (
            <button
              key={status}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                if (status === 'All') params.delete('status');
                else params.set('status', status);
                router.push(params.toString() ? `/iqa/review-queue?${params}` : '/iqa/review-queue');
              }}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {displayItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="text-green-600" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h3 className="text-gray-900 font-semibold mb-1">No items match filters</h3>
          <p className="text-gray-500 text-sm">Try adjusting the status filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayItems.map(check => {
            const submission = submissions.find(s => s.id === check.submissionId);
            const assessment = submission ? assessments.find(a => a.id === submission.assessmentId) : null;
            const tutor = tutors.find(t => t.id === check.tutorId);
            const category = tutor ? categories.find(c => c.id === tutor.categoryId) : null;
            const assignedTutor = check.assignedTo ? tutors.find(t => t.id === check.assignedTo) : null;

            if (!submission || !assessment) return null;

            return (
              <Link
                key={check.id}
                href={`/iqa/review-queue/${check.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                      {submission.student.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{submission.student}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[check.status]}`}>
                          {check.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium mt-0.5">{assessment.title}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tradeColors[assessment.trade] ?? 'bg-gray-100 text-gray-600'}`}>
                          {assessment.trade}
                        </span>
                        {submission.score !== null && (
                          <span className="text-xs text-gray-500">Score: {submission.score}%</span>
                        )}
                        <span className="text-xs text-gray-500">Graded by {tutor?.name ?? 'Unknown'}</span>
                        {assignedTutor && (
                          <span className="text-xs text-blue-600 font-medium">Assigned to {assignedTutor.name}</span>
                        )}
                        {category && (
                          <span className="text-xs text-gray-400">{category.name} ({category.recheckPercent}%)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold bg-orange-600 text-white px-4 py-2 rounded-lg">
                      {check.status === 'Pending' ? 'Review' : 'View'}
                    </span>
                  </div>
                </div>

                {submission.answers && submission.answers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-red-500 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 12.586 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
                    </svg>
                    <p className="text-sm text-gray-500">
                      {submission.answers.filter(a => a.type === 'file').length} PDF document{submission.answers.filter(a => a.type === 'file').length !== 1 ? 's' : ''} uploaded
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {displayItems.length > 0 && (
        <p className="text-xs text-gray-400 mt-4">
          Showing {displayItems.length} of {checks.length} assessment{checks.length !== 1 ? 's' : ''}
        </p>
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
