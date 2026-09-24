import * as React from "react";
export interface DropdownMenuItem {
  label?: React.ReactNode;
  /** Lucide icon name. */
  icon?: string;
  onClick?: () => void;
  tone?: "default" | "danger";
  divider?: boolean;
}
export interface DropdownMenuProps {
  /** The clickable element, usually an <IconButton icon="menu" />. */
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "left" | "right";
  style?: React.CSSProperties;
}
export declare function DropdownMenu(props: DropdownMenuProps): JSX.Element;
