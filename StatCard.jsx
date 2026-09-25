import * as React from "react";
export interface SparklineProps {
  /** Raw series; scaled to fit. */
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  /** Soft gradient under the line. */
  fill?: boolean;
  strokeWidth?: number;
}
export declare function Sparkline(props: SparklineProps): JSX.Element | null;
