import * as React from "react";
export interface EmptyStateProps {
  /** Lucide icon name shown in a 56px tinted tile. */
  icon?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Usually a single <Button>. */
  action?: React.ReactNode;
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element;
