import * as React from "react"

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

export interface DialogHeaderProps {
  children: React.ReactNode;
}

export interface DialogTitleProps {
  children: React.ReactNode;
}

export interface DialogFooterProps {
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => onOpenChange(false)}>
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className = "", children }: DialogContentProps) {
  return (
    <div className={`bg-background rounded-lg shadow-lg p-6 max-h-[90vh] overflow-auto ${className}`}>
      {children}
    </div>
  );
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function DialogFooter({ children }: DialogFooterProps) {
  return <div className="flex justify-end gap-2 mt-4">{children}</div>;
}

