import * as React from "react";
export interface BadgeProps {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "warn" | "success" | "danger";
  /** Lucide icon name rendered at 12px before the label. */
  icon?: string;
  outline?: boolean;
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
