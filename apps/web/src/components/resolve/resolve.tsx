import type { SyncChange } from "@repo/sdk/types";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  getApiV1DataByApplicationIdHistoryOptions,
  getApiV1DataByApplicationIdOptions,
  getApiV1DataListOptions,
  postApiV1DataByApplicationIdResolveMutation,
} from "@repo/sdk/query";
import { zSyncChange } from "@repo/sdk/zod";
import { useMutation } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { clsx } from "clsx";
import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";

import { ChangeRow } from "@/components/resolve/change-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { confirm } from "@/components/ui/confirm";

const ResolveRoute = getRouteApi("/dashboard/$applicationId/resolve");

const ResolveChange = zSyncChange
  .pick({
    id: true,
    change_type: true,
    field_name: true,
    current_value: true,
    new_value: true,
  })
  .extend({
    action: z
      .enum(["accept", "discard"])
      .nullable()
      .refine((action) => (action != null) as boolean, {
        message: "Action is required",
      }),
  });
type ResolveChange = z.infer<typeof ResolveChange>;

const ResolveFormSchema = z.record(z.string(), ResolveChange);
type ResolveFormSchema = z.infer<typeof ResolveFormSchema>;

export function ResolveContent({ changes }: { changes: SyncChange[] }) {
  const { applicationId } = ResolveRoute.useParams();
  const navigate = ResolveRoute.useNavigate();

  const {
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(ResolveFormSchema),
    defaultValues: changes.reduce(
      (acc, change) => {
        acc[change.id] = {
          id: change.id,
          change_type: change.change_type,
          field_name: change.field_name,
          current_value: change.current_value,
          new_value: change.new_value,
          action: null,
        };
        return acc;
      },
      {} as Record<string, ResolveChange>,
    ),
  });

  const resolveMutation = useMutation({
    ...postApiV1DataByApplicationIdResolveMutation(),
    onSuccess: async (_data, _var, _, context) => {
      // Invalidate history queries
      await context.client.invalidateQueries({
        queryKey: getApiV1DataByApplicationIdHistoryOptions({
          path: { application_id: applicationId },
        }).queryKey,
      });
      // Invalidate integration details query to update last synced at
      await context.client.invalidateQueries({
        queryKey: getApiV1DataByApplicationIdOptions({
          path: { application_id: applicationId },
        }).queryKey,
      });
      // Invalidate application list
      await context.client.invalidateQueries({
        queryKey: getApiV1DataListOptions().queryKey,
      });
    },
  });

  const watchedValues = useWatch({
    control,
  });

  const renderedChanges = changes.map((change) => ({
    ...change,
    action: watchedValues[change.id]?.action || null,
  }));

  const onSubmit = async (data: Record<string, ResolveChange>) => {
    // Validate that all changes have an action selected
    if (Object.values(data).some((v) => v.action == null)) {
      await confirm({
        title: "Unresolved Changes",
        content:
          "Some changes do not have an action selected. Please choose an action for all changes before submitting.",
      });
      return;
    }

    const confirmed = await confirm({
      title: "Submit Resolutions",
      content: "Are you sure you want to submit your resolutions?",
    });
    if (!confirmed) return;

    await resolveMutation.mutateAsync({
      path: { application_id: applicationId },
      body: {
        syncActions: Object.values(data).map(({ action, ...change }) => ({
          syncChange: change,
          action: action!,
        })),
      },
    });

    await confirm({
      title: "Resolutions Submitted",
      content: "Your resolutions have been submitted successfully.",
    });
    await navigate({ to: "/dashboard/$applicationId/history", params: { applicationId } });
  };

  const onError = () => {
    void confirm({
      title: "Error",
      content: "Please choose an action for all changes before submitting.",
    });
  };

  const handleAcceptAll = () => {
    changes.forEach((change) => {
      setValue(`${change.id}.action`, "accept");
    });
  };

  const handleDiscardAll = () => {
    changes.forEach((change) => {
      setValue(`${change.id}.action`, "discard");
    });
  };

  if (!changes || changes.length === 0) {
    return (
      <Card>
        <CardContent className="px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">No pending changes to resolve.</p>
        </CardContent>
      </Card>
    );
  }

  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  // detect when headerRef is on top of the viewport (stickying)
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [isFooterSticky, setIsFooterSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const { top } = headerRef.current.getBoundingClientRect();
        setIsHeaderSticky(top <= 0);
      }
      if (footerRef.current) {
        const { bottom } = footerRef.current.getBoundingClientRect();
        setIsFooterSticky(bottom >= window.innerHeight);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="relative space-y-6">
      <Card
        ref={headerRef}
        className={clsx(
          "sticky top-0 gap-0 border-muted",
          isHeaderSticky && "rounded-t-none! shadow-lg",
        )}
      >
        <CardContent className="flex items-center justify-between px-4">
          <span>
            {changes.length} change{changes.length !== 1 ? "s" : ""} pending review
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscardAll}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              <X className="mr-2 size-4" />
              Discard All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAcceptAll}
              className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
            >
              <Check className="mr-2 size-4" />
              Accept All
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        {renderedChanges.map((change) => (
          <ChangeRow
            key={change.id}
            change={change}
            value={change.action}
            onActionChange={(action) => setValue(`${change.id}.action`, action)}
          />
        ))}
      </div>

      <Card
        ref={footerRef}
        className={clsx(
          "sticky bottom-0 border-primary/50 bg-taupe-50",
          isFooterSticky && "rounded-b-none! shadow-lg",
        )}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">Summary:</p>
            <p className="text-sm text-muted-foreground">
              {Object.values(watchedValues).filter((v) => v?.action === "accept").length} accepted,{" "}
              {Object.values(watchedValues).filter((v) => v?.action === "discard").length}{" "}
              discarded, from {changes.length} total changes.
            </p>
          </div>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            Submit Resolutions
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
