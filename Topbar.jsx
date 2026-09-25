import * as React from "react";
export interface SidebarNavItem { id: string; label: string; /** Lucide icon name. */ icon: string; count?: number }
/**
 * Left navigation — 72px icon rail by default, 248px labelled sidebar when expanded.
 * @startingPoint section="Navigation" subtitle="Icon rail and expanded sidebar" viewport="700x330"
 */
export interface SidebarNavProps {
  items: SidebarNavItem[];
  value?: string;
  onChange?: (id: string) => void;
  expanded?: boolean;
  /** Brand mark at the top. */
  logo?: React.ReactNode;
  /** Pinned to the bottom — settings, log out. */
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function SidebarNav(props: SidebarNavProps): JSX.Element;
