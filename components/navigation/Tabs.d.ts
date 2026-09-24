import * as React from "react";
export interface TabItem { id: string; label: React.ReactNode; count?: number }
export interface TabsProps {
  items: TabItem[];
  value?: string;
  onChange?: (id: string) => void;
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): JSX.Element;
