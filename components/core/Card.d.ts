import * as React from "react";
export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  children?: React.ReactNode;
  /** Header strip with a bottom hairline. */
  header?: React.ReactNode;
  /** Footer strip on --color-surface-2, for the card's actions. */
  footer?: React.ReactNode;
  padded?: boolean;
  tone?: "surface" | "raised";
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
