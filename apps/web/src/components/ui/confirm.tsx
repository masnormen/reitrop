import type React from "react";

import { confirmable, createConfirmation, type ConfirmDialogProps } from "react-confirm";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ConfirmDialog = ({
  show,
  proceed,
  title,
  description,
  content,
  confirmText,
  cancelText,
}: ConfirmDialogProps<
  {
    title: React.ReactNode;
    description?: React.ReactNode;
    content?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
  },
  boolean
>) => {
  return (
    <Dialog open={show}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {description && <DialogDescription>{description}</DialogDescription>}
        {content && (
          <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">{content}</div>
        )}
        <DialogFooter className="justify-end">
          {cancelText && (
            <Button type="button" variant="outline" onClick={() => proceed(false)}>
              {cancelText}
            </Button>
          )}
          {(confirmText || (!confirmText && !cancelText)) && (
            <Button type="button" onClick={() => proceed(true)}>
              {confirmText ?? (!cancelText ? "OK" : null)}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const confirm = createConfirmation(confirmable(ConfirmDialog));
