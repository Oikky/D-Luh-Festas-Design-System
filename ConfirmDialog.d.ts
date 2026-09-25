import * as React from "react";
export interface UserChipProps {
  name: React.ReactNode;
  /** Second line — "Gerente", "Cozinha", "Atendimento". */
  role?: React.ReactNode;
  /** Photo URL; falls back to initials on a terracotta tint. */
  src?: string;
  initials?: string;
  /** Avatar only. */
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function UserChip(props: UserChipProps): JSX.Element;
