import * as React from "react";
export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  /** Lucide icon name. */
  icon: string;
  /** Required — becomes aria-label and tooltip. */
  label: string;
  /** Square edge in px when tile=false. */
  size?: number;
  active?: boolean;
  /** 48px rounded tile (nav rail / toolbar style). */
  tile?: boolean;
  /** Unread dot in the top-right corner. */
  badge?: boolean;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
