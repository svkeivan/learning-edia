import { FinanceStage } from '@/lib/finance-data';
import { STAGE_BAR_COLORS } from './constants';

export function RevenueTimeline({ stages }: { stages: FinanceStage[] }) {
  const total = stages.reduce((s, st) => s + st.revenueRecognition, 0);
  const isBalanced = total === 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Revenue Recognition Flow</h3>
        <span
          className={`text-xs font-semibold tabular-nums ${isBalanced ? 'text-emerald-600' : total > 100 ? 'text-red-500' : 'text-amber-500'}`}
        >
          {total}% distributed
        </span>
      </div>

      <div className="relative h-7 rounded-lg overflow-hidden bg-gray-100 flex">
        {stages.map((stage, i) => {
          const w = Math.max(stage.revenueRecognition, 0);
          const barColor = STAGE_BAR_COLORS[i % STAGE_BAR_COLORS.length];
          return (
            <div
              key={stage.id}
              className="group/seg relative h-full flex items-center justify-center border-r border-white/50 cursor-default"
              style={{ width: `${w}%`, transition: 'width 300ms ease' }}
              title={`${stage.courseName}: ${w}%`}
            >
              <div className={`absolute inset-0 ${barColor} opacity-70 group-hover/seg:opacity-90 transition-opacity`} />
              {w >= 7 && (
                <span className="relative z-10 text-[10px] font-bold text-white drop-shadow-sm">{stage.order}</span>
              )}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/seg:flex flex-col items-center z-20 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl">
                  <p className="font-semibold">{stage.courseName}</p>
                  <p className="text-gray-300 text-[11px]">{w}%</p>
                </div>
                <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
              </div>
            </div>
          );
        })}
        {total < 100 && (
          <div className="h-full bg-gray-200 opacity-60 flex-1" style={{ transition: 'width 300ms ease' }} />
        )}
      </div>

      <div className="relative flex mt-1">
        {(() => {
          let cum = 0;
          return stages.map((stage, i) => {
            cum += stage.revenueRecognition;
            const isLast = i === stages.length - 1;
            return (
              <div key={stage.id} style={{ width: `${stage.revenueRecognition}%` }} className="relative">
                {!isLast && cum <= 100 && (
                  <div className="absolute right-0 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-px h-2 bg-gray-300" />
                    <span className="text-[9px] text-gray-400 tabular-nums">{cum}%</span>
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>

      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
        {stages.map((stage, i) => {
          const barColor = STAGE_BAR_COLORS[i % STAGE_BAR_COLORS.length];
          return (
            <div key={stage.id} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`w-2.5 h-2.5 rounded-sm ${barColor} opacity-70`} />
              <span className="truncate max-w-[120px]">{stage.courseName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
