import * as React from "react";
export interface FieldProps {
  /** Uppercase 11px caption above the control. */
  label?: React.ReactNode;
  hint?: React.ReactNode;
  /** Replaces the hint and turns it red. */
  error?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  /** Grid column span when used inside a form grid. */
  span?: number;
  style?: React.CSSProperties;
}
export declare function Field(props: FieldProps): JSX.Element;
