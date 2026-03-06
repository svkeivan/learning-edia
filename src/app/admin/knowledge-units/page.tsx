'use client';

import { useState, useMemo } from 'react';
import { knowledgeUnits, relatedCourses } from '@/lib/mock-data';
import type { KnowledgeUnit, KnowledgeUnitStatus } from '@/lib/mock-data';

const statusStyles: Record<KnowledgeUnitStatus, string> = {
  Active: 'bg-emerald-500 text-white',
  Inactive: 'bg-orange-500 text-white',
};

export default function KnowledgeUnitsPage() {
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [units, setUnits] = useState<KnowledgeUnit[]>(knowledgeUnits);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return units.filter(u => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCourse && u.relatedCourse !== filterCourse) return false;
      if (filterStatus && u.status !== filterStatus) return false;
      return true;
    });
  }, [units, search, filterCourse, filterStatus]);

  const handleCreate = (unit: KnowledgeUnit) => {
    setUnits(prev => [...prev, unit]);
    setShowCreateModal(false);
  };

  const handleToggleStatus = (id: string) => {
    setUnits(prev =>
      prev.map(u =>
        u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u,
      ),
    );
    setMenuOpenId(null);
  };

  const handleDelete = (id: string) => {
    setUnits(prev => prev.filter(u => u.id !== id));
    setMenuOpenId(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Learning</p>
          <h1 className="text-xl font-bold text-gray-900">Knowledge Units</h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search knowledge units..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 w-56"
          />
        </div>

        {/* Course filter */}
        <div className="relative">
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
            <select
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
              className="text-sm bg-transparent focus:outline-none text-gray-700 pr-6 cursor-pointer"
            >
              <option value="">Course</option>
              {relatedCourses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filter */}
        <div className="relative">
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 bg-white">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-sm bg-transparent focus:outline-none text-gray-700 pr-6 cursor-pointer"
            >
              <option value="">Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="ml-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Unit
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-3 px-5 text-left font-medium text-gray-500">Name</th>
                <th className="py-3 px-5 text-left font-medium text-gray-500">Related Course</th>
                <th className="py-3 px-5 text-center font-medium text-gray-500">Activities</th>
                <th className="py-3 px-5 text-center font-medium text-gray-500">Theory Assessment</th>
                <th className="py-3 px-5 text-center font-medium text-gray-500">Practical Assessment</th>
                <th className="py-3 px-5 text-center font-medium text-gray-500">Status</th>
                <th className="py-3 px-5 text-center font-medium text-gray-500 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(unit => (
                <tr key={unit.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-5">
                    <p className="font-semibold text-gray-900">{unit.name}</p>
                  </td>
                  <td className="py-3.5 px-5 text-gray-500">{unit.relatedCourse}</td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold">
                      {unit.activities}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold">
                      {unit.theoryAssessments}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold">
                      {unit.practicalAssessments}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[unit.status]}`}>
                      {unit.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === unit.id ? null : unit.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="4" r="1.5" />
                        <circle cx="10" cy="10" r="1.5" />
                        <circle cx="10" cy="16" r="1.5" />
                      </svg>
                    </button>
                    {menuOpenId === unit.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                        <div className="absolute right-5 top-10 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40">
                          <button
                            onClick={() => handleToggleStatus(unit.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {unit.status === 'Active' ? 'Set Inactive' : 'Set Active'}
                          </button>
                          <button
                            onClick={() => handleDelete(unit.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No knowledge units match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateKnowledgeUnitModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}

function CreateKnowledgeUnitModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (unit: KnowledgeUnit) => void;
}) {
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!course) { setError('Please select a related course.'); return; }
    setError('');
    onSave({
      id: 'ku-' + Date.now(),
      name: name.trim(),
      relatedCourse: course,
      activities: 0,
      theoryAssessments: 0,
      practicalAssessments: 0,
      status: 'Active',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">New Knowledge Unit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Unit Name</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="e.g. Gas Appliance Maintenance"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Related Course</label>
            <select
              value={course}
              onChange={e => { setCourse(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="">Select a course...</option>
              {relatedCourses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">
            Create Unit
          </button>
        </div>
      </div>
    </div>
  );
}
