import * as React from "react";
/**
 * Primary action control. Tone carries meaning in the D'Luh admin: each money/operation
 * action owns one hue (charge-entry blue, charge-total violet, delivered teal…).
 * @startingPoint section="Core" subtitle="Buttons, tones and states" viewport="700x200"
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children?: React.ReactNode;
  /** solid = filled, outline = 1.5px accent border on white, ghost = neutral hairline, quiet = flat tint. */
  variant?: "solid" | "outline" | "ghost" | "quiet";
  /** Semantic hue. accent = D'Luh terracotta. */
  tone?: "accent" | "success" | "chargeAll" | "chargeEntry" | "delivered" | "warn" | "danger";
  size?: "sm" | "md" | "lg";
  /** Lucide icon name rendered before the label. */
  icon?: string;
  iconRight?: string;
  block?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
