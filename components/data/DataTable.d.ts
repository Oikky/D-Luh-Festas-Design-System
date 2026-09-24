import * as React from "react";
export interface DataTableColumn<T = any> {
  key: string;
  label: React.ReactNode;
  align?: "left" | "center" | "right";
  width?: number | string;
  /** Renders in --text-strong semibold. */
  strong?: boolean;
  wrap?: boolean;
  render?: (row: T) => React.ReactNode;
}
export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /** Node shown in place of the body when rows is empty — usually <EmptyState>. */
  empty?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function DataTable<T = any>(props: DataTableProps<T>): JSX.Element;
