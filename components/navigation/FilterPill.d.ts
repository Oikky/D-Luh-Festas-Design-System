import * as React from "react";
export interface FilterPillProps extends Omit<React.HTMLAttributes<HTMLElement>, "style"> {
  children?: React.ReactNode;
  /** Lucide icon before the label. */
  icon?: string;
  /** Lucide icon after the label; pass null to drop it. */
  trailingIcon?: string | null;
  active?: boolean;
  as?: "button" | "div";
  style?: React.CSSProperties;
}
export declare function FilterPill(props: FilterPillProps): JSX.Element;
