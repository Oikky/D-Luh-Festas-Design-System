/* @ds-bundle: {"format":4,"namespace":"DLuhFestasDesignSystem_c861a2","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"EmptyState","sourcePath":"components/core/EmptyState.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Spinner","sourcePath":"components/core/Spinner.jsx"},{"name":"STATUS","sourcePath":"components/core/StatusBadge.jsx"},{"name":"StatusBadge","sourcePath":"components/core/StatusBadge.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"ListRow","sourcePath":"components/data/ListRow.jsx"},{"name":"OrderCard","sourcePath":"components/data/OrderCard.jsx"},{"name":"Sparkline","sourcePath":"components/data/Sparkline.jsx"},{"name":"StatCard","sourcePath":"components/data/StatCard.jsx"},{"name":"UserChip","sourcePath":"components/data/UserChip.jsx"},{"name":"ConfirmDialog","sourcePath":"components/feedback/ConfirmDialog.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"SearchInput","sourcePath":"components/forms/SearchInput.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"DropdownMenu","sourcePath":"components/navigation/DropdownMenu.jsx"},{"name":"FilterPill","sourcePath":"components/navigation/FilterPill.jsx"},{"name":"SidebarNav","sourcePath":"components/navigation/SidebarNav.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Topbar","sourcePath":"components/navigation/Topbar.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"9b9cbef35dab","components/core/Button.jsx":"30f314260615","components/core/Card.jsx":"dc7f4e9ede26","components/core/EmptyState.jsx":"42d3015c440a","components/core/Icon.jsx":"53926d74c3ee","components/core/IconButton.jsx":"7eb12fd01fd6","components/core/Spinner.jsx":"cfeb201b481f","components/core/StatusBadge.jsx":"f64b3fd9343b","components/data/DataTable.jsx":"f05d8bb05c4e","components/data/ListRow.jsx":"9afdf678539c","components/data/OrderCard.jsx":"daa57f7d0018","components/data/Sparkline.jsx":"ea22f0d1c512","components/data/StatCard.jsx":"c8c8a551d7c8","components/data/UserChip.jsx":"6facf4599cb4","components/feedback/ConfirmDialog.jsx":"2202f7624b67","components/feedback/Modal.jsx":"cd6db8ec9a3c","components/feedback/Toast.jsx":"8a93f0b933c3","components/forms/Field.jsx":"923343d8735c","components/forms/Input.jsx":"3ec04b289b01","components/forms/SearchInput.jsx":"d0275827b20a","components/forms/Select.jsx":"fa14fdabd597","components/navigation/DropdownMenu.jsx":"f415c5bb4641","components/navigation/FilterPill.jsx":"9cc02f2ad948","components/navigation/SidebarNav.jsx":"c2421a7aacde","components/navigation/Tabs.jsx":"8f9f675f8b97","components/navigation/Topbar.jsx":"2afd9db83028","ui_kits/admin/Agenda.jsx":"d7fb93617af8","ui_kits/admin/App.jsx":"7a9c24eef680","ui_kits/admin/Busca.jsx":"68109bd2227f","ui_kits/admin/Contratos.jsx":"a4619ba274ed","ui_kits/admin/Cozinha.jsx":"f302b2bbe921","ui_kits/admin/Financeiro.jsx":"eaa417039f6b","ui_kits/admin/Notificacoes.jsx":"6600bef6168c","ui_kits/admin/Pedidos.jsx":"a06a33753793","ui_kits/admin/PedidosModais.jsx":"4db5b610af87","ui_kits/admin/Shell.jsx":"583e476434ee","ui_kits/admin/VisaoGeral.jsx":"272b2080d47a","ui_kits/admin/contratos-data.js":"9d3f2f5e2884","ui_kits/admin/data.js":"b2da890cd031"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DLuhFestasDesignSystem_c861a2 = window.DLuhFestasDesignSystem_c861a2 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  children,
  header,
  footer,
  padded = true,
  tone = "surface",
  style,
  bodyStyle,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: tone === "raised" ? "var(--color-surface)" : "var(--color-surface)",
      border: "var(--border-hairline) solid var(--color-border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-card)",
      overflow: "hidden",
      fontFamily: "var(--font-ui)",
      ...style
    }
  }, rest), header ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--pad-card-header)",
      borderBottom: "var(--border-hairline) solid var(--color-border)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-6)"
    }
  }, header) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: padded ? "var(--pad-card)" : 0,
      ...bodyStyle
    }
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--pad-card)",
      borderTop: "var(--border-hairline) solid var(--color-border)",
      background: "var(--color-surface-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-6)",
      flexWrap: "wrap"
    }
  }, footer) : null);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Lucide is loaded from CDN by the page (see readme ICONOGRAPHY). This wrapper reads the
   icon data off window.lucide and renders a real <svg> so React keeps ownership of the node. */
const pascal = n => String(n).replace(/(^|[-_])([a-z])/g, (_, __, c) => c.toUpperCase());
const reactAttrs = a => {
  const o = {};
  for (const k in a) o[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = a[k];
  return o;
};
function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  color = "currentColor",
  style,
  ...rest
}) {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    if (window.lucide) return;
    const t = setInterval(() => {
      if (window.lucide) {
        clearInterval(t);
        force(n => n + 1);
      }
    }, 120);
    return () => clearInterval(t);
  }, []);
  /* window.lucide.icons.Bell is a single 3-tuple ["svg", attrs, [children]] — we want [2]. */
  const node = window.lucide && window.lucide.icons && window.lucide.icons[pascal(name)];
  const nodes = Array.isArray(node) && Array.isArray(node[2]) ? node[2].filter(c => Array.isArray(c) && typeof c[0] === "string") : [];
  const base = {
    width: size,
    height: size,
    flex: "0 0 auto",
    display: "block",
    ...style
  };
  if (!nodes.length) return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true",
    style: base
  }, rest));
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: base
  }, rest), nodes.map(([tag, attrs], i) => React.createElement(tag, {
    key: i,
    ...reactAttrs(attrs)
  })));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
const TONES = {
  neutral: {
    bg: "var(--color-surface-3)",
    fg: "var(--text-body)",
    line: "var(--color-border)"
  },
  accent: {
    bg: "var(--color-accent-soft)",
    fg: "var(--text-accent)",
    line: "var(--terracotta-200)"
  },
  warn: {
    bg: "var(--action-warn-bg)",
    fg: "var(--action-warn)",
    line: "var(--action-warn-line)"
  },
  success: {
    bg: "var(--action-paid-bg)",
    fg: "var(--action-paid)",
    line: "var(--action-paid-line)"
  },
  danger: {
    bg: "var(--status-cancelado-bg)",
    fg: "var(--status-cancelado-fg)",
    line: "transparent"
  }
};
function Badge({
  children,
  tone = "neutral",
  icon,
  outline = true,
  style
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 10px",
      borderRadius: "var(--radius-pill)",
      background: t.bg,
      color: t.fg,
      border: outline ? `var(--border-hairline) solid ${t.line}` : "none",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      lineHeight: 1.6,
      whiteSpace: "nowrap",
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 12
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/EmptyState.jsx
try { (() => {
function EmptyState({
  icon = "inbox",
  title,
  description,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "var(--space-14) var(--space-10)",
      fontFamily: "var(--font-ui)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      margin: "0 auto var(--space-7)",
      borderRadius: "var(--radius-lg)",
      background: "var(--color-surface-3)",
      color: "var(--text-muted)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 26
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-subhead)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)"
    }
  }, title), description ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontSize: "var(--fs-body-s)",
      color: "var(--text-muted)",
      lineHeight: "var(--lh-normal)"
    }
  }, description) : null, action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-8)",
      display: "flex",
      justifyContent: "center"
    }
  }, action) : null);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IconButton({
  icon,
  label,
  size = 38,
  active = false,
  tile = false,
  badge = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    style: {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: tile ? "var(--icon-tile)" : size,
      height: tile ? "var(--icon-tile)" : size,
      borderRadius: tile ? "var(--radius-md)" : "var(--radius-sm)",
      background: active ? "var(--color-accent)" : "var(--color-surface)",
      color: active ? "var(--color-accent-contrast)" : "var(--text-body)",
      border: `var(--border-control) solid ${active ? "transparent" : "var(--color-border)"}`,
      cursor: "pointer",
      transition: "var(--transition-control)",
      flex: "0 0 auto",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: tile ? 22 : 17
  }), badge ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 7,
      height: 7,
      borderRadius: "var(--radius-pill)",
      background: "var(--action-danger)",
      boxShadow: "0 0 0 2px var(--color-surface)"
    }
  }) : null);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Spinner.jsx
try { (() => {
function Spinner({
  size = 32,
  inline = false,
  label
}) {
  const ring = /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      flex: "0 0 auto",
      display: "inline-block",
      border: `${Math.max(2, Math.round(size / 11))}px solid var(--color-border)`,
      borderTopColor: "var(--color-accent)",
      borderRadius: "var(--radius-pill)",
      animation: "dluh-spin var(--dur-spin) linear infinite"
    }
  });
  if (inline) return /*#__PURE__*/React.createElement(React.Fragment, null, ring, /*#__PURE__*/React.createElement("style", null, "@keyframes dluh-spin{to{transform:rotate(360deg)}}"));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "var(--space-14) var(--space-10)",
      color: "var(--text-muted)",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-body-l)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 auto var(--space-7)",
      width: size,
      height: size
    }
  }, ring), label, /*#__PURE__*/React.createElement("style", null, "@keyframes dluh-spin{to{transform:rotate(360deg)}}"));
}
Object.assign(__ds_scope, { Spinner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Spinner.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  accent: {
    bg: "var(--color-accent)",
    fg: "var(--color-accent-contrast)",
    line: "transparent"
  },
  success: {
    bg: "var(--action-success)",
    fg: "#fff",
    line: "transparent"
  },
  chargeAll: {
    bg: "var(--action-charge-total)",
    fg: "#fff",
    line: "transparent"
  },
  chargeEntry: {
    bg: "var(--action-charge-entry)",
    fg: "#fff",
    line: "transparent"
  },
  delivered: {
    bg: "var(--action-delivered)",
    fg: "#fff",
    line: "transparent"
  },
  warn: {
    bg: "var(--action-warn)",
    fg: "#fff",
    line: "transparent"
  },
  danger: {
    bg: "var(--action-danger)",
    fg: "#fff",
    line: "transparent"
  }
};
const SIZES = {
  sm: {
    padding: "8px 14px",
    fontSize: "var(--fs-small)",
    gap: 6,
    minHeight: 36
  },
  md: {
    padding: "10px 16px",
    fontSize: "var(--fs-body-s)",
    gap: 8,
    minHeight: 40
  },
  lg: {
    padding: "12px 20px",
    fontSize: "var(--fs-body-l)",
    gap: 8,
    minHeight: 44
  }
};
function Button({
  children,
  variant = "solid",
  tone = "accent",
  size = "md",
  icon,
  iconRight,
  block = false,
  loading = false,
  disabled = false,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.accent;
  const s = SIZES[size] || SIZES.md;
  const skin = variant === "outline" ? {
    background: "var(--color-surface)",
    color: t.bg,
    border: `var(--border-control) solid ${t.bg}`
  } : variant === "ghost" ? {
    background: "transparent",
    color: "var(--text-body)",
    border: "var(--border-hairline) solid var(--color-border)"
  } : variant === "quiet" ? {
    background: "var(--color-surface-3)",
    color: "var(--text-body)",
    border: "var(--border-hairline) solid transparent"
  } : {
    background: t.bg,
    color: t.fg,
    border: `var(--border-hairline) solid ${t.line}`
  };
  const off = disabled || loading;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: off,
    "data-tone": tone,
    "data-variant": variant,
    style: {
      display: block ? "flex" : "inline-flex",
      width: block ? "100%" : "auto",
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      padding: s.padding,
      minHeight: s.minHeight,
      fontSize: s.fontSize,
      fontFamily: "var(--font-ui)",
      fontWeight: "var(--fw-semibold)",
      lineHeight: 1,
      borderRadius: "var(--radius-sm)",
      cursor: off ? "not-allowed" : "pointer",
      opacity: off ? "var(--disabled-opacity)" : 1,
      whiteSpace: "nowrap",
      transition: "var(--transition-control)",
      ...skin,
      ...style
    }
  }, rest), loading ? /*#__PURE__*/React.createElement(__ds_scope.Spinner, {
    size: 15,
    inline: true
  }) : icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === "sm" ? 15 : 17
  }) : null, children, iconRight && !loading ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: size === "sm" ? 15 : 17
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusBadge.jsx
try { (() => {
/* The six live Status values (plus the legacy intermediate) from the Coda "Status" column. */
const STATUS = {
  "Aguardando confirmação": {
    key: "aguardando",
    short: "Aguardando"
  },
  "Verificando Estoque": {
    key: "aguardando",
    short: "Verificando estoque"
  },
  "Confirmado — Esperando pagamento": {
    key: "confirmado",
    short: "Esperando pagamento"
  },
  "Pago — Em produção": {
    key: "preparo",
    short: "Em produção"
  },
  "Pronto": {
    key: "pronto",
    short: "Pronto"
  },
  "Entregue — Esperando restante": {
    key: "saiu",
    short: "Esperando restante"
  },
  "Finalizado": {
    key: "entregue",
    short: "Finalizado"
  },
  "Cancelado": {
    key: "cancelado",
    short: "Cancelado"
  }
};
function StatusBadge({
  status,
  short = false,
  dot = true,
  style
}) {
  const meta = STATUS[status] || {
    key: "entregue",
    short: status
  };
  return /*#__PURE__*/React.createElement("span", {
    "data-status": meta.key,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 12px",
      borderRadius: "var(--radius-pill)",
      background: `var(--status-${meta.key}-bg)`,
      color: `var(--status-${meta.key}-fg)`,
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      lineHeight: 1.6,
      whiteSpace: "nowrap",
      ...style
    }
  }, dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "var(--radius-pill)",
      background: "currentColor",
      opacity: .75
    }
  }) : null, short ? meta.short : status);
}
Object.assign(__ds_scope, { STATUS, StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function DataTable({
  columns = [],
  rows = [],
  empty,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
      ...style
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      minWidth: 520,
      borderCollapse: "collapse",
      fontFamily: "var(--font-ui)"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: c.align || "left",
      padding: "0 12px 8px",
      whiteSpace: "nowrap",
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "var(--ls-label)",
      width: c.width
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.length ? rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.id || i
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      textAlign: c.align || "left",
      padding: "12px",
      verticalAlign: "middle",
      borderTop: "var(--border-hairline) solid var(--color-border)",
      fontSize: "var(--fs-body-s)",
      color: c.strong ? "var(--text-strong)" : "var(--text-body)",
      fontWeight: c.strong ? "var(--fw-semibold)" : "var(--fw-regular)",
      whiteSpace: c.wrap ? "normal" : "nowrap"
    }
  }, c.render ? c.render(r) : r[c.key])))) : /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length,
    style: {
      padding: 0
    }
  }, empty)))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/ListRow.jsx
