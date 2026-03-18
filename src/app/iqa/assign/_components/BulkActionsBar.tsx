'use client';

import type { Tab, IqaTutor } from '../types';

interface Props {
  selectedCount: number;
  tab: Tab;
  tutors: IqaTutor[];
  bulkAssignTutor: string;
  showBulkAssign: boolean;
  onBulkAssignTutorChange: (v: string) => void;
  onShowBulkAssign: (show: boolean) => void;
  onBulkAutoAdd: () => void;
  onRequestSkip: () => void;
  onRequestUnassign: () => void;
  onBulkAssign: () => void;
  onHistoryModal: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount, tab, tutors,
  bulkAssignTutor, showBulkAssign,
  onBulkAssignTutorChange, onShowBulkAssign,
  onBulkAutoAdd, onRequestSkip, onRequestUnassign,
  onBulkAssign, onHistoryModal, onClearSelection,
}: Props) {
  const reviewerTutors = tutors.filter(t => t.role !== 'assessor');

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 mb-4 flex items-center gap-3 flex-wrap">
      <span className="text-sm font-semibold text-orange-800">{selectedCount} selected</span>
      <div className="h-4 w-px bg-orange-200" />

      {tab === 'not-queue' && (
        <>
          <button
            onClick={onBulkAutoAdd}
            className="text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-1.5 rounded-lg transition-colors"
          >
            Add to Queue
          </button>
          <button
            onClick={onRequestSkip}
            className="text-sm font-medium bg-white border border-orange-300 text-orange-700 hover:bg-orange-100 px-3.5 py-1.5 rounded-lg transition-colors"
          >
            Skip
          </button>
        </>
      )}

      {tab === 'queue' && (
        <>
          <button
            onClick={onHistoryModal}
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-white border border-orange-300 text-orange-700 hover:bg-orange-100 px-3.5 py-1.5 rounded-lg transition-colors"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            IQA History
          </button>

          {!showBulkAssign ? (
            <button
              onClick={() => onShowBulkAssign(true)}
              className="text-sm font-medium bg-white border border-orange-300 text-orange-700 hover:bg-orange-100 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Assign to Reviewer
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={bulkAssignTutor}
                onChange={e => onBulkAssignTutorChange(e.target.value)}
                className="text-sm border border-orange-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="">Select reviewer...</option>
                {reviewerTutors.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <button
                onClick={onBulkAssign}
                disabled={!bulkAssignTutor}
                className="text-sm font-medium bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => { onShowBulkAssign(false); onBulkAssignTutorChange(''); }}
                className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            onClick={onRequestUnassign}
            className="text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 px-3.5 py-1.5 rounded-lg transition-colors"
          >
            Unassign
          </button>
        </>
      )}

      <button
        onClick={onClearSelection}
        className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
      >
        Clear selection
      </button>
    </div>
  );
}
