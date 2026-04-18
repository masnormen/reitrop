import { confirmable, createConfirmation, type ConfirmDialogProps } from "react-confirm";
// const MyDialog = ({ show, proceed, message }: ConfirmDialogProps<{ message: string }, boolean>) => (
//   <div className={`dialog-overlay ${show ? "show" : "hide"}`}>
//     <div className="dialog">
//       <p>{message}</p>
//       <button onClick={() => proceed(true)}>Yes</button>
//       <button onClick={() => proceed(false)}>No</button>
//     </div>
//   </div>
// );

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
    title: string;
    description?: string;
    content: string;
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
        {content}
        <DialogFooter className="justify-end">
          {(cancelText || (!confirmText && !cancelText)) && (
            <Button type="button" variant="outline" onClick={() => proceed(false)}>
              {cancelText}
            </Button>
          )}
          {confirmText && (
            <Button type="button" onClick={() => proceed(true)}>
              {confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const confirm = createConfirmation(confirmable(ConfirmDialog));