try { (() => {
function ListRow({
  avatar,
  icon,
  title,
  subtitle,
  value,
  valueSub,
  tone = "neutral",
  trailing,
  onClick,
  style
}) {
  const money = tone === "in" ? "var(--action-paid)" : tone === "out" ? "var(--action-danger)" : "var(--text-strong)";
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-6)",
      padding: "11px 12px",
      borderRadius: "var(--radius-sm)",
      cursor: onClick ? "pointer" : "default",
      background: "var(--color-surface)",
      fontFamily: "var(--font-ui)",
      border: "var(--border-hairline) solid var(--color-border-soft)",
      ...style
    }
  }, avatar ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      flex: "0 0 auto",
      borderRadius: "var(--radius-sm)",
      background: "var(--color-surface-3)",
      color: "var(--text-body)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "var(--fs-body-s)",
      fontWeight: "var(--fw-semibold)"
    }
  }, avatar) : icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      flex: "0 0 auto",
      borderRadius: "var(--radius-sm)",
      background: "var(--color-surface-3)",
      color: "var(--text-body)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18
  })) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-body-l)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)",
      marginTop: 2
    }
  }, subtitle) : null), value != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-body-l)",
      fontWeight: "var(--fw-semibold)",
      color: money,
      whiteSpace: "nowrap"
    }
  }, value), valueSub ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)",
      marginTop: 2
    }
  }, valueSub) : null) : null, trailing);
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/data/OrderCard.jsx
try { (() => {
function OrderCard({
  id,
  customer,
  status,
  meta = [],
  items = [],
  total,
  paid,
  due,
  badges,
  actions,
  highlight = false,
  style
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Card, {
    style: {
      boxShadow: highlight ? "var(--glow-accent)" : "var(--shadow-card)",
      ...style
    },
    header: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, id ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-caption)",
        fontWeight: "var(--fw-semibold)",
        color: "var(--color-accent)",
        letterSpacing: "var(--ls-caps)",
        textTransform: "uppercase",
        marginBottom: 4
      }
    }, id) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)",
        color: "var(--text-strong)"
      }
    }, customer), meta.length ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-body-s)",
        color: "var(--text-body)",
        fontWeight: "var(--fw-medium)",
        marginTop: 3
      }
    }, meta.map((m, i) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, i ? /*#__PURE__*/React.createElement("span", {
      style: {
        opacity: .45,
        margin: "0 6px"
      }
    }, "\xB7") : null, m))) : null, badges ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        marginTop: 8
      }
    }, badges) : null), status ? /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
      status: status,
      short: true
    }) : null),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-ui)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-tiny)",
        color: "var(--text-muted)",
        marginRight: 6
      }
    }, "Total"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-subhead)",
        fontWeight: "var(--fw-bold)",
        color: "var(--text-strong)"
      }
    }, total), paid != null || due != null ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-small)",
        fontWeight: "var(--fw-semibold)",
        color: "var(--text-body)",
        marginTop: 4
      }
    }, paid != null ? /*#__PURE__*/React.createElement(React.Fragment, null, "Pago ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: "var(--action-paid)"
      }
    }, paid)) : null, due != null ? /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 Falta ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: "var(--action-warn)"
      }
    }, due)) : null) : null), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "var(--gap-inline)",
        alignItems: "center",
        flexWrap: "wrap"
      }
    }, actions))
  }, items.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-tiny)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "var(--ls-label)",
      marginBottom: 8
    }
  }, "Itens"), items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      alignItems: "flex-start",
      padding: "9px 0",
      borderTop: i ? "var(--border-hairline) solid var(--color-border)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-body-l)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-strong)"
    }
  }, it.qty ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      marginRight: 6
    }
  }, it.qty, "\xD7") : null, it.name), it.note ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)",
      marginTop: 3,
      lineHeight: "var(--lh-snug)"
    }
  }, it.note) : null, it.topper ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-block",
      fontSize: "var(--fs-tiny)",
      color: "var(--color-accent)",
      background: "var(--color-accent-soft)",
      padding: "4px 8px",
      borderRadius: "var(--radius-xs)",
      marginTop: 5,
      lineHeight: "var(--lh-normal)"
    }
  }, it.topper) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-body-l)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)",
      whiteSpace: "nowrap"
    }
  }, it.price)))) : null);
}
Object.assign(__ds_scope, { OrderCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/OrderCard.jsx", error: String((e && e.message) || e) }); }

// components/data/Sparkline.jsx
try { (() => {
function Sparkline({
  data = [],
  width = 160,
  height = 40,
  color = "var(--color-accent)",
  fill = true,
  strokeWidth = 2
}) {
  if (!data.length) return null;
  const max = Math.max(...data),
    min = Math.min(...data),
    span = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const pts = data.map((v, i) => [i * step, height - (v - min) / span * (height - strokeWidth * 2) - strokeWidth]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const id = React.useId ? React.useId().replace(/:/g, "") : "sp";
  return /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: height,
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: "none",
    style: {
      display: "block",
      overflow: "visible"
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: id,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: color,
    stopOpacity: ".22"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: color,
    stopOpacity: "0"
  }))), fill ? /*#__PURE__*/React.createElement("path", {
    d: `${d} L ${width} ${height} L 0 ${height} Z`,
    fill: `url(#${id})`,
    stroke: "none"
  }) : null, /*#__PURE__*/React.createElement("path", {
    d: d,
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    vectorEffect: "non-scaling-stroke"
  }));
}
Object.assign(__ds_scope, { Sparkline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Sparkline.jsx", error: String((e && e.message) || e) }); }

// components/data/StatCard.jsx
try { (() => {
function StatCard({
  label,
  value,
  unit,
  delta,
  deltaLabel,
  icon,
  tone = "neutral",
  chart,
  style
}) {
  const up = typeof delta === "number" ? delta >= 0 : null;
  const accentBg = tone === "accent" ? "var(--color-accent-soft)" : "var(--color-surface)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      padding: "var(--space-8)",
      background: accentBg,
      border: "var(--border-hairline) solid " + (tone === "accent" ? "var(--terracotta-200)" : "var(--color-border)"),
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-card)",
      fontFamily: "var(--font-ui)",
      minWidth: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)"
    }
  }, icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 34,
      height: 34,
      borderRadius: "var(--radius-sm)",
      flex: "0 0 auto",
      background: tone === "accent" ? "var(--color-accent)" : "var(--color-surface-3)",
      color: tone === "accent" ? "var(--color-accent-contrast)" : "var(--text-body)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18
  })) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-small)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-muted)"
    }
  }, label)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-display-s)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)",
      letterSpacing: "var(--ls-display)",
      lineHeight: "var(--lh-tight)"
    }
  }, value), unit ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-s)",
      color: "var(--text-muted)",
      fontWeight: "var(--fw-medium)"
    }
  }, unit) : null), chart, delta != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      padding: "2px 7px",
      borderRadius: "var(--radius-pill)",
      background: up ? "var(--action-paid-bg)" : "var(--status-cancelado-bg)",
      color: up ? "var(--action-paid)" : "var(--status-cancelado-fg)",
      fontWeight: "var(--fw-semibold)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: up ? "arrow-up-right" : "arrow-down-right",
    size: 12
  }), Math.abs(delta), "%"), deltaLabel) : null);
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/data/UserChip.jsx
try { (() => {
function UserChip({
  name,
  role,
  src,
  initials,
  compact = false,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-ui)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      flex: "0 0 auto",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      background: "var(--color-accent-soft)",
      color: "var(--color-accent)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "var(--fs-body-s)",
      fontWeight: "var(--fw-bold)"
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials || String(name || "?").slice(0, 1)), compact ? null : /*#__PURE__*/React.createElement("span", {
    style: {
      lineHeight: 1.25,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--fs-body-s)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)"
    }
  }, name), role ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)"
    }
  }, role) : null));
}
Object.assign(__ds_scope, { UserChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/UserChip.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ConfirmDialog.jsx
try { (() => {
function ConfirmDialog({
  open = true,
  icon = "circle-check",
  tone = "accent",
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel
}) {
  if (!open) return null;
  const color = tone === "danger" ? "var(--action-danger)" : tone === "warn" ? "var(--action-warn)" : "var(--color-accent)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-10)",
      background: "var(--overlay-scrim)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--color-surface)",
      borderRadius: "var(--radius-lg)",
      maxWidth: 340,
      width: "100%",
      padding: "22px 20px",
      textAlign: "center",
      boxShadow: "var(--shadow-modal)",
      fontFamily: "var(--font-ui)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      margin: "0 auto var(--space-5)",
      borderRadius: "var(--radius-pill)",
      background: "var(--color-surface-3)",
      color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 25
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-title)",
      fontWeight: "var(--fw-bold)",
      color: "var(--text-strong)",
      marginBottom: 6
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-body-s)",
      color: "var(--text-body)",
      lineHeight: "var(--lh-normal)",
      marginBottom: "var(--space-9)"
    }
  }, message), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    block: true,
    onClick: onCancel
  }, cancelLabel), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    block: true,
    tone: tone === "danger" ? "danger" : "accent",
    onClick: onConfirm
  }, confirmLabel))));
}
Object.assign(__ds_scope, { ConfirmDialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ConfirmDialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
function Modal({
  open = true,
  title,
  subtitle,
  children,
  footer,
  onClose,
  width = 580,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-10)",
      background: "var(--overlay-scrim)"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "var(--color-surface)",
      borderRadius: "var(--radius-lg)",
      width: "100%",
      maxWidth: width,
      maxHeight: "90%",
      overflowY: "auto",
      padding: "22px 20px",
      boxShadow: "var(--shadow-modal)",
      fontFamily: "var(--font-ui)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-title)",
      fontWeight: "var(--fw-bold)",
      color: "var(--text-strong)"
    }
  }, title) : null, subtitle ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontSize: "var(--fs-body-s)",
      color: "var(--text-body)",
      lineHeight: "var(--lh-normal)"
    }
  }, subtitle) : null), onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "Fechar",
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "var(--text-muted)",
      display: "flex",
      padding: 2
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 19
  })) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-7)"
    }
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-5)",
      marginTop: "var(--space-8)"
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function Toast({
  children,
  tone = "neutral",
  icon,
  visible = true,
  style
}) {
  const fg = tone === "success" ? "var(--action-paid-line)" : tone === "danger" ? "var(--action-danger)" : "#fff";
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      position: "absolute",
      bottom: "var(--space-11)",
      left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      opacity: visible ? 1 : 0,
      transition: `all var(--dur-base) var(--ease-standard)`,
      display: "inline-flex",
      alignItems: "center",
      gap: 9,
      padding: "12px 20px",
      background: "#222",
      color: "#fff",
      borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-body-l)",
      whiteSpace: "nowrap",
      pointerEvents: "none",
      zIndex: 999,
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 17,
    style: {
      color: fg
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function Field({
  label,
  hint,
  error,
  required,
  children,
  span,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
      gridColumn: span ? `span ${span}` : undefined,
      fontFamily: "var(--font-ui)",
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "var(--ls-label)"
    }
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--action-danger)"
    }
  }, " *") : null) : null, children, error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--action-danger)"
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)"
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  prefix,
  suffix,
  invalid,
  size = "md",
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const pad = size === "sm" ? "7px 9px" : "9px 11px";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "var(--color-surface)",
      border: `var(--border-hairline) solid ${invalid ? "var(--action-danger)" : focus ? "var(--color-accent)" : "var(--color-border)"}`,
      borderRadius: "var(--radius-xs)",
      padding: pad,
      transition: "var(--transition-control)",
      boxShadow: focus ? "var(--focus-ring)" : "none",
      ...style
    }
  }, prefix ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      display: "flex"
    }
  }, prefix) : null, /*#__PURE__*/React.createElement("input", _extends({
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    }
  }, rest, {
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-body-s)",
      color: "var(--text-strong)"
    }
  })), suffix ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      display: "flex",
      fontSize: "var(--fs-tiny)"
    }
  }, suffix) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Buscar por nome, telefone, valor, ID…",
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flex: 1,
      minWidth: 0,
      background: "var(--color-surface-2)",
      border: `var(--border-hairline) solid ${focus ? "var(--color-accent)" : "var(--color-border)"}`,
      borderRadius: "var(--radius-pill)",
      padding: "9px 14px",
      boxShadow: focus ? "var(--focus-ring)" : "none",
      transition: "var(--transition-control)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "search",
    size: 17,
    style: {
      color: "var(--text-muted)"
    }
  }), /*#__PURE__*/React.createElement("input", _extends({
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false)
  }, rest, {
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-body-s)",
      color: "var(--text-strong)"
    }
  })), value ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClear,
    "aria-label": "Limpar busca",
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "var(--text-muted)",
      display: "flex",
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 16
  })) : null);
}
Object.assign(__ds_scope, { SearchInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  options = [],
  accent = false,
  size = "md",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      width: "100%",
      background: "var(--color-surface)",
      border: `${accent ? "var(--border-control)" : "var(--border-hairline)"} solid ${accent ? "var(--color-accent)" : "var(--color-border)"}`,
      borderRadius: "var(--radius-xs)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("select", _extends({}, rest, {
    style: {
      appearance: "none",
      width: "100%",
      border: "none",
      outline: "none",
      background: "transparent",
      padding: size === "sm" ? "7px 30px 7px 9px" : "9px 32px 9px 11px",
      cursor: "pointer",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-body-s)",
      fontWeight: accent ? "var(--fw-semibold)" : "var(--fw-regular)",
      color: accent ? "var(--color-accent)" : "var(--text-strong)"
    }
  }), options.map(o => typeof o === "string" ? /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o) : /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 15,
    style: {
      position: "absolute",
      right: 9,
      pointerEvents: "none",
      color: accent ? "var(--color-accent)" : "var(--text-muted)"
    }
  }));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/navigation/DropdownMenu.jsx
try { (() => {
function DropdownMenu({
  trigger,
  items = [],
  open: openProp,
  onOpenChange,
  align = "right",
  style
}) {
  const [openState, setOpenState] = React.useState(false);
  const open = openProp != null ? openProp : openState;
  const setOpen = v => {
    onOpenChange ? onOpenChange(v) : setOpenState(v);
  };
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const away = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => setOpen(!open)
  }, trigger), open ? /*#__PURE__*/React.createElement("div", {
    role: "menu",
    style: {
      position: "absolute",
      top: "calc(100% + 6px)",
      [align]: 0,
      zIndex: 40,
      display: "flex",
      flexDirection: "column",
      gap: 2,
      minWidth: 220,
      padding: 6,
      background: "var(--color-surface)",
      border: "var(--border-hairline) solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-pop)",
      fontFamily: "var(--font-ui)"
    }
  }, items.map((it, i) => it.divider ? /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      height: 1,
      background: "var(--color-border)",
      margin: "4px 0"
    }
  }) : /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    role: "menuitem",
    onClick: () => {
      setOpen(false);
      it.onClick && it.onClick();
    },
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      width: "100%",
      textAlign: "left",
      padding: "9px 10px",
      borderRadius: "var(--radius-xs)",
      border: "none",
      cursor: "pointer",
      background: "transparent",
      color: it.tone === "danger" ? "var(--action-danger)" : "var(--text-body)",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-small)",
      fontWeight: "var(--fw-semibold)",
      whiteSpace: "nowrap"
    }
  }, it.icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: it.icon,
    size: 16
  }) : null, it.label))) : null);
}
Object.assign(__ds_scope, { DropdownMenu });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/DropdownMenu.jsx", error: String((e && e.message) || e) }); }

