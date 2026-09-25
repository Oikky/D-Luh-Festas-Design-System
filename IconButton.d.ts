import * as React from "react";
export interface IconProps extends React.SVGAttributes<SVGElement> {
  /** Lucide icon name, kebab or Pascal ("shopping-bag" | "ShoppingBag"). */
  name: string;
  /** Rendered box in px. 20 inline, 24 in a 48px tile. */
  size?: number;
  strokeWidth?: number;
  color?: string;
}
export declare function Icon(props: IconProps): JSX.Element;
