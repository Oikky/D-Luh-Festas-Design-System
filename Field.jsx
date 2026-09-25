import * as React from "react";
export interface ToastProps {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "danger";
  /** Lucide icon name, tinted by tone. */
  icon?: string;
  visible?: boolean;
  style?: React.CSSProperties;
}
export declare function Toast(props: ToastProps): JSX.Element;
