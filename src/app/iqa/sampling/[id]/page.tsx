'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  getSamplingPlans,
  getCohorts,
  updateSamplingPlan,
  updateCohort,
  assessors,
  iqaPersonnel,
  centers,
  computeSamplingCoverage,
} from '@/lib/iqa-sampling';
import { qualifications, knowledgeUnits } from '@/lib/mock-data';
import type { SamplingPlan, SamplingPlanStatus, Cohort, CohortStatus, SamplingEntry, CandidateStage } from '@/lib/iqa-sampling';

const statusColors: Record<SamplingPlanStatus, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Active: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
};

const cohortStatusColors: Record<CohortStatus, string> = {
  'In Progress': 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Referred: 'bg-red-100 text-red-700',
};

const stageOrder: CandidateStage[] = ['Attendance', 'Completion', 'Pass'];

export default function SamplingPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [plan, setPlan] = useState<SamplingPlan | null>(null);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState('');
  const [activeSection, setActiveSection] = useState<'proposed' | 'actual'>('proposed');

  const refresh = useCallback(() => {
    const plans = getSamplingPlans();
    const found = plans.find(p => p.id === id) ?? null;
    setPlan(found);
    if (found?.cohortId) {
      const cohorts = getCohorts();
      setCohort(cohorts.find(c => c.id === found.cohortId) ?? null);
    }
  }, [id]);

  useEffect(() => {
    setMounted(true);
    refresh();
    const handler = () => refresh();
    window.addEventListener('iqa-sampling-updated', handler);
    return () => window.removeEventListener('iqa-sampling-updated', handler);
  }, [refresh]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (!mounted) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-40 w-full bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center py-20">
        <p className="text-gray-500 font-medium">Sampling plan not found.</p>
        <Link href="/iqa/sampling" className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-2 inline-block">
          Back to plans
        </Link>
      </div>
    );
  }

  const qual = qualifications.find(q => q.id === plan.qualificationId);
  const assessor = assessors.find(a => a.id === plan.assessorId);
  const iqaAssessor = iqaPersonnel.find(p => p.id === plan.iqaAssessorId);
  const controller = iqaPersonnel.find(p => p.id === plan.controllerId);
  const coverage = computeSamplingCoverage(plan);
  const assessorCenter = centers.find(c => c.id === assessor?.centerId);
  const iqaCenter = centers.find(c => c.id === iqaAssessor?.centerId);

  const handleStatusChange = (status: SamplingPlanStatus) => {
    updateSamplingPlan(plan.id, { status });
    setToast(`Plan status changed to ${status}`);
    refresh();
  };

  const handleCohortAction = (action: CohortStatus) => {
    if (!cohort) return;
    updateCohort(cohort.id, { status: action });
    setToast(`Cohort ${action.toLowerCase()}`);
    refresh();
  };

  const handleAddActualEntry = (entry: SamplingEntry) => {
    const existing = plan.actualEntries.find(
      e => e.candidateId === entry.candidateId && e.knowledgeUnitId === entry.knowledgeUnitId && e.assessmentMode === entry.assessmentMode,
    );
    if (existing) return;
    const updated = [...plan.actualEntries, { ...entry, id: 'ae-' + Date.now(), stage: 'Attendance' as CandidateStage }];
    updateSamplingPlan(plan.id, { actualEntries: updated });
    setToast('Added to actual sampling');
    refresh();
  };

  const handleAdvanceStage = (entryId: string) => {
    const updated = plan.actualEntries.map(e => {
      if (e.id !== entryId) return e;
      const currentIdx = stageOrder.indexOf(e.stage);
      if (currentIdx < stageOrder.length - 1) {
        return { ...e, stage: stageOrder[currentIdx + 1] };
      }
      return e;
    });
    updateSamplingPlan(plan.id, { actualEntries: updated });
    refresh();
  };

  const currentEntries = activeSection === 'proposed' ? plan.proposedEntries : plan.actualEntries;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <div className="mb-5">
        <Link href="/iqa" className="text-sm text-gray-500 hover:text-gray-700">IQA</Link>
        <span className="text-gray-400 mx-2">/</span>
        <Link href="/iqa/sampling" className="text-sm text-gray-500 hover:text-gray-700">Sampling Plans</Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-sm text-gray-900 font-medium">{qual?.name}</span>
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

      {/* Plan header card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{qual?.name}</h1>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColors[plan.status]}`}>
                {plan.status}
              </span>
            </div>
            {plan.notes && <p className="text-sm text-gray-500 mt-1">{plan.notes}</p>}
            <p className="text-xs text-gray-400 mt-2">Created {plan.createdAt}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {plan.status === 'Draft' && (
              <button onClick={() => handleStatusChange('Active')}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Activate Plan
              </button>
            )}
            {plan.status === 'Active' && (
              <button onClick={() => handleStatusChange('Completed')}
                className="text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                Mark Completed
              </button>
            )}
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="border border-gray-100 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Assessor</p>
            <p className="text-sm font-medium text-gray-900">{assessor?.name}</p>
            <p className="text-xs text-gray-400">{assessorCenter?.name}</p>
            {assessor?.experience === 'New' && (
              <span className="inline-block mt-1 text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">New</span>
            )}
          </div>
          <div className="border border-gray-100 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">IQA Assessor</p>
            <p className="text-sm font-medium text-gray-900">{iqaAssessor?.name}</p>
            <p className="text-xs text-gray-400">{iqaCenter?.name}</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Controller</p>
            <p className="text-sm font-medium text-gray-900">{controller?.name}</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Coverage</p>
            <p className="text-lg font-bold text-gray-900">
              {coverage.actual}/{coverage.proposed}
              {coverage.exceeded && <span className="text-green-600 text-xs ml-1">+extended</span>}
            </p>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all ${coverage.percent >= 100 ? 'bg-green-500' : coverage.percent >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(coverage.percent, 100)}%` }}
              />
            </div>
          </div>
          <div className="border border-gray-100 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Independence</p>
            {assessorCenter?.id !== iqaCenter?.id ? (
              <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Different centers
              </p>
            ) : (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" />
                </svg>
                Same center — review independence
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cohort card */}
      {cohort && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-gray-900">Cohort: {cohort.name}</h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cohortStatusColors[cohort.status]}`}>
                {cohort.status}
              </span>
              <span className="text-xs text-gray-400">{cohort.candidateIds.length} candidates</span>
            </div>
            {cohort.status === 'In Progress' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCohortAction('Approved')}
                  className="text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  Approve Cohort
                </button>
                <button
                  onClick={() => handleCohortAction('Referred')}
                  className="text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  Refer Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proposed vs Actual tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-5 w-fit">
        <button
          onClick={() => setActiveSection('proposed')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeSection === 'proposed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Proposed Sampling
          <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${activeSection === 'proposed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
            {plan.proposedEntries.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSection('actual')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeSection === 'actual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Actual Sampling
          <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${activeSection === 'actual' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
            {plan.actualEntries.length}
          </span>
        </button>
      </div>

      {/* Entries table */}
      {currentEntries.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Candidate</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Knowledge Unit</th>
                  <th className="py-3 px-4 text-center font-medium text-gray-500">Mode</th>
                  <th className="py-3 px-4 text-center font-medium text-gray-500">Stage</th>
                  {activeSection === 'proposed' && plan.status === 'Active' && (
                    <th className="py-3 px-4 text-right font-medium text-gray-500">Actions</th>
                  )}
                  {activeSection === 'actual' && (
                    <th className="py-3 px-4 text-right font-medium text-gray-500">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentEntries.map(entry => {
                  const ku = knowledgeUnits.find(k => k.id === entry.knowledgeUnitId);
                  const stageIdx = stageOrder.indexOf(entry.stage);
                  const stageColor =
                    entry.stage === 'Pass' ? 'bg-green-100 text-green-700'
                      : entry.stage === 'Completion' ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600';

                  const alreadyActual = activeSection === 'proposed' && plan.actualEntries.some(
                    ae => ae.candidateId === entry.candidateId && ae.knowledgeUnitId === entry.knowledgeUnitId && ae.assessmentMode === entry.assessmentMode,
                  );

                  return (
                    <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{entry.candidateName}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{ku?.name ?? entry.knowledgeUnitId}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          entry.assessmentMode === 'Theory' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                        }`}>
                          {entry.assessmentMode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {stageOrder.map((s, i) => (
                            <div
                              key={s}
                              className={`w-2 h-2 rounded-full ${i <= stageIdx ? (entry.stage === 'Pass' ? 'bg-green-500' : 'bg-blue-500') : 'bg-gray-200'}`}
                              title={s}
                            />
                          ))}
                          <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${stageColor}`}>
                            {entry.stage}
                          </span>
                        </div>
                      </td>
                      {activeSection === 'proposed' && plan.status === 'Active' && (
                        <td className="py-3 px-4 text-right">
                          {alreadyActual ? (
                            <span className="text-xs text-green-600 font-medium">Sampled</span>
                          ) : (
                            <button
                              onClick={() => handleAddActualEntry(entry)}
                              className="text-xs font-medium text-orange-600 border border-orange-200 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Record Actual
                            </button>
                          )}
                        </td>
                      )}
                      {activeSection === 'actual' && (
                        <td className="py-3 px-4 text-right">
                          {stageIdx < stageOrder.length - 1 && (
                            <button
                              onClick={() => handleAdvanceStage(entry.id)}
                              className="text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Advance → {stageOrder[stageIdx + 1]}
                            </button>
                          )}
                          {entry.stage === 'Pass' && (
                            <span className="text-xs text-green-600 font-medium">Complete</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-500 font-medium">
            {activeSection === 'proposed' ? 'No proposed sampling entries yet.' : 'No actual sampling recorded yet.'}
          </p>
          {activeSection === 'proposed' && plan.status === 'Draft' && (
            <p className="text-xs text-gray-400 mt-2">Activate the plan to begin proposing sampling entries.</p>
          )}
        </div>
      )}
    </div>
  );
}
