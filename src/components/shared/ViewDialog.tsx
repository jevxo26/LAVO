"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ViewDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function ViewDialog({
  open,
  title,
  onClose,
  children,
}: ViewDialogProps) {
  return (
    <Dialog
      open={open}
      title={title}
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
    >
      <div className="space-y-5">
        {children}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}