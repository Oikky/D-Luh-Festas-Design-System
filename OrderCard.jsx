import * as React from "react";
export interface ListRowProps {
  /** Initial letter or an <img>; wins over icon. */
  avatar?: React.ReactNode;
  /** Lucide icon name in a 36px tile. */
  icon?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned amount, pre-formatted. */
  value?: React.ReactNode;
  valueSub?: React.ReactNode;
  /** in = green (entrada), out = red (saída). */
  tone?: "neutral" | "in" | "out";
  trailing?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function ListRow(props: ListRowProps): JSX.Element;
