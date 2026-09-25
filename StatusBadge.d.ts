import * as React from "react";
export interface SpinnerProps {
  size?: number;
  /** Bare ring, for use inside a button. */
  inline?: boolean;
  /** Caption under the ring in block mode, e.g. "Carregando pedidos…". */
  label?: React.ReactNode;
}
export declare function Spinner(props: SpinnerProps): JSX.Element;
