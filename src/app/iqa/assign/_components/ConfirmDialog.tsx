'use client';

interface Props {
  action: 'skip' | 'unassign';
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ action, selectedCount, onConfirm, onCancel }: Props) {
  const isSkip = action === 'skip';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSkip ? 'bg-amber-100' : 'bg-red-100'}`}>
            <svg className={isSkip ? 'text-amber-600' : 'text-red-600'} width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              {isSkip
                ? `Skip ${selectedCount} assessment${selectedCount !== 1 ? 's' : ''}?`
                : `Unassign ${selectedCount} item${selectedCount !== 1 ? 's' : ''}?`}
            </h3>
            <p className="text-sm text-gray-500">
              {isSkip
                ? 'They will be removed from the eligible pool. You can restore them from the All tab.'
                : 'Reviewers will be removed from these checks.'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 text-sm font-semibold text-white rounded-lg ${isSkip ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isSkip ? 'Skip' : 'Unassign'}
          </button>
        </div>
      </div>
    </div>
  );
}
