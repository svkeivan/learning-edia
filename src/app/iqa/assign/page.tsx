'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  getIqaChecks,
  getIqaTutors,
  getIqaCategories,
  getReviewerWorkloads,
  getSkippedSubmissionIds,
  skipSubmissions,
  unskipSubmission,
  autoAssignReviewer,
  addIqaCheck,
  updateIqaCheck,
  removeIqaCheck,
} from '@/lib/iqa-data';
import { submissions, assessments } from '@/lib/mock-data';
import type { IqaCheck, IqaCheckStatus, IqaTutor, IqaCategory, ReviewerWorkload } from '@/lib/iqa-data';
import type { StudentSubmission } from '@/lib/mock-data';

type Tab = 'all' | 'queue' | 'not-queue';

const PAGE_SIZE = 20;

const tradeColors: Record<string, string> = {
  'Gas Engineering': 'bg-orange-100 text-orange-700',
  Electrical: 'bg-yellow-100 text-yellow-700',
  Plumbing: 'bg-blue-100 text-blue-700',
};

const statusStyles: Record<IqaCheckStatus, string> = {
  Pending: 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

interface EnrichedSubmission {
  submission: StudentSubmission;
  assessment: (typeof assessments)[number] | undefined;
  assessor: IqaTutor | undefined;
  check: IqaCheck | undefined;
  assignedReviewer: IqaTutor | undefined;
  category: IqaCategory | undefined;
  isSkipped: boolean;
}

// ── IQA History Modal ──────────────────────────────────────────────────────

interface IqaHistoryModalProps {
  items: EnrichedSubmission[];
  allChecks: IqaCheck[];
  tutors: IqaTutor[];
  workloads: ReviewerWorkload[];
  onClose: () => void;
  onSkip: (submissionId: string, checkId: string) => void;
  onAssign: (checkId: string, tutorId: string) => void;
}

function IqaHistoryModal({ items, allChecks, tutors, workloads, onClose, onSkip, onAssign }: IqaHistoryModalProps) {
  const [assigningCheckId, setAssigningCheckId] = useState<string | null>(null);
  const [assignTutorId, setAssignTutorId] = useState('');
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const checkedSubmissionIds = useMemo(
    () => new Set(allChecks.map(c => c.submissionId)),
    [allChecks],
  );

  const rows = useMemo(() => {
    return items.map(item => {
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
    });
  }, [items, allChecks, checkedSubmissionIds]);

  const handleSkipRow = (submissionId: string, checkId: string) => {
    setSkippedIds(prev => new Set([...prev, submissionId]));
    onSkip(submissionId, checkId);
  };

  const handleConfirmAssign = (checkId: string, submissionId: string) => {
    if (!assignTutorId) return;
    onAssign(checkId, assignTutorId);
    setAssigningCheckId(null);
    setAssignTutorId('');
    setSkippedIds(prev => new Set([...prev, submissionId])); // visually dim after action
  };

  const activeRows = rows.filter(r => !skippedIds.has(r.item.submission.id));

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
                const isActioned = skippedIds.has(sub.id);
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
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tradeColors[assessment?.trade ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                          {assessment?.trade}
                        </span>
                      </div>
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
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          cohortPct >= 50 ? 'bg-purple-100 text-purple-700' : cohortPct > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                        }`}>
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
                            {tutors.map(t => {
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

        {/* Summary footer */}
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
            {skippedIds.size > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-amber-600 font-medium">{skippedIds.size} actioned this session</span>
              </>
            )}
          </div>
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function IqaAssignPage() {
  const [checks, setChecks] = useState<IqaCheck[]>([]);
  const [tutors, setTutors] = useState<IqaTutor[]>([]);
  const [categories, setCategories] = useState<IqaCategory[]>([]);
  const [workloads, setWorkloads] = useState<ReviewerWorkload[]>([]);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  const [tab, setTab] = useState<Tab>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterAssessor, setFilterAssessor] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [bulkAssignTutor, setBulkAssignTutor] = useState('');
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [inlineAssigningId, setInlineAssigningId] = useState<string | null>(null);
  const [inlineSelectedTutor, setInlineSelectedTutor] = useState('');
  const [toast, setToast] = useState('');
  const [allPage, setAllPage] = useState(1);

  const refresh = useCallback(() => {
    setChecks(getIqaChecks());
    setTutors(getIqaTutors());
    setCategories(getIqaCategories());
    setWorkloads(getReviewerWorkloads());
    setSkipped(getSkippedSubmissionIds());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
    const handler = () => refresh();
    window.addEventListener('iqa-checks-updated', handler);
    window.addEventListener('iqa-tutors-updated', handler);
    window.addEventListener('iqa-categories-updated', handler);
    return () => {
      window.removeEventListener('iqa-checks-updated', handler);
      window.removeEventListener('iqa-tutors-updated', handler);
      window.removeEventListener('iqa-categories-updated', handler);
    };
  }, [refresh]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    setSelected(new Set());
    setShowBulkAssign(false);
    setInlineAssigningId(null);
    setShowHistoryModal(false);
  }, [tab]);

  const gradedSubmissions = useMemo(
    () => submissions.filter(s => s.gradedBy && s.score !== null),
    [],
  );

  const submissionIdsInQueue = useMemo(
    () => new Set(checks.map(c => c.submissionId)),
    [checks],
  );

  const enrichSubmission = useCallback(
    (sub: StudentSubmission): EnrichedSubmission => {
      const assessment = assessments.find(a => a.id === sub.assessmentId);
      const assessor = tutors.find(t => t.id === sub.gradedBy);
      const check = checks.find(c => c.submissionId === sub.id);
      const assignedReviewer = check?.assignedTo ? tutors.find(t => t.id === check.assignedTo) : undefined;
      const category = assessor ? categories.find(c => c.id === assessor.categoryId) : undefined;
      const isSkipped = skipped.has(sub.id);
      return { submission: sub, assessment, assessor, check, assignedReviewer, category, isSkipped };
    },
    [checks, tutors, categories, skipped],
  );

  const allItems = useMemo(
    () => gradedSubmissions.map(enrichSubmission),
    [gradedSubmissions, enrichSubmission],
  );

  const inQueueItems = useMemo(
    () => gradedSubmissions.filter(s => submissionIdsInQueue.has(s.id)).map(enrichSubmission),
    [gradedSubmissions, submissionIdsInQueue, enrichSubmission],
  );

  const notInQueueItems = useMemo(
    () => gradedSubmissions
      .filter(s => !submissionIdsInQueue.has(s.id) && !skipped.has(s.id))
      .map(enrichSubmission),
    [gradedSubmissions, submissionIdsInQueue, skipped, enrichSubmission],
  );

  const currentItems = tab === 'all' ? allItems : tab === 'queue' ? inQueueItems : notInQueueItems;

  const filteredItems = useMemo(() => {
    return currentItems.filter(item => {
      if (filterAssessor && item.assessor?.id !== filterAssessor) return false;
      if (filterCategory && item.category?.id !== filterCategory) return false;
      if (filterExam && item.assessment?.id !== filterExam) return false;
      if (tab === 'queue' && filterStatus && item.check?.status !== filterStatus) return false;
      return true;
    });
  }, [currentItems, filterAssessor, filterCategory, filterExam, filterStatus, tab]);

  const uniqueAssessors = useMemo(() => {
    const ids = new Set(currentItems.map(i => i.assessor?.id).filter(Boolean));
    return tutors.filter(t => ids.has(t.id));
  }, [currentItems, tutors]);

  const uniqueCategories = useMemo(() => {
    const ids = new Set(currentItems.map(i => i.category?.id).filter(Boolean));
    return categories.filter(c => ids.has(c.id));
  }, [currentItems, categories]);

  const uniqueExams = useMemo(() => {
    const ids = new Set(currentItems.map(i => i.assessment?.id).filter(Boolean));
    return assessments.filter(a => ids.has(a.id));
  }, [currentItems]);

  // Pagination for "All" tab
  const totalAllPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = tab === 'all'
    ? filteredItems.slice((allPage - 1) * PAGE_SIZE, allPage * PAGE_SIZE)
    : filteredItems;

  useEffect(() => { setAllPage(1); }, [filterAssessor, filterCategory, filterExam, tab]);

  const allSelected = pagedItems.length > 0 && pagedItems.every(i => selected.has(i.submission.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(pagedItems.map(i => i.submission.id)));
  };
  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Items currently selected (for modal)
  const selectedItems = useMemo(
    () => inQueueItems.filter(i => selected.has(i.submission.id)),
    [inQueueItems, selected],
  );

  // ── Actions ──────────────────────────────────────────────────────────────

  const addToQueueWithAutoAssign = (submissionId: string) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub?.gradedBy) return;
    const reviewer = autoAssignReviewer(sub.gradedBy);
    addIqaCheck({
      submissionId,
      tutorId: sub.gradedBy,
      status: 'Pending',
      assignedTo: reviewer ?? undefined,
    });
    return reviewer;
  };

  const handleAutoAddToQueue = (submissionId: string) => {
    const reviewer = addToQueueWithAutoAssign(submissionId);
    const name = reviewer ? tutors.find(t => t.id === reviewer)?.name : null;
    setToast(name ? `Added to queue — auto-assigned to ${name}` : 'Added to queue (no reviewer available)');
    refresh();
  };

  const handleManualAssign = (submissionId: string, tutorId: string) => {
    const item = currentItems.find(i => i.submission.id === submissionId);
    if (!item) return;
    if (item.check) {
      updateIqaCheck(item.check.id, { assignedTo: tutorId || undefined });
    } else {
      addIqaCheck({
        submissionId,
        tutorId: item.submission.gradedBy!,
        status: 'Pending',
        assignedTo: tutorId || undefined,
      });
    }
    const name = tutors.find(t => t.id === tutorId)?.name ?? 'any reviewer';
    setToast(`Assigned to ${name}`);
    setInlineAssigningId(null);
    setInlineSelectedTutor('');
    refresh();
  };

  const handleSkip = (submissionId: string) => {
    skipSubmissions([submissionId]);
    setToast('Assessment skipped from IQA queue');
    refresh();
  };

  // Used by modal: remove from queue entirely + mark as skipped
  const handleModalSkip = (submissionId: string, checkId: string) => {
    removeIqaCheck(checkId);
    skipSubmissions([submissionId]);
    setToast('Assessment removed from queue and skipped');
    refresh();
  };

  // Used by modal: assign a reviewer to an existing check
  const handleModalAssign = (checkId: string, tutorId: string) => {
    updateIqaCheck(checkId, { assignedTo: tutorId });
    const name = tutors.find(t => t.id === tutorId)?.name ?? 'reviewer';
    setToast(`Assigned to ${name}`);
    refresh();
  };

  const handleBulkAutoAdd = () => {
    let count = 0;
    selected.forEach(id => {
      if (!submissionIdsInQueue.has(id)) {
        addToQueueWithAutoAssign(id);
        count++;
      }
    });
    setToast(`Added ${count} item${count !== 1 ? 's' : ''} to queue with auto-assignment`);
    setSelected(new Set());
    refresh();
  };

  const handleBulkSkip = () => {
    const ids = [...selected];
    skipSubmissions(ids);
    setToast(`Skipped ${ids.length} assessment${ids.length !== 1 ? 's' : ''}`);
    setSelected(new Set());
    refresh();
  };

  const handleBulkAssign = () => {
    if (!bulkAssignTutor) return;
    let count = 0;
    selected.forEach(id => {
      const item = currentItems.find(i => i.submission.id === id);
      if (!item) return;
      if (item.check) {
        updateIqaCheck(item.check.id, { assignedTo: bulkAssignTutor });
      } else {
        addIqaCheck({
          submissionId: id,
          tutorId: item.submission.gradedBy!,
          status: 'Pending',
          assignedTo: bulkAssignTutor,
        });
      }
      count++;
    });
    const name = tutors.find(t => t.id === bulkAssignTutor)?.name ?? 'reviewer';
    setToast(`Assigned ${count} item${count !== 1 ? 's' : ''} to ${name}`);
    setSelected(new Set());
    setShowBulkAssign(false);
    setBulkAssignTutor('');
    refresh();
  };

  const handleBulkUnassign = () => {
    let count = 0;
    selected.forEach(id => {
      const item = currentItems.find(i => i.submission.id === id);
      if (!item?.check?.assignedTo) return;
      updateIqaCheck(item.check.id, { assignedTo: undefined });
      count++;
    });
    setToast(`Unassigned ${count} item${count !== 1 ? 's' : ''}`);
    setSelected(new Set());
    refresh();
  };

  const clearFilters = () => {
    setFilterAssessor('');
    setFilterCategory('');
    setFilterExam('');
    setFilterStatus('');
  };

  const hasActiveFilters = filterAssessor || filterCategory || filterExam || filterStatus;

  if (!mounted) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-12 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  const showCheckboxes = tab !== 'all';
  const displayItems = tab === 'all' ? pagedItems : filteredItems;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <div className="mb-5">
        <Link href="/iqa" className="text-sm text-gray-500 hover:text-gray-700">IQA</Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-sm text-gray-900 font-medium">Assign for Recheck</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">IQA</p>
          <h1 className="text-2xl font-bold text-gray-900">Assign for Recheck</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage which assessments go into the IQA review queue.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/iqa/categories"
            className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50"
          >
            Categories
          </Link>
          <Link
            href="/iqa/review-queue"
            className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50"
          >
            Review Queue
          </Link>
        </div>
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

      {/* Reviewer Workload Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Reviewer Workload</h2>
          <Link href="/iqa/people" className="text-xs text-orange-600 hover:text-orange-700 font-medium">
            Manage reviewers
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {workloads.map(w => {
            const pct = w.capacity > 0 ? Math.round((w.activeCount / w.capacity) * 100) : 0;
            const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';
            const textColor = pct >= 90 ? 'text-red-700' : pct >= 70 ? 'text-amber-700' : 'text-green-700';
            return (
              <div key={w.tutor.id} className="border border-gray-100 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-800 truncate mb-2">{w.tutor.name}</p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${textColor}`}>{w.activeCount}/{w.capacity}</span>
                  <span className="text-[10px] text-gray-400">{w.category?.name ?? '—'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-5 w-fit">
        {([
          { key: 'all' as Tab, label: 'All', count: allItems.length },
          { key: 'queue' as Tab, label: 'In Queue', count: inQueueItems.length },
          { key: 'not-queue' as Tab, label: 'Not in Queue', count: notInQueueItems.length },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              tab === t.key ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-500'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab description */}
      {tab === 'all' && (
        <p className="text-xs text-gray-500 mb-4">All graded assessments. Shows IQA status for each.</p>
      )}
      {tab === 'not-queue' && (
        <p className="text-xs text-gray-500 mb-4">Graded assessments eligible for IQA — not yet queued or skipped. Select to add to queue or skip.</p>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>

          <select value={filterAssessor} onChange={e => setFilterAssessor(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300">
            <option value="">All Assessors</option>
            {uniqueAssessors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300">
            <option value="">All Categories</option>
            {uniqueCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select value={filterExam} onChange={e => setFilterExam(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300">
            <option value="">All Exams</option>
            {uniqueExams.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>

          {tab === 'queue' && (
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          )}

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2">
              Clear filters
            </button>
          )}

          <span className="text-xs text-gray-400 ml-auto">
            {filteredItems.length} of {currentItems.length} shown
          </span>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-orange-800">{selected.size} selected</span>
          <div className="h-4 w-px bg-orange-200" />

          {tab === 'not-queue' && (
            <>
              <button
                onClick={handleBulkAutoAdd}
                className="text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-1.5 rounded-lg transition-colors"
              >
                Add to Queue
              </button>
              <button
                onClick={handleBulkSkip}
                className="text-sm font-medium bg-white border border-orange-300 text-orange-700 hover:bg-orange-100 px-3.5 py-1.5 rounded-lg transition-colors"
              >
                Skip
              </button>
            </>
          )}

          {tab === 'queue' && (
            <>
              {/* IQA History button */}
              <button
                onClick={() => setShowHistoryModal(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-white border border-orange-300 text-orange-700 hover:bg-orange-100 px-3.5 py-1.5 rounded-lg transition-colors"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                IQA History
              </button>

              {!showBulkAssign ? (
                <button
                  onClick={() => setShowBulkAssign(true)}
                  className="text-sm font-medium bg-white border border-orange-300 text-orange-700 hover:bg-orange-100 px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  Assign to Reviewer
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={bulkAssignTutor}
                    onChange={e => setBulkAssignTutor(e.target.value)}
                    className="text-sm border border-orange-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="">Select reviewer...</option>
                    {tutors.map(t => {
                      const wl = workloads.find(w => w.tutor.id === t.id);
                      return (
                        <option key={t.id} value={t.id}>
                          {t.name} ({wl ? `${wl.activeCount}/${wl.capacity}` : '—'})
                        </option>
                      );
                    })}
                  </select>
                  <button
                    onClick={handleBulkAssign}
                    disabled={!bulkAssignTutor}
                    className="text-sm font-medium bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => { setShowBulkAssign(false); setBulkAssignTutor(''); }}
                    className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <button
                onClick={handleBulkUnassign}
                className="text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 px-3.5 py-1.5 rounded-lg transition-colors"
              >
                Unassign
              </button>
            </>
          )}

          <button onClick={() => setSelected(new Set())} className="text-sm text-gray-500 hover:text-gray-700 ml-auto">
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      {displayItems.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {showCheckboxes && (
                    <th className="py-3 px-4 text-left w-10">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                    </th>
                  )}
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Student</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Trade</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Assessment</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Graded By</th>
                  {tab !== 'all' && (
                    <th className="py-3 px-4 text-left font-medium text-gray-500">Category</th>
                  )}
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Result</th>
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
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                        selected.has(sub.id) ? 'bg-orange-50/40' : ''
                      }`}
                    >
                      {showCheckboxes && (
                        <td className="py-3 px-4">
                          <input type="checkbox" checked={selected.has(sub.id)} onChange={() => toggleOne(sub.id)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                        </td>
                      )}

                      {/* Student — no avatar */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{sub.student}</p>
                        <p className="text-xs text-gray-400">{sub.email}</p>
                      </td>

                      {/* Trade */}
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tradeColors[assessment?.trade ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                          {assessment?.trade ?? '—'}
                        </span>
                      </td>

                      {/* Assessment */}
                      <td className="py-3 px-4">
                        <p className="text-gray-900 font-medium">{assessment?.title}</p>
                        <p className="text-xs text-gray-400">{assessment?.module}</p>
                      </td>

                      {/* Graded By */}
                      <td className="py-3 px-4 text-gray-700 text-sm">{assessor?.name ?? '—'}</td>

                      {/* Category (not shown on All tab) */}
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

                      {/* Result — Pass/Fail only */}
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          sub.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {sub.status === 'Pass' ? 'Pass' : 'Fail'}
                        </span>
                      </td>

                      {/* Queue tab: IQA check status + reviewer */}
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
                                  {tutors.map(t => {
                                    const wl = workloads.find(w => w.tutor.id === t.id);
                                    return (
                                      <option key={t.id} value={t.id}>
                                        {t.name} ({wl ? `${wl.activeCount}/${wl.capacity}` : '—'})
                                      </option>
                                    );
                                  })}
                                </select>
                                <button onClick={() => handleManualAssign(sub.id, inlineSelectedTutor)}
                                  className="text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1.5 rounded-lg">
                                  Save
                                </button>
                                <button onClick={() => { setInlineAssigningId(null); setInlineSelectedTutor(''); }}
                                  className="text-xs text-gray-400 hover:text-gray-600 px-1">&times;</button>
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

                      {/* All tab: IQA status badge */}
                      {tab === 'all' && (
                        <td className="py-3 px-4">
                          {check ? (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[check.status]}`}>
                              {check.status}
                            </span>
                          ) : isSkipped ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              Skipped
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      )}

                      {/* Actions (not on All tab) */}
                      {tab !== 'all' && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            {tab === 'queue' && check && (
                              <Link href={`/iqa/review-queue/${check.id}`}
                                className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                Review
                              </Link>
                            )}
                            {tab === 'not-queue' && !isAssigning && (
                              <>
                                <button onClick={() => handleAutoAddToQueue(sub.id)}
                                  className="text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                                  Add to Queue
                                </button>
                                <button onClick={() => { setInlineAssigningId(sub.id); setInlineSelectedTutor(''); }}
                                  className="text-xs font-medium text-orange-600 border border-orange-200 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
                                  Manual
                                </button>
                                <button onClick={() => handleSkip(sub.id)}
                                  className="text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
                                  Skip
                                </button>
                              </>
                            )}
                          </div>
                          {tab === 'not-queue' && isAssigning && (
                            <div className="flex items-center gap-1.5 mt-2 justify-end">
                              <select
                                value={inlineSelectedTutor}
                                onChange={e => setInlineSelectedTutor(e.target.value)}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 w-36"
                              >
                                <option value="">Any reviewer</option>
                                {tutors.map(t => {
                                  const wl = workloads.find(w => w.tutor.id === t.id);
                                  return (
                                    <option key={t.id} value={t.id}>
                                      {t.name} ({wl ? `${wl.activeCount}/${wl.capacity}` : '—'})
                                    </option>
                                  );
                                })}
                              </select>
                              <button onClick={() => handleManualAssign(sub.id, inlineSelectedTutor)}
                                className="text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1.5 rounded-lg">
                                Add & Assign
                              </button>
                              <button onClick={() => { setInlineAssigningId(null); setInlineSelectedTutor(''); }}
                                className="text-xs text-gray-400 hover:text-gray-600 px-1">&times;</button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination for All tab */}
          {tab === 'all' && totalAllPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Page {allPage} of {totalAllPages} · {filteredItems.length} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAllPage(p => Math.max(1, p - 1))}
                  disabled={allPage === 1}
                  className="text-xs font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setAllPage(p => Math.min(totalAllPages, p + 1))}
                  disabled={allPage === totalAllPages}
                  className="text-xs font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
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
                  ? 'No assessments eligible for queuing.'
                  : 'No graded assessments found.'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-2">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Skipped counter for All tab */}
      {tab === 'all' && skipped.size > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          {skipped.size} assessment{skipped.size !== 1 ? 's' : ''} skipped from IQA queue.{' '}
          <button
            onClick={() => {
              [...skipped].forEach(id => unskipSubmission(id));
              refresh();
            }}
            className="text-orange-600 hover:text-orange-700 underline underline-offset-2"
          >
            Restore all
          </button>
        </p>
      )}

      {/* IQA History Modal */}
      {showHistoryModal && selectedItems.length > 0 && (
        <IqaHistoryModal
          items={selectedItems}
          allChecks={checks}
          tutors={tutors}
          workloads={workloads}
          onClose={() => setShowHistoryModal(false)}
          onSkip={handleModalSkip}
          onAssign={handleModalAssign}
        />
      )}
    </div>
  );
}
