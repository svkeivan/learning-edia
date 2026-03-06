'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { knowledgeUnits, qualifications as initialQualifications } from '@/lib/mock-data';
import type { Qualification, KnowledgeUnit } from '@/lib/mock-data';

const statusStyles = {
  Active: 'bg-emerald-500 text-white',
  Draft: 'bg-gray-400 text-white',
};

export default function QualificationsPage() {
  const [quals, setQuals] = useState<Qualification[]>(initialQualifications);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQual, setEditingQual] = useState<Qualification | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return quals.filter(q => {
      if (search && !q.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && q.status !== filterStatus) return false;
      return true;
    });
  }, [quals, search, filterStatus]);

  const getKnowledgeUnitsForQual = (q: Qualification): KnowledgeUnit[] => {
    return q.knowledgeUnitIds
      .map(id => knowledgeUnits.find(ku => ku.id === id))
      .filter((ku): ku is KnowledgeUnit => !!ku);
  };

  const handleCreate = (qual: Qualification) => {
    setQuals(prev => [...prev, qual]);
    setShowCreateModal(false);
  };

  const handleUpdate = (qual: Qualification) => {
    setQuals(prev => prev.map(q => (q.id === qual.id ? qual : q)));
    setEditingQual(null);
  };

  const handleDelete = (id: string) => {
    setQuals(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Learning</p>
          <h1 className="text-xl font-bold text-gray-900">Qualifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage qualifications, each linking to multiple knowledge units.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Qualification
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
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
            placeholder="Search qualifications..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 w-56"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
        </select>

        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} qualification{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Qualification Cards */}
      <div className="space-y-4">
        {filtered.map(qual => {
          const kus = getKnowledgeUnitsForQual(qual);
          const isExpanded = expandedId === qual.id;

          return (
            <div key={qual.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Card header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-bold text-gray-900">{qual.name}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[qual.status]}`}>
                        {qual.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{qual.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{kus.length} knowledge unit{kus.length !== 1 ? 's' : ''}</span>
                      <span>Created {qual.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : qual.id)}
                      className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {isExpanded ? 'Collapse' : 'View Units'}
                    </button>
                    <button
                      onClick={() => setEditingQual(qual)}
                      className="text-xs font-medium text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(qual.id)}
                      className="text-xs font-medium text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded knowledge units */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  {kus.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="py-2.5 px-5 text-left font-medium text-gray-500 text-xs">Knowledge Unit</th>
                          <th className="py-2.5 px-5 text-left font-medium text-gray-500 text-xs">Related Course</th>
                          <th className="py-2.5 px-5 text-center font-medium text-gray-500 text-xs">Activities</th>
                          <th className="py-2.5 px-5 text-center font-medium text-gray-500 text-xs">Theory</th>
                          <th className="py-2.5 px-5 text-center font-medium text-gray-500 text-xs">Practical</th>
                          <th className="py-2.5 px-5 text-center font-medium text-gray-500 text-xs">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kus.map(ku => (
                          <tr key={ku.id} className="border-b border-gray-50 last:border-0">
                            <td className="py-2.5 px-5 font-medium text-gray-900">{ku.name}</td>
                            <td className="py-2.5 px-5 text-gray-500">{ku.relatedCourse}</td>
                            <td className="py-2.5 px-5 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
                                {ku.activities}
                              </span>
                            </td>
                            <td className="py-2.5 px-5 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
                                {ku.theoryAssessments}
                              </span>
                            </td>
                            <td className="py-2.5 px-5 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
                                {ku.practicalAssessments}
                              </span>
                            </td>
                            <td className="py-2.5 px-5 text-center">
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ku.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                                {ku.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-8 text-center text-gray-400 text-sm">
                      No knowledge units linked to this qualification.
                    </div>
                  )}
                  <div className="px-5 py-3 border-t border-gray-100">
                    <Link
                      href="/admin/knowledge-units"
                      className="text-xs font-medium text-orange-600 hover:text-orange-700"
                    >
                      Manage Knowledge Units →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <svg className="mx-auto mb-3 text-gray-300" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-1.342" />
            </svg>
            <p className="text-gray-500 font-medium">No qualifications found.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Create your first qualification
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(showCreateModal || editingQual) && (
        <QualificationModal
          qualification={editingQual}
          onClose={() => { setShowCreateModal(false); setEditingQual(null); }}
          onSave={editingQual ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}

function QualificationModal({
  qualification,
  onClose,
  onSave,
}: {
  qualification: Qualification | null;
  onClose: () => void;
  onSave: (qual: Qualification) => void;
}) {
  const isEdit = !!qualification;
  const [name, setName] = useState(qualification?.name ?? '');
  const [description, setDescription] = useState(qualification?.description ?? '');
  const [selectedKUs, setSelectedKUs] = useState<Set<string>>(
    new Set(qualification?.knowledgeUnitIds ?? []),
  );
  const [status, setStatus] = useState<'Active' | 'Draft'>(qualification?.status ?? 'Draft');
  const [error, setError] = useState('');

  const toggleKU = (id: string) => {
    setSelectedKUs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!description.trim()) { setError('Description is required.'); return; }
    if (selectedKUs.size === 0) { setError('Select at least one knowledge unit.'); return; }
    setError('');
    onSave({
      id: qualification?.id ?? 'q-' + Date.now(),
      name: name.trim(),
      description: description.trim(),
      knowledgeUnitIds: Array.from(selectedKUs),
      status,
      createdAt: qualification?.createdAt ?? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Edit Qualification' : 'New Qualification'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="e.g. Level 3 Gas Engineering"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => { setDescription(e.target.value); setError(''); }}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              placeholder="Brief description of this qualification..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'Active' | 'Draft')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Knowledge Units
              <span className="text-gray-400 font-normal ml-1">({selectedKUs.size} selected)</span>
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {knowledgeUnits.map(ku => (
                <label
                  key={ku.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                    selectedKUs.has(ku.id) ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedKUs.has(ku.id)}
                    onChange={() => toggleKU(ku.id)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{ku.name}</p>
                    <p className="text-xs text-gray-400">{ku.relatedCourse}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    ku.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {ku.status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg">
            {isEdit ? 'Save Changes' : 'Create Qualification'}
          </button>
        </div>
      </div>
    </div>
  );
}
