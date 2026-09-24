import * as React from "react";
export interface ConfirmDialogProps {
  open?: boolean;
  /** Lucide icon name in the 52px round tile. */
  icon?: string;
  tone?: "accent" | "warn" | "danger";
  title: React.ReactNode;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
export declare function ConfirmDialog(props: ConfirmDialogProps): JSX.Element | null;
