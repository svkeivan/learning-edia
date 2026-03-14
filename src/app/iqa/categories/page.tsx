'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getIqaCategories,
  getIqaTutors,
  updateIqaCategory,
  addIqaCategory,
  removeIqaCategory,
  type IqaCategory,
  type IqaTutor,
  type IqaRiskLevel,
} from '@/lib/iqa-data';

const RISK_LEVELS: IqaRiskLevel[] = ['Low', 'Medium', 'High'];

function EditCategoryModal({
  category,
  onClose,
  onSave,
}: {
  category: IqaCategory;
  onClose: () => void;
  onSave: (id: string, update: Partial<IqaCategory>) => void;
}) {
  const [name, setName] = useState(category.name);
  const [recheckPercent, setRecheckPercent] = useState(String(category.recheckPercent));
  const [riskLevel, setRiskLevel] = useState<IqaRiskLevel>(category.riskLevel);
  const [error, setError] = useState('');

  const handleSave = () => {
    const pct = parseInt(recheckPercent);
    if (!name.trim()) { setError('Name is required.'); return; }
    if (isNaN(pct) || pct < 0 || pct > 100) { setError('Recheck percent must be 0–100.'); return; }
    setError('');
    // Keep rechecksPerReviewer unchanged (managed via People > Reviewers > Max Queue)
    onSave(category.id, { name: name.trim(), recheckPercent: pct, riskLevel });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Category</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="e.g. Low Risk"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Recheck %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={recheckPercent}
              onChange={e => { setRecheckPercent(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <p className="text-xs text-gray-500 mt-1">Percentage of submissions by this category that must be IQA checked</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Risk Level</label>
            <select
              value={riskLevel}
              onChange={e => setRiskLevel(e.target.value as IqaRiskLevel)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              {RISK_LEVELS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function AddCategoryModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (category: IqaCategory) => void;
}) {
  const [name, setName] = useState('');
  const [recheckPercent, setRecheckPercent] = useState('15');
  const [riskLevel, setRiskLevel] = useState<IqaRiskLevel>('Medium');
  const [error, setError] = useState('');

  const handleSave = () => {
    const pct = parseInt(recheckPercent);
    if (!name.trim()) { setError('Name is required.'); return; }
    if (isNaN(pct) || pct < 0 || pct > 100) { setError('Recheck percent must be 0–100.'); return; }
    setError('');
    const id = 'cat-' + Date.now();
    // rechecksPerReviewer defaults to 10; overrideable per-reviewer in People page
    onSave({ id, name: name.trim(), recheckPercent: pct, riskLevel, rechecksPerReviewer: 10 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add Category</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="e.g. New Risk Tier"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Recheck %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={recheckPercent}
              onChange={e => { setRecheckPercent(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <p className="text-xs text-gray-500 mt-1">Percentage of submissions by this category that must be IQA checked</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Risk Level</label>
            <select
              value={riskLevel}
              onChange={e => setRiskLevel(e.target.value as IqaRiskLevel)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              {RISK_LEVELS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg">
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IqaCategoriesPage() {
  const [categories, setCategories] = useState<IqaCategory[]>([]);
  const [assessors, setAssessors] = useState<IqaTutor[]>([]);
  const [editingCategory, setEditingCategory] = useState<IqaCategory | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refresh = () => {
    setCategories(getIqaCategories());
    setAssessors(getIqaTutors());
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('iqa-categories-updated', handler);
    window.addEventListener('iqa-tutors-updated', handler);
    return () => {
      window.removeEventListener('iqa-categories-updated', handler);
      window.removeEventListener('iqa-tutors-updated', handler);
    };
  }, []);

  const handleSaveCategory = (id: string, update: Partial<IqaCategory>) => {
    updateIqaCategory(id, update);
    refresh();
  };

  const handleAddCategory = (category: IqaCategory) => {
    addIqaCategory(category);
    refresh();
  };

  const handleDeleteCategory = (id: string) => {
    removeIqaCategory(id);
    setConfirmDeleteId(null);
    refresh();
  };

  const assessorsByCategory = (catId: string) => assessors.filter(t => t.categoryId === catId);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/iqa" className="text-sm text-gray-500 hover:text-gray-700">IQA</Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-sm text-gray-900 font-medium">Categories</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">IQA</p>
          <h1 className="text-2xl font-bold text-gray-900">Assessor Categories</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage risk categories and recheck percentages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/iqa/people"
            className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Manage People
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Category
          </button>
        </div>
      </div>

      {/* Categories table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Category</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Recheck %</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Risk Level</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Assessors</th>
              <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <p className="text-gray-500 font-medium mb-1">No categories yet</p>
                  <p className="text-sm text-gray-400">Add a category to start managing IQA risk tiers.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add your first category
                  </button>
                </td>
              </tr>
            )}
            {categories.map(cat => (
              <tr key={cat.id} className="border-b border-gray-100 last:border-0">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">{cat.name}</p>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{cat.recheckPercent}%</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    cat.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                    cat.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {cat.riskLevel}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{assessorsByCategory(cat.id).length}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => setEditingCategory(cat)}
                      className="text-sm font-medium text-orange-600 hover:text-orange-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(cat.id)}
                      className="text-sm font-medium text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* People summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <svg className="text-blue-500 shrink-0 mt-0.5" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">
              {assessors.length} assessor{assessors.length !== 1 ? 's' : ''} assigned across {categories.length} categories
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              {categories.map(c => `${c.name}: ${assessorsByCategory(c.id).length}`).join(' · ')}
            </p>
          </div>
        </div>
        <Link
          href="/iqa/people"
          className="text-sm font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap"
        >
          Manage People →
        </Link>
      </div>

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={handleSaveCategory}
        />
      )}

      {showAddModal && (
        <AddCategoryModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCategory}
        />
      )}

      {confirmDeleteId && (() => {
        const cat = categories.find(c => c.id === confirmDeleteId);
        const memberCount = assessorsByCategory(confirmDeleteId).length;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg className="text-red-600" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Delete &ldquo;{cat?.name}&rdquo;?</h3>
                  <p className="text-sm text-gray-500">This cannot be undone.</p>
                </div>
              </div>
              {memberCount > 0 && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                  {memberCount} assessor{memberCount !== 1 ? 's are' : ' is'} assigned to this category. They will no longer have a category.
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCategory(confirmDeleteId)}
                  className="flex-1 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
