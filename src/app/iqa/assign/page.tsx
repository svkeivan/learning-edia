'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getIqaChecks,
  getIqaTutors,
  getIqaCategories,
  addIqaCheck,
  updateIqaCheck,
} from '@/lib/iqa-data';
import { submissions, assessments } from '@/lib/mock-data';
import type { IqaCheckStatus } from '@/lib/iqa-data';

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

export default function IqaAssignPage() {
  const [checks, setChecks] = useState(() => getIqaChecks());
  const [tutors, setTutors] = useState(() => getIqaTutors());
  const [categories, setCategories] = useState(() => getIqaCategories());
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState('');
  const [toast, setToast] = useState('');

  const refresh = () => {
    setChecks(getIqaChecks());
    setTutors(getIqaTutors());
    setCategories(getIqaCategories());
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('iqa-checks-updated', handler);
    window.addEventListener('iqa-tutors-updated', handler);
    return () => {
      window.removeEventListener('iqa-checks-updated', handler);
      window.removeEventListener('iqa-tutors-updated', handler);
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const gradedSubmissions = submissions.filter(s => s.gradedBy && s.score !== null);
  const submissionIdsInQueue = new Set(checks.map(c => c.submissionId));
  const notInQueue = gradedSubmissions.filter(s => !submissionIdsInQueue.has(s.id));
  const inQueue = gradedSubmissions.filter(s => submissionIdsInQueue.has(s.id));

  const getCheckForSubmission = (submissionId: string) =>
    checks.find(c => c.submissionId === submissionId);

  const handleAssign = (submissionId: string, tutorId: string) => {
    const existing = getCheckForSubmission(submissionId);
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission?.gradedBy) return;

    if (existing) {
      updateIqaCheck(existing.id, { assignedTo: tutorId || undefined });
    } else {
      addIqaCheck({
        submissionId,
        tutorId: submission.gradedBy,
        status: 'Pending',
        assignedTo: tutorId || undefined,
      });
    }
    const tutorName = tutors.find(t => t.id === tutorId)?.name ?? 'any reviewer';
    setToast(`Assigned to ${tutorName}`);
    setAssigningId(null);
    setSelectedTutor('');
    refresh();
  };

  const handleAddToQueue = (submissionId: string, tutorId: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission?.gradedBy) return;
    addIqaCheck({
      submissionId,
      tutorId: submission.gradedBy,
      status: 'Pending',
      assignedTo: tutorId || undefined,
    });
    const tutorName = tutorId ? tutors.find(t => t.id === tutorId)?.name : null;
    setToast(tutorName ? `Added to queue and assigned to ${tutorName}` : 'Added to IQA queue');
    setAssigningId(null);
    setSelectedTutor('');
    refresh();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/iqa" className="text-sm text-gray-500 hover:text-gray-700">IQA</Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-sm text-gray-900 font-medium">Assign for Recheck</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">IQA</p>
          <h1 className="text-2xl font-bold text-gray-900">Assign Assessment for Recheck</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manually assign graded assessments to tutors for IQA recheck.
          </p>
        </div>
        <Link
          href="/iqa/review-queue"
          className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50"
        >
          View Queue
        </Link>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-2">
          <svg className="text-green-600 shrink-0" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-sm text-green-800 font-medium">{toast}</p>
        </div>
      )}

      {/* In queue */}
      {inQueue.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">In IQA Queue</h2>
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{inQueue.length}</span>
          </div>
          <div className="space-y-3">
            {inQueue.map(sub => {
              const assessment = assessments.find(a => a.id === sub.assessmentId);
              const tutor = tutors.find(t => t.id === sub.gradedBy);
              const check = getCheckForSubmission(sub.id);
              const assignedTutor = check?.assignedTo ? tutors.find(t => t.id === check.assignedTo) : null;
              const isAssigning = assigningId === sub.id;
              const fileCount = sub.answers?.filter(a => a.type === 'file').length ?? 0;

              return (
                <div key={sub.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                        {sub.student.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{sub.student}</p>
                          {check && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[check.status]}`}>
                              {check.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{assessment?.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tradeColors[assessment?.trade ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                            {assessment?.trade}
                          </span>
                          <span className="text-xs text-gray-500">Score: {sub.score}%</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${sub.status === 'Pass' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {sub.status}
                          </span>
                          <span className="text-xs text-gray-500">Graded by {tutor?.name}</span>
                          {fileCount > 0 && (
                            <span className="text-xs text-gray-400">{fileCount} PDF{fileCount !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                        {assignedTutor && (
                          <p className="text-xs text-blue-600 font-medium mt-1.5">Reviewer: {assignedTutor.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isAssigning ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedTutor}
                            onChange={e => setSelectedTutor(e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                          >
                            <option value="">Any reviewer</option>
                            {tutors.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssign(sub.id, selectedTutor)}
                            className="text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setAssigningId(null); setSelectedTutor(''); }}
                            className="text-sm font-medium text-gray-500 px-3 py-2 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => { setAssigningId(sub.id); setSelectedTutor(check?.assignedTo ?? ''); }}
                            className="text-sm font-semibold text-orange-600 border border-orange-200 hover:bg-orange-50 px-4 py-2 rounded-lg transition-colors"
                          >
                            {assignedTutor ? 'Reassign' : 'Assign'}
                          </button>
                          <Link
                            href={`/iqa/review-queue/${check?.id}`}
                            className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Review
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Not in queue */}
      {notInQueue.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Add to Queue</h2>
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{notInQueue.length}</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Graded assessments not yet in the IQA queue.</p>
          <div className="space-y-3">
            {notInQueue.map(sub => {
              const assessment = assessments.find(a => a.id === sub.assessmentId);
              const tutor = tutors.find(t => t.id === sub.gradedBy);
              const isAssigning = assigningId === sub.id;
              const fileCount = sub.answers?.filter(a => a.type === 'file').length ?? 0;

              return (
                <div key={sub.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                        {sub.student.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{sub.student}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{assessment?.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tradeColors[assessment?.trade ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                            {assessment?.trade}
                          </span>
                          <span className="text-xs text-gray-500">Score: {sub.score}%</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${sub.status === 'Pass' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {sub.status}
                          </span>
                          <span className="text-xs text-gray-500">Graded by {tutor?.name}</span>
                          {fileCount > 0 && (
                            <span className="text-xs text-gray-400">{fileCount} PDF{fileCount !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isAssigning ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedTutor}
                            onChange={e => setSelectedTutor(e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                          >
                            <option value="">Any reviewer</option>
                            {tutors.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAddToQueue(sub.id, selectedTutor)}
                            className="text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Add & Assign
                          </button>
                          <button
                            onClick={() => { setAssigningId(null); setSelectedTutor(''); }}
                            className="text-sm font-medium text-gray-500 px-3 py-2 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAssigningId(sub.id); setSelectedTutor(''); }}
                          className="text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Add to Queue
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {gradedSubmissions.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-500">No tutor-graded assessments found.</p>
        </div>
      )}
    </div>
  );
}
