'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getIqaCategories,
  getIqaTutors,
  updateIqaTutor,
  addIqaTutor,
  getFeedbackForAssessor,
  markFeedbackRead,
  type IqaTutor,
  type IqaTutorRole,
  type IqaFeedbackRecord,
} from '@/lib/iqa-data';

type TabType = 'assessors' | 'reviewers';

const roleBadge: Record<IqaTutorRole, string> = {
  assessor: 'bg-blue-100 text-blue-700',
  reviewer: 'bg-purple-100 text-purple-700',
  both: 'bg-orange-100 text-orange-700',
};
const roleLabel: Record<IqaTutorRole, string> = {
  assessor: 'Assessor',
  reviewer: 'Reviewer',
  both: 'Both',
};

const outcomeLabels: Record<string, string> = {
  'recheck-assessor': 'Recheck required',
  'return-module': 'Student returns to module',
};

export default function IqaPeoplePage() {
  const [people, setPeople] = useState<IqaTutor[]>([]);
  const [categories, setCategories] = useState(() => getIqaCategories());
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('assessors');
  const [maxQueueDraft, setMaxQueueDraft] = useState<Record<string, string>>({});
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, IqaFeedbackRecord[]>>({});

  const refresh = () => {
    const tutors = getIqaTutors();
    setPeople(tutors);
    setCategories(getIqaCategories());
    const draft: Record<string, string> = {};
    tutors.forEach(t => { draft[t.id] = String(t.maxQueue ?? ''); });
    setMaxQueueDraft(draft);

    const map: Record<string, IqaFeedbackRecord[]> = {};
    tutors.filter(t => t.role !== 'reviewer').forEach(t => {
      map[t.id] = getFeedbackForAssessor(t.id);
    });
    setFeedbackMap(map);
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('iqa-tutors-updated', handler);
    window.addEventListener('iqa-categories-updated', handler);
    window.addEventListener('iqa-feedback-updated', handler);
    return () => {
      window.removeEventListener('iqa-tutors-updated', handler);
      window.removeEventListener('iqa-categories-updated', handler);
      window.removeEventListener('iqa-feedback-updated', handler);
    };
  }, []);

  const handleCategoryChange = (personId: string, categoryId: string) => {
    updateIqaTutor(personId, { categoryId });
    refresh();
  };

  const handleMaxQueueBlur = (personId: string) => {
    const raw = maxQueueDraft[personId];
    if (raw === '' || raw === undefined) {
      updateIqaTutor(personId, { maxQueue: undefined });
    } else {
      const val = parseInt(raw);
      if (!isNaN(val) && val >= 1) updateIqaTutor(personId, { maxQueue: val });
    }
    refresh();
  };

  const handleAddPerson = (person: Omit<IqaTutor, 'id'>) => {
    addIqaTutor(person);
    setShowAddModal(false);
    refresh();
  };

  const handleToggleFeedback = (personId: string) => {
    if (expandedFeedback === personId) {
      setExpandedFeedback(null);
      return;
    }
    // Mark all as read when expanding
    (feedbackMap[personId] ?? []).filter(f => !f.read).forEach(f => markFeedbackRead(f.id));
    setExpandedFeedback(personId);
    refresh();
  };

  // Filter by role
  const assessors = people.filter(p => p.role === 'assessor' || p.role === 'both');
  const reviewers = people.filter(p => p.role === 'reviewer' || p.role === 'both');

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/iqa" className="text-sm text-gray-500 hover:text-gray-700">IQA</Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-sm text-gray-900 font-medium">People</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">IQA</p>
          <h1 className="text-2xl font-bold text-gray-900">People & Roles</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage assessors (who grade work) and reviewers (who IQA-check grading).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/iqa/categories"
            className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50">
            Categories
          </Link>
          <button onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add {activeTab === 'assessors' ? 'Assessor' : 'Reviewer'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {([
          { key: 'assessors' as TabType, label: 'Assessors', count: assessors.length },
          { key: 'reviewers' as TabType, label: 'Reviewers', count: reviewers.length },
        ]).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
            <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              activeTab === t.key ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-500'
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ── Assessors tab ── */}
      {activeTab === 'assessors' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Name</th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Email</th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Role</th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Category</th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Recheck %</th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">IQA Feedback</th>
              </tr>
            </thead>
            <tbody>
              {assessors.map(person => {
                const category = categories.find(c => c.id === person.categoryId);
                const feedbacks = feedbackMap[person.id] ?? [];
                const unread = feedbacks.filter(f => !f.read).length;
                const isExpanded = expandedFeedback === person.id;

                return (
                  <>
                    <tr key={person.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{person.name}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{person.email}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge[person.role]}`}>
                          {roleLabel[person.role]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select value={person.categoryId} onChange={e => handleCategoryChange(person.id, e.target.value)}
                          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300">
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        {category ? (
                          <span className="text-sm font-semibold text-orange-600">{category.recheckPercent}%</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {feedbacks.length === 0 ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : (
                          <button onClick={() => handleToggleFeedback(person.id)}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                              unread > 0 ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}>
                            {unread > 0 ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {unread} unread
                              </>
                            ) : (
                              `${feedbacks.length} read`
                            )}
                            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && feedbacks.length > 0 && (
                      <tr key={`${person.id}-feedback`} className="bg-amber-50/40">
                        <td colSpan={6} className="px-5 py-3">
                          <div className="space-y-2">
                            {feedbacks.map(fb => (
                              <div key={fb.id} className={`rounded-lg px-4 py-3 border text-sm ${
                                fb.read ? 'bg-white border-gray-100' : 'bg-amber-50 border-amber-200'
                              }`}>
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {fb.studentName} — <span className="font-normal text-gray-600">{fb.assessmentTitle}</span>
                                    </p>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                                      fb.outcomeType === 'recheck-assessor' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {outcomeLabels[fb.outcomeType] ?? fb.outcomeType}
                                    </span>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-xs text-gray-400">by {fb.reviewerName}</p>
                                    <p className="text-xs text-gray-400">{fb.reviewedAt}</p>
                                  </div>
                                </div>
                                {fb.feedback && (
                                  <p className="mt-2 text-sm text-gray-700 bg-white rounded border border-gray-100 px-3 py-2 leading-relaxed">
                                    {fb.feedback}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {assessors.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">No assessors added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Reviewers tab ── */}
      {activeTab === 'reviewers' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Name</th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Email</th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Role</th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Category</th>
                <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Max Queue</th>
              </tr>
            </thead>
            <tbody>
              {reviewers.map(person => {
                const category = categories.find(c => c.id === person.categoryId);
                const placeholder = String(category?.rechecksPerReviewer ?? 10);
                return (
                  <tr key={person.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="px-5 py-4"><p className="font-medium text-gray-900">{person.name}</p></td>
                    <td className="px-5 py-4 text-sm text-gray-600">{person.email}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge[person.role]}`}>
                        {roleLabel[person.role]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{category?.name ?? '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <input type="number" min={1}
                          value={maxQueueDraft[person.id] ?? ''}
                          placeholder={placeholder}
                          onChange={e => setMaxQueueDraft(prev => ({ ...prev, [person.id]: e.target.value }))}
                          onBlur={() => handleMaxQueueBlur(person.id)}
                          className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300" />
                        {!maxQueueDraft[person.id] && (
                          <span className="text-xs text-gray-400">default: {placeholder}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {reviewers.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">No reviewers added yet.</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-100 bg-blue-50">
            <p className="text-xs text-blue-700">
              <strong>Max Queue</strong> sets the maximum number of pending rechecks a reviewer can hold at once. Leave blank to use the category default.
            </p>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddPersonModal
          categories={categories}
          defaultRole={activeTab === 'assessors' ? 'assessor' : 'reviewer'}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddPerson}
        />
      )}
    </div>
  );
}

function AddPersonModal({
  categories,
  defaultRole,
  onClose,
  onSave,
}: {
  categories: ReturnType<typeof getIqaCategories>;
  defaultRole: IqaTutorRole;
  onClose: () => void;
  onSave: (person: Omit<IqaTutor, 'id'>) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [role, setRole] = useState<IqaTutorRole>(defaultRole);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!categoryId) { setError('Category is required.'); return; }
    setError('');
    onSave({ name: name.trim(), email: email.trim(), categoryId, role });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add Person</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name</label>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="e.g. Jane Smith" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="e.g. j.smith@lms.co.uk" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role</label>
            <select value={role} onChange={e => setRole(e.target.value as IqaTutorRole)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="assessor">Assessor only — grades student work</option>
              <option value="reviewer">Reviewer only — IQA checks grading</option>
              <option value="both">Both — grades work and reviews others</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.recheckPercent}% recheck)</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg">Add Person</button>
        </div>
      </div>
    </div>
  );
}
