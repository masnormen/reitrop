import type { SyncChange } from "@repo/sdk/types";

import { clsx } from "clsx";
import { Check, X, Minus, Plus } from "lucide-react";

import { Card } from "@/components/ui/card";

interface ChangeDetailRowProps {
  change: SyncChange;
  isDiscarded: boolean;
}

export function ChangeDetailRow({ change, isDiscarded }: ChangeDetailRowProps) {
  const [entity, field] = change.field_name.split(".");
  const isAddition = change.change_type === "ADD";
  const isDeletion = change.change_type === "DELETE";

  return (
    <Card className={clsx("gap-0 pb-0!", isDiscarded && "border-red-200 bg-red-50/30")}>
      <div className="flex items-center justify-between border-b px-3 pb-3">
        <div className="flex items-center gap-2">
          {isDiscarded ? (
            <X className="size-4 text-red-700" />
          ) : (
            <Check className="size-4 text-green-700" />
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {entity}.{field}
          </span>
          <span
            className={clsx(
              "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
              isAddition && "bg-green-100 text-green-700",
              isDeletion && "bg-red-100 text-red-700",
              !isAddition && !isDeletion && "bg-amber-100 text-amber-700",
            )}
          >
            {change.change_type}
          </span>
        </div>
        {isDiscarded && (
          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
            Discarded
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 text-xs">
        {isAddition ? (
          <>
            <div className="border-r border-dashed bg-muted/20 px-3 py-4 text-muted-foreground/50">
              <span className="text-muted-foreground/50">—</span>
            </div>
            <div className="bg-green-500/10 px-3 py-4">
              <div className="flex items-center gap-1.5 text-blue-700">
                <Plus className="h-3 w-3" />
                <span className="font-medium">new</span>
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-green-900">{change.new_value}</div>
            </div>
          </>
        ) : isDeletion ? (
          <>
            <div className="border-r bg-red-500/10 px-3 py-4">
              <div className="flex items-center gap-1.5 text-red-700">
                <Minus className="h-3 w-3" />
                <span className="font-medium">current</span>
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-red-900">
                {change.current_value}
              </div>
            </div>
            <div className="border-l border-dashed bg-muted/20 px-3 py-4 text-muted-foreground/50">
              <span className="text-muted-foreground/50">—</span>
            </div>
          </>
        ) : (
          <>
            <div className="border-r bg-red-500/10 px-3 py-4">
              <div className="flex items-center gap-1.5 text-red-700">
                <Minus className="h-3 w-3" />
                <span className="font-medium">current</span>
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-orange-900">
                {change.current_value}
              </div>
            </div>
            <div className="bg-green-500/10 px-3 py-4">
              <div className="flex items-center gap-1.5 text-blue-700">
                <Plus className="h-3 w-3" />
                <span className="font-medium">incoming</span>
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-green-900">{change.new_value}</div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
