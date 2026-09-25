import * as React from "react";
export interface ModalProps {
  open?: boolean;
  /** Playfair Display heading. */
  title?: React.ReactNode;
  /** One sentence explaining what this dialog does. */
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  /** Action row; buttons stretch to equal width. */
  footer?: React.ReactNode;
  onClose?: () => void;
  width?: number;
  style?: React.CSSProperties;
}
export declare function Modal(props: ModalProps): JSX.Element | null;
