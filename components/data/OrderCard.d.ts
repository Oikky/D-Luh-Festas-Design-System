import * as React from "react";
import type { DluhStatus } from "../core/StatusBadge";
export interface OrderItem {
  name: React.ReactNode;
  qty?: number;
  /** Flavour, filling, size — the grey second line. */
  note?: React.ReactNode;
  /** Cake-topper request, shown in a terracotta tint chip. */
  topper?: React.ReactNode;
  price?: React.ReactNode;
}
/**
 * The pedido card: the unit of work in the D'Luh admin.
 * @startingPoint section="Data" subtitle="Order card with items and actions" viewport="700x400"
 */
export interface OrderCardProps {
  /** Short order reference, uppercase. */
  id?: React.ReactNode;
  customer: React.ReactNode;
  status?: DluhStatus | string;
  /** Delivery date, phone, payment method… joined with a dot. */
  meta?: React.ReactNode[];
  items?: OrderItem[];
  total?: React.ReactNode;
  paid?: React.ReactNode;
  due?: React.ReactNode;
  /** <Badge> row under the customer name. */
  badges?: React.ReactNode;
  /** Buttons in the footer. */
  actions?: React.ReactNode;
  /** Terracotta glow — used when an order was just updated. */
  highlight?: boolean;
  style?: React.CSSProperties;
}
export declare function OrderCard(props: OrderCardProps): JSX.Element;