// components/navigation/FilterPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function FilterPill({
  children,
  icon,
  trailingIcon = "chevron-down",
  active = false,
  as = "button",
  style,
  ...rest
}) {
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    type: as === "button" ? "button" : undefined,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "8px 14px",
      borderRadius: "var(--radius-pill)",
      cursor: "pointer",
      whiteSpace: "nowrap",
      background: active ? "var(--color-accent-soft)" : "var(--color-surface)",
      border: `var(--border-hairline) solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
      color: active ? "var(--color-accent)" : "var(--text-body)",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-small)",
      fontWeight: "var(--fw-semibold)",
      transition: "var(--transition-control)",
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 15
  }) : null, children, trailingIcon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: trailingIcon,
    size: 14,
    style: {
      opacity: .7
    }
  }) : null);
}
Object.assign(__ds_scope, { FilterPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/FilterPill.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SidebarNav.jsx
try { (() => {
function SidebarNav({
  items = [],
  value,
  onChange,
  expanded = false,
  logo,
  footer,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      width: expanded ? "var(--sidebar-w)" : "var(--rail-w)",
      flex: "0 0 auto",
      padding: "var(--space-6)",
      background: "var(--color-surface)",
      borderRight: "var(--border-hairline) solid var(--color-border)",
      fontFamily: "var(--font-ui)",
      transition: "width var(--dur-base) var(--ease-standard)",
      height: "100%",
      boxSizing: "border-box",
      ...style
    }
  }, logo ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "var(--space-2) var(--space-2) var(--space-8)"
    }
  }, logo) : null, items.map(it => {
    const active = it.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      onClick: () => onChange && onChange(it.id),
      title: it.label,
      "aria-current": active ? "page" : undefined,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        justifyContent: expanded ? "flex-start" : "center",
        padding: expanded ? "10px 12px" : 0,
        minHeight: "var(--icon-tile)",
        width: "100%",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        border: "var(--border-hairline) solid " + (active ? "transparent" : "var(--color-border-soft)"),
        background: active ? "var(--color-accent)" : "transparent",
        color: active ? "var(--color-accent-contrast)" : "var(--text-body)",
        fontFamily: "var(--font-ui)",
        fontSize: "var(--fs-body-s)",
        fontWeight: "var(--fw-medium)",
        transition: "var(--transition-control)",
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: expanded ? "auto" : "100%",
        display: "flex",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 21
    })), expanded ? /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        textAlign: "left"
      }
    }, it.label) : null, it.count ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: expanded ? "static" : "absolute",
        top: 6,
        right: 6,
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        borderRadius: "var(--radius-pill)",
        background: active ? "rgba(255,255,255,.28)" : "var(--color-accent)",
        color: active ? "var(--color-accent-contrast)" : "var(--color-accent-contrast)",
        fontSize: "var(--fs-micro)",
        fontWeight: "var(--fw-bold)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, it.count) : null);
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), footer);
}
Object.assign(__ds_scope, { SidebarNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SidebarNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  items = [],
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "flex",
      gap: 2,
      borderBottom: "var(--border-tab) solid var(--color-border)",
      overflowX: "auto",
      fontFamily: "var(--font-ui)",
      scrollbarWidth: "none",
      ...style
    }
  }, items.map(it => {
    const active = it.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      role: "tab",
      "aria-selected": active,
      type: "button",
      onClick: () => onChange && onChange(it.id),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
        padding: "12px 14px",
        marginBottom: "calc(var(--border-tab) * -1)",
        background: "none",
        border: "none",
        cursor: "pointer",
        borderBottom: `var(--border-tab) solid ${active ? "var(--color-accent)" : "transparent"}`,
        color: active ? "var(--color-accent)" : "var(--text-muted)",
        fontSize: "var(--fs-body)",
        fontWeight: active ? "var(--fw-semibold)" : "var(--fw-medium)",
        transition: "var(--transition-control)"
      }
    }, it.label, it.count != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: "var(--fw-semibold)",
        color: active ? "var(--color-accent)" : "var(--text-muted)"
      }
    }, it.count) : null);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Topbar.jsx
try { (() => {
function Topbar({
  title,
  subtitle,
  search,
  actions,
  user,
  style
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-7)",
      flexWrap: "wrap",
      minHeight: "var(--topbar-h)",
      padding: "var(--space-6) var(--space-10)",
      background: "var(--color-surface)",
      borderBottom: "var(--border-hairline) solid var(--color-border)",
      fontFamily: "var(--font-ui)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-heading)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)",
      lineHeight: "var(--lh-tight)"
    }
  }, title) : null, subtitle ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 3,
      fontSize: "var(--fs-body-s)",
      color: "var(--text-muted)"
    }
  }, subtitle) : null), search ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 220,
      maxWidth: 420,
      display: "flex"
    }
  }, search) : /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--gap-inline)"
    }
  }, actions) : null, user);
}
Object.assign(__ds_scope, { Topbar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Topbar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Agenda.jsx
try { (() => {
const DS = window.DLuhFestasDesignSystem_c861a2;
const {
  Card,
  Badge,
  Button,
  IconButton,
  FilterPill,
  StatusBadge,
  EmptyState,
  Icon,
  ListRow
} = DS;
const TIPOS = {
  encomenda: {
    rot: "Encomenda",
    cor: "var(--color-accent)",
    tint: "var(--color-accent-soft)",
    icone: "cake-slice"
  },
  buffet: {
    rot: "Buffet",
    cor: "var(--action-charge-entry)",
    tint: "var(--status-confirmado-bg)",
    icone: "chef-hat"
  },
  festa: {
    rot: "Festa",
    cor: "var(--action-charge-total)",
    tint: "var(--status-preparo-bg)",
    icone: "party-popper"
  },
  boleto: {
    rot: "Boleto",
    cor: "var(--action-warn)",
    tint: "var(--action-warn-bg)",
    icone: "barcode",
    fin: true
  },
  cartao: {
    rot: "Cartão",
    cor: "var(--action-delivered)",
    tint: "rgba(15,118,110,.12)",
    icone: "credit-card",
    fin: true
  }
};
const SITUACAO = {
  "A vencer": "warn",
  "Vence hoje": "warn",
  "Vencido": "danger",
  "Pago": "success"
};
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
function TipoDot({
  tipo,
  size = 7
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: "var(--radius-pill)",
      background: TIPOS[tipo].cor,
      flex: "0 0 auto"
    }
  });
}
function Calendario({
  ano,
  mes,
  sel,
  onSel,
  itens,
  compact
}) {
  const primeiro = new Date(ano, mes, 1).getDay();
  const dias = new Date(ano, mes + 1, 0).getDate();
  const celulas = [];
  for (let i = 0; i < primeiro; i++) celulas.push(null);
  for (let d = 1; d <= dias; d++) celulas.push(d);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 4,
      marginBottom: 6
    }
  }, DIAS.map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      textAlign: "center",
      fontSize: "var(--fs-micro)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "var(--ls-label)"
    }
  }, d))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 4
    }
  }, celulas.map((d, i) => {
    if (!d) return /*#__PURE__*/React.createElement("div", {
      key: "e" + i
    });
    const chave = ano + "-" + String(mes + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    const doDia = itens.filter(x => x.data === chave);
    const ativo = sel === chave;
    const hoje = chave === "2026-06-12";
    return /*#__PURE__*/React.createElement("button", {
      key: chave,
      type: "button",
      onClick: () => onSel(chave),
      style: {
        minHeight: compact ? 46 : 74,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 4,
        padding: compact ? "5px 4px" : "7px 8px",
        cursor: "pointer",
        textAlign: "left",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-ui)",
        background: ativo ? "var(--color-accent)" : doDia.length ? "var(--color-surface-2)" : "transparent",
        border: "var(--border-hairline) solid " + (ativo ? "transparent" : hoje ? "var(--color-accent)" : "var(--color-border-soft)"),
        color: ativo ? "var(--color-accent-contrast)" : "var(--text-strong)",
        transition: "var(--transition-control)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-tiny)",
        fontWeight: hoje || ativo ? "var(--fw-bold)" : "var(--fw-medium)"
      }
    }, d), compact ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        gap: 2,
        flexWrap: "wrap"
      }
    }, doDia.slice(0, 3).map((x, k) => /*#__PURE__*/React.createElement(TipoDot, {
      key: k,
      tipo: x.tipo,
      size: 5
    }))) : /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 3,
        minWidth: 0
      }
    }, doDia.slice(0, 2).map((x, k) => /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 5px",
        borderRadius: 4,
        background: ativo ? "rgba(255,255,255,.22)" : TIPOS[x.tipo].tint,
        color: ativo ? "inherit" : TIPOS[x.tipo].cor,
        fontSize: 9.5,
        fontWeight: "var(--fw-semibold)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, x.hora ? x.hora + " " : "", x.cliente.split(" ")[0])), doDia.length > 2 ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        color: ativo ? "inherit" : "var(--text-muted)",
        paddingLeft: 5
      }
    }, "+", doDia.length - 2) : null));
  })));
}
function ItemAgenda({
  x
}) {
  const t = TIPOS[x.tipo];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      padding: "12px 13px",
      borderRadius: "var(--radius-sm)",
      background: "var(--color-surface)",
      border: "var(--border-hairline) solid var(--color-border)",
      borderLeft: "3px solid " + t.cor,
      fontFamily: "var(--font-ui)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      flex: "0 0 auto",
      borderRadius: "var(--radius-sm)",
      background: t.tint,
      color: t.cor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.icone,
    size: 19
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-l)",
      fontWeight: "var(--fw-semibold)"
    }
  }, x.cliente), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      color: t.cor
    }
  }, t.rot)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)",
      marginTop: 3,
      lineHeight: "var(--lh-snug)"
    }
  }, x.titulo), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 7,
      flexWrap: "wrap",
      fontSize: "var(--fs-tiny)",
      color: "var(--text-body)"
    }
  }, x.hora ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 13
  }), x.hora) : null, x.forma ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "wallet",
    size: 13
  }), x.forma) : null, x.parcela ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "layers",
    size: 13
  }), "Parcela ", x.parcela) : null, x.local ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 13
  }), x.local) : null, x.convidados ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "users",
    size: 13
  }), x.convidados, " convidados") : null)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      flex: "0 0 auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-l)",
      fontWeight: "var(--fw-bold)",
      whiteSpace: "nowrap",
      color: t.fin ? "var(--action-danger)" : "var(--text-strong)"
    }
  }, t.fin ? "− " + x.valor : x.valor), t.fin ? /*#__PURE__*/React.createElement(Badge, {
    tone: SITUACAO[x.situacao] || "neutral"
  }, x.situacao) : /*#__PURE__*/React.createElement(StatusBadge, {
    status: x.status,
    short: true
  })));
}
function Agenda({
  compact
}) {
  const [filtro, setFiltro] = React.useState("tudo");
  const [sel, setSel] = React.useState("2026-06-12");
  const [mes, setMes] = React.useState(5);
  const ano = 2026;
  const todos = window.DLUH.agenda;
  const itens = filtro === "tudo" ? todos : todos.filter(x => x.tipo === filtro);
  const doDia = itens.filter(x => x.data === sel).sort((a, b) => (a.hora || "00:00").localeCompare(b.hora || "00:00"));
  const proximos = itens.filter(x => x.data > sel).sort((a, b) => (a.data + (a.hora || "")).localeCompare(b.data + (b.hora || ""))).slice(0, 4);
  const [aa, mm, dd] = sel.split("-");
  const dataLonga = Number(dd) + " de " + MESES[Number(mm) - 1];
  const mesChave = ano + "-" + String(mes + 1).padStart(2, "0");
  const aPagar = todos.filter(x => TIPOS[x.tipo].fin && x.situacao !== "Pago" && x.data.slice(0, 7) === mesChave).reduce((s, x) => s + Number(x.valor.replace(/[^\d,]/g, "").replace(",", ".")), 0);
  const contagem = t => todos.filter(x => x.tipo === t && x.data.slice(0, 7) === ano + "-" + String(mes + 1).padStart(2, "0")).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--gap-inline)",
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(FilterPill, {
    active: filtro === "tudo",
    trailingIcon: null,
    onClick: () => setFiltro("tudo")
  }, "Tudo"), Object.keys(TIPOS).map(k => /*#__PURE__*/React.createElement(FilterPill, {
    key: k,
    active: filtro === k,
    trailingIcon: null,
    icon: TIPOS[k].icone,
    onClick: () => setFiltro(k)
  }, TIPOS[k].rot, " \xB7 ", contagem(k))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Badge, {
    tone: "warn",
    icon: "receipt"
  }, "A pagar no m\xEAs: R$ ", aPagar.toLocaleString("pt-BR", {
    minimumFractionDigits: 2
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: compact ? "1fr" : "1.35fr 1fr",
      gap: 12,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    header: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(IconButton, {
      icon: "chevron-left",
      label: "M\xEAs anterior",
      size: 32,
      onClick: () => setMes((mes + 11) % 12)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: "var(--fs-heading)",
        fontWeight: "var(--fw-semibold)",
        minWidth: 150,
        textAlign: "center",
        textTransform: "capitalize"
      }
    }, MESES[mes], " ", ano), /*#__PURE__*/React.createElement(IconButton, {
      icon: "chevron-right",
      label: "Pr\xF3ximo m\xEAs",
      size: 32,
      onClick: () => setMes((mes + 1) % 12)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        flexWrap: "wrap"
      }
    }, Object.keys(TIPOS).map(k => /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: "var(--fs-tiny)",
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement(TipoDot, {
      tipo: k
    }), TIPOS[k].rot))))
  }, /*#__PURE__*/React.createElement(Calendario, {
    ano: ano,
    mes: mes,
    sel: sel,
    onSel: setSel,
    itens: itens,
    compact: compact
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Card, {
    header: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)"
      }
    }, dataLonga), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-tiny)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, doDia.length ? doDia.length + (doDia.length === 1 ? " compromisso" : " compromissos") : "Dia livre"))),
    bodyStyle: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    },
    padded: doDia.length > 0
  }, doDia.length ? doDia.map((x, i) => /*#__PURE__*/React.createElement(ItemAgenda, {
    key: i,
    x: x
  })) : /*#__PURE__*/React.createElement(EmptyState, {
    icon: "calendar-check",
    title: "Nada marcado nesse dia",
    description: "Encomendas, eventos, boletos e faturas de cart\xE3o aparecem aqui automaticamente."
  })), proximos.length ? /*#__PURE__*/React.createElement(Card, {
    header: /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)"
      }
    }, "Pr\xF3ximos"),
    bodyStyle: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, proximos.map((x, i) => /*#__PURE__*/React.createElement(ListRow, {
    key: i,
    icon: TIPOS[x.tipo].icone,
    title: x.cliente,
    subtitle: TIPOS[x.tipo].rot + " · " + x.data.split("-").reverse().slice(0, 2).join("/") + (x.hora ? " · " + x.hora : ""),
    value: TIPOS[x.tipo].fin ? "− " + x.valor : x.valor,
    tone: TIPOS[x.tipo].fin ? "out" : "neutral",
    onClick: () => setSel(x.data)
  }))) : null)));
}
Object.assign(window, {
  Agenda,
  TIPOS_AGENDA: TIPOS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Agenda.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/App.jsx
try { (() => {
function useCompact() {
  const mq = "(max-width: 760px)";
  const [c, setC] = React.useState(() => window.matchMedia(mq).matches);
  React.useEffect(() => {
    const m = window.matchMedia(mq),
      f = e => setC(e.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return c;
}
function App() {
  const [view, setView] = React.useState("visao");
  const compact = useCompact();
  const [theme, setTheme] = React.useState("dark");
  const [q, setQ] = React.useState("");
  const Screen = {
    visao: window.VisaoGeral,
    pedidos: window.Pedidos,
    agenda: window.Agenda,
    cozinha: window.Cozinha,
    financeiro: window.Financeiro
  }[view];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100dvh"
    }
  }, /*#__PURE__*/React.createElement(window.Shell, {
    view: view,
    onView: setView,
    compact: compact,
    theme: theme,
    onTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    q: q,
    onQ: setQ
  }, Screen ? /*#__PURE__*/React.createElement(Screen, {
    compact: compact,
    q: q,
    onView: setView
  }) : null));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Busca.jsx
try { (() => {
const BX = window.DLuhFestasDesignSystem_c861a2;
const norm = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const dataBR = iso => iso.slice(8, 10) + "/" + iso.slice(5, 7);
function indiceBusca() {
  const d = window.DLUH,
    ag = d.agenda;
  return [{
    id: "pedidos",
    label: "Pedidos",
    icon: "receipt-text",
    view: "pedidos",
    itens: d.pedidos.map(p => ({
      title: p.cliente,
      sub: p.id + " · " + p.status,
      value: p.total,
      busca: [p.cliente, p.id, p.tel, p.status, ...p.itens.map(i => i.name)],
      q: p.id
    }))
  }, {
    id: "eventos",
    label: "Eventos",
    icon: "party-popper",
    view: "agenda",
    itens: ag.filter(e => e.tipo === "buffet" || e.tipo === "festa").map(e => ({
      title: e.titulo,
      sub: e.cliente + " · " + dataBR(e.data) + " " + e.hora + (e.local ? " · " + e.local : ""),
      value: e.valor,
      busca: [e.titulo, e.cliente, e.local]
    }))
  }, {
    id: "pagamentos",
    label: "Pagamentos",
    icon: "wallet",
    view: "visao",
    itens: d.pagamentos.map(p => ({
      title: p.title,
      sub: p.sub,
      value: p.value,
      tone: p.tone,
      busca: [p.title, p.sub]
    }))
  }, {
    id: "boletos",
    label: "Boletos",
    icon: "file-text",
    view: "agenda",
    itens: ag.filter(e => e.tipo === "boleto").map(e => ({
      title: e.cliente,
      sub: e.titulo + " · vence " + dataBR(e.data) + " · " + e.situacao,
      value: e.valor,
      busca: [e.cliente, e.titulo, e.situacao]
    }))
  }, {
    id: "cartoes",
    label: "Cartões",
    icon: "credit-card",
    view: "agenda",
    itens: ag.filter(e => e.tipo === "cartao").map(e => ({
      title: e.cliente,
      sub: e.titulo + " · " + dataBR(e.data) + " · " + e.situacao,
      value: e.valor,
      busca: [e.cliente, e.titulo, e.situacao]
    }))
  }];
}
function ResultadoRow({
  grupo,
  it,
  onPick
}) {
  const [h, setH] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onMouseDown: e => e.preventDefault(),
    onClick: () => onPick(grupo, it),
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      padding: "8px 10px",
      border: "none",
      borderRadius: "var(--radius-sm)",
      background: h ? "var(--color-accent-soft)" : "transparent",
      cursor: "pointer",
      textAlign: "left",
      fontFamily: "var(--font-ui)",
      color: "var(--text-strong)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "0 0 32px",
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-sm)",
      border: "var(--border-hairline) solid var(--color-border)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement(BX.Icon, {
    name: grupo.icon,
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-s)",
      fontWeight: "var(--fw-semibold)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, it.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, it.sub)), it.value ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-s)",
      fontWeight: "var(--fw-semibold)",
      whiteSpace: "nowrap",
      color: it.tone === "in" ? "var(--action-success, var(--text-strong))" : it.tone === "out" ? "var(--action-danger)" : "var(--text-strong)"
    }
  }, it.value) : null);
}
function GlobalSearch({
  q,
  onQ,
  onView
}) {
  const [open, setOpen] = React.useState(false);
  const indice = React.useMemo(indiceBusca, []);
  const t = norm(q).trim();
  const grupos = t ? indice.map(g => ({
    ...g,
    achados: g.itens.filter(it => it.busca.some(s => norm(s).includes(t)))
  })).filter(g => g.achados.length) : [];
  const total = grupos.reduce((s, g) => s + g.achados.length, 0);
  const pick = (g, it) => {
    onView(g.view);
    onQ(it.q || "");
    setOpen(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "100%"
    },
    onKeyDown: e => e.key === "Escape" && setOpen(false)
  }, /*#__PURE__*/React.createElement(BX.SearchInput, {
    value: q,
    onChange: e => {
      onQ(e.target.value);
      setOpen(true);
    },
    onClear: () => onQ(""),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    placeholder: "Pesquise aqui qualquer coisa",
    style: {
      width: "100%",
      maxWidth: "none"
    }
  }), open && t ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "calc(100% + 8px)",
      left: 0,
      right: 0,
      zIndex: 50,
      maxHeight: "min(70vh, 560px)",
      overflowY: "auto",
      padding: 8,
      borderRadius: "var(--radius-md)",
      border: "var(--border-hairline) solid var(--color-border)",
      background: "var(--color-surface)",
      boxShadow: "0 16px 48px rgba(0,0,0,.28)"
    }
  }, total ? grupos.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.id,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      paddingBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "8px 10px 4px",
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "var(--ls-label)"
    }
  }, /*#__PURE__*/React.createElement("span", null, g.label), /*#__PURE__*/React.createElement("span", null, g.achados.length)), g.achados.slice(0, 5).map((it, i) => /*#__PURE__*/React.createElement(ResultadoRow, {
    key: i,
    grupo: g,
    it: it,
    onPick: pick
  })))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 10px",
      fontSize: "var(--fs-body-s)",
      color: "var(--text-muted)",
      textAlign: "center"
    }
  }, "Nada encontrado para \u201C", q, "\u201D.")) : null);
}
Object.assign(window, {
  GlobalSearch
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Busca.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Contratos.jsx
try { (() => {
const DS = window.DLuhFestasDesignSystem_c861a2;
const {
  Card,
  Button,
  IconButton,
  Badge,
  Field,
  Input,
  Select,
  Icon,
  Toast,
  ListRow,
  FilterPill
} = DS;
const fmtData = v => {
  if (!v) return "";
  const p = String(v).split("-");
  return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : v;
};
const fmtMoeda = v => {
  const n = Number(String(v).replace(",", "."));
  return isNaN(n) || !String(v).length ? "" : n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
function preencher(texto, vals, modelo) {
  return String(texto).replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (k === "equipe") {
      const e = [["garcons", "garçom", "garçons"], ["cozinheiras", "cozinheira", "cozinheiras"], ["organizadores", "organizador", "organizadores"], ["auxiliares", "auxiliar", "auxiliares"]].filter(([id]) => Number(vals[id]) > 0).map(([id, s, p]) => vals[id] + " " + (Number(vals[id]) === 1 ? s : p));
      return e.length ? e.join(", ") : "__________";
    }
    const campo = modelo.grupos.flatMap(g => g.campos).find(c => c.id === k);
    let v = vals[k];
    if (v == null || v === "") return "__________";
    if (campo && campo.tipo === "date") v = fmtData(v);
    if (campo && campo.tipo === "dinheiro") v = "R$ " + fmtMoeda(v);
    return v;
  });
}
function EscolhaTipo({
  modelos,
  valor,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: 10
    }
  }, modelos.map(m => {
    const on = m.id === valor;
    return /*#__PURE__*/React.createElement("button", {
      key: m.id,
      type: "button",
      onClick: () => onChange(m.id),
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        textAlign: "left",
        cursor: "pointer",
        padding: "14px 16px",
        borderRadius: "var(--radius-lg)",
        background: on ? "var(--color-accent-soft)" : "var(--color-surface)",
        border: (on ? "var(--border-control)" : "var(--border-hairline)") + " solid " + (on ? "var(--color-accent)" : "var(--color-border)"),
        boxShadow: on ? "none" : "var(--shadow-card)",
        fontFamily: "var(--font-ui)",
        transition: "var(--transition-control)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: "var(--icon-tile)",
        height: "var(--icon-tile)",
        flex: "0 0 auto",
        borderRadius: "var(--radius-md)",
        background: on ? "var(--color-accent)" : "var(--color-surface-3)",
        color: on ? "var(--color-accent-contrast)" : "var(--text-body)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: m.icone,
      size: 24
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-body-l)",
        fontWeight: "var(--fw-semibold)",
        color: on ? "var(--color-accent)" : "var(--text-strong)"
      }
    }, m.nome), on ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16,
      color: "var(--color-accent)"
    }) : null), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: "var(--fs-tiny)",
        color: "var(--text-muted)",
        marginTop: 4,
        lineHeight: "var(--lh-snug)"
      }
    }, m.descricao)));
  }));
}
function Previa({
  modelo,
  vals
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      color: "#1a1a1a",
      padding: "34px 38px",
      borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-ui)",
      fontSize: 11.5,
      lineHeight: 1.65,
      boxShadow: "var(--shadow-soft)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-dluh-festas.png",
    alt: "D'Luh Festas",
    style: {
      height: 62,
      objectFit: "contain"
    }
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 15,
      fontWeight: 700,
      textAlign: "center",
      margin: "0 0 18px",
      lineHeight: 1.3
    }
  }, modelo.titulo, vals.salao_nome ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("br", null), vals.salao_nome) : null), preencher(modelo.abertura, vals, modelo).split("\n\n").map((p, i) => /*#__PURE__*/React.createElement("p", {
    key: i,
    style: {
      margin: "0 0 10px",
      whiteSpace: "pre-line",
      textAlign: "justify"
    }
  }, p)), modelo.clausulas.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      margin: "0 0 4px"
    }
  }, c.t), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      textAlign: "justify"
    }
  }, preencher(c.c, vals, modelo)), (c.sub || []).map((s, k) => /*#__PURE__*/React.createElement("p", {
    key: k,
    style: {
      margin: "5px 0 0",
      textAlign: "justify"
    }
  }, preencher(s, vals, modelo))))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "22px 0 0"
    }
  }, (vals.cidade || "Montes Claros") + ", ____ de __________ de ______"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: modelo.assinaturas.length > 2 ? "1fr 1fr" : "1fr 1fr",
      gap: "26px 34px",
      marginTop: 26
    }
  }, modelo.assinaturas.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #1a1a1a",
      paddingTop: 5,
      fontSize: 10.5
    }
  }, a)))));
}
const CT_KEY = "dluh-admin-contratos";
const ctAgora = () => {
  const d = new Date(),
    p = x => String(x).padStart(2, "0");
  return p(d.getDate()) + "/" + p(d.getMonth() + 1) + " · " + p(d.getHours()) + ":" + p(d.getMinutes());
};
const ctPadrao = modelos => {
  const d = {};
  modelos.forEach(m => {
    d[m.id] = {};
    m.grupos.flatMap(g => g.campos).forEach(c => {
      if (c.def) d[m.id][c.id] = c.def;
    });
  });
  return d;
};
const ctCliente = c => (c.dados[c.tipo] || {}).contratante_nome || (c.dados[c.tipo] || {}).nome || "Sem nome";
const ctValor = c => {
  const v = (c.dados[c.tipo] || {}).valor_total;
  return v ? "R$ " + fmtMoeda(v) : "—";
};
function ContratoEditor({
  contrato,
  modelos,
  compact,
  onChange,
  onBack,
  onToast
}) {
  const tipo = contrato.tipo;
  const modelo = modelos.find(m => m.id === tipo);
  const vals = contrato.dados[tipo];
  const [verPrevia, setVerPrevia] = React.useState(!compact);
  const set = (id, v) => onChange({
    dados: {
      ...contrato.dados,
      [tipo]: {
        ...contrato.dados[tipo],
        [id]: v
      }
    }
  });
  React.useEffect(() => {
    if (tipo !== "salao") return;
    const t = Number(String(vals.valor_total || "").replace(",", "."));
    const e = Number(String(vals.entrada || "").replace(",", "."));
    const s = (isNaN(t) ? 0 : t) - (isNaN(e) ? 0 : e);
    const novo = s > 0 ? String(s) : "";
    if (novo !== (vals.saldo || "")) set("saldo", novo);
  }, [tipo, vals.valor_total, vals.entrada]);
  const campos = modelo.grupos.flatMap(g => g.campos);
  const faltando = campos.filter(c => c.req && !vals[c.id]).length;
  const final = contrato.status === "Finalizado";
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--gap-inline)",
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    icon: "arrow-left",
    onClick: onBack
  }, "Contratos"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-title)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)"
    }
  }, ctCliente(contrato)), /*#__PURE__*/React.createElement(Badge, {
    tone: final ? "success" : "neutral",
    icon: final ? "circle-check" : "pencil"
  }, final ? "Finalizado" : "Rascunho"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)"
    }
  }, "Salvo automaticamente \xB7 ", contrato.atualizado)), /*#__PURE__*/React.createElement(EscolhaTipo, {
    modelos: modelos,
    valor: tipo,
    onChange: t => onChange({
      tipo: t
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--gap-inline)",
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: faltando ? "warn" : "success",
    icon: faltando ? "circle-alert" : "circle-check"
  }, faltando ? faltando + " campo(s) obrigatório(s) em falta" : "Pronto para gerar"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), compact ? /*#__PURE__*/React.createElement(FilterPill, {
    trailingIcon: null,
    icon: verPrevia ? "pencil" : "eye",
    active: true,
    onClick: () => setVerPrevia(!verPrevia)
  }, verPrevia ? "Editar dados" : "Ver prévia") : null, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    icon: "printer",
    onClick: () => onToast("Contrato enviado para impressão")
  }, "Imprimir"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    icon: "download",
    onClick: () => onToast("PDF gerado")
  }, "PDF"), final ? null : /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    icon: "check",
    onClick: () => {
      onChange({
        status: "Finalizado"
      });
      onToast("Contrato finalizado");
    }
  }, "Finalizar")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: compact ? "minmax(0,1fr)" : "minmax(0,1fr) minmax(0,1.05fr)",
      gap: 12,
      alignItems: "start"
    }
  }, !compact || !verPrevia ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, modelo.grupos.map(g => /*#__PURE__*/React.createElement(Card, {
    key: g.titulo,
    header: /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)"
      }
    }, g.titulo)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: compact ? "minmax(0,1fr)" : "repeat(2, minmax(0,1fr))",
      gap: "10px 12px"
    }
  }, g.campos.map(c => /*#__PURE__*/React.createElement(Field, {
    key: c.id,
    label: c.rot,
    required: c.req,
    span: c.span,
    style: {
      gridColumn: c.span && !compact ? "span " + Math.min(c.span, 2) : undefined
    }
  }, c.tipo === "opcao" ? /*#__PURE__*/React.createElement(Select, {
    options: c.opcoes,
    value: vals[c.id] || "",
    onChange: e => set(c.id, e.target.value)
  }) : /*#__PURE__*/React.createElement(Input, {
    type: c.tipo === "date" ? "date" : c.tipo === "time" ? "time" : c.tipo === "number" || c.tipo === "dinheiro" ? "number" : "text",
    step: c.tipo === "dinheiro" ? "0.01" : undefined,
    prefix: c.tipo === "dinheiro" ? "R$" : undefined,
    placeholder: c.ph,
    readOnly: c.auto,
    value: vals[c.id] || "",
    onChange: e => set(c.id, e.target.value)
  }))))))) : null, !compact || verPrevia ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: compact ? "static" : "sticky",
      top: 0
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padded: false,
    header: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)"
      }
    }, "Pr\xE9via"), /*#__PURE__*/React.createElement(Badge, null, modelo.clausulas.length, " cl\xE1usulas")),
    bodyStyle: {
      background: "var(--color-surface-3)",
      padding: 14,
      maxHeight: compact ? "none" : 620,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(Previa, {
    modelo: modelo,
    vals: vals
  }))) : null));
}
function Contratos({
  compact
}) {
  const MODELOS = [window.DLUH_CONTRATOS.buffet, window.DLUH_CONTRATOS.salao];
  const [salvos, setSalvos] = React.useState(() => {
    try {
      const r = JSON.parse(localStorage.getItem(CT_KEY));
      if (Array.isArray(r)) return r;
    } catch (e) {}
    return window.DLUH.contratos.map((c, i) => {
      const d = ctPadrao(MODELOS),
        v = String(c.valor).replace(/[^\d,]/g, "").replace(",", ".");
      d[c.tipo] = {
        ...d[c.tipo],
        [c.tipo === "buffet" ? "contratante_nome" : "nome"]: c.cliente,
        valor_total: v
      };
      return {
        uid: "seed-" + i,
        tipo: c.tipo,
        dados: d,
        status: i === 1 ? "Rascunho" : "Finalizado",
        atualizado: c.data.slice(0, 5)
      };
    });
  });
  const [aberto, setAberto] = React.useState(null);
  const [apagar, setApagar] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const showToast = m => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };
  React.useEffect(() => {
    try {
      localStorage.setItem(CT_KEY, JSON.stringify(salvos));
    } catch (e) {}
  }, [salvos]);
  const atual = salvos.find(c => c.uid === aberto);
  const upd = patch => setSalvos(l => l.map(c => c.uid === aberto ? {
    ...c,
    ...patch,
    atualizado: ctAgora()
  } : c));
  const criar = () => {
    const c = {
      uid: "c" + Date.now(),
      tipo: "buffet",
      dados: ctPadrao(MODELOS),
      status: "Rascunho",
      atualizado: ctAgora()
    };
    setSalvos(l => [c, ...l]);
    setAberto(c.uid);
  };
  const rascunhos = salvos.filter(c => c.status !== "Finalizado").length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)",
      minHeight: "100%"
    }
  }, atual ? /*#__PURE__*/React.createElement(ContratoEditor, {
    contrato: atual,
    modelos: MODELOS,
    compact: compact,
    onChange: upd,
    onBack: () => setAberto(null),
    onToast: showToast
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--gap-inline)",
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, rascunhos ? /*#__PURE__*/React.createElement(Badge, {
    tone: "warn",
    icon: "pencil"
  }, rascunhos, " rascunho(s) em andamento") : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    icon: "plus",
    onClick: criar
  }, "Novo contrato")), /*#__PURE__*/React.createElement(Card, {
    header: /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)"
      }
    }, "Hist\xF3rico de contratos"),
    bodyStyle: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, salvos.length ? salvos.map(c => /*#__PURE__*/React.createElement(ListRow, {
    key: c.uid,
    icon: c.tipo === "buffet" ? "chef-hat" : "party-popper",
    title: ctCliente(c),
    subtitle: (c.tipo === "buffet" ? "Buffet" : "Locação do salão") + " · " + (c.status === "Finalizado" ? "Finalizado" : "Rascunho") + " · " + c.atualizado,
    value: ctValor(c),
    trailing: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginLeft: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: c.status === "Finalizado" ? "ghost" : "outline",
      icon: c.status === "Finalizado" ? "eye" : "pencil",
      onClick: () => setAberto(c.uid)
    }, c.status === "Finalizado" ? "Abrir" : "Continuar"), /*#__PURE__*/React.createElement(IconButton, {
      icon: "download",
      label: "Baixar PDF",
      size: 32,
      onClick: () => showToast("PDF gerado")
    }), /*#__PURE__*/React.createElement(IconButton, {
      icon: "trash",
      label: "Apagar",
      size: 32,
      onClick: () => setApagar(c)
    }))
  })) : /*#__PURE__*/React.createElement(DS.EmptyState, {
    icon: "file-text",
    title: "Nenhum contrato ainda",
    description: "Crie o primeiro pelo bot\xE3o Novo contrato."
  }))), apagar ? /*#__PURE__*/React.createElement(DS.ConfirmDialog, {
    tone: "danger",
    icon: "trash",
    title: "Apagar contrato?",
    message: "O contrato de " + ctCliente(apagar) + " sai do histórico. Não dá pra desfazer.",
    confirmLabel: "Sim, apagar",
    onCancel: () => setApagar(null),
    onConfirm: () => {
      setSalvos(l => l.filter(x => x.uid !== apagar.uid));
      setApagar(null);
      showToast("Contrato apagado");
    }
  }) : null, toast ? /*#__PURE__*/React.createElement(Toast, {
    tone: "success",
    icon: "check"
  }, toast) : null);
}
Object.assign(window, {
  Contratos,
  PreviaContrato: Previa
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Contratos.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Cozinha.jsx
try { (() => {
const DS = window.DLuhFestasDesignSystem_c861a2;
const {
  Card,
  Button,
  Badge,
  StatusBadge,
  IconButton,
  FilterPill,
  Icon,
  ConfirmDialog,
  Toast,
  EmptyState
} = DS;
const PAGO_TONE = {
  "Totalmente pago": "success",
  "Só entrada": "warn",
  "Não pago": "danger"
};
function FilaCard({
  p,
  onEntregar
}) {
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column"
    },
    header: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-caption)",
        fontWeight: "var(--fw-semibold)",
        color: "var(--color-accent)",
        letterSpacing: "var(--ls-caps)"
      }
    }, p.hora), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)",
        marginTop: 3
      }
    }, p.cliente)), /*#__PURE__*/React.createElement(Badge, {
      tone: PAGO_TONE[p.pago]
    }, p.pago))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-body-s)",
      color: "var(--text-body)",
      lineHeight: "var(--lh-normal)"
    }
  }, p.itens), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 14,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    icon: p.entrega === "Entrega" ? "truck" : "shopping-bag"
  }, p.entrega), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    tone: "delivered",
    icon: "check",
    onClick: () => onEntregar(p)
  }, "Feito")));
}
function Cozinha({
  compact
}) {
  const fila = window.DLUH.fila;
  const [feature, setFeature] = React.useState(0);
  const [confirm, setConfirm] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [som, setSom] = React.useState(true);
  const p = fila[feature];
  const showToast = m => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "var(--gap-section)",
      minHeight: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: "var(--radius-xl)",
      padding: compact ? "18px" : "24px 28px",
      background: "var(--color-accent)",
      color: "var(--color-accent-contrast)",
      display: "flex",
      gap: 20,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 220
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: "var(--fs-small)",
      fontWeight: "var(--fw-semibold)",
      opacity: .85
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "flame",
    size: 16
  }), " Fazer agora \xB7 ", feature + 1, " de ", fila.length), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: compact ? "var(--fs-display-s)" : "var(--fs-display)",
      fontWeight: "var(--fw-bold)",
      lineHeight: "var(--lh-tight)",
      marginTop: 8
    }
  }, p.cliente), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-subhead)",
      marginTop: 8,
      opacity: .92,
      lineHeight: "var(--lh-snug)"
    }
  }, p.itens), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 14,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: "5px 12px",
      borderRadius: "var(--radius-pill)",
      background: "rgba(255,255,255,.22)",
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)"
    }
  }, p.hora), /*#__PURE__*/React.createElement("span", {
    style: {
      padding: "5px 12px",
      borderRadius: "var(--radius-pill)",
      background: "rgba(255,255,255,.22)",
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)"
    }
  }, p.entrega), /*#__PURE__*/React.createElement("span", {
    style: {
      padding: "5px 12px",
      borderRadius: "var(--radius-pill)",
      background: "rgba(255,255,255,.22)",
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)"
    }
  }, p.pago))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: compact ? "row" : "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-left",
    label: "Anterior",
    onClick: () => setFeature((feature - 1 + fila.length) % fila.length),
    style: {
      background: "rgba(255,255,255,.16)",
      border: "1.5px solid rgba(255,255,255,.3)",
      color: "inherit"
    }
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-right",
    label: "Pr\xF3ximo",
    onClick: () => setFeature((feature + 1) % fila.length),
    style: {
      background: "rgba(255,255,255,.16)",
      border: "1.5px solid rgba(255,255,255,.3)",
      color: "inherit"
    }
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-heading)",
      fontWeight: "var(--fw-semibold)"
    }
  }, "Fila de hoje"), /*#__PURE__*/React.createElement(Badge, null, fila.length, " pedidos"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(FilterPill, {
    icon: som ? "volume-2" : "volume-x",
    trailingIcon: null,
    active: som,
    onClick: () => {
      setSom(!som);
      showToast(som ? "Alerta sonoro desligado" : "Alerta sonoro ligado");
    }
  }, "Alerta sonoro"), /*#__PURE__*/React.createElement(FilterPill, {
    icon: "printer",
    trailingIcon: null,
    onClick: () => showToast("Fila enviada para impressão")
  }, "Imprimir fila")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: compact ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))",
      gap: 12
    }
  }, fila.map(x => /*#__PURE__*/React.createElement(FilaCard, {
    key: x.id,
    p: x,
    onEntregar: setConfirm
  })))), confirm ? /*#__PURE__*/React.createElement(ConfirmDialog, {
    icon: "truck",
    title: "Pedido feito?",
    message: `${confirm.cliente} — ${confirm.entrega.toLowerCase()} às ${confirm.hora}. O que fazer com o pagamento?`,
    cancelLabel: "Sem cobrar",
    confirmLabel: "Cobrar restante",
    onCancel: () => {
      setConfirm(null);
      showToast("Pedido marcado como feito");
    },
    onConfirm: () => {
      setConfirm(null);
      showToast("Cobrança do restante enviada");
    }
  }) : null, toast ? /*#__PURE__*/React.createElement(Toast, {
    tone: "success",
    icon: "check"
  }, toast) : null);
}
function Clientes() {
  return /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(EmptyState, {
    icon: "users",
    title: "Tela de clientes ainda n\xE3o existe no produto",
    description: "O sistema atual n\xE3o tem uma vis\xE3o por cliente \u2014 o hist\xF3rico vive no Coda. Deixada em branco de prop\xF3sito."
  }));
}
Object.assign(window, {
  Cozinha,
  FilaCard,
  Clientes
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Cozinha.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Financeiro.jsx
try { (() => {
const FN = window.DLuhFestasDesignSystem_c861a2;
const FIN_TABS = [{
  id: "transacoes",
  label: "Transações",
  acao: "Nova transação"
}, {
  id: "boletos",
  label: "Boletos",
  acao: "Novo boleto"
}, {
  id: "cartoes",
  label: "Cartões",
  acao: "Novo cartão"
}, {
  id: "contratos",
  label: "Contratos"
}];
const FIN_FORM = {
  transacoes: {
    titulo: "Nova transação",
    campos: [{
      id: "desc",
      rot: "Descrição",
      span: 2
    }, {
      id: "tipo",
      rot: "Tipo",
      opcoes: ["Entrada", "Saída"]
    }, {
      id: "meio",
      rot: "Forma",
      opcoes: ["Pix", "Cartão", "Dinheiro", "Boleto", "Transferência"]
    }, {
      id: "data",
      rot: "Data",
      tipo: "date"
    }, {
      id: "valor",
      rot: "Valor",
      tipo: "dinheiro"
    }]
  },
  boletos: {
    titulo: "Novo boleto",
    campos: [{
      id: "desc",
      rot: "Fornecedor / descrição",
      span: 2
    }, {
      id: "venc",
      rot: "Vencimento",
      tipo: "date"
    }, {
      id: "valor",
      rot: "Valor",
      tipo: "dinheiro"
    }, {
      id: "codigo",
      rot: "Linha digitável",
      span: 2
    }]
  },
  cartoes: {
    titulo: "Novo cartão",
    campos: [{
      id: "nome",
      rot: "Nome do cartão",
      span: 2
    }, {
      id: "final",
      rot: "Final",
      ph: "0000"
    }, {
      id: "bandeira",
      rot: "Bandeira",
      opcoes: ["Visa", "Mastercard", "Elo", "Outra"]
    }, {
      id: "limite",
      rot: "Limite",
      tipo: "dinheiro"
    }, {
      id: "venc",
      rot: "Dia do vencimento",
      tipo: "number"
    }]
  }
};
const dataCurta = iso => iso ? iso.split("-").reverse().slice(0, 2).join("/") : "—";
function FinRegistro({
  tab,
  onClose,
  onSave
}) {
  const f = FIN_FORM[tab];
  const [v, setV] = React.useState(() => Object.fromEntries(f.campos.filter(c => c.opcoes).map(c => [c.id, c.opcoes[0]])));
  return /*#__PURE__*/React.createElement(FN.Modal, {
    width: 480,
    title: f.titulo,
    onClose: onClose,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FN.Button, {
      variant: "ghost",
      block: true,
      onClick: onClose
    }, "Cancelar"), /*#__PURE__*/React.createElement(FN.Button, {
      block: true,
      icon: "check",
      onClick: () => onSave(v)
    }, "Registrar"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0,1fr))",
      gap: "10px 12px"
    }
  }, f.campos.map(c => /*#__PURE__*/React.createElement(FN.Field, {
    key: c.id,
    label: c.rot,
    style: {
      gridColumn: c.span ? "span 2" : undefined
    }
  }, c.opcoes ? /*#__PURE__*/React.createElement(FN.Select, {
    options: c.opcoes,
    value: v[c.id],
    onChange: e => setV({
      ...v,
      [c.id]: e.target.value
    })
  }) : /*#__PURE__*/React.createElement(FN.Input, {
    type: c.tipo === "date" ? "date" : c.tipo === "dinheiro" || c.tipo === "number" ? "number" : "text",
    step: c.tipo === "dinheiro" ? "0.01" : undefined,
    prefix: c.tipo === "dinheiro" ? "R$" : undefined,
    placeholder: c.ph,
    value: v[c.id] || "",
    onChange: e => setV({
      ...v,
      [c.id]: e.target.value
    })
  })))));
}
function Financeiro({
  compact
}) {
  const [tab, setTab] = React.useState("transacoes");
  const [novo, setNovo] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [dados, setDados] = React.useState(() => ({
    ...window.DLUH.financeiro
  }));
  const showToast = m => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };
  const t = FIN_TABS.find(x => x.id === tab);
  const n = v => Number(String(v || "").replace(",", ".")) || 0;
  const remover = i => {
    setDados(d => ({
      ...d,
      [tab]: d[tab].filter((_, j) => j !== i)
    }));
    showToast("Registro removido");
  };
  const salvar = v => {
    const item = tab === "transacoes" ? {
      desc: v.desc || "Transação",
      tipo: v.tipo,
      meio: v.meio,
      data: dataCurta(v.data),
      valor: n(v.valor)
    } : tab === "boletos" ? {
      desc: v.desc || "Boleto",
      venc: dataCurta(v.venc),
      valor: n(v.valor),
      status: "Em aberto"
    } : {
      nome: v.nome || "Cartão",
      final: v.final || "0000",
      bandeira: v.bandeira,
      limite: n(v.limite),
      fatura: 0,
      venc: v.venc || "—"
    };
    setDados(d => ({
      ...d,
      [tab]: [item, ...d[tab]]
    }));
    setNovo(false);
    showToast("Registro salvo");
  };
  const lixo = i => /*#__PURE__*/React.createElement(FN.IconButton, {
    icon: "trash",
    label: "Remover",
    size: 32,
    style: {
      marginLeft: 10
    },
    onClick: () => remover(i)
  });
  const vazio = /*#__PURE__*/React.createElement(FN.EmptyState, {
    icon: "wallet",
    title: "Nada registrado ainda",
    description: "Use o bot\xE3o acima para adicionar o primeiro registro."
  });
  const lista = dados[tab] || [];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)",
      minHeight: "100%"
    }
  }, /*#__PURE__*/React.createElement(FN.Tabs, {
    value: tab,
    onChange: setTab,
    items: FIN_TABS.map(x => ({
      id: x.id,
      label: x.label,
      count: x.id === "contratos" ? undefined : (dados[x.id] || []).length
    }))
  }), tab === "contratos" ? /*#__PURE__*/React.createElement(window.Contratos, {
    compact: compact
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--gap-inline)",
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, tab === "transacoes" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FN.Badge, {
    tone: "success",
    icon: "arrow-down-left"
  }, "Entradas ", window.brl(lista.filter(x => x.tipo === "Entrada").reduce((s, x) => s + x.valor, 0))), /*#__PURE__*/React.createElement(FN.Badge, {
    tone: "warn",
    icon: "arrow-up-right"
  }, "Sa\xEDdas ", window.brl(lista.filter(x => x.tipo === "Saída").reduce((s, x) => s + x.valor, 0)))) : tab === "boletos" ? /*#__PURE__*/React.createElement(FN.Badge, {
    tone: "warn",
    icon: "clock"
  }, "Em aberto ", window.brl(lista.filter(x => x.status !== "Pago").reduce((s, x) => s + x.valor, 0))) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(FN.Button, {
    size: "sm",
    icon: "plus",
    onClick: () => setNovo(true)
  }, t.acao)), /*#__PURE__*/React.createElement(FN.Card, {
    padded: !!lista.length,
    bodyStyle: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, !lista.length ? vazio : tab === "transacoes" ? lista.map((x, i) => /*#__PURE__*/React.createElement(FN.ListRow, {
    key: i,
    icon: x.tipo === "Entrada" ? "arrow-down-left" : "arrow-up-right",
    title: x.desc,
    subtitle: x.data + " · " + x.meio,
    value: (x.tipo === "Entrada" ? "+ " : "− ") + window.brl(x.valor),
    tone: x.tipo === "Entrada" ? "in" : "out",
    trailing: lixo(i)
  })) : tab === "boletos" ? lista.map((x, i) => /*#__PURE__*/React.createElement(FN.ListRow, {
    key: i,
    icon: "receipt",
    title: x.desc,
    subtitle: "Vence " + x.venc,
    value: window.brl(x.valor),
    trailing: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginLeft: 10
      }
    }, x.status === "Pago" ? /*#__PURE__*/React.createElement(FN.Badge, {
      tone: "success"
    }, "Pago") : /*#__PURE__*/React.createElement(FN.Button, {
      size: "sm",
      variant: "outline",
      icon: "check",
      onClick: () => {
        setDados(d => ({
          ...d,
          boletos: d.boletos.map((b, j) => j === i ? {
            ...b,
            status: "Pago"
          } : b)
        }));
        showToast("Boleto marcado como pago");
      }
    }, "Pagar"), lixo(i))
  })) : lista.map((x, i) => /*#__PURE__*/React.createElement(FN.ListRow, {
    key: i,
    icon: "credit-card",
    title: x.nome + " · final " + x.final,
    subtitle: x.bandeira + " · vence dia " + x.venc + " · limite " + window.brl(x.limite),
    value: window.brl(x.fatura),
    trailing: lixo(i)
  })))), novo ? /*#__PURE__*/React.createElement(FinRegistro, {
    tab: tab,
    onClose: () => setNovo(false),
    onSave: salvar
  }) : null, toast ? /*#__PURE__*/React.createElement(FN.Toast, {
    tone: "success",
    icon: "check"
  }, toast) : null);
}
Object.assign(window, {
  Financeiro
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Financeiro.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Notificacoes.jsx
try { (() => {
const NT = window.DLuhFestasDesignSystem_c861a2;
const NOTIF_DEMO = [{
  icon: "receipt-text",
  title: "Novo pedido no site",
  sub: "Luana Ferreira · 60 docinhos gourmet · R$ 210,00",
  view: "pedidos"
}, {
  icon: "wallet",
  title: "Entrada paga",
  sub: "Willian Bicalho pagou R$ 370,00 via Pix",
  view: "pedidos"
}, {
  icon: "file-text",
  title: "Boleto vence hoje",
  sub: "Distribuidora Doce Minas · R$ 1.146,00",
  view: "agenda"
}, {
  icon: "chef-hat",
  title: "Pedido pronto",
  sub: "PED-2293 · Rafaela Prates saiu da cozinha",
  view: "cozinha"
}];
function NotifCard({
  n,
  onClose,
  onOpen,
  compact
}) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const a = requestAnimationFrame(() => setOn(true));
    const b = setTimeout(() => setOn(false), 3000);
    const c = setTimeout(onClose, 3300);
    return () => {
      cancelAnimationFrame(a);
      clearTimeout(b);
      clearTimeout(c);
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    onClick: onOpen,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: compact ? "100%" : 340,
      boxSizing: "border-box",
      padding: "12px 12px 12px 14px",
      cursor: "pointer",
      borderRadius: "var(--radius-md)",
      border: "var(--border-hairline) solid var(--color-border)",
      background: "var(--color-surface)",
      boxShadow: "0 12px 36px rgba(0,0,0,.28)",
      pointerEvents: "auto",
      opacity: on ? 1 : 0,
      transform: on ? "none" : compact ? "translateY(-16px)" : "translateX(24px)",
      transition: "opacity var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "0 0 36px",
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-sm)",
      background: "var(--color-accent)",
      color: "var(--color-accent-contrast)"
    }
  }, /*#__PURE__*/React.createElement(NT.Icon, {
    name: n.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-s)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)"
    }
  }, n.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)",
      lineHeight: "var(--lh-normal)"
    }
  }, n.sub)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Fechar",
    onClick: e => {
      e.stopPropagation();
      onClose();
    },
    style: {
      alignSelf: "flex-start",
      display: "flex",
      padding: 4,
      border: "none",
      background: "transparent",
      color: "var(--text-muted)",
      cursor: "pointer",
      borderRadius: "var(--radius-xs)"
    }
  }, /*#__PURE__*/React.createElement(NT.Icon, {
    name: "x",
    size: 14
  })));
}
function Notificacoes({
  onView,
  compact
}) {
  const [lista, setLista] = React.useState([]);
  React.useEffect(() => {
    let i = 0;
    const push = () => {
      const n = NOTIF_DEMO[i++ % NOTIF_DEMO.length];
      setLista(l => [...l, {
        ...n,
        key: Date.now()
      }]);
    };
    const first = setTimeout(push, 2500);
    const loop = setInterval(push, 14000);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
    };
  }, []);
  const tirar = k => setLista(l => l.filter(x => x.key !== k));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      zIndex: 900,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      pointerEvents: "none",
      ...(compact ? {
        top: "calc(8px + env(safe-area-inset-top))",
        left: 12,
        right: 12,
        alignItems: "stretch"
      } : {
        right: 24,
        bottom: 24,
        alignItems: "flex-end",
        maxWidth: "calc(100% - 24px)"
      })
    }
  }, lista.map(n => /*#__PURE__*/React.createElement(NotifCard, {
    key: n.key,
    n: n,
    compact: compact,
    onClose: () => tirar(n.key),
    onOpen: () => {
      onView(n.view);
      tirar(n.key);
    }
  })));
}
Object.assign(window, {
  Notificacoes,
  NOTIF_DEMO
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Notificacoes.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Pedidos.jsx
try { (() => {
const DS = window.DLuhFestasDesignSystem_c861a2;
const {
  Tabs,
  FilterPill,
  OrderCard,
  Button,
  IconButton,
  DropdownMenu,
  Badge,
  EmptyState,
  Modal,
  ConfirmDialog,
  Toast,
  Field,
  Input,
  Select,
  Card,
  StatusBadge,
  DataTable
} = DS;
const TABS = [{
  id: "estoque",
  label: "Estoque pendente",
  filtro: "Aguardando confirmação"
}, {
  id: "pagamento",
  label: "Esperando pagamento",
  filtro: "Confirmado — Esperando pagamento"
}, {
  id: "producao",
  label: "Em produção",
  filtro: "Pago — Em produção"
}, {
  id: "restante",
  label: "Esperando restante",
  filtro: "Entregue — Esperando restante"
}, {
  id: "final",
  label: "Finalizados",
  filtro: "Finalizado"
}];
function DetalhesModal({
  pedido,
  onClose,
  onToast
}) {
  const [pgtos, setPgtos] = React.useState([{
    quando: "10/06 · 14:32",
    valor: 240,
    origem: "site",
    meio: "Pix"
  }]);
  const [verPgtos, setVerPgtos] = React.useState(false);
  if (!pedido) return null;
  const recebido = pgtos.reduce((s, p) => s + p.valor, 0);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Modal, {
    width: 620,
    title: "Detalhes do pedido",
    onClose: onClose,
    subtitle: "Edite o que precisar \u2014 produtos, quantidades, valores, dados do cliente, entrega, pagamento e observa\xE7\xF5es.",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      block: true,
      onClick: onClose
    }, "Fechar"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      block: true,
      icon: "printer",
      onClick: () => onToast("Pedido enviado para impressão")
    }, "Imprimir"), /*#__PURE__*/React.createElement(Button, {
      block: true,
      icon: "save",
      onClick: () => {
        onClose();
        onToast("Pedido atualizado");
      }
    }, "Salvar"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--color-accent)",
      letterSpacing: "var(--ls-caps)"
    }
  }, pedido.id), /*#__PURE__*/React.createElement(StatusBadge, {
    status: pedido.status
  }), pedido.tipo ? /*#__PURE__*/React.createElement(Badge, {
    tone: "accent",
    icon: "building-2"
  }, pedido.tipo) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Cliente",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: pedido.cliente
  })), /*#__PURE__*/React.createElement(Field, {
    label: "WhatsApp",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: pedido.tel
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Entrega"
  }, /*#__PURE__*/React.createElement(Select, {
    options: ["Retirada no local", "Entrega em endereço"]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Data"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "date",
    defaultValue: "2026-06-12"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Hora"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "time",
    defaultValue: "15:00"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Pagamento"
  }, /*#__PURE__*/React.createElement(Select, {
    options: ["Pix", "Cartão", "Dinheiro"],
    defaultValue: pedido.pgto
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    rows: pedido.itens.map((it, i) => ({
      id: i,
      ...it
    })),
    columns: [{
      key: "name",
      label: "Produto",
      strong: true,
      wrap: true
    }, {
      key: "qty",
      label: "Qtd",
      align: "center",
      width: 60
    }, {
      key: "price",
      label: "Subtotal",
      align: "right",
      width: 100,
      strong: true
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      alignItems: "center",
      gap: 16,
      flexWrap: "wrap",
      padding: "12px 14px",
      borderRadius: "var(--radius-sm)",
      border: "var(--border-hairline) solid var(--color-border)"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Valor recebido"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-body-l)",
      fontWeight: "var(--fw-bold)"
    }
  }, window.brl(recebido))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    icon: "list",
    onClick: () => setVerPgtos(true)
  }, "Pagamentos (", pgtos.length, ")"))), verPgtos ? /*#__PURE__*/React.createElement(PagamentosModal, {
    lista: pgtos,
    onChange: setPgtos,
    onClose: () => setVerPgtos(false),
    onToast: onToast
  }) : null);
}
function Pedidos({
  compact,
  q
}) {
  const [tab, setTab] = React.useState("estoque");
  const [detalhe, setDetalhe] = React.useState(null);
  const [manual, setManual] = React.useState(false);
  const [confirm, setConfirm] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };
  const filtro = (TABS.find(t => t.id === tab) || TABS[0]).filtro;
  const lista = window.DLUH.pedidos.filter(p => p.status === filtro).filter(p => !q || p.cliente.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()));
  const counts = {};
  TABS.forEach(t => counts[t.id] = window.DLUH.pedidos.filter(p => p.status === t.filtro).length);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)",
      minHeight: "100%"
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: TABS.map(t => ({
      id: t.id,
      label: t.label,
      count: counts[t.id]
    }))
  }), compact ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    icon: "plus",
    onClick: () => setManual(true)
  }, "Pedido manual")), lista.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)"
    }
  }, lista.map(p => /*#__PURE__*/React.createElement(OrderCard, {
    key: p.id,
    id: p.id,
    customer: p.cliente,
    status: p.status,
    meta: [p.entrega, p.tel, p.pgto].filter(Boolean),
    badges: /*#__PURE__*/React.createElement(React.Fragment, null, p.tipo ? /*#__PURE__*/React.createElement(Badge, {
      tone: "accent",
      icon: "building-2"
    }, p.tipo) : null, p.falta ? /*#__PURE__*/React.createElement(Badge, {
      tone: "warn"
    }, "Falta ", p.falta) : null),
    items: p.itens,
    total: p.total,
    paid: p.pago,
    due: p.falta,
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      icon: "file-text",
      onClick: () => setDetalhe(p)
    }, "Detalhes"), p.status === "Aguardando confirmação" ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      icon: "check",
      onClick: () => setConfirm(p)
    }, "Confirmar estoque") : p.status === "Confirmado — Esperando pagamento" ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      tone: "chargeEntry",
      icon: "link",
      onClick: () => showToast("Link de cobrança enviado")
    }, "Cobrar entrada") : p.status === "Pago — Em produção" ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      tone: "delivered",
      icon: "truck",
      onClick: () => showToast("Pedido marcado como entregue")
    }, "Marcar entregue") : p.status === "Entregue — Esperando restante" ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      tone: "chargeAll",
      icon: "banknote",
      onClick: () => showToast("Cobrança do restante enviada")
    }, "Cobrar restante") : /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      icon: "printer",
      onClick: () => showToast("Recibo gerado")
    }, "Recibo"), /*#__PURE__*/React.createElement(DropdownMenu, {
      trigger: /*#__PURE__*/React.createElement(IconButton, {
        icon: "menu",
        label: "Mais a\xE7\xF5es"
      }),
      items: [{
        label: "Copiar dados do pedido",
        icon: "copy",
        onClick: () => showToast("Dados copiados")
      }, {
        label: "Marcar como pago",
        icon: "badge-check",
        onClick: () => showToast("Pagamento registrado")
      }, {
        label: "Notificar alterações",
        icon: "bell-ring",
        onClick: () => showToast("Cliente avisado no WhatsApp")
      }, {
        label: "Imprimir recibo",
        icon: "printer"
      }, {
        divider: true
      }, {
        label: "Apagar pedido",
        icon: "trash-2",
        tone: "danger",
        onClick: () => setConfirm({
          ...p,
          apagar: true
        })
      }]
    }))
  }))) : /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(EmptyState, {
    icon: "party-popper",
    title: "Nenhum pedido nesta aba",
    description: "Assim que um pedido entrar nesse status ele aparece aqui automaticamente."
  })), detalhe ? /*#__PURE__*/React.createElement(DetalhesModal, {
    pedido: detalhe,
    onClose: () => setDetalhe(null),
    onToast: showToast
  }) : null, manual ? /*#__PURE__*/React.createElement(ManualModal, {
    onClose: () => setManual(false),
    onToast: showToast
  }) : null, confirm ? /*#__PURE__*/React.createElement(ConfirmDialog, {
    tone: confirm.apagar ? "danger" : "accent",
    icon: confirm.apagar ? "trash-2" : "circle-check",
    title: confirm.apagar ? "Apagar pedido?" : "Confirmar estoque?",
    message: confirm.apagar ? "O pedido sai da fila e do Coda. Não dá pra desfazer." : "O cliente recebe o link de pagamento da entrada e o pedido entra na fila da cozinha.",
    confirmLabel: confirm.apagar ? "Sim, apagar" : "Sim, confirmar",
    onCancel: () => setConfirm(null),
    onConfirm: () => {
      const a = confirm.apagar;
      setConfirm(null);
      showToast(a ? "Pedido apagado" : "Estoque confirmado");
    }
  }) : null, toast ? /*#__PURE__*/React.createElement(Toast, {
    tone: "success",
    icon: "check"
  }, toast) : null);
}
Object.assign(window, {
  Pedidos,
  DetalhesModal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Pedidos.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/PedidosModais.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PM = window.DLuhFestasDesignSystem_c861a2;
const brl = n => "R$ " + (Number(n) || 0).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const agora = () => {
  const d = new Date(),
    p = x => String(x).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} · ${p(d.getHours())}:${p(d.getMinutes())}`;
};
function EntradaToggle({
  value,
  onChange
}) {
  const cheio = value === 100;
  const lado = {
    flex: 1,
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    transition: "color var(--dur-base) var(--ease-standard)"
  };
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": cheio,
    onClick: () => onChange(cheio ? 50 : 100),
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      width: "100%",
      height: 40,
      padding: 3,
      borderRadius: "var(--radius-pill)",
      border: "var(--border-hairline) solid var(--color-border-strong)",
      background: "var(--color-surface-sunken, var(--color-bg))",
      cursor: "pointer",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-body-s)",
      fontWeight: "var(--fw-semibold)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 3,
      bottom: 3,
      left: cheio ? "50%" : 3,
      width: "calc(50% - 3px)",
      borderRadius: "var(--radius-pill)",
      background: "var(--color-accent)",
      boxShadow: "0 1px 3px rgba(40,24,16,.18)",
      transition: "left var(--dur-base) var(--ease-standard)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...lado,
      color: cheio ? "var(--text-muted)" : "var(--color-accent-contrast)"
    }
  }, "50%"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...lado,
      color: cheio ? "var(--color-accent-contrast)" : "var(--text-muted)"
    }
  }, "100%"));
}
function Anexo({
  arquivo,
  onFile
}) {
  if (arquivo) return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      minWidth: 0,
      fontSize: "var(--fs-tiny)",
      color: "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement(PM.Icon, {
    name: "paperclip",
    size: 14,
    style: {
      color: "var(--text-muted)",
      flex: "0 0 auto"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, arquivo));
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
      fontSize: "var(--fs-tiny)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--color-accent)"
    }
  }, /*#__PURE__*/React.createElement(PM.Icon, {
    name: "upload",
    size: 14
  }), "Anexar comprovante", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*,.pdf",
    hidden: true,
    onChange: e => e.target.files[0] && onFile(e.target.files[0].name)
  }));
}
const PG_COLS = "minmax(0,1fr) minmax(0,.8fr) minmax(0,1.4fr) 32px";
function PagamentosModal({
  lista,
  onChange,
  onClose,
  onToast
}) {
  const [valor, setValor] = React.useState("");
  const [arquivo, setArquivo] = React.useState(null);
  const total = lista.reduce((s, p) => s + p.valor, 0);
  const cab = {
    fontSize: "var(--fs-caption)",
    fontWeight: "var(--fw-semibold)",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "var(--ls-label)"
  };
  const registrar = () => {
    const v = parseFloat(String(valor).replace(",", "."));
    if (!v) return;
    onChange([...lista, {
      quando: agora(),
      valor: v,
      arquivo,
      origem: "manual"
    }]);
    setValor("");
    setArquivo(null);
    onToast("Pagamento registrado");
  };
  return /*#__PURE__*/React.createElement(PM.Modal, {
    width: 600,
    title: "Pagamentos",
    onClose: onClose,
    subtitle: "Tudo o que o cliente j\xE1 pagou: pelo site e registrado manualmente. Registros manuais n\xE3o geram cobran\xE7a nem avisam o cliente.",
    footer: /*#__PURE__*/React.createElement(PM.Button, {
      variant: "ghost",
      block: true,
      onClick: onClose
    }, "Fechar")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: "var(--border-hairline) solid var(--color-border)",
      borderRadius: "var(--radius-sm)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: PG_COLS,
      gap: 12,
      padding: "10px 14px",
      ...cab
    }
  }, /*#__PURE__*/React.createElement("span", null, "Registro"), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right"
    }
  }, "Valor"), /*#__PURE__*/React.createElement("span", null, "Comprovante"), /*#__PURE__*/React.createElement("span", null)), lista.length ? lista.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "grid",
      gridTemplateColumns: PG_COLS,
      gap: 12,
      alignItems: "center",
      padding: "10px 14px",
      borderTop: "var(--border-hairline) solid var(--color-border)",
      fontSize: "var(--fs-body-s)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 1.3,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-body)",
      whiteSpace: "nowrap"
    }
  }, p.quando), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)"
    }
  }, p.origem === "site" ? "Pelo site · " + (p.meio || "Pix") : "Manual")), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)",
      whiteSpace: "nowrap"
    }
  }, brl(p.valor)), p.origem === "site" ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement(PM.Icon, {
    name: "check",
    size: 14
  }), "Confirmado automaticamente") : /*#__PURE__*/React.createElement(Anexo, {
    arquivo: p.arquivo,
    onFile: n => onChange(lista.map((x, j) => j === i ? {
      ...x,
      arquivo: n
    } : x))
  }), p.origem === "site" ? /*#__PURE__*/React.createElement("span", null) : /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Remover pagamento",
    title: "Remover pagamento",
    onClick: () => {
      onChange(lista.filter((_, j) => j !== i));
      onToast("Pagamento removido");
    },
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      padding: 0,
      border: "none",
      borderRadius: "var(--radius-sm)",
      background: "transparent",
      color: "var(--text-muted)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(PM.Icon, {
    name: "trash",
    size: 16
  })))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px",
      borderTop: "var(--border-hairline) solid var(--color-border)",
      fontSize: "var(--fs-body-s)",
      color: "var(--text-muted)"
    }
  }, "Nenhum pagamento registrado."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: PG_COLS,
      gap: 12,
      alignItems: "center",
      padding: "12px 14px",
      borderTop: "var(--border-hairline) solid var(--color-border-strong)",
      background: "var(--color-accent-soft)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-s)",
      fontWeight: "var(--fw-bold)"
    }
  }, "Total recebido"), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right",
      fontSize: "var(--fs-body-l)",
      fontWeight: "var(--fw-bold)",
      whiteSpace: "nowrap"
    }
  }, brl(total)), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) auto auto",
      gap: 12,
      alignItems: "end"
    }
  }, /*#__PURE__*/React.createElement(PM.Field, {
    label: "Novo pagamento"
  }, /*#__PURE__*/React.createElement(PM.Input, {
    type: "number",
    prefix: "R$",
    step: "0.01",
    placeholder: "0,00",
    value: valor,
    onChange: e => setValor(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 40,
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Anexo, {
    arquivo: arquivo,
    onFile: setArquivo
  })), /*#__PURE__*/React.createElement(PM.Button, {
    tone: "warn",
    icon: "plus",
    onClick: registrar
  }, "Registrar")));
}
const novoRascunho = n => ({
  uid: Date.now() + n,
  cliente: "",
  tel: "",
  data: "",
  hora: "",
  entrega: "Retirada no local",
  pgto: "Pix",
  entrada: 50,
  tipo: "Pessoa física",
  obs: "",
  itens: [{
    nome: "",
    qtd: 1,
    preco: ""
  }]
});
const totalRascunho = r => r.itens.reduce((s, it) => s + (Number(it.qtd) || 0) * (parseFloat(String(it.preco).replace(",", ".")) || 0), 0);
const ITEM_COLS = "minmax(0,1fr) 80px 130px 40px";
function ManualModal({
  onClose,
  onToast
}) {
  const [lista, setLista] = React.useState([novoRascunho(0)]);
  const [ativo, setAtivo] = React.useState(0);
  const r = lista[ativo];
  const set = (k, v) => setLista(l => l.map((x, i) => i === ativo ? {
    ...x,
    [k]: v
  } : x));
  const setItem = (j, k, v) => set("itens", r.itens.map((it, i) => i === j ? {
    ...it,
    [k]: v
  } : it));
  const novo = () => {
    setLista(l => [...l, novoRascunho(l.length)]);
    setAtivo(lista.length);
  };
  const remover = i => {
    if (lista.length === 1) return;
    setLista(l => l.filter((_, j) => j !== i));
    setAtivo(a => Math.max(0, a >= i ? a - 1 : a));
  };
  const ctl = k => ({
    value: r[k],
    onChange: e => set(k, e.target.value)
  });
  const n = lista.length;
  const geral = lista.reduce((s, x) => s + totalRascunho(x), 0);
  return /*#__PURE__*/React.createElement(PM.Modal, {
    width: 860,
    title: "Pedidos manuais",
    onClose: onClose,
    subtitle: "Mesmo fluxo do site: registra no Coda, notifica o Telegram (Confirmar Estoque) e segue o ciclo normal \u2014 cobran\xE7a, fila da cozinha, avisos no WhatsApp do cliente.",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PM.Button, {
      variant: "ghost",
      block: true,
      onClick: onClose
    }, "Cancelar"), /*#__PURE__*/React.createElement(PM.Button, {
      block: true,
      icon: "check",
      onClick: () => {
        onClose();
        onToast(n > 1 ? `${n} pedidos criados` : "Pedido criado");
      }
    }, n > 1 ? `Criar ${n} pedidos · ${brl(geral)}` : "Criar pedido"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      alignItems: "center",
      paddingBottom: 14,
      marginBottom: 16,
      borderBottom: "var(--border-hairline) solid var(--color-border)"
    }
  }, lista.map((x, i) => {
    const on = i === ativo;
    return /*#__PURE__*/React.createElement("div", {
      key: x.uid,
      onClick: () => setAtivo(i),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 8px 6px 12px",
        cursor: "pointer",
        borderRadius: "var(--radius-md)",
        border: "var(--border-hairline) solid " + (on ? "var(--color-accent)" : "var(--color-border)"),
        background: on ? "var(--color-accent-soft)" : "var(--color-surface)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        lineHeight: 1.25
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-body-s)",
        fontWeight: "var(--fw-semibold)",
        color: "var(--text-strong)",
        maxWidth: 140,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, x.cliente || `Pedido ${i + 1}`), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-tiny)",
        color: "var(--text-muted)"
      }
    }, brl(totalRascunho(x)))), n > 1 ? /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Remover pedido",
      onClick: e => {
        e.stopPropagation();
        remover(i);
      },
      style: {
        display: "flex",
        padding: 4,
        border: "none",
        background: "transparent",
        color: "var(--text-muted)",
        cursor: "pointer",
        borderRadius: "var(--radius-xs)"
      }
    }, /*#__PURE__*/React.createElement(PM.Icon, {
      name: "x",
      size: 14
    })) : null);
  }), /*#__PURE__*/React.createElement(PM.Button, {
    size: "sm",
    variant: "quiet",
    icon: "plus",
    onClick: novo
  }, "Novo pedido")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0,1fr))",
      gap: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement(PM.Field, {
    label: "Cliente",
    required: true
  }, /*#__PURE__*/React.createElement(PM.Input, _extends({
    placeholder: "Nome do cliente"
  }, ctl("cliente")))), /*#__PURE__*/React.createElement(PM.Field, {
    label: "WhatsApp",
    required: true
  }, /*#__PURE__*/React.createElement(PM.Input, _extends({
    placeholder: "(38) 99999-9999"
  }, ctl("tel")))), /*#__PURE__*/React.createElement(PM.Field, {
    label: "Tipo de cliente"
  }, /*#__PURE__*/React.createElement(PM.Select, _extends({
    options: ["Pessoa física", "Empresa", "Festa"]
  }, ctl("tipo")))), /*#__PURE__*/React.createElement(PM.Field, {
    label: "Data de entrega",
    required: true
  }, /*#__PURE__*/React.createElement(PM.Input, _extends({
    type: "date"
  }, ctl("data")))), /*#__PURE__*/React.createElement(PM.Field, {
    label: "Hora"
  }, /*#__PURE__*/React.createElement(PM.Input, _extends({
    type: "time"
  }, ctl("hora")))), /*#__PURE__*/React.createElement(PM.Field, {
    label: "Entrega"
  }, /*#__PURE__*/React.createElement(PM.Select, _extends({
    options: ["Retirada no local", "Entrega em endereço"]
  }, ctl("entrega")))), /*#__PURE__*/React.createElement(PM.Field, {
    label: "Pagamento"
  }, /*#__PURE__*/React.createElement(PM.Select, _extends({
    options: ["Pix", "Cartão", "Dinheiro"]
  }, ctl("pgto")))), /*#__PURE__*/React.createElement(PM.Field, {
    label: "Entrada",
    hint: "Percentual cobrado agora"
  }, /*#__PURE__*/React.createElement(EntradaToggle, {
    value: r.entrada,
    onChange: v => set("entrada", v)
  })), /*#__PURE__*/React.createElement(PM.Field, {
    label: "Observa\xE7\xF5es"
  }, /*#__PURE__*/React.createElement(PM.Input, _extends({
    placeholder: "Opcional"
  }, ctl("obs"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      border: "var(--border-hairline) solid var(--color-border)",
      borderRadius: "var(--radius-sm)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: ITEM_COLS,
      gap: 10,
      padding: "10px 12px",
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "var(--ls-label)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Produto"), /*#__PURE__*/React.createElement("span", null, "Qtd"), /*#__PURE__*/React.createElement("span", null, "Pre\xE7o un."), /*#__PURE__*/React.createElement("span", null)), r.itens.map((it, j) => /*#__PURE__*/React.createElement("div", {
    key: j,
    style: {
      display: "grid",
      gridTemplateColumns: ITEM_COLS,
      gap: 10,
      alignItems: "center",
      padding: "8px 12px",
      borderTop: "var(--border-hairline) solid var(--color-border)"
    }
  }, /*#__PURE__*/React.createElement(PM.Input, {
    size: "sm",
    placeholder: "Ex.: Bolo de chocolate 2kg",
    value: it.nome,
    onChange: e => setItem(j, "nome", e.target.value)
  }), /*#__PURE__*/React.createElement(PM.Input, {
    size: "sm",
    type: "number",
    min: "1",
    value: it.qtd,
    onChange: e => setItem(j, "qtd", e.target.value)
  }), /*#__PURE__*/React.createElement(PM.Input, {
    size: "sm",
    type: "number",
    prefix: "R$",
    step: "0.01",
    placeholder: "0,00",
    value: it.preco,
    onChange: e => setItem(j, "preco", e.target.value)
  }), /*#__PURE__*/React.createElement(PM.IconButton, {
    icon: "trash-2",
    label: "Remover item",
    onClick: () => r.itens.length > 1 && set("itens", r.itens.filter((_, i) => i !== j))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "10px 12px",
      borderTop: "var(--border-hairline) solid var(--color-border)"
    }
  }, /*#__PURE__*/React.createElement(PM.Button, {
    size: "sm",
    variant: "quiet",
    icon: "plus",
    onClick: () => set("itens", [...r.itens, {
      nome: "",
      qtd: 1,
      preco: ""
    }])
  }, "Adicionar item"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)"
    }
  }, "Entrada ", r.entrada, "% \xB7 ", brl(totalRascunho(r) * r.entrada / 100)), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: "var(--fs-subhead)"
    }
  }, brl(totalRascunho(r)))))));
}
Object.assign(window, {
  ManualModal,
  PagamentosModal,
  EntradaToggle,
  brl
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/PedidosModais.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Shell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  SearchInput,
  IconButton,
  UserChip,
  Icon,
  Modal,
  FilterPill,
  Button,
  ListRow,
  EmptyState
} = window.DLuhFestasDesignSystem_c861a2;
const NAV = [{
  id: "visao",
  label: "Visão geral",
  icon: "layout-dashboard"
}, {
  id: "pedidos",
  label: "Pedidos",
  icon: "receipt-text",
  count: 7
}, {
  id: "agenda",
  label: "Agenda",
  icon: "calendar-days",
  count: 3
}, {
  id: "cozinha",
  label: "Cozinha",
  icon: "chef-hat",
  count: 4
}, {
  id: "financeiro",
  label: "Financeiro",
  icon: "wallet"
}];
function RailItem({
  icon,
  label,
  count,
  active,
  badge,
  open,
  onClick
}) {
  const [h, setH] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    title: open ? undefined : label,
    "aria-current": active ? "page" : undefined,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      minHeight: "var(--icon-tile)",
      padding: "0 13px",
      borderRadius: "var(--radius-md)",
      cursor: "pointer",
      position: "relative",
      border: "var(--border-hairline) solid " + (active ? "transparent" : "var(--color-border-soft)"),
      background: active ? "var(--color-accent)" : h ? "var(--color-accent-soft)" : "transparent",
      color: active ? "var(--color-accent-contrast)" : "var(--text-body)",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-body-s)",
      fontWeight: "var(--fw-medium)",
      transition: "var(--transition-control)",
      overflow: "hidden",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "0 0 22px",
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 21
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: "left",
      opacity: open ? 1 : 0,
      transition: "opacity var(--dur-base) var(--ease-standard)"
    }
  }, label), count ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: open ? "static" : "absolute",
      top: 6,
      right: 6,
      minWidth: 18,
      height: 18,
      padding: "0 5px",
      borderRadius: "var(--radius-pill)",
      background: active ? "rgba(255,255,255,.28)" : "var(--color-accent)",
      color: "var(--color-accent-contrast)",
      fontSize: "var(--fs-micro)",
      fontWeight: "var(--fw-bold)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, count) : null, badge ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 8,
      left: 30,
      width: 7,
      height: 7,
      borderRadius: "var(--radius-pill)",
      background: "var(--action-danger)",
      boxShadow: "0 0 0 2px var(--color-surface)"
    }
  }) : null);
}
function Sidebar({
  view,
  onView,
  onSettings,
  onNotif,
  hasNotif
}) {
  const [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "var(--rail-w)",
      flex: "0 0 auto",
      position: "relative",
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement("nav", {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: open ? "var(--sidebar-w)" : "var(--rail-w)",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      padding: "var(--space-6)",
      background: "var(--color-surface)",
      borderRight: "var(--border-hairline) solid var(--color-border)",
      boxShadow: open ? "0 12px 40px rgba(40,24,16,.16)" : "none",
      overflow: "hidden",
      transition: "width var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      padding: "var(--space-2) 0 var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-dluh-festas.png",
    alt: "D'Luh Festas",
    style: {
      width: 44,
      height: 44,
      objectFit: "contain",
      marginLeft: 2
    }
  })), NAV.map(it => /*#__PURE__*/React.createElement(RailItem, _extends({
    key: it.id
  }, it, {
    open: open,
    active: it.id === view,
    onClick: () => onView(it.id)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "bell",
    label: "Notifica\xE7\xF5es",
    badge: hasNotif,
    open: open,
    onClick: onNotif
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "settings",
    label: "Configura\xE7\xF5es",
    open: open,
    onClick: onSettings
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "var(--border-hairline) solid var(--color-border)",
      margin: "var(--space-2) 0 0",
      paddingTop: "var(--space-4)",
      paddingLeft: 3,
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement(UserChip, {
    name: "Luciana",
    role: "Gerente",
    compact: !open
  }))));
}
function BottomNav({
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      borderTop: "1px solid var(--color-border)",
      background: "var(--color-surface)",
      padding: "6px 4px calc(8px + env(safe-area-inset-bottom))",
      gap: 2,
      flex: "0 0 auto"
    }
  }, NAV.map(it => {
    const active = it.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      onClick: () => onChange(it.id),
      style: {
        flex: 1,
        minHeight: "var(--tap-min)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: active ? "var(--color-accent)" : "var(--text-muted)",
        fontFamily: "var(--font-ui)",
        fontSize: "var(--fs-micro)",
        fontWeight: "var(--fw-semibold)",
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 21
    }), it.label, it.count ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 2,
        right: "50%",
        marginRight: -22,
        minWidth: 16,
        height: 16,
        padding: "0 4px",
        borderRadius: "var(--radius-pill)",
        background: "var(--color-accent)",
        color: "var(--color-accent-contrast)",
        fontSize: 9.5,
        fontWeight: "var(--fw-bold)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, it.count) : null);
  }));
}
function Shell({
  view,
  onView,
  compact,
  theme,
  onTheme,
  children,
  q,
  onQ
}) {
  const [cfg, setCfg] = React.useState(false);
  const [notif, setNotif] = React.useState(false);
  const [notifs, setNotifs] = React.useState(() => [...(window.NOTIF_DEMO || [])]);
  const search = /*#__PURE__*/React.createElement(window.GlobalSearch, {
    q: q,
    onQ: onQ,
    onView: onView
  });
  return /*#__PURE__*/React.createElement("div", {
    "data-theme": theme,
    style: {
      display: "flex",
      height: "100%",
      position: "relative",
      background: "var(--color-bg)",
      fontFamily: "var(--font-ui)",
      color: "var(--text-strong)",
      overflow: "hidden"
    }
  }, compact ? null : /*#__PURE__*/React.createElement(Sidebar, {
    view: view,
    onView: onView,
    onSettings: () => setCfg(true),
    onNotif: () => setNotif(true),
    hasNotif: notifs.length > 0
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: compact ? "12px" : "var(--pad-page)",
      paddingBottom: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex"
    }
  }, search), compact ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IconButton, {
    icon: "bell",
    label: "Notifica\xE7\xF5es",
    badge: notifs.length > 0,
    onClick: () => setNotif(true)
  }), /*#__PURE__*/React.createElement(UserChip, {
    name: "Luciana",
    compact: true
  })) : null), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      overflowY: "auto",
      overscrollBehavior: "none",
      padding: compact ? "12px" : "var(--pad-page)"
    }
  }, children), compact ? /*#__PURE__*/React.createElement(BottomNav, {
    value: view,
    onChange: onView
  }) : null), /*#__PURE__*/React.createElement(window.Notificacoes, {
    onView: onView,
    compact: compact
  }), /*#__PURE__*/React.createElement(Modal, {
    open: notif,
    onClose: () => setNotif(false),
    title: "Notifica\xE7\xF5es",
    width: 440
  }, notifs.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    icon: "check-check",
    onClick: () => setNotifs([])
  }, "Limpar todas")), notifs.map((n, i) => /*#__PURE__*/React.createElement(ListRow, {
    key: n.title + n.sub,
    icon: n.icon,
    title: n.title,
    subtitle: n.sub,
    onClick: () => {
      setNotif(false);
      onView(n.view);
    },
    trailing: /*#__PURE__*/React.createElement(IconButton, {
      icon: "x",
      label: "Limpar notifica\xE7\xE3o",
      size: 32,
      style: {
        marginLeft: 10
      },
      onClick: e => {
        e.stopPropagation();
        setNotifs(l => l.filter((_, j) => j !== i));
      }
    })
  }))) : /*#__PURE__*/React.createElement(EmptyState, {
    icon: "bell-off",
    title: "Nenhuma notifica\xE7\xE3o",
    description: "Novos pedidos, pagamentos e vencimentos aparecem aqui."
  })), /*#__PURE__*/React.createElement(Modal, {
    open: cfg,
    onClose: () => setCfg(false),
    title: "Configura\xE7\xF5es",
    width: 420
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-s)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-strong)"
    }
  }, "Tema"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(FilterPill, {
    icon: "sun",
    trailingIcon: null,
    active: theme !== "dark",
    onClick: () => theme === "dark" && onTheme()
  }, "Claro"), /*#__PURE__*/React.createElement(FilterPill, {
    icon: "moon",
    trailingIcon: null,
    active: theme === "dark",
    onClick: () => theme !== "dark" && onTheme()
  }, "Escuro"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      paddingTop: 16,
      borderTop: "var(--border-hairline) solid var(--color-border)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    block: true,
    icon: "log-out",
    onClick: () => setCfg(false)
  }, "Sair da conta"))));
}
Object.assign(window, {
  Shell,
  BottomNav,
  NAV
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/VisaoGeral.jsx
try { (() => {
const {
  Card,
  StatCard,
  Sparkline,
  ListRow,
  DataTable,
  StatusBadge,
  Button,
  IconButton,
  Badge,
  Icon
} = window.DLuhFestasDesignSystem_c861a2;
function ChartCard({
  compact
}) {
  const serie = window.DLUH.serieReceita;
  const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const max = Math.max(...serie);
  return /*#__PURE__*/React.createElement(Card, {
    header: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)"
      }
    }, "Receita da semana"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-tiny)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, "08 \u2013 14 de junho")))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: compact ? 6 : 12,
      height: 150
    }
  }, serie.map((v, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 7,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-micro)",
      color: "var(--text-muted)",
      fontWeight: "var(--fw-semibold)"
    }
  }, (v / 1000).toFixed(1).replace(".", ","), "k"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: v / max * 104,
      borderRadius: "var(--radius-xs)",
      background: i === serie.length - 2 ? "var(--color-accent)" : "var(--color-accent-soft)",
      border: "1px solid " + (i === serie.length - 2 ? "transparent" : "var(--terracotta-200)")
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-micro)",
      color: "var(--text-muted)"
    }
  }, dias[i])))));
}
const RECENT_COLS = "minmax(0,1.4fr) minmax(0,1.3fr) minmax(0,1fr) minmax(0,.8fr)";
function VisaoGeral({
  compact,
  onView
}) {
  const d = window.DLUH;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--gap-section)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: compact ? "1fr 1fr" : "repeat(4, 1fr)",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    icon: "receipt-text",
    label: "Pedidos hoje",
    value: "14",
    delta: 8,
    deltaLabel: "vs. ontem"
  }), /*#__PURE__*/React.createElement(StatCard, {
    tone: "accent",
    icon: "wallet",
    label: "A receber",
    value: "R$ 3.420,00",
    chart: /*#__PURE__*/React.createElement(Sparkline, {
      data: d.serieReceita,
      height: 30
    })
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: "chef-hat",
    label: "Na fila",
    value: "4",
    unit: "pedidos"
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: "cake-slice",
    label: "Ticket m\xE9dio",
    value: "R$ 244",
    delta: -3,
    deltaLabel: "na semana"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: compact ? "1fr" : "1.6fr 1fr",
      gap: 12,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(ChartCard, {
    compact: compact
  }), /*#__PURE__*/React.createElement(Card, {
    header: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)"
      }
    }, "Pagamentos recentes"), /*#__PURE__*/React.createElement(IconButton, {
      icon: "arrow-up-right",
      label: "Abrir financeiro",
      size: 32,
      onClick: () => onView("financeiro")
    })),
    bodyStyle: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, d.pagamentos.map((p, i) => /*#__PURE__*/React.createElement(ListRow, {
    key: i,
    icon: p.icon,
    title: p.title,
    subtitle: p.sub,
    value: p.value,
    tone: p.tone
  })))), /*#__PURE__*/React.createElement(Card, {
    padded: false,
    header: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)"
      }
    }, "\xDAltimos pedidos"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-tiny)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, "5 de 6.244 no total")), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      iconRight: "arrow-right",
      onClick: () => onView("pedidos")
    }, "Ver todos"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: compact ? "4px 0" : "8px 0"
    }
  }, compact ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: RECENT_COLS,
      gap: 12,
      padding: "4px 18px 8px",
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "var(--ls-label)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Cliente"), /*#__PURE__*/React.createElement("span", null, "Status"), /*#__PURE__*/React.createElement("span", null, "Entrega"), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right"
    }
  }, "Total")), d.recentes.map(r => compact ? /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      padding: "12px 16px",
      borderTop: "var(--border-hairline) solid var(--color-border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-s)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)"
    }
  }, r.nome), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-s)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)",
      whiteSpace: "nowrap"
    }
  }, r.total)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(StatusBadge, {
    status: r.status,
    short: true
  }), /*#__PURE__*/React.createElement(Badge, null, r.cat), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)",
      display: "flex",
      alignItems: "center",
      gap: 4,
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 13
  }), r.data, " \xB7 ", r.hora))) : /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      display: "grid",
      gridTemplateColumns: RECENT_COLS,
      gap: 12,
      alignItems: "center",
      padding: "11px 18px",
      borderTop: "var(--border-hairline) solid var(--color-border)",
      fontSize: "var(--fs-body-s)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)"
    }
  }, r.nome), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)",
      marginTop: 2
    }
  }, r.cat)), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(StatusBadge, {
    status: r.status,
    short: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-body)",
      display: "flex",
      alignItems: "center",
      gap: 6,
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 14,
    style: {
      color: "var(--text-muted)"
    }
  }), r.data, " \xB7 ", r.hora), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-strong)",
      whiteSpace: "nowrap"
    }
  }, r.total))))));
}
Object.assign(window, {
  VisaoGeral,
  ChartCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/VisaoGeral.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/contratos-data.js
try { (() => {
/* Os dois modelos de contrato da D'Luh Festas, transcritos dos geradores atuais. */
window.DLUH_CONTRATOS = {
  buffet: {
    id: "buffet",
    nome: "Prestação de serviços de buffet",
    descricao: "Para festas e eventos com buffet da D'Luh — equipe, cardápio, utensílios e horários.",
    icone: "chef-hat",
    titulo: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE BUFFET",
    grupos: [{
      titulo: "Contratante",
      campos: [{
        id: "contratante_nome",
        rot: "Nome",
        req: true,
        span: 2
      }, {
        id: "contratante_end",
        rot: "Endereço",
        req: true,
        span: 2
      }, {
        id: "contratante_cpf",
        rot: "CPF / CNPJ",
        req: true
      }]
    }, {
      titulo: "Evento",
      campos: [{
        id: "evento_tipo",
        rot: "Tipo de evento",
        req: true,
        ph: "Aniversário de 15 anos"
      }, {
        id: "data_evento",
        rot: "Data do evento",
        tipo: "date",
        req: true
      }, {
        id: "local_evento",
        rot: "Local / espaço",
        req: true,
        span: 2
      }, {
        id: "inicio",
        rot: "Início",
        tipo: "time",
        req: true
      }, {
        id: "fim",
        rot: "Término",
        tipo: "time",
        req: true
      }, {
        id: "duracao",
        rot: "Duração",
        ph: "4 horas"
      }, {
        id: "tolerancia",
        rot: "Tolerância",
        ph: "30 minutos"
      }, {
        id: "convidados",
        rot: "Convidados",
        tipo: "number",
        req: true
      }, {
        id: "chegada",
        rot: "Chegada da equipe",
        tipo: "time"
      }, {
        id: "antecedencia",
        rot: "Antecedência de preparo",
        ph: "2 horas"
      }]
    }, {
      titulo: "Equipe",
      campos: [{
        id: "garcons",
        rot: "Garçons",
        tipo: "number"
      }, {
        id: "cozinheiras",
        rot: "Cozinheiras",
        tipo: "number"
      }, {
        id: "organizadores",
        rot: "Organizadores",
        tipo: "number"
      }, {
        id: "auxiliares",
        rot: "Auxiliares",
        tipo: "number"
      }]
    }, {
      titulo: "Valores",
      campos: [{
        id: "valor_total",
        rot: "Valor total",
        tipo: "dinheiro",
        req: true
      }, {
        id: "valor_extenso",
        rot: "Valor por extenso",
        req: true,
        span: 2
      }, {
        id: "entrada",
        rot: "Entrada",
        tipo: "dinheiro"
      }, {
        id: "data_entrada",
        rot: "Data da entrada",
        tipo: "date"
      }, {
        id: "cidade",
        rot: "Comarca / cidade",
        ph: "Montes Claros"
      }]
    }],
    abertura: "CONTRATANTE: {{contratante_nome}}\nEndereço: {{contratante_end}}\nCPF/CNPJ: {{contratante_cpf}}\n\nCONTRATADA: LUCIANA DE AGUILAR FREITAS, proprietária da empresa D'Luh Festas, com sede em Montes Claros, na Rua Visconde de Taunay, 278, Bairro Vila Maria Cândida, CEP 39402-394, Estado de Minas Gerais.\n\nAs partes acima identificadas têm, entre si, justo e contratado o presente Contrato de Prestação de Serviços de Buffet, oferecido pela D'Luh Festas, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.",
    clausulas: [{
      t: "CLÁUSULA 1ª – DO OBJETO",
      c: "A presente contratação tem como objeto a prestação de serviços de buffet, pela CONTRATADA, para {{evento_tipo}} da CONTRATANTE, a realizar-se no dia {{data_evento}}, no espaço {{local_evento}}, com início às {{inicio}} e término às {{fim}}."
    }, {
      t: "CLÁUSULA 2ª",
      c: "O evento terá duração de {{duracao}}, com tolerância de {{tolerancia}}, e contará com a presença estimada de {{convidados}} convidados. O local e horário do evento são os descritos na cláusula anterior."
    }, {
      t: "CLÁUSULA 3ª – DAS OBRIGAÇÕES DA CONTRATANTE",
      c: "A CONTRATANTE compromete-se a fornecer todas as informações necessárias para a adequada realização do serviço, especificando detalhes do evento e a forma de execução dos serviços contratados."
    }, {
      t: "CLÁUSULA 4ª",
      c: "A CONTRATANTE deverá realizar o pagamento conforme estipulado na Cláusula 11 deste contrato."
    }, {
      t: "CLÁUSULA 5ª – DAS OBRIGAÇÕES DA CONTRATADA",
      c: "A CONTRATADA deverá prestar os serviços conforme especificações da CONTRATANTE, iniciando-se às {{inicio}} e finalizando às {{fim}}. Os produtos servidos deverão ser de alta qualidade."
    }, {
      t: "CLÁUSULA 6ª",
      c: "A CONTRATADA se responsabiliza por fornecer utensílios como pratos, copos, taças, talheres, bandejas, réchauds, baldes de gelo, entre outras especificações em anexo, para execução dos serviços."
    }, {
      t: "CLÁUSULA 7ª",
      c: "A CONTRATADA deverá estar presente no local do evento às {{chegada}}, a fim de realizar a preparação do espaço com antecedência mínima de {{antecedencia}}."
    }, {
      t: "CLÁUSULA 8ª",
      c: "Serão disponibilizados para a execução do serviço: {{equipe}}."
    }, {
      t: "CLÁUSULA 9ª",
      c: "A CONTRATADA será exclusivamente responsável por seus colaboradores, incluindo cumprimento de obrigações trabalhistas, previdenciárias, fiscais e sociais."
    }, {
      t: "CLÁUSULA 10ª",
      c: "Todos os colaboradores da CONTRATADA deverão estar devidamente uniformizados, apresentando conduta adequada e profissional."
    }, {
      t: "CLÁUSULA 11ª – DO PREÇO E CONDIÇÕES DE PAGAMENTO",
      c: "O serviço será remunerado no valor de R$ {{valor_total}} ({{valor_extenso}}), com entrada de R$ {{entrada}} em {{data_entrada}}."
    }, {
      t: "CLÁUSULA 12ª – DO INADIMPLEMENTO",
      c: "Em caso de inadimplemento da CONTRATANTE, incidirão multa de 2%, juros de mora de 1% ao mês e correção monetária. Em caso de cobrança judicial, serão acrescidos honorários advocatícios de 20% e custas processuais."
    }, {
      t: "CLÁUSULA 13ª – DA DEVOLUÇÃO",
      c: "Todos os utensílios fornecidos deverão ser devolvidos em perfeito estado. Em caso de danos ou extravios, a CONTRATANTE deverá arcar com o valor de reposição conforme anexo, no prazo máximo de 24 horas após o evento, sob pena de aplicação de multa, juros e correção conforme cláusula anterior."
    }, {
      t: "CLÁUSULA 14ª – DA RESCISÃO",
      c: "O contrato poderá ser rescindido unilateralmente por qualquer das partes, mediante comunicação escrita com justificativa, respeitado o prazo mínimo de 60 (sessenta) dias antes da data do evento."
    }, {
      t: "CLÁUSULA 15ª",
      c: "Salvo rescisão conforme cláusula anterior, a parte que descumprir o contrato deverá pagar multa de 50% (cinquenta por cento) do valor total, sem prejuízo de eventuais perdas e danos."
    }, {
      t: "CLÁUSULA 16ª",
      c: "Caso necessário, e havendo possibilidade, a CONTRATADA poderá complementar os serviços de buffet durante o evento."
    }, {
      t: "CLÁUSULA 17ª",
      c: "O cardápio será preparado de acordo com o número de convidados informado. A CONTRATADA não será responsável por eventuais insuficiências caso haja número superior ao estipulado."
    }, {
      t: "CLÁUSULA 18ª",
      c: "Qualquer alteração neste contrato deverá ser feita por meio de Termo Aditivo, assinado por ambas as partes."
    }, {
      t: "CLÁUSULA 19ª – DO FORO",
      c: "Fica eleito o foro da Comarca de {{cidade}}/MG para dirimir quaisquer dúvidas ou litígios decorrentes deste contrato."
    }],
    assinaturas: ["Nome e assinatura do Contratado:", "Nome e assinatura do Contratante:", "Testemunha 1:", "Testemunha 2:"]
  },
  salao: {
    id: "salao",
    nome: "Locação do salão de festas",
    descricao: "Para quem aluga só o espaço — chave, horários, danos ao patrimônio e regras de som.",
    icone: "party-popper",
    titulo: "CONTRATO DE LOCAÇÃO DO SALÃO DE FESTAS",
    grupos: [{
      titulo: "Salão",
      campos: [{
        id: "salao_nome",
        rot: "Nome do salão",
        req: true,
        span: 2
      }, {
        id: "locadora_nome",
        rot: "Locadora",
        req: true,
        span: 2,
        def: "LUCIANA DE AGUILAR FREITAS"
      }, {
        id: "locadora_cpf",
        rot: "CPF da locadora"
      }, {
        id: "locadora_endereco",
        rot: "Endereço da locadora",
        span: 2
      }]
    }, {
      titulo: "Locatário (cliente)",
      campos: [{
        id: "nome",
        rot: "Nome completo",
        req: true,
        span: 2
      }, {
        id: "cpf",
        rot: "CPF",
        req: true
      }, {
        id: "rg",
        rot: "RG"
      }, {
        id: "estado_civil",
        rot: "Estado civil",
        tipo: "opcao",
        opcoes: ["solteiro(a)", "casado(a)", "divorciado(a)", "viúvo(a)"]
      }, {
        id: "profissao",
        rot: "Profissão"
      }, {
        id: "endereco",
        rot: "Endereço",
        req: true,
        span: 2
      }, {
        id: "bairro",
        rot: "Bairro"
      }, {
        id: "cidade",
        rot: "Cidade",
        def: "Montes Claros"
      }, {
        id: "uf",
        rot: "UF",
        def: "MG"
      }, {
        id: "telefone",
        rot: "Telefone",
        ph: "(38) 99999-9999"
      }]
    }, {
      titulo: "Evento",
      campos: [{
        id: "tipo_festa",
        rot: "Tipo de festa",
        req: true,
        ph: "de aniversário infantil"
      }, {
        id: "data_evento",
        rot: "Data",
        tipo: "date",
        req: true
      }, {
        id: "hora_inicio",
        rot: "Início",
        tipo: "time",
        req: true
      }, {
        id: "hora_chave",
        rot: "Entrega da chave",
        tipo: "time"
      }, {
        id: "hora_saida",
        rot: "Retirada dos pertences",
        tipo: "time"
      }, {
        id: "itens_fornecidos",
        rot: "Itens fornecidos",
        span: 2,
        ph: "mesas, cadeiras, som ambiente e brinquedos"
      }, {
        id: "decibeis",
        rot: "Limite de som (dB)",
        tipo: "number",
        def: "70"
      }, {
        id: "leis_municipais",
        rot: "Leis municipais",
        span: 2
      }]
    }, {
      titulo: "Valores e prazos",
      campos: [{
        id: "valor_total",
        rot: "Valor da locação",
        tipo: "dinheiro",
        req: true
      }, {
        id: "valor_total_extenso",
        rot: "Valor por extenso",
        span: 2
      }, {
        id: "entrada",
        rot: "Entrada já paga",
        tipo: "dinheiro"
      }, {
        id: "entrada_extenso",
        rot: "Entrada por extenso",
        span: 2
      }, {
        id: "forma_entrada",
        rot: "Forma da entrada",
        tipo: "opcao",
        opcoes: ["Pix", "Cartão", "Dinheiro"]
      }, {
        id: "saldo",
        rot: "Saldo",
        tipo: "dinheiro",
        auto: true
      }, {
        id: "saldo_extenso",
        rot: "Saldo por extenso",
        span: 2
      }, {
        id: "prazo_saldo_dias",
        rot: "Prazo do saldo (dias antes)",
        tipo: "number",
        def: "7"
      }, {
        id: "prazo_desistencia_dias",
        rot: "Prazo de desistência (dias)",
        tipo: "number",
        def: "30"
      }, {
        id: "foro",
        rot: "Foro",
        def: "Montes Claros"
      }]
    }],
    abertura: "Por este instrumento particular de contrato, de um lado como;\n\nLOCADORA: {{locadora_nome}}, portadora do CPF: {{locadora_cpf}}, residente e domiciliada a {{locadora_endereco}}, na cidade de Montes Claros – MG, e de outro lado como:\n\nLOCATÁRIO: {{nome}}, {{estado_civil}}, {{profissao}}, portador do CPF: {{cpf}}, RG {{rg}}, residente e domiciliado a {{endereco}}, {{bairro}}, {{cidade}} – {{uf}}, Telefone {{telefone}}. Doravante denominado simplesmente LOCATÁRIO, resolvem pactuar o presente contrato, de acordo com as condições e cláusulas seguintes;",
    clausulas: [{
      t: "1ª Cláusula",
      c: "É objeto do presente contrato do salão de festas {{salao_nome}} de propriedade da LOCADORA para realização de Festa {{tipo_festa}}, no dia {{data_evento}} às {{hora_inicio}}. A entrega da chave será às {{hora_chave}} do mesmo dia."
    }, {
      t: "2ª Cláusula",
      c: "São obrigações da LOCADORA:",
      sub: ["2.1 Colocar a disposição do LOCATÁRIO a área ora locada em perfeitas condições de uso.", "2.2 Fornecer {{itens_fornecidos}}.", "2.3 Informar todos os requisitos de segurança que salão oferece.", "2.4 Caso a LOCADORA desista de alugar o espaço, deverá comunicar ao LOCATÁRIO com antecedência de {{prazo_desistencia_dias}} dias, ficando obrigada a devolver assim o sinal já pago."]
    }, {
      t: "3ª Cláusula",
      c: "São obrigações do LOCATÁRIO:",
      sub: ["3.1 Efetuar o pagamento do valor da locação de {{valor_total}} ({{valor_total_extenso}}) ao LOCADOR, sendo {{entrada}} ({{entrada_extenso}}) já pago via {{forma_entrada}} e o restante {{saldo}} ({{saldo_extenso}}) ATÉ {{prazo_saldo_dias}} dias antes do dia da festa.", "3.2 Caso o LOCATÁRIO desista de realizar o evento, o valor da entrada, só será devolvido se avisar com antecedência de no mínimo {{prazo_desistencia_dias}} dias.", "3.3 Usar com zelo as dependências bem como todos os equipamentos e outros materiais colocados à sua disposição, sem qualquer dano.", "3.4 Responder por quaisquer danos causados ao patrimônio da LOCADORA, indenizando pela totalidade dos prejuízos que por ventura venha a ocorrer, quer por terceiros ou por elementos sob a subordinação direta ou indireta do LOCATÁRIO;", "3.5 É vedado ao LOCATÁRIO colocar mesas e cadeiras fora do salão de festas de qualquer forma, podendo causar transtornos entre vizinhança e LOCADORA.", "3.6 Fica estabelecida ainda que o LOCATÁRIO seguirá rigorosamente as leis municipais do meio ambiente ({{leis_municipais}}), comprometendo em manter a intensidade do volume/ volume do som em {{decibeis}} decibéis (som ambiente).", "3.7 Incidentes de qualquer natureza decorrente da festa (atividade), dentro ou fora do recinto, será única e exclusiva de responsabilidade do LOCATÁRIO.", "3.8 Na devolução do ambiente é de responsabilidade do LOCATÁRIO entregar o ambiente na mais perfeita ordem e limpeza possível.", "3.9 O LOCATÁRIO se compromete a retirar tudo que foi levado para dentro do salão pertencente ao mesmo até as {{hora_saida}} do dia seguinte."]
    }, {
      t: "5ª Cláusula",
      c: "A LOCADORA não se responsabiliza por objeto de quaisquer naturezas, esquecido dentro do salão de festas."
    }, {
      t: "6ª Cláusula",
      c: "A LOCADORA não tem nenhuma responsabilidade se por qualquer eventualidade climática o LOCATÁRIO não puder usufruir de algum espaço no salão de festa bem como os brinquedos."
    }, {
      t: "7ª Cláusula",
      c: "As partes elegem o foro da comarca de {{foro}} para solucionar as dúvidas oriundas deste contrato. E por acharem justos e contratados, assinam o presente em duas vias de igual teor, que o assinam."
    }],
    assinaturas: ["LOCADORA", "LOCATÁRIO"]
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/contratos-data.js", error: String((e && e.message) || e) }); }

// ui_kits/admin/data.js
try { (() => {
window.DLUH = {
  pedidos: [{
    id: "PED-2291",
    cliente: "Maria Helena",
    status: "Pago — Em produção",
    tel: "(38) 99812-4410",
    entrega: "12/06 · 15h",
    pgto: "Pix",
    tipo: null,
    total: "R$ 480,00",
    pago: "R$ 240,00",
    falta: "R$ 240,00",
    itens: [{
      qty: 1,
      name: "Bolo Vulcão 2kg",
      note: "Recheio: ninho com nutella",
      topper: "Topo: “Ana faz 5”",
      price: "R$ 240,00"
    }, {
      qty: 100,
      name: "Salgados sortidos",
      note: "Coxinha, risoles, quibe",
      price: "R$ 228,00"
    }, {
      qty: 1,
      name: "Taxa de entrega",
      note: "Centro · 3,2 km",
      price: "R$ 12,00"
    }]
  }, {
    id: "PED-2290",
    cliente: "Willian Bicalho",
    status: "Confirmado — Esperando pagamento",
    tel: "(38) 99114-2087",
    entrega: "13/06 · 11h",
    pgto: "Cartão",
    tipo: null,
    total: "R$ 740,00",
    pago: "R$ 0,00",
    falta: "R$ 370,00",
    itens: [{
      qty: 2,
      name: "Bolo Red Velvet 1,5kg",
      note: "Cobertura: cream cheese",
      price: "R$ 520,00"
    }, {
      qty: 50,
      name: "Docinhos gourmet",
      note: "Brigadeiro belga e beijinho",
      price: "R$ 220,00"
    }]
  }, {
    id: "PED-2289",
    cliente: "Padaria Central",
    status: "Aguardando confirmação",
    tel: "(38) 3221-9080",
    entrega: "14/06 · 07h",
    pgto: "Pix",
    tipo: "Empresa",
    total: "R$ 1.240,00",
    pago: "R$ 0,00",
    falta: null,
    itens: [{
      qty: 400,
      name: "Salgados para revenda",
      note: "Entrega semanal — contrato",
      price: "R$ 1.240,00"
    }]
  }, {
    id: "PED-2288",
    cliente: "Ana Cláudia",
    status: "Entregue — Esperando restante",
    tel: "(38) 99701-3322",
    entrega: "10/06 · 18h",
    pgto: "Dinheiro",
    tipo: null,
    total: "R$ 320,00",
    pago: "R$ 160,00",
    falta: "R$ 160,00",
    itens: [{
      qty: 1,
      name: "Bolo de festa 3 andares",
      note: "Tema: jardim encantado",
      topper: "Topo: “Helena 1 ano”",
      price: "R$ 320,00"
    }]
  }, {
    id: "PED-2287",
    cliente: "João Vitor",
    status: "Finalizado",
    tel: "(38) 99455-1190",
    entrega: "09/06 · 16h",
    pgto: "Pix",
    tipo: null,
    total: "R$ 188,00",
    pago: "R$ 188,00",
    falta: null,
    itens: [{
      qty: 1,
      name: "Torta salgada grande",
      note: "Frango com catupiry",
      price: "R$ 188,00"
    }]
  }],
  fila: [{
    id: "PED-2291",
    cliente: "Maria Helena",
    hora: "15:00",
    itens: "1 Bolo Vulcão 2kg · 100 Salgados sortidos",
    pago: "Só entrada",
    entrega: "Entrega"
  }, {
    id: "PED-2293",
    cliente: "Rafaela Prates",
    hora: "16:30",
    itens: "80 Docinhos gourmet",
    pago: "Totalmente pago",
    entrega: "Retirada"
  }, {
    id: "PED-2294",
    cliente: "Colégio São José",
    hora: "17:00",
    itens: "300 Salgados sortidos · 2 Bolos 1kg",
    pago: "Não pago",
    entrega: "Entrega"
  }, {
    id: "PED-2295",
    cliente: "Tiago Meireles",
    hora: "18:15",
    itens: "1 Bolo Red Velvet 1,5kg",
    pago: "Só entrada",
    entrega: "Retirada"
  }],
  agenda: [{
    data: "2026-06-05",
    tipo: "boleto",
    cliente: "Cemig",
    titulo: "Energia elétrica — cozinha e salão",
    valor: "R$ 684,30",
    situacao: "Pago",
    forma: "Débito automático"
  }, {
    data: "2026-06-10",
    tipo: "cartao",
    cliente: "Nubank PJ",
    titulo: "Fatura do cartão — insumos e embalagens",
    valor: "R$ 2.318,90",
    situacao: "Pago"
  }, {
    data: "2026-06-12",
    tipo: "boleto",
    cliente: "Distribuidora Doce Minas",
    titulo: "Chocolate, leite condensado e farinha",
    valor: "R$ 1.146,00",
    situacao: "Vence hoje",
    parcela: "2/3"
  }, {
    data: "2026-06-15",
    tipo: "boleto",
    cliente: "Copasa",
    titulo: "Água e esgoto",
    valor: "R$ 212,45",
    situacao: "A vencer"
  }, {
    data: "2026-06-17",
    tipo: "cartao",
    cliente: "Itaú Empresas",
    titulo: "Fatura do cartão — gás e manutenção",
    valor: "R$ 976,20",
    situacao: "A vencer"
  }, {
    data: "2026-06-20",
    tipo: "boleto",
    cliente: "Aluguel do salão",
    titulo: "Aluguel mensal",
    valor: "R$ 3.200,00",
    situacao: "A vencer"
  }, {
    data: "2026-06-25",
    tipo: "boleto",
    cliente: "Simples Nacional",
    titulo: "DAS — competência maio",
    valor: "R$ 1.482,77",
    situacao: "A vencer"
  }, {
    data: "2026-06-08",
    tipo: "boleto",
    cliente: "Embalagens Montes Claros",
    titulo: "Caixas para bolo e forminhas",
    valor: "R$ 438,00",
    situacao: "Vencido",
    parcela: "1/2"
  }, {
    data: "2026-06-10",
    tipo: "encomenda",
    hora: "18:00",
    cliente: "Ana Cláudia",
    titulo: "Bolo de festa 3 andares — jardim encantado",
    valor: "R$ 320,00",
    status: "Entregue — Esperando restante"
  }, {
    data: "2026-06-12",
    tipo: "encomenda",
    hora: "15:00",
    cliente: "Maria Helena",
    titulo: "Bolo Vulcão 2kg · 100 salgados sortidos",
    valor: "R$ 480,00",
    status: "Pago — Em produção"
  }, {
    data: "2026-06-12",
    tipo: "buffet",
    hora: "19:30",
    cliente: "Família Prates",
    titulo: "Buffet completo — aniversário de 15 anos",
    local: "Espaço Villa Bella",
    convidados: 120,
    valor: "R$ 8.400,00",
    status: "Pago — Em produção"
  }, {
    data: "2026-06-13",
    tipo: "encomenda",
    hora: "11:00",
    cliente: "Willian Bicalho",
    titulo: "2 bolos Red Velvet · 50 docinhos gourmet",
    valor: "R$ 740,00",
    status: "Confirmado — Esperando pagamento"
  }, {
    data: "2026-06-14",
    tipo: "encomenda",
    hora: "07:00",
    cliente: "Padaria Central",
    titulo: "400 salgados para revenda — contrato semanal",
    valor: "R$ 1.240,00",
    status: "Aguardando confirmação"
  }, {
    data: "2026-06-14",
    tipo: "festa",
    hora: "16:00",
    cliente: "Tiago Meireles",
    titulo: "Locação do salão — aniversário infantil",
    local: "Salão D'Luh",
    convidados: 60,
    valor: "R$ 1.800,00",
    status: "Confirmado — Esperando pagamento"
  }, {
    data: "2026-06-18",
    tipo: "buffet",
    hora: "20:00",
    cliente: "Colégio São José",
    titulo: "Buffet de formatura",
    local: "Auditório do colégio",
    convidados: 250,
    valor: "R$ 14.200,00",
    status: "Aguardando confirmação"
  }, {
    data: "2026-06-20",
    tipo: "festa",
    hora: "14:00",
    cliente: "Rafaela Prates",
    titulo: "Locação do salão — chá de bebê",
    local: "Salão D'Luh",
    convidados: 45,
    valor: "R$ 1.500,00",
    status: "Pago — Em produção"
  }, {
    data: "2026-06-21",
    tipo: "encomenda",
    hora: "09:30",
    cliente: "João Vitor",
    titulo: "Torta salgada grande — frango com catupiry",
    valor: "R$ 188,00",
    status: "Finalizado"
  }, {
    data: "2026-06-27",
    tipo: "buffet",
    hora: "12:00",
    cliente: "Empresa Minas Log",
    titulo: "Coffee break corporativo",
    local: "Sede da empresa",
    convidados: 80,
    valor: "R$ 3.900,00",
    status: "Confirmado — Esperando pagamento"
  }],
  contratos: [{
    cliente: "Família Prates",
    tipo: "buffet",
    data: "02/06/2026",
    valor: "R$ 8.400,00"
  }, {
    cliente: "Tiago Meireles",
    tipo: "salao",
    data: "28/05/2026",
    valor: "R$ 1.800,00"
  }, {
    cliente: "Colégio São José",
    tipo: "buffet",
    data: "21/05/2026",
    valor: "R$ 14.200,00"
  }],
  financeiro: {
    transacoes: [{
      desc: "Maria Helena · entrada PED-2291",
      tipo: "Entrada",
      meio: "Pix",
      data: "12/06",
      valor: 240
    }, {
      desc: "Atacadão · farinha e açúcar",
      tipo: "Saída",
      meio: "Cartão",
      data: "11/06",
      valor: 612.4
    }, {
      desc: "Rafaela Prates · PED-2293",
      tipo: "Entrada",
      meio: "Cartão",
      data: "11/06",
      valor: 352
    }, {
      desc: "Gás de cozinha",
      tipo: "Saída",
      meio: "Dinheiro",
      data: "10/06",
      valor: 130
    }],
    boletos: [{
      desc: "Cemig · energia",
      venc: "15/06",
      valor: 486.9,
      status: "Em aberto"
    }, {
      desc: "Embalagens Norte",
      venc: "20/06",
      valor: 740,
      status: "Em aberto"
    }, {
      desc: "Aluguel do salão",
      venc: "05/06",
      valor: 2200,
      status: "Pago"
    }],
    cartoes: [{
      nome: "Nubank Empresa",
      final: "4821",
      bandeira: "Mastercard",
      limite: 8000,
      fatura: 1942.3,
      venc: "10"
    }, {
      nome: "Sicoob",
      final: "0377",
      bandeira: "Visa",
      limite: 5000,
      fatura: 612.4,
      venc: "25"
    }]
  },
  serieSemana: [8, 11, 9, 14, 12, 19, 14],
  serieReceita: [1200, 1680, 1440, 2100, 1980, 2740, 2320],
  recentes: [{
    id: 1,
    nome: "Maria Helena",
    cat: "Bolo",
    status: "Pago — Em produção",
    total: "R$ 480,00",
    data: "12/06",
    hora: "14:00"
  }, {
    id: 2,
    nome: "Willian Bicalho",
    cat: "Docinhos",
    status: "Confirmado — Esperando pagamento",
    total: "R$ 740,00",
    data: "13/06",
    hora: "10:30"
  }, {
    id: 3,
    nome: "Padaria Central",
    cat: "Empresa",
    status: "Aguardando confirmação",
    total: "R$ 1.240,00",
    data: "14/06",
    hora: "08:00"
  }, {
    id: 4,
    nome: "Ana Cláudia",
    cat: "Bolo de festa",
    status: "Entregue — Esperando restante",
    total: "R$ 320,00",
    data: "10/06",
    hora: "16:00"
  }, {
    id: 5,
    nome: "João Vitor",
    cat: "Torta",
    status: "Finalizado",
    total: "R$ 188,00",
    data: "09/06",
    hora: "11:00"
  }],
  pagamentos: [{
    icon: "cake-slice",
    title: "Maria Helena",
    sub: "Entrada 50% · Pix",
    value: "+ R$ 240,00",
    tone: "in"
  }, {
    icon: "credit-card",
    title: "Rafaela Prates",
    sub: "Pagamento total · Cartão",
    value: "+ R$ 352,00",
    tone: "in"
  }, {
    icon: "truck",
    title: "Taxa de entrega",
    sub: "Centro · 3,2 km",
    value: "+ R$ 12,00",
    tone: "in"
  }, {
    icon: "rotate-ccw",
    title: "João Vitor",
    sub: "Reembolso de cancelamento",
    value: "− R$ 88,00",
    tone: "out"
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Spinner = __ds_scope.Spinner;

__ds_ns.STATUS = __ds_scope.STATUS;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.ListRow = __ds_scope.ListRow;

__ds_ns.OrderCard = __ds_scope.OrderCard;

__ds_ns.Sparkline = __ds_scope.Sparkline;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.UserChip = __ds_scope.UserChip;

__ds_ns.ConfirmDialog = __ds_scope.ConfirmDialog;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SearchInput = __ds_scope.SearchInput;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.DropdownMenu = __ds_scope.DropdownMenu;

__ds_ns.FilterPill = __ds_scope.FilterPill;

__ds_ns.SidebarNav = __ds_scope.SidebarNav;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Topbar = __ds_scope.Topbar;

})();
