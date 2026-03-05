'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getIqaCategories,
  getIqaTutors,
  updateIqaTutor,
  addIqaTutor,
  type IqaTutor,
} from '@/lib/iqa-data';

export default function IqaPeoplePage() {
  const [tutors, setTutors] = useState<IqaTutor[]>([]);
  const [categories, setCategories] = useState(() => getIqaCategories());
  const [showAddModal, setShowAddModal] = useState(false);

  const refresh = () => {
    setTutors(getIqaTutors());
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

  const handleCategoryChange = (tutorId: string, categoryId: string) => {
    updateIqaTutor(tutorId, { categoryId });
    refresh();
  };

  const handleAddPerson = (tutor: Omit<IqaTutor, 'id'>) => {
    addIqaTutor(tutor);
    setShowAddModal(false);
    refresh();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/iqa" className="text-sm text-gray-500 hover:text-gray-700">IQA</Link>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-sm text-gray-900 font-medium">People</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">IQA</p>
          <h1 className="text-2xl font-bold text-gray-900">Manage People</h1>
          <p className="text-gray-500 text-sm mt-1">
            Assign tutors and reviewers to risk categories. Each category defines the recheck percentage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/iqa/categories"
            className="text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50"
          >
            Manage Categories
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Person
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Name</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Email</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Category</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Recheck %</th>
              <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wide px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tutors.map(tutor => {
              const category = categories.find(c => c.id === tutor.categoryId);
              return (
                <tr key={tutor.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{tutor.name}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{tutor.email}</td>
                  <td className="px-5 py-4">
                    <select
                      value={tutor.categoryId}
                      onChange={e => handleCategoryChange(tutor.id, e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {category ? `${category.recheckPercent}%` : '-'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href="/iqa/categories"
                      className="text-sm font-medium text-orange-600 hover:text-orange-700"
                    >
                      Edit category
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {tutors.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center mt-4">
          <p className="text-gray-500 mb-4">No people yet.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            Add your first person
          </button>
        </div>
      )}

      {showAddModal && (
        <AddPersonModalWrapper
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddPerson}
        />
      )}
    </div>
  );
}

function AddPersonModalWrapper({
  categories,
  onClose,
  onSave,
}: {
  categories: ReturnType<typeof getIqaCategories>;
  onClose: () => void;
  onSave: (tutor: Omit<IqaTutor, 'id'>) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!categoryId) {
      setError('Category is required.');
      return;
    }
    setError('');
    onSave({ name: name.trim(), email: email.trim(), categoryId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add Person</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="e.g. Jane Smith"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="e.g. j.smith@lms.co.uk"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.recheckPercent}% recheck)</option>
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
            Add Person
          </button>
        </div>
      </div>
    </div>
  );
}
