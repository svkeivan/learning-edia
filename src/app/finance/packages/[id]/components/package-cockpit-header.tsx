'use client';

import Link from 'next/link';
import { FinancePackage, PackageStatus } from '@/lib/finance-data';
import { statusDot, statusText } from './constants';
import { EditableField } from './editable-field';
import { fmtPrice } from './utils';

type PackageCockpitHeaderProps = {
  pkg: FinancePackage;
  packageStatus: PackageStatus;
  setPackageStatus: (s: PackageStatus) => void;
  statusDropdownOpen: boolean;
  setStatusDropdownOpen: (open: boolean | ((v: boolean) => boolean)) => void;
  allPriced: boolean;
  isSaving: boolean;
  onSave: () => void;
  computedTotalPrice: number;
  onConfirmTotalPrice: (newTotal: number) => void;
  totalRefund: number;
  totalActivities: number;
  pricedStages: number;
  stagesLength: number;
  pricingPct: number;
};

export function PackageCockpitHeader({
  pkg,
  packageStatus,
  setPackageStatus,
  statusDropdownOpen,
  setStatusDropdownOpen,
  allPriced,
  isSaving,
  onSave,
  computedTotalPrice,
  onConfirmTotalPrice,
  totalRefund,
  totalActivities,
  pricedStages,
  stagesLength,
  pricingPct,
}: PackageCockpitHeaderProps) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3 px-6 py-3">
        <Link
          href="/finance/packages"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Packages
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-sm font-semibold text-gray-900 flex-1 truncate">{pkg.name}</h1>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-gray-500 bg-gray-100">
            {pkg.trade}
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusDropdownOpen(v => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 ${statusText[packageStatus]} hover:border-gray-300`}
            >
              <span className={`w-2 h-2 rounded-full ${statusDot[packageStatus]}`} />
              {packageStatus}
              <svg
                width="10"
                height="10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className={`transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {statusDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStatusDropdownOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[180px] rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl">
                  {(['Pending', 'Ready to Sell'] as PackageStatus[]).map(s => {
                    const disabled = s === 'Ready to Sell' && !allPriced;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (!disabled) {
                            setPackageStatus(s);
                            setStatusDropdownOpen(false);
                          }
                        }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-sm ${
                          disabled
                            ? 'opacity-40 cursor-not-allowed'
                            : `hover:bg-gray-50 ${packageStatus === s ? 'bg-gray-50 font-semibold text-gray-900' : 'text-gray-700'}`
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${statusDot[s]}`} />
                        <span className="flex-1">{s}</span>
                        {disabled && (
                          <svg
                            width="12"
                            height="12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="text-gray-400 shrink-0"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                  {!allPriced && (
                    <div className="px-3.5 pt-1.5 pb-1 border-t border-gray-100 mt-1">
                      <p className="text-[10px] text-amber-600">Price all courses to enable</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-orange-500 text-white shadow-sm hover:bg-orange-600 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-stretch border-t border-gray-100 divide-x divide-gray-100">
        <div className="flex-1 px-4 py-2.5 min-w-0">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Package Price</p>
          <div className="mt-0.5">
            <EditableField
              value={computedTotalPrice}
              prefix="£"
              min={0}
              max={999999}
              step={100}
              onConfirm={onConfirmTotalPrice}
              size="md"
            />
          </div>
        </div>

        {[
          { label: 'Total Refund', value: fmtPrice(totalRefund) },
          { label: 'Courses', value: String(pkg.courseCount) },
          { label: 'Modules', value: String(pkg.moduleCount) },
          { label: 'Activities', value: String(totalActivities) },
        ].map(({ label, value }) => (
          <div key={label} className="flex-1 px-4 py-2.5 min-w-0">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide truncate">{label}</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-bold text-gray-900 tabular-nums">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {!allPriced && (
        <div className="px-6 py-2 bg-amber-50/80 border-t border-amber-200/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className="text-amber-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <span className="text-xs font-semibold text-amber-700">
                {pricedStages} of {stagesLength} courses priced
              </span>
            </div>
            <div className="flex-1 h-2 rounded-full bg-amber-200/60 overflow-hidden">
              <div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${pricingPct}%` }} />
            </div>
            <span className="text-xs font-bold text-amber-700 tabular-nums shrink-0">{pricingPct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
