import * as React from "react";
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  /** Node before the text — usually an <Icon> or a "R$". */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  invalid?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
