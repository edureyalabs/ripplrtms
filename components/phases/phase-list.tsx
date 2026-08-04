import { Badge } from "@/components/ui/badge";
import { PHASE_STATUS_TONE } from "@/lib/badge-tones";
import { DeletePhaseButton } from "@/components/phases/delete-phase-button";

type Phase = { id: string; name: string; status: "pending" | "submitted" | "accepted" };

export function PhaseList({
  parentType,
  parentId,
  phases,
  canManage,
}: {
  parentType: "task" | "project";
  parentId: string;
  phases: Phase[];
  canManage: boolean;
}) {
  return (
    <ul className="mt-3 flex flex-col divide-y divide-surface-border dark:divide-surface-border-dark">
      {phases.map((phase) => (
        <li key={phase.id} className="flex items-center justify-between gap-2 py-2">
          <span className="text-sm text-zinc-700 dark:text-zinc-300">{phase.name}</span>
          <div className="flex items-center gap-3">
            <Badge tone={PHASE_STATUS_TONE[phase.status]}>{phase.status}</Badge>
            {canManage && phase.status === "pending" && (
              <DeletePhaseButton parentType={parentType} parentId={parentId} phaseId={phase.id} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
