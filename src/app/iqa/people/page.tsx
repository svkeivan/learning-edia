'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getIqaCategories,
  getIqaTutors,
  updateIqaTutor,
  addIqaTutor,
  type IqaTutor,
  type IqaTutorRole,
} from '@/lib/iqa-data';

export default function IqaPeoplePage() {
  const [people, setPeople] = useState<IqaTutor[]>([]);
  const [categories, setCategories] = useState(() => getIqaCategories());
  const [showAddModal, setShowAddModal] = useState(false);

  const refresh = () => {
    const tutors = getIqaTutors();
    setPeople(tutors);
    setCategories(getIqaCategories());
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('iqa-tutors-updated', handler);
    window.addEventListener('iqa-categories-updated', handler);
    return () => {
      window.removeEventListener('iqa-tutors-updated', handler);
      window.removeEventListener('iqa-categories-updated', handler);
    };
  }, []);

  const handleCategoryChange = (personId: string, categoryId: string) => {
    updateIqaTutor(personId, { categoryId });
    refresh();
  };

  const handleAddPerson = (person: Omit<IqaTutor, 'id'>) => {
    addIqaTutor(person);
    setShowAddModal(false);
    refresh();
  };

  const assessors = people.filter(p => p.role === 'assessor' || p.role === 'both');

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
            Manage assessors and their categories.
          </p>
        </div>
        <Link href="/iqa/categories"
          className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50">
          Categories
        </Link>
      </div>

      {/* Assessors table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Name</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Email</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Category</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Recheck %</th>
            </tr>
          </thead>
          <tbody>
            {assessors.map(person => {
              const category = categories.find(c => c.id === person.categoryId);
              return (
                <tr key={person.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{person.name}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{person.email}</td>
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
                </tr>
              );
            })}
            {assessors.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">No assessors added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddPersonModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddPerson}
        />
      )}
    </div>
  );
}

function AddPersonModal({
  categories,
  onClose,
  onSave,
}: {
  categories: ReturnType<typeof getIqaCategories>;
  onClose: () => void;
  onSave: (person: Omit<IqaTutor, 'id'>) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [role, setRole] = useState<IqaTutorRole>('assessor');
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
