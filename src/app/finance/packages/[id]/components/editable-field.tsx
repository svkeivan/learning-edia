'use client';

import { useState, useRef } from 'react';
import { IcCheck, IcX } from './icons';

type EditState = 'idle' | 'editing';

export function EditableField({
  value,
  prefix = '',
  suffix = '',
  min = 0,
  max = 99999,
  step = 1,
  onConfirm,
  size = 'md',
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  onConfirm: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [state, setState] = useState<EditState>('idle');
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(String(value));
    setState('editing');
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    const n = parseFloat(draft);
    if (isNaN(n) || n < min || n > max) {
      setDraft(String(value));
      setState('idle');
      return;
    }
    if (n !== value) {
      onConfirm(n);
    }
    setState('idle');
  };
  const cancel = () => {
    setDraft(String(value));
    setState('idle');
  };

  const pillBase =
    size === 'sm'
      ? 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold tabular-nums border transition-all cursor-pointer'
      : size === 'lg'
        ? 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold tabular-nums border-2 transition-all cursor-pointer'
        : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold tabular-nums border transition-all cursor-pointer';

  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={startEdit}
        className={`${pillBase} bg-white border-gray-200 text-gray-800 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 group`}
      >
        {prefix && <span className="font-normal text-gray-400">{prefix}</span>}
        <span>
          {value}
          {suffix}
        </span>
        <svg
          width={size === 'sm' ? 11 : size === 'lg' ? 16 : 13}
          height={size === 'sm' ? 11 : size === 'lg' ? 16 : 13}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          className="text-gray-300 group-hover:text-orange-500 transition-colors shrink-0"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
          />
        </svg>
      </button>
    );
  }

  if (state === 'editing') {
    return (
      <span className="inline-flex items-center gap-1.5">
        {prefix && <span className="text-xs text-gray-400">{prefix}</span>}
        <input
          ref={inputRef}
          type="number"
          value={draft}
          min={min}
          max={max}
          step={step}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') cancel();
          }}
          autoFocus
          className={`border-2 border-orange-400 rounded-lg px-2 py-1 font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-900 bg-white ${
            size === 'lg' ? 'w-20 text-base' : 'w-16 text-sm'
          }`}
        />
        {suffix && <span className="text-xs font-medium text-gray-500">{suffix}</span>}
        <button
          type="button"
          onClick={commitEdit}
          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <IcCheck /> Apply
        </button>
        <button
          type="button"
          onClick={cancel}
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-xs font-semibold px-2 py-1.5 rounded-lg transition-colors"
        >
          <IcX />
        </button>
      </span>
    );
  }

  return null;
}
