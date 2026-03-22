'use client';

import { FinanceStage } from '@/lib/finance-data';
import { StageCard } from './stage-card';

export function StageList({
  stages,
  cumulatives,
  onUpdateRevenue,
  onUpdateRefund,
  onUpdatePrice,
  onToggleSellable,
  onToggleCommissionable,
}: {
  stages: FinanceStage[];
  cumulatives: number[];
  onUpdateRevenue: (id: string, val: number) => void;
  onUpdateRefund: (id: string, val: number) => void;
  onUpdatePrice: (id: string, val: number) => void;
  onToggleSellable: (id: string, value: boolean) => void;
  onToggleCommissionable: (id: string, value: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      {stages.map((stage, i) => (
        <StageCard
          key={stage.id}
          stage={stage}
          stageIndex={i}
          cumulative={cumulatives[i]}
          onUpdateRevenue={onUpdateRevenue}
          onUpdateRefund={onUpdateRefund}
          onUpdatePrice={onUpdatePrice}
          onToggleSellable={onToggleSellable}
          onToggleCommissionable={onToggleCommissionable}
        />
      ))}
    </div>
  );
}
