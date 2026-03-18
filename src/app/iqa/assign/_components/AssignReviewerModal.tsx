'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { IqaTutor } from '../types';

interface Props {
  title?: string;
  count?: number;
  tutors: IqaTutor[];
  onAssign: (tutorId: string) => void;
  onClose: () => void;
}

export function AssignReviewerModal({
  title = 'Assign Reviewer',
  count,
  tutors,
  onAssign,
  onClose,
}: Props) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reviewerTutors = useMemo(
    () => tutors.filter(t => t.role !== 'assessor'),
    [tutors],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return reviewerTutors;
    return reviewerTutors.filter(
      t => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q),
    );
  }, [reviewerTutors, search]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const selectedName = reviewerTutors.find(t => t.id === selectedId)?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {count !== undefined && count > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">
                {count} assessment{count !== 1 ? 's' : ''} will be assigned
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-3 shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>

        {/* Reviewer list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No reviewers match your search.</p>
          ) : (
            <div className="space-y-1">
              {filtered.map(t => {
                const isSelected = selectedId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-orange-50 border-2 border-orange-300'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <p className={`text-sm font-medium ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.email}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedId && onAssign(selectedId)}
            disabled={!selectedId}
            className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {selectedId && selectedName
              ? `Assign to ${selectedName}`
              : 'Select a reviewer'}
          </button>
        </div>
      </div>
    </div>
  );
}
