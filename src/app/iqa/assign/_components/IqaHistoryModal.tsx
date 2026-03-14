'use client';

import { useState, useMemo } from 'react';
import { submissions } from '@/lib/mock-data';
import type { IqaCheck, IqaTutor, ReviewerWorkload, EnrichedSubmission } from '../types';
import { tradeColors, statusStyles } from '../types';

interface Props {
  items: EnrichedSubmission[];
  allChecks: IqaCheck[];
  tutors: IqaTutor[];
  workloads: ReviewerWorkload[];
  onClose: () => void;
  onSkip: (submissionId: string, checkId: string) => void;
  onAssign: (checkId: string, tutorId: string) => void;
}

export function IqaHistoryModal({ items, allChecks, tutors, workloads, onClose, onSkip, onAssign }: Props) {
  const [assigningCheckId, setAssigningCheckId] = useState<string | null>(null);
  const [assignTutorId, setAssignTutorId] = useState('');
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());

  const reviewerTutors = tutors.filter(t => t.role !== 'assessor');

  const checkedSubmissionIds = useMemo(
    () => new Set(allChecks.map(c => c.submissionId)),
    [allChecks],
  );

  const rows = useMemo(() => items.map(item => {
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

  const handleSkipRow = (submissionId: string, checkId: string) => {
    setActionedIds(prev => new Set([...prev, submissionId]));
    onSkip(submissionId, checkId);
  };

  const handleConfirmAssign = (checkId: string, submissionId: string) => {
    if (!assignTutorId) return;
    onAssign(checkId, assignTutorId);
    setAssigningCheckId(null);
    setAssignTutorId('');
    setActionedIds(prev => new Set([...prev, submissionId]));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">IQA History &amp; Cohort Coverage</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {items.length} selected assessment{items.length !== 1 ? 's' : ''} — review prior IQA records, cohort rates and take action
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Legend */}
        <div className="px-6 pt-3 pb-3 flex items-center gap-6 text-xs text-gray-500 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span><strong className="text-gray-700">Prior IQA</strong> — other exams by this student that were IQA checked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span><strong className="text-gray-700">Cohort Coverage</strong> — % of graded submissions in this exam already IQA reviewed</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Student</th>
                <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Assessment</th>
                <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Result</th>
                <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">IQA Status</th>
                <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Prior IQA</th>
                <th className="py-3 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wide">Cohort Coverage</th>
                <th className="py-3 px-4 text-right font-semibold text-xs text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, priorIqaCount, priorIqaTotal, cohortChecked, cohortTotal, cohortPct, currentCheck }) => {
                const { submission: sub, assessment } = item;
                const isActioned = actionedIds.has(sub.id);
                const isAssigning = assigningCheckId === currentCheck?.id;

                return (
                  <tr key={sub.id} className={`border-b border-gray-50 transition-colors ${isActioned ? 'opacity-40 bg-gray-50' : 'hover:bg-gray-50/40'}`}>
                    {/* Student */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{sub.student}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub.email}</p>
                    </td>

                    {/* Assessment */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 text-sm">{assessment?.title ?? '—'}</p>
                      {assessment?.trade && (
                        <span className={`mt-0.5 inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tradeColors[assessment.trade] ?? 'bg-gray-100 text-gray-600'}`}>
                          {assessment.trade}
                        </span>
                      )}
                    </td>

                    {/* Result */}
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sub.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {sub.status === 'Pass' ? 'Pass' : 'Fail'}
                      </span>
                    </td>

                    {/* IQA Status */}
                    <td className="py-3 px-4">
                      {isActioned ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Done</span>
                      ) : currentCheck ? (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[currentCheck.status]}`}>
                          {currentCheck.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Prior IQA */}
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

                    {/* Cohort Coverage */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cohortPct >= 50 ? 'bg-purple-100 text-purple-700' : cohortPct > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                          {cohortPct}%
                        </span>
                        <span className="text-xs text-gray-400">{cohortChecked}/{cohortTotal}</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cohortPct >= 50 ? 'bg-purple-500' : cohortPct > 0 ? 'bg-amber-400' : 'bg-gray-300'}`}
                            style={{ width: `${cohortPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {isActioned ? (
                        <span className="text-xs text-gray-400 italic">actioned</span>
                      ) : isAssigning ? (
                        <div className="flex items-center gap-1.5 justify-end">
                          <select
                            value={assignTutorId}
                            onChange={e => setAssignTutorId(e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 w-36"
                          >
                            <option value="">Select reviewer...</option>
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
                            onClick={() => currentCheck && handleConfirmAssign(currentCheck.id, sub.id)}
                            disabled={!assignTutorId}
                            className="text-xs font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white px-2.5 py-1.5 rounded-lg"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => { setAssigningCheckId(null); setAssignTutorId(''); }}
                            className="text-xs text-gray-400 hover:text-gray-600 px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-end">
                          {currentCheck && (
                            <button
                              onClick={() => { setAssigningCheckId(currentCheck.id); setAssignTutorId(currentCheck.assignedTo ?? ''); }}
                              className="text-xs font-medium text-orange-600 border border-orange-200 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              Assign
                            </button>
                          )}
                          <button
                            onClick={() => currentCheck && handleSkipRow(sub.id, currentCheck.id)}
                            className="text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            Skip
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

        {/* Footer summary */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-5 text-xs text-gray-600">
            <span>
              <strong className="text-gray-800">{rows.filter(r => r.priorIqaCount > 0).length}</strong> of {items.length} students have prior IQA history
            </span>
            <span className="text-gray-300">|</span>
            <span>
              Avg cohort coverage:{' '}
              <strong className="text-gray-800">
                {rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.cohortPct, 0) / rows.length) : 0}%
              </strong>
            </span>
            {actionedIds.size > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-amber-600 font-medium">{actionedIds.size} actioned this session</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
