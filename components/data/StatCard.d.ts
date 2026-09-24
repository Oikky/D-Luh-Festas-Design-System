import * as React from "react";
/**
 * A single headline number with an optional trend chip and sparkline.
 * @startingPoint section="Data" subtitle="KPI tiles for the admin overview" viewport="700x200"
 */
export interface StatCardProps {
  label: React.ReactNode;
  /** Pre-formatted string — format money as "R$ 1.480,00" (pt-BR). */
  value: React.ReactNode;
  unit?: React.ReactNode;
  /** Percentage change; sign picks the green/red chip and the arrow. */
  delta?: number;
  deltaLabel?: React.ReactNode;
  /** Lucide icon name in the 34px tile. */
  icon?: string;
  tone?: "neutral" | "accent";
  /** Usually a <Sparkline>. */
  chart?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function StatCard(props: StatCardProps): JSX.Element;
