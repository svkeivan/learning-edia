'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  getSamplingPlans,
  getCohorts,
  assessors,
  iqaPersonnel,
  centers,
  computeSamplingCoverage,
  getPersonnelByRole,
  addSamplingPlan,
} from '@/lib/iqa-sampling';
import { qualifications, knowledgeUnits } from '@/lib/mock-data';
import type { SamplingPlan, SamplingPlanStatus } from '@/lib/iqa-sampling';

const statusStyles: Record<SamplingPlanStatus, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Active: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
};

export default function SamplingPlansPage() {
  const [plans, setPlans] = useState<SamplingPlan[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filterQual, setFilterQual] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssessor, setFilterAssessor] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState('');

  const refresh = useCallback(() => {
    setPlans(getSamplingPlans());
  }, []);

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

  const cohorts = useMemo(() => getCohorts(), [plans]);

  const filtered = useMemo(() => {
    return plans.filter(p => {
      if (filterQual && p.qualificationId !== filterQual) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterAssessor && p.assessorId !== filterAssessor) return false;
      return true;
    });
  }, [plans, filterQual, filterStatus, filterAssessor]);

  const hasFilters = filterQual || filterStatus || filterAssessor;

  if (!mounted) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-40 w-full bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <div className="mb-5">
        <Link href="/iqa" className="text-sm text-gray-500 hover:text-gray-700">IQA</Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-sm text-gray-900 font-medium">Sampling Plans</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">IQA</p>
          <h1 className="text-2xl font-bold text-gray-900">Sampling Plans</h1>
          <p className="text-gray-500 text-sm mt-1">
            Proposed and actual IQA sampling — per assessor, per qualification. Controllers set the plan, assessors execute.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Plan
        </button>
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Plans', value: plans.length, color: 'text-gray-900' },
          { label: 'Active', value: plans.filter(p => p.status === 'Active').length, color: 'text-blue-700' },
          { label: 'Draft', value: plans.filter(p => p.status === 'Draft').length, color: 'text-gray-500' },
          { label: 'Completed', value: plans.filter(p => p.status === 'Completed').length, color: 'text-green-700' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
          </svg>

          <select value={filterQual} onChange={e => setFilterQual(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300">
            <option value="">All Qualifications</option>
            {qualifications.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
          </select>

          <select value={filterAssessor} onChange={e => setFilterAssessor(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300">
            <option value="">All Assessors</option>
            {assessors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300">
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>

          {hasFilters && (
            <button onClick={() => { setFilterQual(''); setFilterStatus(''); setFilterAssessor(''); }}
              className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2">
              Clear
            </button>
          )}

          <span className="text-xs text-gray-400 ml-auto">{filtered.length} plan{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Plans table */}
      {filtered.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Qualification</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Assessor</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">IQA Assessor</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Cohort</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">Controller</th>
                  <th className="py-3 px-4 text-center font-medium text-gray-500">Proposed</th>
                  <th className="py-3 px-4 text-center font-medium text-gray-500">Actual</th>
                  <th className="py-3 px-4 text-center font-medium text-gray-500">Coverage</th>
                  <th className="py-3 px-4 text-center font-medium text-gray-500">Status</th>
                  <th className="py-3 px-4 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(plan => {
                  const qual = qualifications.find(q => q.id === plan.qualificationId);
                  const assessor = assessors.find(a => a.id === plan.assessorId);
                  const iqaAssessor = iqaPersonnel.find(p => p.id === plan.iqaAssessorId);
                  const controller = iqaPersonnel.find(p => p.id === plan.controllerId);
                  const cohort = cohorts.find(c => c.id === plan.cohortId);
                  const coverage = computeSamplingCoverage(plan);

                  const coverageColor =
                    coverage.percent >= 100 ? 'text-green-700 bg-green-50'
                      : coverage.percent >= 50 ? 'text-amber-700 bg-amber-50'
                        : 'text-red-700 bg-red-50';

                  return (
                    <tr key={plan.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{qual?.name ?? '—'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-gray-800">{assessor?.name ?? '—'}</p>
                          <p className="text-xs text-gray-400">
                            {assessor?.experience === 'New' && (
                              <span className="text-amber-600 font-medium">New assessor</span>
                            )}
                            {assessor?.experience === 'Experienced' && 'Experienced'}
                            {' · '}
                            {centers.find(c => c.id === assessor?.centerId)?.name}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-gray-800">{iqaAssessor?.name ?? '—'}</p>
                          <p className="text-xs text-gray-400">{centers.find(c => c.id === iqaAssessor?.centerId)?.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-xs">{cohort?.name ?? '—'}</td>
                      <td className="py-3 px-4 text-gray-700 text-xs">{controller?.name ?? '—'}</td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-900">{coverage.proposed}</td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-900">
                        {coverage.actual}
                        {coverage.exceeded && (
                          <span className="ml-1 text-[10px] text-green-600 font-medium">+</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${coverageColor}`}>
                          {coverage.percent}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[plan.status]}`}>
                          {plan.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/iqa/sampling/${plan.id}`}
                          className="text-xs font-medium text-orange-600 hover:text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          View
                        </Link>
                      </td>
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
            {hasFilters ? 'No plans match your filters.' : 'No sampling plans yet.'}
          </p>
        </div>
      )}

      {showCreate && (
        <CreatePlanModal
          onClose={() => setShowCreate(false)}
          onSave={plan => {
            addSamplingPlan(plan);
            setToast('Sampling plan created');
            setShowCreate(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function CreatePlanModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (plan: Omit<SamplingPlan, 'id'>) => void;
}) {
  const [qualId, setQualId] = useState('');
  const [assessorId, setAssessorId] = useState('');
  const [iqaAssessorId, setIqaAssessorId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const controllers = getPersonnelByRole('Controller');
  const iqaAssessors = getPersonnelByRole('Assessor');
  const selectedAssessor = assessors.find(a => a.id === assessorId);

  const handleSave = () => {
    if (!qualId) { setError('Select a qualification.'); return; }
    if (!assessorId) { setError('Select an assessor.'); return; }
    if (!iqaAssessorId) { setError('Select an IQA assessor.'); return; }

    const assessor = assessors.find(a => a.id === assessorId);
    const iqaPerson = iqaPersonnel.find(p => p.id === iqaAssessorId);
    if (assessor && iqaPerson && assessor.centerId === iqaPerson.centerId) {
      setError('IQA assessor must be from a different center than the assessor (independence requirement).');
      return;
    }

    setError('');
    onSave({
      qualificationId: qualId,
      assessorId,
      iqaAssessorId,
      controllerId: controllers[0]?.id ?? '',
      status: 'Draft',
      createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      proposedEntries: [],
      actualEntries: [],
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">New Sampling Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Qualification</label>
            <select value={qualId} onChange={e => { setQualId(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="">Select...</option>
              {qualifications.filter(q => q.status === 'Active').map(q => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Assessor</label>
            <select value={assessorId} onChange={e => { setAssessorId(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="">Select...</option>
              {assessors.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.experience} · {centers.find(c => c.id === a.centerId)?.name})
                </option>
              ))}
            </select>
            {selectedAssessor?.experience === 'New' && (
              <p className="text-xs text-amber-600 mt-1">New assessor — full coverage will be required.</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">IQA Assessor</label>
            <select value={iqaAssessorId} onChange={e => { setIqaAssessorId(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="">Select...</option>
              {iqaAssessors.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({centers.find(c => c.id === p.centerId)?.name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              placeholder="Optional notes..." />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg">Create Plan</button>
        </div>
      </div>
    </div>
  );
}
