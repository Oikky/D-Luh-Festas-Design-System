import * as React from "react";
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size" | "style"> {
  options?: Array<string | { value: string; label: string }>;
  /** Terracotta 1.5px border + semibold accent text — the admin's inline status changer. */
  accent?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
