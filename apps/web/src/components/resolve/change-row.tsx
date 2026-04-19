import type { SyncChange } from "@repo/sdk/types";

import { clsx } from "clsx";
import { Check, X, FileDiff, Plus, Minus, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";

interface ChangeRowProps {
  change: SyncChange;
  value: "accept" | "discard" | null;
  onActionChange: (action: "accept" | "discard" | null) => void;
}

export function ChangeRow({ change, value, onActionChange }: ChangeRowProps) {
  const [entity, field] = change.field_name.split(".");
  const isAddition = change.change_type === "ADD";
  const isDeletion = change.change_type === "DELETE";

  return (
    <Card className="group gap-0 pb-0!">
      <div className="flex items-center justify-between border-b px-3 pb-3">
        <div className="flex items-center gap-2">
          {value == null ? (
            <FileDiff className="size-4 text-muted-foreground" />
          ) : value === "accept" ? (
            <Check className="size-4 text-green-700" />
          ) : (
            <Trash2 className="size-4 text-red-700" />
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

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onActionChange(value === "discard" ? null : "discard")}
            className={clsx(
              "flex h-6 items-center gap-1 rounded px-2 text-[10px] font-medium transition-all",
              "border",
              value === "discard"
                ? "border-red-500 bg-red-500 text-white"
                : "border-transparent bg-muted/50 text-muted-foreground hover:bg-red-100 hover:text-red-700",
            )}
          >
            <X className="size-3" />
            Discard
          </button>
          <button
            type="button"
            onClick={() => onActionChange(value === "accept" ? null : "accept")}
            className={clsx(
              "flex h-6 items-center gap-1 rounded px-2 text-[10px] font-medium transition-all",
              "border",
              value === "accept"
                ? "border-green-500 bg-green-500 text-white"
                : "border-transparent bg-muted/50 text-muted-foreground hover:bg-green-100 hover:text-green-700",
            )}
          >
            <Check className="size-3" />
            Accept
          </button>
        </div>
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
