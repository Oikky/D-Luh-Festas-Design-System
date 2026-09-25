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
/* Lucide names can end in digits ("trash-2" → Trash2), so the segment after a dash may be a number. */
const pascal = n => String(n).replace(/(^|[-_])([a-z0-9])/g, (_, __, c) => c.toUpperCase());
const missing = new Set();
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
  if (!nodes.length) {
    if (window.lucide && !missing.has(name)) {
      missing.add(name);
      console.warn(`[Icon] Lucide has no icon "${name}"`);
    }
    return /*#__PURE__*/React.createElement("span", _extends({
      "aria-hidden": "true",
      style: base
    }, rest));
  }
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
Object.assign(__ds_scope, {
  Icon
});
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
      maxWidth: "100%",
      minWidth: 0,
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 12,
    style: {
      flex: "0 0 auto"
    }
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      minWidth: 0
    }
  }, children));
}
Object.assign(__ds_scope, {
  Badge
});
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
    bg: "var(--color-accent-strong)",
    fg: "var(--color-accent-contrast)",
    line: "transparent"
  },
  success: {
    bg: "var(--action-success)",
    fg: "var(--action-fg)",
    line: "transparent"
  },
  chargeAll: {
    bg: "var(--action-charge-total)",
    fg: "var(--action-fg)",
    line: "transparent"
  },
  chargeEntry: {
    bg: "var(--action-charge-entry)",
    fg: "var(--action-fg)",
    line: "transparent"
  },
  delivered: {
    bg: "var(--action-delivered)",
    fg: "var(--action-fg)",
    line: "transparent"
  },
  warn: {
    bg: "var(--action-warn)",
    fg: "var(--action-fg)",
    line: "transparent"
  },
  danger: {
    bg: "var(--action-danger)",
    fg: "var(--action-fg)",
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
      /* In a row of block buttons they share the width equally, and a button that no longer fits
         its words moves to the next line (the row wraps) instead of breaking a word in half. */
      flex: block ? "1 1 0%" : undefined,
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      padding: s.padding,
      minHeight: s.minHeight,
      fontSize: s.fontSize,
      fontFamily: "var(--font-ui)",
      fontWeight: "var(--fw-semibold)",
      lineHeight: 1.2,
      textAlign: "center",
      borderRadius: "var(--radius-sm)",
      cursor: off ? "not-allowed" : "pointer",
      /* Labels wrap rather than overflow: pt-BR runs long, and a value in a label ("Criar 3 pedidos
         · R$ 12.480,00") can outgrow a phone. */
      opacity: off ? "var(--disabled-opacity)" : undefined,
      maxWidth: "100%",
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
  }) : null, children != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      overflowWrap: "break-word"
    }
  }, children) : null, iconRight && !loading ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: size === "sm" ? 15 : 17
  }) : null);
}
Object.assign(__ds_scope, {
  Button
});
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

/* A value Coda holds that is not in this list is shown as-is, never restyled as a known state: a
   neutral pill with a dashed outline and an alert glyph, so a typo in the single-select is visible
   instead of passing for "Finalizado". An empty value reads "Sem status". */
function StatusBadge({
  status,
  short = false,
  dot = true,
  style
}) {
  const meta = STATUS[status];
  if (!meta) return /*#__PURE__*/React.createElement("span", {
    "data-status": "desconhecido",
    title: "Status fora da lista do Coda",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "3px 11px",
      maxWidth: "100%",
      borderRadius: "var(--radius-pill)",
      border: "var(--border-hairline) dashed var(--color-border-strong)",
      background: "var(--color-surface-3)",
      color: "var(--text-body)",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      lineHeight: 1.6,
      whiteSpace: "nowrap",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "circle-alert",
    size: 12,
    style: {
      flex: "0 0 auto"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, status ? status : "Sem status"));
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
Object.assign(__ds_scope, {
  STATUS,
  StatusBadge
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function DataTable({
  columns = [],
  rows = [],
  empty,
  minWidth = 520,
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
      minWidth,
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
Object.assign(__ds_scope, {
  DataTable
});
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
  /* Money leaving is signed ("− R$"), not painted red: red is reserved for apagar. */
  const money = tone === "in" ? "var(--action-paid)" : "var(--text-strong)";
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    "data-row-action": onClick ? "" : undefined,
    role: onClick ? "button" : undefined,
    tabIndex: onClick ? 0 : undefined,
    onKeyDown: onClick ? e => {
      if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
        e.preventDefault();
        onClick(e);
      }
    } : undefined,
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
      transition: "var(--transition-control)",
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
Object.assign(__ds_scope, {
  ListRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/data/OrderCard.jsx
try { (() => {
/* "R$ 0,00" is a fact, not a payment: it stays neutral instead of taking the paid green. */
const isZero = v => /^R\$\s*0(,0+)?$/.test(String(v).trim());
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
        color: "var(--text-accent)",
        letterSpacing: "var(--ls-caps)",
        textTransform: "uppercase",
        marginBottom: 4
      }
    }, id) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)",
        color: "var(--text-strong)",
        overflowWrap: "anywhere"
      }
    }, customer || "Cliente sem nome"), meta.length ? /*#__PURE__*/React.createElement("div", {
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
    }, total == null || total === "" ? "—" : total), paid != null || due != null ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-small)",
        fontWeight: "var(--fw-semibold)",
        color: "var(--text-body)",
        marginTop: 4
      }
    }, paid != null ? /*#__PURE__*/React.createElement(React.Fragment, null, "Pago ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: isZero(paid) ? "var(--text-strong)" : "var(--action-paid)"
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
  }, !items.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-body-s)",
      color: "var(--text-muted)"
    }
  }, "Nenhum item registrado neste pedido.") : null, items.length ? /*#__PURE__*/React.createElement("div", {
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
      minWidth: 0,
      overflowWrap: "anywhere"
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
      color: "var(--text-accent)",
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
Object.assign(__ds_scope, {
  OrderCard
});
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
      color: "var(--text-accent)",
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
Object.assign(__ds_scope, {
  UserChip
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/UserChip.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ConfirmDialog.jsx
try { (() => {
/* Icon hue follows the confirm button's tone, so a money confirmation reads in the same
   semantic colour as the action that opened it. */
const HUE = {
  accent: "var(--color-accent)",
  danger: "var(--action-danger)",
  warn: "var(--action-warn)",
  success: "var(--action-success)",
  chargeAll: "var(--action-charge-total)",
  chargeEntry: "var(--action-charge-entry)",
  delivered: "var(--action-delivered)"
};
let seq = 0;
function ConfirmDialog({
  open = true,
  ...props
}) {
  return open ? /*#__PURE__*/React.createElement(ConfirmPanel, props) : null;
}

/* While `pending` the confirm button spins and nothing can close the dialog, so a write in flight
   is never abandoned half-way or sent twice. */
function ConfirmPanel({
  icon = "circle-check",
  tone = "accent",
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  pending = false,
  onConfirm,
  onCancel
}) {
  const panel = React.useRef(null);
  const [ids] = React.useState(() => {
    const n = ++seq;
    return {
      t: "dluh-confirm-t" + n,
      m: "dluh-confirm-m" + n
    };
  });
  __ds_scope.useDialogFocus(panel, pending ? null : onCancel);
  const entrada = __ds_scope.useEntrada();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-10)",
      background: "var(--overlay-scrim)",
      ...entrada.scrim
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: panel,
    role: "alertdialog",
    "aria-modal": "true",
    "aria-labelledby": ids.t,
    "aria-describedby": message ? ids.m : undefined,
    tabIndex: -1,
    style: {
      background: "var(--color-surface)",
      borderRadius: "var(--radius-lg)",
      maxWidth: 360,
      width: "100%",
      outline: "none",
      padding: "22px 20px",
      textAlign: "center",
      boxShadow: "var(--shadow-modal)",
      fontFamily: "var(--font-ui)",
      ...entrada.panel
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      margin: "0 auto var(--space-5)",
      borderRadius: "var(--radius-pill)",
      background: "var(--color-surface-3)",
      color: HUE[tone] || HUE.accent,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 25
  })), /*#__PURE__*/React.createElement("div", {
    id: ids.t,
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--fs-title)",
      fontWeight: "var(--fw-bold)",
      color: "var(--text-strong)",
      marginBottom: 6
    }
  }, title), message ? /*#__PURE__*/React.createElement("div", {
    id: ids.m,
    style: {
      fontSize: "var(--fs-body-s)",
      color: "var(--text-body)",
      lineHeight: "var(--lh-normal)",
      marginBottom: "var(--space-9)"
    }
  }, message) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    block: true,
    onClick: onCancel,
    disabled: pending,
    "data-autofocus": true
  }, cancelLabel), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    block: true,
    tone: HUE[tone] ? tone : "accent",
    onClick: onConfirm,
    loading: pending
  }, confirmLabel))));
}
Object.assign(__ds_scope, {
  ConfirmDialog
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ConfirmDialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/* Shared by Modal and ConfirmDialog: moves focus into the dialog, keeps Tab inside it, maps
   Escape to the dialog's own exit and hands focus back to whatever opened it. */
function useDialogFocus(ref, onEscape) {
  const esc = React.useRef(onEscape);
  esc.current = onEscape;
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const opener = document.activeElement;
    const list = () => [...node.querySelectorAll(FOCUSABLE)].filter(el => el.getClientRects().length);
    (node.querySelector("[data-autofocus]") || node).focus({
      preventScroll: true
    });
    const onKey = e => {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (esc.current) esc.current();
        return;
      }
      if (e.key !== "Tab") return;
      const f = list();
      if (!f.length) {
        e.preventDefault();
        return;
      }
      const first = f[0],
        last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === node)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    node.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("keydown", onKey);
      if (opener && opener.focus && document.contains(opener)) opener.focus({
        preventScroll: true
      });
    };
  }, []);
}
let seq = 0;

/* Dialogs rise in once, on open: the scrim fades and the panel settles from 97% on ease-out, so
   the page behind does not swap instantly. Centered, so no transform-origin. Closing is instant;
   the operator already decided. Reduced motion keeps the fade and drops the scale. */
function useEntrada() {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const f = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(f);
  }, []);
  return {
    scrim: {
      opacity: on ? 1 : 0,
      transition: "opacity var(--dur-base) var(--ease-out)"
    },
    panel: {
      opacity: on ? 1 : 0,
      transform: on ? "none" : "scale(.97)",
      transition: "opacity var(--dur-base) var(--ease-out), transform var(--dur-move) var(--ease-out)"
    }
  };
}
function Modal({
  open = true,
  ...props
}) {
  return open ? /*#__PURE__*/React.createElement(ModalPanel, props) : null;
}
function ModalPanel({
  title,
  subtitle,
  children,
  footer,
  onClose,
  dismissible = true,
  width = 580,
  style
}) {
  const panel = React.useRef(null);
  const [titleId] = React.useState(() => "dluh-modal-" + ++seq);
  useDialogFocus(panel, onClose);
  const entrada = useEntrada();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-10)",
      background: "var(--overlay-scrim)",
      ...entrada.scrim
    },
    onClick: e => {
      if (dismissible && onClose && e.target === e.currentTarget) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: panel,
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": title ? titleId : undefined,
    tabIndex: -1,
    style: {
      background: "var(--color-surface)",
      borderRadius: "var(--radius-lg)",
      width: "100%",
      outline: "none",
      maxWidth: width,
      maxHeight: "calc(100dvh - 2 * var(--space-10))",
      overflowY: "auto",
      padding: "22px 20px",
      boxShadow: "var(--shadow-modal)",
      fontFamily: "var(--font-ui)",
      ...entrada.panel,
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
    id: titleId,
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
      width: 40,
      height: 40,
      margin: "-10px -10px 0 0",
      flex: "0 0 auto",
      border: "none",
      borderRadius: "var(--radius-sm)",
      background: "transparent",
      cursor: "pointer",
      color: "var(--text-muted)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0
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
      flexWrap: "wrap",
      gap: "var(--space-5)",
      marginTop: "var(--space-8)"
    }
  }, footer) : null));
}
Object.assign(__ds_scope, {
  useDialogFocus,
  useEntrada,
  Modal
});
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
  /* Mounts one frame hidden so the documented 250ms rise plays instead of a pop-in. */
  const [montado, setMontado] = React.useState(false);
  React.useEffect(() => {
    const f = requestAnimationFrame(() => setMontado(true));
    return () => cancelAnimationFrame(f);
  }, []);
  visible = visible && montado;
  const fg = tone === "success" ? "var(--action-paid-line)" : tone === "danger" ? "var(--action-danger)" : "#fff";
  return /*#__PURE__*/React.createElement("div", {
    role: tone === "danger" ? "alert" : "status",
    style: {
      /* Fixed to the viewport, above the modal layer: a toast confirms the action that just
         happened, even when that action came from inside a dialog or a scrolled list. The shell
         sets --toast-offset to clear the mobile bottom bar. */
      position: "fixed",
      bottom: "calc(var(--space-11) + var(--toast-offset, 0px) + env(safe-area-inset-bottom))",
      left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      opacity: visible ? 1 : 0,
      transition: "opacity var(--dur-base) var(--ease-out), transform var(--dur-move) var(--ease-out)",
      display: "inline-flex",
      alignItems: "center",
      gap: 9,
      padding: "12px 20px",
      background: "#222",
      color: "#fff",
      borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--fs-body-l)",
      lineHeight: "var(--lh-snug)",
      /* Shrink-wraps short messages; long pt-BR ones wrap inside the viewport instead of running off it. */
      width: "max-content",
      maxWidth: "calc(100vw - 32px)",
      pointerEvents: "none",
      zIndex: 1100,
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 17,
    style: {
      color: fg,
      flex: "0 0 auto"
    }
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0
    }
  }, children));
}
Object.assign(__ds_scope, {
  Toast
});
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
    placeholder: placeholder
  }, rest, {
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    },
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
      width: 32,
      height: 32,
      margin: "-8px -8px -8px 0",
      border: "none",
      borderRadius: "var(--radius-pill)",
      background: "transparent",
      cursor: "pointer",
      color: "var(--text-muted)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 16
  })) : null);
}
Object.assign(__ds_scope, {
  SearchInput
});
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
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      width: "100%",
      background: "var(--color-surface)",
      border: `${accent ? "var(--border-control)" : "var(--border-hairline)"} solid ${accent || focus ? "var(--color-accent)" : "var(--color-border)"}`,
      borderRadius: "var(--radius-xs)",
      boxShadow: focus ? "var(--focus-ring)" : "none",
      transition: "var(--transition-control)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("select", _extends({}, rest, {
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    },
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
      color: accent ? "var(--text-accent)" : "var(--text-strong)"
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
Object.assign(__ds_scope, {
  Select
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/navigation/DropdownMenu.jsx
try { (() => {
/* The menu is position: fixed against the trigger's rect, so a parent with overflow: hidden
   (every Card) can no longer clip it. It flips above the trigger when there is no room below. */
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
  const menu = React.useRef(null);
  const [pos, setPos] = React.useState(null);
  const place = () => {
    const t = ref.current.getBoundingClientRect();
    const h = menu.current ? menu.current.offsetHeight : 0;
    const below = t.bottom + 6 + h <= window.innerHeight - 8;
    setPos({
      top: below ? t.bottom + 6 : Math.max(8, t.top - 6 - h),
      [align]: align === "right" ? window.innerWidth - t.right : t.left
    });
  };
  const close = refocus => {
    setOpen(false);
    if (refocus) {
      const b = ref.current && ref.current.querySelector("button");
      if (b) b.focus();
    }
  };
  React.useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    place();
    const away = e => {
      if (ref.current && !ref.current.contains(e.target) && menu.current && !menu.current.contains(e.target)) close(false);
    };
    const drop = () => close(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away);
    window.addEventListener("resize", drop);
    document.addEventListener("scroll", drop, true);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("touchstart", away);
      window.removeEventListener("resize", drop);
      document.removeEventListener("scroll", drop, true);
    };
  }, [open]);

  /* Focus moves in only once the menu is placed; a visibility: hidden element cannot take focus. */
  React.useEffect(() => {
    if (!open || !pos) return;
    const first = menu.current && menu.current.querySelector('[role="menuitem"]');
    if (first && !menu.current.contains(document.activeElement)) first.focus({
      preventScroll: true
    });
  }, [open, !!pos]);
  const onMenuKey = e => {
    const list = [...menu.current.querySelectorAll('[role="menuitem"]')];
    const i = list.indexOf(document.activeElement);
    const go = n => {
      e.preventDefault();
      list[(n + list.length) % list.length].focus();
    };
    if (e.key === "ArrowDown") go(i + 1);else if (e.key === "ArrowUp") go(i - 1);else if (e.key === "Home") go(0);else if (e.key === "End") go(list.length - 1);else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    } else if (e.key === "Tab") close(false);
  };
  const trig = React.isValidElement(trigger) ? React.cloneElement(trigger, {
    "aria-haspopup": "menu",
    "aria-expanded": open,
    onClick: e => {
      trigger.props.onClick && trigger.props.onClick(e);
      setOpen(!open);
    },
    onKeyDown: e => {
      if (e.key === "ArrowDown" && !open) {
        e.preventDefault();
        setOpen(true);
      }
    }
  }) : /*#__PURE__*/React.createElement("span", {
    onClick: () => setOpen(!open)
  }, trigger);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    }
  }, trig, open ? /*#__PURE__*/React.createElement("div", {
    ref: menu,
    role: "menu",
    onKeyDown: onMenuKey,
    style: {
      position: "fixed",
      zIndex: 950,
      visibility: pos ? "visible" : "hidden",
      ...(pos || {
        top: 0,
        [align]: 0
      }),
      display: "flex",
      flexDirection: "column",
      gap: 2,
      minWidth: 220,
      maxWidth: "calc(100vw - 16px)",
      padding: 6,
      background: "var(--color-surface)",
      border: "var(--border-hairline) solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-pop)",
      fontFamily: "var(--font-ui)"
    }
  }, items.map((it, i) => it.divider ? /*#__PURE__*/React.createElement("span", {
    key: i,
    role: "separator",
    style: {
      height: 1,
      background: "var(--color-border)",
      margin: "4px 0"
    }
  }) : /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    role: "menuitem",
    tabIndex: -1,
    onClick: () => {
      close(true);
      it.onClick && it.onClick();
    },
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      width: "100%",
      minHeight: 40,
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
Object.assign(__ds_scope, {
  DropdownMenu
});
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
    "aria-pressed": as === "button" ? active : undefined,
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
      color: active ? "var(--text-accent)" : "var(--text-body)",
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
Object.assign(__ds_scope, {
  FilterPill
});
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
      transition: "width var(--dur-move) var(--ease-out)",
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
Object.assign(__ds_scope, {
  SidebarNav
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SidebarNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/* Roving tabindex: Tab lands on the selected tab, arrows move between tabs (and select them),
   Home/End jump to the ends. The selected tab scrolls into view when the strip overflows on
   a phone, so "Em produção" is never selected off-screen. */
function Tabs({
  items = [],
  value,
  onChange,
  style
}) {
  const list = React.useRef(null);
  React.useEffect(() => {
    const el = list.current && list.current.querySelector('[aria-selected="true"]');
    if (el && list.current.scrollWidth > list.current.clientWidth) el.scrollIntoView({
      block: "nearest",
      inline: "nearest"
    });
  }, [value]);
  const onKey = e => {
    const i = items.findIndex(it => it.id === value);
    const to = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      Home: 0,
      End: items.length - 1
    }[e.key];
    if (to == null || !onChange) return;
    e.preventDefault();
    const n = (to + items.length) % items.length;
    onChange(items[n].id);
    const btn = list.current.querySelectorAll('[role="tab"]')[n];
    if (btn) btn.focus();
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    ref: list,
    onKeyDown: onKey,
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
      tabIndex: active ? 0 : -1,
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
        color: active ? "var(--text-accent)" : "var(--text-muted)",
        fontSize: "var(--fs-body)",
        fontWeight: active ? "var(--fw-semibold)" : "var(--fw-medium)",
        transition: "var(--transition-control)"
      }
    }, it.label, it.count != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: "var(--fw-semibold)",
        color: active ? "var(--text-accent)" : "var(--text-muted)"
      }
    }, it.count) : null);
  }));
}
Object.assign(__ds_scope, {
  Tabs
});
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

/* Colour here separates only two families: what the shop delivers (terracotta) and what the
   shop pays (neutral ink). Blue, violet and teal belong to money actions, so the five types
   tell themselves apart by glyph and label instead. */
const EVENTO = {
  cor: "var(--color-accent)",
  texto: "var(--text-accent)",
  tint: "var(--color-accent-soft)"
};
const CONTA = {
  cor: "var(--text-body)",
  texto: "var(--text-body)",
  tint: "var(--color-surface-3)"
};
const TIPOS = {
  encomenda: {
    rot: "Encomenda",
    ...EVENTO,
    icone: "cake-slice"
  },
  buffet: {
    rot: "Buffet",
    ...EVENTO,
    icone: "chef-hat"
  },
  festa: {
    rot: "Festa",
    ...EVENTO,
    icone: "party-popper"
  },
  boleto: {
    rot: "Boleto",
    ...CONTA,
    icone: "barcode",
    fin: true
  },
  cartao: {
    rot: "Cartão",
    ...CONTA,
    icone: "credit-card",
    fin: true
  }
};
/* A row whose tipo is not one of the five still shows, as a neutral "Outro", instead of breaking
   the calendar. */
const OUTRO = {
  rot: "Outro",
  cor: "var(--text-muted)",
  texto: "var(--text-body)",
  tint: "var(--color-surface-3)",
  icone: "circle-help"
};
const tipoDe = x => TIPOS[x.tipo] || OUTRO;
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
      background: (TIPOS[tipo] || OUTRO).cor,
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
  compact,
  hoje
}) {
  const primeiro = new Date(ano, mes, 1).getDay();
  const dias = new Date(ano, mes + 1, 0).getDate();
  const celulas = [];
  for (let i = 0; i < primeiro; i++) celulas.push(null);
  for (let d = 1; d <= dias; d++) celulas.push(d);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,minmax(0,1fr))",
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
      gridTemplateColumns: "repeat(7,minmax(0,1fr))",
      gap: 4
    }
  }, celulas.map((d, i) => {
    if (!d) return /*#__PURE__*/React.createElement("div", {
      key: "e" + i
    });
    const chave = ano + "-" + String(mes + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    const doDia = itens.filter(x => x.data === chave);
    const ativo = sel === chave;
    const eHoje = chave === hoje;
    return /*#__PURE__*/React.createElement("button", {
      key: chave,
      type: "button",
      "data-cell": true,
      onClick: () => onSel(chave),
      "aria-pressed": ativo,
      "aria-label": d + " de " + MESES[mes] + (eHoje ? ", hoje" : "") + (doDia.length ? ", " + doDia.length + (doDia.length === 1 ? " compromisso" : " compromissos") : ""),
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
        background: ativo ? "var(--color-accent-strong)" : doDia.length ? "var(--color-surface-2)" : "transparent",
        border: "var(--border-hairline) solid " + (ativo ? "transparent" : eHoje ? "var(--color-accent)" : "var(--color-border-soft)"),
        color: ativo ? "var(--color-accent-contrast)" : "var(--text-strong)",
        transition: "var(--transition-control)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        fontSize: "var(--fs-tiny)",
        fontWeight: eHoje || ativo ? "var(--fw-bold)" : "var(--fw-medium)"
      }
    }, d), compact ? /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
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
      "aria-hidden": "true",
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
        background: ativo ? "transparent" : tipoDe(x).tint,
        color: ativo ? "inherit" : tipoDe(x).texto,
        fontSize: "var(--fs-caption)",
        fontWeight: "var(--fw-semibold)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, x.hora ? x.hora + " " : "", x.cliente.split(" ")[0])), doDia.length > 2 ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-caption)",
        color: ativo ? "inherit" : "var(--text-muted)",
        paddingLeft: 5
      }
    }, "+", doDia.length - 2) : null));
  })));
}
function ItemAgenda({
  x
}) {
  const t = tipoDe(x);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      padding: "12px 13px",
      borderRadius: "var(--radius-sm)",
      background: "var(--color-surface)",
      border: "var(--border-hairline) solid var(--color-border)",
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
      fontWeight: "var(--fw-semibold)",
      overflowWrap: "anywhere",
      minWidth: 0
    }
  }, x.cliente || "Sem nome"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      color: t.texto
    }
  }, t.rot)), x.titulo ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)",
      marginTop: 3,
      lineHeight: "var(--lh-snug)",
      overflowWrap: "anywhere"
    }
  }, x.titulo) : null, /*#__PURE__*/React.createElement("div", {
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
      color: "var(--text-strong)"
    }
  }, x.valor ? t.fin ? "− " + x.valor : x.valor : "—"), t.fin ? x.situacao ? /*#__PURE__*/React.createElement(Badge, {
    tone: SITUACAO[x.situacao] || "neutral"
  }, x.situacao) : null : /*#__PURE__*/React.createElement(StatusBadge, {
    status: x.status,
    short: true
  })));
}
function Agenda({
  compact
}) {
  const hoje = window.DLUH.hoje;
  const carga = useCarga(() => window.DLUH_API.carregar("agenda"));
  const [filtro, setFiltro] = React.useState("tudo");
  const [sel, setSel] = React.useState(hoje);
  const [cursor, setCursor] = React.useState(() => ({
    ano: Number(hoje.slice(0, 4)),
    mes: Number(hoje.slice(5, 7)) - 1
  }));
  const {
    ano,
    mes
  } = cursor;
  /* Moving the month moves the selected day with it (same day number, clamped to the month),
     so the detail card never describes a month the grid is not showing. */
  const irPara = (a, m) => {
    const d = new Date(a, m, 1),
      na = d.getFullYear(),
      nm = d.getMonth();
    const dia = Math.min(Number(sel.slice(8, 10)), new Date(na, nm + 1, 0).getDate());
    setCursor({
      ano: na,
      mes: nm
    });
    setSel(na + "-" + String(nm + 1).padStart(2, "0") + "-" + String(dia).padStart(2, "0"));
  };
  const escolher = chave => {
    setSel(chave);
    setCursor({
      ano: Number(chave.slice(0, 4)),
      mes: Number(chave.slice(5, 7)) - 1
    });
  };

  /* Rows with no date cannot sit on a calendar; they are left out rather than breaking the grid. */
  const todos = (carga.dados || []).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.data || ""));
  const itens = filtro === "tudo" ? todos : todos.filter(x => x.tipo === filtro);
  const doDia = itens.filter(x => x.data === sel).sort((a, b) => (a.hora || "00:00").localeCompare(b.hora || "00:00"));
  const proximos = itens.filter(x => x.data > sel).sort((a, b) => (a.data + (a.hora || "")).localeCompare(b.data + (b.hora || ""))).slice(0, 4);
  const [aa, mm, dd] = sel.split("-");
  const dataLonga = Number(dd) + " de " + MESES[Number(mm) - 1];
  const mesChave = ano + "-" + String(mes + 1).padStart(2, "0");
  const aPagar = todos.filter(x => tipoDe(x).fin && x.situacao !== "Pago" && x.data.slice(0, 7) === mesChave).reduce((s, x) => s + (Number(String(x.valor || "").replace(/[^\d,]/g, "").replace(",", ".")) || 0), 0);
  const doMes = itens.filter(x => x.data.slice(0, 7) === mesChave).length;
  if (carga.estado === "erro" && !carga.dados) return /*#__PURE__*/React.createElement(ErroCarga, {
    erro: carga.erro,
    oque: "a agenda",
    onTentar: carga.tentar
  });
  if (!carga.dados) return /*#__PURE__*/React.createElement(Carregando, {
    oque: "a agenda"
  });
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
      size: 36,
      onClick: () => irPara(ano, mes - 1)
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
      size: 36,
      onClick: () => irPara(ano, mes + 1)
    })))
  }, /*#__PURE__*/React.createElement(Calendario, {
    ano: ano,
    mes: mes,
    sel: sel,
    onSel: escolher,
    itens: itens,
    compact: compact,
    hoje: hoje
  }), doMes ? null : /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
      padding: "10px 12px",
      borderRadius: "var(--radius-sm)",
      background: "var(--color-surface-2)",
      fontSize: "var(--fs-body-s)",
      color: "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar-x",
    size: 16,
    style: {
      color: "var(--text-muted)"
    }
  }), filtro === "tudo" ? `Nenhum compromisso em ${MESES[mes]}.` : `Nenhum item de ${tipoDe({
    tipo: filtro
  }).rot.toLowerCase()} em ${MESES[mes]}.`), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      flexWrap: "wrap",
      marginTop: 12
    }
  }, [["encomenda", "Encomendas e eventos"], ["boleto", "Contas"]].map(([k, rot]) => /*#__PURE__*/React.createElement("span", {
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
  }), rot)))), /*#__PURE__*/React.createElement("div", {
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
    icon: tipoDe(x).icone,
    title: x.cliente,
    subtitle: tipoDe(x).rot + " · " + x.data.split("-").reverse().slice(0, 2).join("/") + (x.hora ? " · " + x.hora : ""),
    value: tipoDe(x).fin ? "− " + x.valor : x.valor,
    tone: tipoDe(x).fin ? "out" : "neutral",
    onClick: () => escolher(x.data)
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
const dataBR = iso => iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) : "sem data";
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
      sub: p.id + " · " + (p.status || "sem status"),
      value: p.total,
      busca: [p.cliente, p.id, p.tel, p.status, ...(p.itens || []).map(i => i.name)],
      q: p.id
    }))
  }, {
    id: "eventos",
    label: "Eventos",
    icon: "party-popper",
    view: "agenda",
    itens: ag.filter(e => e.tipo === "buffet" || e.tipo === "festa").map(e => ({
      title: e.titulo,
      sub: [e.cliente, e.data ? dataBR(e.data) + (e.hora ? " " + e.hora : "") : null, e.local].filter(Boolean).join(" · "),
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
  onPick,
  id,
  ativo,
  onHover
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    id: id,
    role: "option",
    "aria-selected": ativo,
    tabIndex: -1,
    onMouseDown: e => e.preventDefault(),
    onClick: () => onPick(grupo, it),
    onMouseEnter: onHover,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      padding: "8px 10px",
      border: "none",
      borderRadius: "var(--radius-sm)",
      background: ativo ? "var(--color-accent-soft)" : "transparent",
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
      color: it.tone === "in" ? "var(--action-paid)" : "var(--text-strong)"
    }
  }, it.value) : null);
}
function GlobalSearch({
  q,
  onQ,
  onView
}) {
  const [open, setOpen] = React.useState(false);
  const [ativo, setAtivo] = React.useState(-1);
  const indice = React.useMemo(indiceBusca, []);
  const t = norm(q).trim();
  const grupos = t ? indice.map(g => ({
    ...g,
    achados: g.itens.filter(it => it.busca.some(s => norm(s).includes(t)))
  })).filter(g => g.achados.length) : [];
  const total = grupos.reduce((s, g) => s + g.achados.length, 0);
  /* Flat list of what is on screen (five per group), so arrows walk the results in order. */
  const visiveis = grupos.flatMap(g => g.achados.slice(0, 5).map(it => ({
    g,
    it
  })));
  const pick = (g, it) => {
    onView(g.view);
    onQ(it.q || "");
    setOpen(false);
    setAtivo(-1);
  };
  const aberto = open && !!t;
  const onKey = e => {
    if (e.key === "Escape") {
      if (aberto) {
        e.preventDefault();
        setOpen(false);
      } else if (q) onQ("");
      return;
    }
    if (!visiveis.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      const d = e.key === "ArrowDown" ? 1 : -1;
      setAtivo(a => (a + d + visiveis.length) % visiveis.length);
    } else if (e.key === "Enter" && aberto && ativo >= 0 && visiveis[ativo]) {
      e.preventDefault();
      pick(visiveis[ativo].g, visiveis[ativo].it);
    }
  };
  React.useEffect(() => {
    setAtivo(-1);
  }, [t]);
  React.useEffect(() => {
    const el = ativo >= 0 && document.getElementById("busca-op-" + ativo);
    if (el) el.scrollIntoView({
      block: "nearest"
    });
  }, [ativo]);
  let n = -1;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement(BX.SearchInput, {
    value: q,
    onChange: e => {
      onQ(e.target.value);
      setOpen(true);
    },
    onClear: () => onQ(""),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    onKeyDown: onKey,
    role: "combobox",
    "aria-label": "Buscar pedidos, eventos e pagamentos",
    "aria-expanded": aberto,
    "aria-controls": "busca-resultados",
    "aria-autocomplete": "list",
    "aria-activedescendant": aberto && ativo >= 0 ? "busca-op-" + ativo : undefined,
    placeholder: "Pesquise aqui qualquer coisa",
    style: {
      width: "100%",
      maxWidth: "none"
    }
  }), aberto ? /*#__PURE__*/React.createElement("div", {
    id: "busca-resultados",
    role: "listbox",
    "aria-label": "Resultados da busca",
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
    role: "group",
    "aria-label": g.label,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      paddingBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
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
  }, /*#__PURE__*/React.createElement("span", null, g.label), /*#__PURE__*/React.createElement("span", null, g.achados.length)), g.achados.slice(0, 5).map((it, i) => {
    n++;
    const k = n;
    return /*#__PURE__*/React.createElement(ResultadoRow, {
      key: i,
      id: "busca-op-" + k,
      ativo: k === ativo,
      onHover: () => setAtivo(k),
      grupo: g,
      it: it,
      onPick: pick
    });
  }))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 10px",
      fontSize: "var(--fs-body-s)",
      color: "var(--text-muted)",
      textAlign: "center"
    }
  }, "Nada encontrado para \u201C", q, "\u201D.", /*#__PURE__*/React.createElement("br", null), "Busque pelo nome do cliente, n\xFAmero do pedido (PED-\u2026), telefone, evento ou fornecedor.")) : null);
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
  onChange,
  travado
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
      "aria-pressed": on,
      disabled: travado && !on,
      onClick: () => onChange(m.id),
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        textAlign: "left",
        cursor: travado ? "default" : "pointer",
        opacity: travado && !on ? "var(--disabled-opacity)" : undefined,
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
        background: on ? "var(--color-accent-strong)" : "var(--color-surface-3)",
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
        color: on ? "var(--text-accent)" : "var(--text-strong)"
      }
    }, m.nome), on ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16,
      color: "var(--text-accent)"
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
      fontSize: 16,
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
  onToast,
  naoSalvo
}) {
  const tipo = contrato.tipo;
  const modelo = modelos.find(m => m.id === tipo);
  const [verPrevia, setVerPrevia] = React.useState(!compact);
  const [finalizar, setFinalizar] = React.useState(false);
  const set = (id, v) => onChange({
    dados: {
      ...contrato.dados,
      [tipo]: {
        ...contrato.dados[tipo],
        [id]: v
      }
    }
  });

  /* The hall contract's saldo is derived from total minus entrada on every render. Storing it
     used to rewrite the contract, and its "salvo" time, the moment it was opened. */
  const base = contrato.dados[tipo];
  const vals = tipo !== "salao" ? base : (() => {
    const t = Number(String(base.valor_total || "").replace(",", "."));
    const e = Number(String(base.entrada || "").replace(",", "."));
    const s = (isNaN(t) ? 0 : t) - (isNaN(e) ? 0 : e);
    return {
      ...base,
      saldo: s > 0 ? String(s) : ""
    };
  })();
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
  }, final ? "Finalizado" : "Rascunho"), naoSalvo ? /*#__PURE__*/React.createElement("span", {
    title: "O armazenamento do navegador recusou a grava\xE7\xE3o (cheio ou em modo privado)."
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "danger",
    icon: "circle-alert"
  }, "N\xE3o salvo neste aparelho")) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)"
    }
  }, "Salvo automaticamente \xB7 ", contrato.atualizado)), /*#__PURE__*/React.createElement(EscolhaTipo, {
    modelos: modelos,
    valor: tipo,
    travado: final,
    onChange: t => !final && onChange({
      tipo: t
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--gap-inline)",
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, final ? null : /*#__PURE__*/React.createElement(Badge, {
    tone: faltando ? "warn" : "success",
    icon: faltando ? "circle-alert" : "circle-check"
  }, faltando ? faltando === 1 ? "Falta 1 campo obrigatório" : "Faltam " + faltando + " campos obrigatórios" : "Pronto para gerar"), /*#__PURE__*/React.createElement("div", {
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
    disabled: faltando > 0,
    title: faltando ? "Preencha os campos obrigatórios para finalizar" : undefined,
    onClick: () => setFinalizar(true)
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
    disabled: final,
    onChange: e => set(c.id, e.target.value)
  }) : /*#__PURE__*/React.createElement(Input, {
    type: c.tipo === "date" ? "date" : c.tipo === "time" ? "time" : c.tipo === "number" || c.tipo === "dinheiro" ? "number" : "text",
    step: c.tipo === "dinheiro" ? "0.01" : undefined,
    prefix: c.tipo === "dinheiro" ? "R$" : undefined,
    placeholder: c.ph,
    readOnly: c.auto || final,
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
  }))) : null), finalizar ? /*#__PURE__*/React.createElement(DS.ConfirmDialog, {
    icon: "file-check",
    title: "Finalizar contrato?",
    message: "O contrato sai de rascunho e fica s\xF3 para leitura. Imprimir e gerar PDF continuam dispon\xEDveis.",
    confirmLabel: "Sim, finalizar",
    cancelLabel: "Voltar",
    onCancel: () => setFinalizar(false),
    onConfirm: () => {
      setFinalizar(false);
      onChange({
        status: "Finalizado"
      });
      onToast("Contrato finalizado");
    }
  }) : null);
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
  const [toastNode, showToast] = useToast();
  /* Contracts autosave to this browser. If storage refuses (full, private mode), the editor says
     so instead of claiming "Salvo automaticamente". */
  const [naoSalvo, setNaoSalvo] = React.useState(false);
  React.useEffect(() => {
    try {
      localStorage.setItem(CT_KEY, JSON.stringify(salvos));
      setNaoSalvo(false);
    } catch (e) {
      setNaoSalvo(true);
    }
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
    onToast: showToast,
    naoSalvo: naoSalvo
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
  }, rascunhos === 1 ? "1 rascunho em andamento" : rascunhos + " rascunhos em andamento") : null, /*#__PURE__*/React.createElement("div", {
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
      size: 36,
      onClick: () => showToast("PDF gerado")
    }), /*#__PURE__*/React.createElement(IconButton, {
      icon: "trash-2",
      label: "Apagar",
      size: 36,
      onClick: () => setApagar(c)
    }))
  })) : /*#__PURE__*/React.createElement(DS.EmptyState, {
    icon: "file-text",
    title: "Nenhum contrato ainda",
    description: "Crie o primeiro pelo bot\xE3o Novo contrato."
  }))), apagar ? /*#__PURE__*/React.createElement(DS.ConfirmDialog, {
    tone: "danger",
    icon: "trash-2",
    title: "Apagar contrato?",
    cancelLabel: "Voltar",
    message: "O contrato de " + ctCliente(apagar) + " sai do histórico. Não dá pra desfazer.",
    confirmLabel: "Sim, apagar",
    onCancel: () => setApagar(null),
    onConfirm: () => {
      setSalvos(l => l.filter(x => x.uid !== apagar.uid));
      setApagar(null);
      showToast("Contrato apagado");
    }
  }) : null, toastNode);
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

/* Kitchen cards are read at arm's length on a shared tablet: what to make is the largest,
   darkest text on the card, and the one action is a full 44px target. */
function FilaCard({
  p,
  onEntregar,
  pendente
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
        color: "var(--text-accent)",
        letterSpacing: "var(--ls-caps)"
      }
    }, p.hora), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)",
        marginTop: 3,
        overflowWrap: "anywhere"
      }
    }, p.cliente || "Cliente sem nome")), p.pago ? /*#__PURE__*/React.createElement(Badge, {
      tone: PAGO_TONE[p.pago] || "neutral",
      style: {
        flex: "0 0 auto"
      }
    }, p.pago) : null)
  }, p.itens ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-subhead)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-strong)",
      lineHeight: "var(--lh-snug)",
      overflowWrap: "anywhere"
    }
  }, p.itens) : /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-body-s)",
      color: "var(--text-muted)"
    }
  }, "Itens n\xE3o informados. Confira o pedido antes de produzir."), /*#__PURE__*/React.createElement("div", {
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
    size: "lg",
    tone: "delivered",
    icon: "check",
    loading: pendente,
    onClick: () => onEntregar(p)
  }, "Feito")));
}

/* The "Fazer agora" panel sits on the darker terracotta (white text 4.8:1), and its chips darken
   the panel rather than lighten it, so their white labels hold 6:1. */
const chip = {
  padding: "5px 12px",
  borderRadius: "var(--radius-pill)",
  background: "rgba(0,0,0,.15)",
  fontSize: "var(--fs-caption)",
  fontWeight: "var(--fw-semibold)"
};
const seta = {
  width: 48,
  height: 48,
  background: "rgba(255,255,255,.16)",
  border: "1.5px solid rgba(255,255,255,.5)",
  color: "inherit"
};
function Cozinha({
  compact
}) {
  const carga = useCarga(() => window.DLUH_API.carregar("fila"));
  const fila = carga.dados || [];
  const [feature, setFeature] = React.useState(0);
  const [confirm, setConfirm] = React.useState(null);
  const [toastNode, showToast] = useToast();
  const [acao, pendente] = useAcao(showToast);
  const [som, setSom] = React.useState(true);
  const atual = Math.min(feature, Math.max(0, fila.length - 1));
  const p = fila[atual];
  /* The kitchen only confirms that an order is done; charging stays with atendimento in Pedidos.
     The card leaves the queue only after the server accepted it. */
  const feito = async x => {
    await acao("feito-" + x.id, {
      ok: "Pedido marcado como feito",
      falhou: "Não deu pra marcar como feito"
    }, () => carga.setDados(l => l.filter(y => y.id !== x.id)));
    setConfirm(null);
  };
  if (carga.estado === "erro" && !carga.dados) return /*#__PURE__*/React.createElement(ErroCarga, {
    erro: carga.erro,
    oque: "a fila da cozinha",
    onTentar: carga.tentar
  });
  if (!carga.dados) return /*#__PURE__*/React.createElement(Carregando, {
    oque: "a fila"
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "var(--gap-section)",
      minHeight: "100%"
    }
  }, p ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: "var(--radius-xl)",
      padding: compact ? "18px" : "24px 28px",
      background: "var(--color-accent-strong)",
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
      fontSize: "var(--fs-body-s)",
      fontWeight: "var(--fw-semibold)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "flame",
    size: 16
  }), " Fazer agora \xB7 ", atual + 1, " de ", fila.length), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: compact ? "var(--fs-display-s)" : "var(--fs-display)",
      fontWeight: "var(--fw-bold)",
      lineHeight: "var(--lh-tight)",
      marginTop: 8,
      overflowWrap: "anywhere"
    }
  }, p.cliente || "Cliente sem nome"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-title)",
      fontWeight: "var(--fw-semibold)",
      marginTop: 8,
      lineHeight: "var(--lh-snug)",
      overflowWrap: "anywhere"
    }
  }, p.itens || "Itens não informados"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 14,
      flexWrap: "wrap"
    }
  }, [p.hora, p.entrega, p.pago].filter(Boolean).map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    style: chip
  }, c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: compact ? "row" : "column",
      alignItems: compact ? "center" : "stretch",
      gap: 8,
      width: compact ? "100%" : "auto"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    icon: "check",
    loading: pendente === "feito-" + p.id,
    onClick: () => setConfirm(p),
    style: {
      background: "var(--color-accent-contrast)",
      color: "var(--color-accent-strong)",
      flex: compact ? 1 : "none"
    }
  }, "Feito"), fila.length > 1 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-left",
    label: "Pedido anterior",
    onClick: () => setFeature((atual - 1 + fila.length) % fila.length),
    style: seta
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-right",
    label: "Pr\xF3ximo pedido",
    onClick: () => setFeature((atual + 1) % fila.length),
    style: seta
  })) : null)) : null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
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
  }, "Fila de hoje"), /*#__PURE__*/React.createElement(Badge, null, fila.length, " ", fila.length === 1 ? "pedido" : "pedidos"), /*#__PURE__*/React.createElement("div", {
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
  }, "Imprimir fila")), fila.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: compact ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))",
      gap: 12
    }
  }, fila.map(x => /*#__PURE__*/React.createElement(FilaCard, {
    key: x.id,
    p: x,
    onEntregar: setConfirm,
    pendente: pendente === "feito-" + x.id
  }))) : /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(EmptyState, {
    icon: "chef-hat",
    title: "Fila vazia",
    description: "Tudo o que era para hoje j\xE1 foi feito. Pedidos pagos entram aqui automaticamente."
  }))), confirm ? /*#__PURE__*/React.createElement(ConfirmDialog, {
    tone: "delivered",
    icon: "check",
    title: "Marcar como feito?",
    message: [confirm.cliente || "Cliente sem nome", [confirm.entrega && confirm.entrega.toLowerCase(), confirm.hora && confirm.hora !== "—" ? "às " + confirm.hora : null].filter(Boolean).join(" ")].filter(Boolean).join(" — ") + ". O pedido sai da fila de hoje.",
    cancelLabel: "Voltar",
    confirmLabel: "Sim, marcar feito",
    pending: pendente === "feito-" + confirm.id,
    onCancel: () => setConfirm(null),
    onConfirm: () => feito(confirm)
  }) : null, toastNode);
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
      span: 2,
      req: true
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
      tipo: "dinheiro",
      req: true
    }]
  },
  boletos: {
    titulo: "Novo boleto",
    campos: [{
      id: "desc",
      rot: "Fornecedor / descrição",
      span: 2,
      req: true
    }, {
      id: "venc",
      rot: "Vencimento",
      tipo: "date",
      req: true
    }, {
      id: "valor",
      rot: "Valor",
      tipo: "dinheiro",
      req: true
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
      span: 2,
      req: true
    }, {
      id: "final",
      rot: "Final",
      ph: "0000",
      req: true
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

/* What each tab says when it has nothing yet, and the one action that fills it. */
const FIN_VAZIO = {
  transacoes: {
    icone: "arrow-left-right",
    titulo: "Nenhuma transação registrada",
    texto: "Entradas e saídas do caixa aparecem aqui."
  },
  boletos: {
    icone: "receipt",
    titulo: "Nenhum boleto registrado",
    texto: "Boletos a pagar aparecem aqui, com vencimento e valor."
  },
  cartoes: {
    icone: "credit-card",
    titulo: "Nenhum cartão cadastrado",
    texto: "Cadastre os cartões da loja para acompanhar fatura, limite e vencimento."
  }
};
const dataCurta = iso => iso ? iso.split("-").reverse().slice(0, 2).join("/") : "—";
const num = v => Number(String(v || "").replace(",", ".")) || 0;
const errosDe = (f, v) => {
  const e = {};
  f.campos.filter(c => c.req).forEach(c => {
    if (c.tipo === "dinheiro" ? !(num(v[c.id]) > 0) : !String(v[c.id] || "").trim()) e[c.id] = c.tipo === "dinheiro" ? "Digite um valor maior que zero" : c.tipo === "date" ? "Escolha a data" : "Preencha este campo";
  });
  if (v.final && !/^\d{4}$/.test(v.final)) e.final = "Os 4 últimos números do cartão";
  if (v.venc && f === FIN_FORM.cartoes && !(Number(v.venc) >= 1 && Number(v.venc) <= 31)) e.venc = "Um dia entre 1 e 31";
  return e;
};
function FinRegistro({
  tab,
  onClose,
  onSave,
  salvando
}) {
  const f = FIN_FORM[tab];
  const [v, setV] = React.useState(() => Object.fromEntries(f.campos.filter(c => c.opcoes).map(c => [c.id, c.opcoes[0]])));
  const [tentou, setTentou] = React.useState(false);
  const erros = tentou ? errosDe(f, v) : {};
  const registrar = () => {
    setTentou(true);
    if (!Object.keys(errosDe(f, v)).length) onSave(v);
  };
  return /*#__PURE__*/React.createElement(FN.Modal, {
    width: 480,
    title: f.titulo,
    onClose: salvando ? null : onClose,
    dismissible: false,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FN.Button, {
      variant: "ghost",
      block: true,
      disabled: salvando,
      onClick: onClose
    }, "Cancelar"), /*#__PURE__*/React.createElement(FN.Button, {
      block: true,
      icon: "check",
      loading: salvando,
      onClick: registrar
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
    required: c.req,
    error: erros[c.id],
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
    min: c.tipo === "dinheiro" ? "0" : undefined,
    inputMode: c.id === "final" ? "numeric" : undefined,
    maxLength: c.id === "final" ? 4 : undefined,
    prefix: c.tipo === "dinheiro" ? "R$" : undefined,
    placeholder: c.ph,
    invalid: !!erros[c.id],
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
  const [apagar, setApagar] = React.useState(null);
  const [toastNode, showToast] = useToast();
  const [acao, pendente] = useAcao(showToast);
  const carga = useCarga(() => window.DLUH_API.carregar("financeiro"));
  const dados = carga.dados || {};
  const t = FIN_TABS.find(x => x.id === tab);
  const nomeDe = x => x.desc || (x.nome ? x.nome + " · final " + x.final : "este registro");
  const muda = fn => carga.setDados(d => ({
    ...d,
    [tab]: fn(d[tab] || [])
  }));
  const remover = async i => {
    await acao("remover", {
      ok: "Registro removido",
      falhou: "Não deu pra remover o registro"
    }, () => muda(l => l.filter((_, j) => j !== i)));
    setApagar(null);
  };
  const salvar = async v => {
    const item = tab === "transacoes" ? {
      desc: v.desc.trim(),
      tipo: v.tipo,
      meio: v.meio,
      data: dataCurta(v.data),
      valor: num(v.valor)
    } : tab === "boletos" ? {
      desc: v.desc.trim(),
      venc: dataCurta(v.venc),
      valor: num(v.valor),
      status: "Em aberto"
    } : {
      nome: v.nome.trim(),
      final: v.final,
      bandeira: v.bandeira,
      limite: num(v.limite),
      fatura: 0,
      venc: v.venc || "—"
    };
    if (await acao("salvar", {
      ok: "Registro salvo",
      falhou: "Não deu pra salvar o registro"
    }, () => muda(l => [item, ...l]))) setNovo(false);
  };
  const pagar = i => acao("pagar-" + i, {
    ok: "Boleto marcado como pago",
    falhou: "Não deu pra marcar o boleto como pago"
  }, () => muda(l => l.map((b, j) => j === i ? {
    ...b,
    status: "Pago"
  } : b)));
  if (carga.estado === "erro" && !carga.dados) return /*#__PURE__*/React.createElement(ErroCarga, {
    erro: carga.erro,
    oque: "o financeiro",
    onTentar: carga.tentar
  });
  if (!carga.dados) return /*#__PURE__*/React.createElement(Carregando, {
    oque: "o financeiro"
  });
  const lixo = i => /*#__PURE__*/React.createElement(FN.IconButton, {
    icon: "trash-2",
    label: "Remover",
    size: 36,
    style: {
      marginLeft: 10
    },
    onClick: () => setApagar(i)
  });
  const lista = dados[tab] || [];
  const vz = FIN_VAZIO[tab];
  const vazio = vz ? /*#__PURE__*/React.createElement(FN.EmptyState, {
    icon: vz.icone,
    title: vz.titulo,
    description: vz.texto,
    action: /*#__PURE__*/React.createElement(FN.Button, {
      icon: "plus",
      onClick: () => setNovo(true)
    }, t.acao)
  }) : null;
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
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, lista.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--gap-inline)",
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, tab === "transacoes" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FN.Badge, {
    tone: "success",
    icon: "arrow-down-left"
  }, "Entradas ", window.brl(lista.filter(x => x.tipo === "Entrada").reduce((s, x) => s + (x.valor || 0), 0))), /*#__PURE__*/React.createElement(FN.Badge, {
    icon: "arrow-up-right"
  }, "Sa\xEDdas ", window.brl(lista.filter(x => x.tipo === "Saída").reduce((s, x) => s + (x.valor || 0), 0)))) : tab === "boletos" ? /*#__PURE__*/React.createElement(FN.Badge, {
    tone: "warn",
    icon: "clock"
  }, "Em aberto ", window.brl(lista.filter(x => x.status !== "Pago").reduce((s, x) => s + (x.valor || 0), 0))) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(FN.Button, {
    size: "sm",
    icon: "plus",
    onClick: () => setNovo(true)
  }, t.acao)) : null, /*#__PURE__*/React.createElement(FN.Card, {
    padded: !!lista.length,
    bodyStyle: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, !lista.length ? vazio : tab === "transacoes" ? lista.map((x, i) => /*#__PURE__*/React.createElement(FN.ListRow, {
    key: i,
    icon: x.tipo === "Entrada" ? "arrow-down-left" : "arrow-up-right",
    title: x.desc || "Sem descrição",
    subtitle: [x.data, x.meio].filter(Boolean).join(" · "),
    value: x.valor == null ? "—" : (x.tipo === "Entrada" ? "+ " : "− ") + window.brl(x.valor),
    tone: x.tipo === "Entrada" ? "in" : "out",
    trailing: lixo(i)
  })) : tab === "boletos" ? lista.map((x, i) => /*#__PURE__*/React.createElement(FN.ListRow, {
    key: i,
    icon: "receipt",
    title: x.desc || "Sem descrição",
    subtitle: "Vence " + (x.venc || "—"),
    value: x.valor == null ? "—" : window.brl(x.valor),
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
      loading: pendente === "pagar-" + i,
      onClick: () => pagar(i)
    }, "Marcar pago"), lixo(i))
  })) : lista.map((x, i) => /*#__PURE__*/React.createElement(FN.ListRow, {
    key: i,
    icon: "credit-card",
    title: (x.nome || "Cartão") + " · final " + (x.final || "—"),
    subtitle: [x.bandeira, x.venc ? "vence dia " + x.venc : null, x.limite ? "limite " + window.brl(x.limite) : null].filter(Boolean).join(" · "),
    value: x.fatura == null ? "—" : window.brl(x.fatura),
    trailing: lixo(i)
  })))), novo ? /*#__PURE__*/React.createElement(FinRegistro, {
    tab: tab,
    onClose: () => setNovo(false),
    onSave: salvar,
    salvando: pendente === "salvar"
  }) : null, apagar != null && lista[apagar] ? /*#__PURE__*/React.createElement(FN.ConfirmDialog, {
    tone: "danger",
    icon: "trash-2",
    title: "Remover registro?",
    message: nomeDe(lista[apagar]) + " sai do financeiro. Não dá pra desfazer.",
    pending: pendente === "remover",
    confirmLabel: "Sim, remover",
    cancelLabel: "Voltar",
    onCancel: () => setApagar(null),
    onConfirm: () => remover(apagar)
  }) : null, toastNode);
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

/* The transient cards replay NOTIF_DEMO only when the page is opened with ?demo. Without a real
   event source the production panel must not invent orders arriving. */
const DEMO = /[?&]demo\b/.test(window.location.search);
const VISIVEL_MS = 6000;
function NotifCard({
  n,
  onClose,
  onOpen,
  compact
}) {
  const [on, setOn] = React.useState(false);
  const [pausa, setPausa] = React.useState(false);
  React.useEffect(() => {
    const a = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(a);
  }, []);
  /* The timer stops while the card is hovered or focused, so it can be read and acted on. */
  React.useEffect(() => {
    if (pausa) return;
    const b = setTimeout(() => setOn(false), VISIVEL_MS);
    const c = setTimeout(onClose, VISIVEL_MS + 300);
    return () => {
      clearTimeout(b);
      clearTimeout(c);
    };
  }, [pausa]);
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setPausa(true),
    onMouseLeave: () => setPausa(false),
    onFocus: () => setPausa(true),
    onBlur: () => setPausa(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      width: compact ? "100%" : 360,
      boxSizing: "border-box",
      padding: 6,
      borderRadius: "var(--radius-md)",
      border: "var(--border-hairline) solid var(--color-border)",
      background: "var(--color-surface)",
      boxShadow: "var(--shadow-pop)",
      pointerEvents: "auto",
      opacity: on ? 1 : 0,
      transform: on ? "none" : compact ? "translateY(-16px)" : "translateX(24px)",
      /* Enters on ease-out (moves the moment it appears); leaves on the neutral curve. */
      transition: on ? "opacity var(--dur-base) var(--ease-out), transform var(--dur-move) var(--ease-out)" : "opacity var(--dur-base) var(--ease-standard), transform var(--dur-move) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onOpen,
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "6px 6px 6px 8px",
      textAlign: "left",
      border: "none",
      borderRadius: "var(--radius-sm)",
      background: "transparent",
      cursor: "pointer",
      fontFamily: "var(--font-ui)"
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
  }, n.sub))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Fechar notifica\xE7\xE3o",
    onClick: onClose,
    style: {
      alignSelf: "flex-start",
      width: 36,
      height: 36,
      flex: "0 0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      border: "none",
      background: "transparent",
      color: "var(--text-muted)",
      cursor: "pointer",
      borderRadius: "var(--radius-sm)"
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
    if (!DEMO) return;
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
    "aria-live": "polite",
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
  DataTable,
  ListRow,
  Icon
} = DS;

/* One tab per Coda Status. "Verificando Estoque" is the Telegram round-trip in progress, so it
   lives with "Aguardando confirmação" under Estoque pendente instead of vanishing. */
const TABS = [{
  id: "estoque",
  label: "Estoque pendente",
  filtro: ["Aguardando confirmação", "Verificando Estoque"]
}, {
  id: "pagamento",
  label: "Esperando pagamento",
  filtro: ["Confirmado — Esperando pagamento"]
}, {
  id: "producao",
  label: "Em produção",
  filtro: ["Pago — Em produção"]
}, {
  id: "restante",
  label: "Esperando restante",
  filtro: ["Entregue — Esperando restante"]
}, {
  id: "final",
  label: "Finalizados",
  filtro: ["Finalizado"]
}, {
  id: "cancelado",
  label: "Cancelados",
  filtro: ["Cancelado"]
}];
const valor = s => Number(String(s || "").replace(/[^\d,]/g, "").replace(",", ".")) || 0;
const casa = (p, q) => !q || [p.cliente, p.id, p.tel].some(v => String(v || "").toLowerCase().includes(q.toLowerCase()));

/* Every confirmation the order card can open. Money actions name the amount in the question. */
const quem = p => p.cliente || "O cliente";
const CONFIRMA = {
  estoque: p => ({
    tone: "accent",
    icon: "circle-check",
    title: "Confirmar estoque?",
    message: "O cliente recebe o link de pagamento da entrada e o pedido vai para Esperando pagamento.",
    confirmLabel: "Sim, confirmar",
    ok: "Estoque confirmado",
    falhou: "Não deu pra confirmar o estoque",
    aplicar: l => l.map(x => x.id === p.id ? {
      ...x,
      status: "Confirmado — Esperando pagamento"
    } : x)
  }),
  entrada: p => ({
    tone: "chargeEntry",
    icon: "link",
    title: p.falta ? `Cobrar entrada de ${p.falta}?` : "Cobrar entrada?",
    message: `${quem(p)} recebe o link de pagamento da entrada.` + (p.falta ? "" : " O valor da entrada não está preenchido neste pedido."),
    confirmLabel: "Sim, cobrar",
    ok: "Link de cobrança enviado",
    falhou: "Não deu pra enviar a cobrança"
  }),
  restante: p => ({
    tone: "chargeAll",
    icon: "banknote",
    title: p.falta ? `Cobrar restante de ${p.falta}?` : "Cobrar restante?",
    message: `${quem(p)} recebe o link de pagamento do restante.` + (p.falta ? "" : " O valor do restante não está preenchido neste pedido."),
    confirmLabel: "Sim, cobrar",
    ok: "Cobrança do restante enviada",
    falhou: "Não deu pra enviar a cobrança do restante"
  }),
  pago: p => ({
    tone: "success",
    icon: "badge-check",
    title: "Marcar como pago?",
    message: `O pedido de ${p.cliente || "este cliente"} fica como totalmente pago. Nenhuma cobrança é enviada.`,
    confirmLabel: "Sim, marcar pago",
    ok: "Pagamento registrado",
    falhou: "Não deu pra registrar o pagamento"
  }),
  apagar: p => ({
    tone: "danger",
    icon: "trash-2",
    title: "Apagar pedido?",
    message: "O pedido sai da fila e do Coda. Não dá pra desfazer.",
    confirmLabel: "Sim, apagar",
    ok: "Pedido apagado",
    falhou: "Não deu pra apagar o pedido",
    aplicar: l => l.filter(x => x.id !== p.id)
  })
};
function DetalhesModal({
  pedido,
  onClose,
  onToast,
  acao,
  pendente
}) {
  /* What the order already received comes from the order itself. The site does not report
     when it was paid, so that row carries no timestamp until Coda provides one. */
  const [pgtos, setPgtos] = React.useState(() => pedido && valor(pedido.pago) > 0 ? [{
    quando: null,
    valor: valor(pedido.pago),
    origem: "site",
    meio: pedido.pgto
  }] : []);
  const [verPgtos, setVerPgtos] = React.useState(false);
  if (!pedido) return null;
  const recebido = pgtos.reduce((s, p) => s + p.valor, 0);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Modal, {
    width: 620,
    title: "Detalhes do pedido",
    onClose: onClose,
    subtitle: "Edite os dados do cliente, a entrega e o pagamento.",
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
      loading: pendente === "salvar",
      onClick: async () => {
        if (await acao("salvar", {
          ok: "Pedido atualizado",
          falhou: "Não deu pra salvar o pedido"
        })) onClose();
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
      color: "var(--text-accent)",
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
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Cliente",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: pedido.cliente || ""
  })), /*#__PURE__*/React.createElement(Field, {
    label: "WhatsApp",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: pedido.tel || ""
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Entrega"
  }, /*#__PURE__*/React.createElement(Select, {
    options: ["Retirada no local", "Entrega em endereço"],
    defaultValue: pedido.modo || undefined
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Data"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "date",
    defaultValue: pedido.data || ""
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Hora"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "time",
    defaultValue: pedido.hora || ""
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Pagamento"
  }, /*#__PURE__*/React.createElement(Select, {
    options: ["Pix", "Cartão", "Dinheiro"],
    defaultValue: pedido.pgto || undefined
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    minWidth: 0,
    empty: /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px",
        fontSize: "var(--fs-body-s)",
        color: "var(--text-muted)"
      }
    }, "Nenhum item registrado neste pedido."),
    rows: (pedido.itens || []).map((it, i) => ({
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
    onToast: onToast,
    acao: acao,
    pendente: pendente
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
  const [toastNode, showToast] = useToast();
  const [acao, pendente] = useAcao(showToast);
  const carga = useCarga(() => window.DLUH_API.carregar("pedidos"));
  const todos = carga.dados || [];
  const filtro = (TABS.find(t => t.id === tab) || TABS[0]).filtro;
  const lista = todos.filter(p => filtro.includes(p.status)).filter(p => casa(p, q));
  /* Orders whose Status is not in the Coda single-select would fall between the tabs. They are
     listed on their own, above the tabs, so a typo in Coda is visible instead of lost. */
  const fora = todos.filter(p => !TABS.some(t => t.filtro.includes(p.status)));
  const achouEmOutra = !!q && todos.some(p => casa(p, q));

  /* A search that only matches in another status moves to that tab, so picking a pedido in
     the global search never lands on an empty list. */
  React.useEffect(() => {
    if (!q || lista.length) return;
    const alvo = TABS.find(t => todos.some(p => t.filtro.includes(p.status) && casa(p, q)));
    if (alvo) setTab(alvo.id);
  }, [q, carga.estado]);
  const counts = {};
  TABS.forEach(t => counts[t.id] = todos.filter(p => t.filtro.includes(p.status)).length);
  const pede = (tipo, p) => setConfirm({
    tipo,
    p,
    ...CONFIRMA[tipo](p)
  });
  if (carga.estado === "erro" && !carga.dados) return /*#__PURE__*/React.createElement(ErroCarga, {
    erro: carga.erro,
    oque: "os pedidos",
    onTentar: carga.tentar
  });
  if (!carga.dados) return /*#__PURE__*/React.createElement(Carregando, {
    oque: "pedidos"
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)",
      minHeight: "100%"
    }
  }, fora.length ? /*#__PURE__*/React.createElement(Card, {
    header: /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-alert",
      size: 18,
      style: {
        color: "var(--action-warn)"
      }
    }), fora.length === 1 ? "1 pedido com status fora do padrão" : fora.length + " pedidos com status fora do padrão"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-tiny)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, "O status n\xE3o bate com nenhuma aba. Corrija no Coda para o pedido voltar ao fluxo.")),
    bodyStyle: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, fora.map(p => /*#__PURE__*/React.createElement(ListRow, {
    key: p.id,
    icon: "receipt-text",
    title: p.cliente || "Cliente sem nome",
    subtitle: p.id + " · status: " + (p.status || "vazio"),
    value: dinheiro(p.total),
    onClick: () => setDetalhe(p)
  }))) : null, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: TABS.map(t => ({
      id: t.id,
      label: t.label,
      count: counts[t.id]
    }))
  }), /*#__PURE__*/React.createElement("div", {
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
    items: p.itens || [],
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
      onClick: () => pede("estoque", p)
    }, "Confirmar estoque") : p.status === "Confirmado — Esperando pagamento" ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      tone: "chargeEntry",
      icon: "link",
      onClick: () => pede("entrada", p)
    }, "Cobrar entrada") : p.status === "Pago — Em produção" ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      tone: "delivered",
      icon: "truck",
      loading: pendente === "entregue-" + p.id,
      onClick: () => acao("entregue-" + p.id, {
        ok: "Pedido marcado como entregue",
        falhou: "Não deu pra marcar como entregue"
      })
    }, "Marcar entregue") : p.status === "Entregue — Esperando restante" ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      tone: "chargeAll",
      icon: "banknote",
      onClick: () => pede("restante", p)
    }, "Cobrar restante") : p.status === "Finalizado" ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      icon: "printer",
      onClick: () => showToast("Recibo gerado")
    }, "Recibo") : null, /*#__PURE__*/React.createElement(DropdownMenu, {
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
        onClick: () => pede("pago", p)
      }, {
        label: "Notificar alterações",
        icon: "bell-ring",
        onClick: () => acao("notificar-" + p.id, {
          ok: "Cliente avisado no WhatsApp",
          falhou: "Não deu pra avisar o cliente"
        })
      }, {
        label: "Imprimir recibo",
        icon: "printer",
        onClick: () => showToast("Recibo enviado para impressão")
      }, {
        divider: true
      }, {
        label: "Apagar pedido",
        icon: "trash-2",
        tone: "danger",
        onClick: () => pede("apagar", p)
      }]
    }))
  }))) : q && !achouEmOutra ? /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(EmptyState, {
    icon: "search-x",
    title: `Nenhum pedido encontrado para “${q}”`,
    description: "A busca procura pelo nome do cliente, pelo n\xFAmero do pedido (PED-\u2026) e pelo telefone."
  })) : /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(EmptyState, {
    icon: "party-popper",
    title: "Nenhum pedido nesta aba",
    description: "Assim que um pedido entrar nesse status ele aparece aqui automaticamente."
  })), detalhe ? /*#__PURE__*/React.createElement(DetalhesModal, {
    pedido: detalhe,
    onClose: () => setDetalhe(null),
    onToast: showToast,
    acao: acao,
    pendente: pendente
  }) : null, manual ? /*#__PURE__*/React.createElement(ManualModal, {
    compact: compact,
    onClose: () => setManual(false),
    onToast: showToast,
    acao: acao,
    pendente: pendente
  }) : null, confirm ? /*#__PURE__*/React.createElement(ConfirmDialog, {
    tone: confirm.tone,
    icon: confirm.icon,
    title: confirm.title,
    message: confirm.message,
    confirmLabel: confirm.confirmLabel,
    cancelLabel: "Voltar",
    pending: pendente === confirm.tipo,
    onCancel: () => setConfirm(null),
    onConfirm: async () => {
      const c = confirm;
      await acao(c.tipo, {
        ok: c.ok,
        falhou: c.falhou
      }, c.aplicar ? () => carga.setDados(c.aplicar) : null);
      setConfirm(null);
    }
  }) : null, toastNode);
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
    "aria-label": "Cobrar 100% agora",
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
      left: 3,
      width: "calc(50% - 3px)",
      borderRadius: "var(--radius-pill)",
      background: "var(--color-accent-strong)",
      boxShadow: "0 1px 3px rgba(40,24,16,.18)",
      transform: cheio ? "translateX(100%)" : "none",
      transition: "transform var(--dur-move) var(--ease-standard)"
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
    "data-target": true,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      minHeight: 32,
      cursor: "pointer",
      fontSize: "var(--fs-tiny)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-accent)"
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
const PG_COLS = "minmax(0,1fr) minmax(0,.8fr) minmax(0,1.4fr) 40px";
function PagamentosModal({
  lista,
  onChange,
  onClose,
  onToast,
  acao,
  pendente
}) {
  const [valor, setValor] = React.useState("");
  const [arquivo, setArquivo] = React.useState(null);
  const [remover, setRemover] = React.useState(null);
  const [erroValor, setErroValor] = React.useState(null);
  const total = lista.reduce((s, p) => s + p.valor, 0);
  const cab = {
    fontSize: "var(--fs-caption)",
    fontWeight: "var(--fw-semibold)",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "var(--ls-label)"
  };
  /* The amount is checked here; the record only joins the list once the server accepted it. */
  const registrar = async () => {
    const v = parseFloat(String(valor).replace(",", "."));
    if (!(v > 0)) {
      setErroValor("Digite um valor maior que zero");
      return;
    }
    setErroValor(null);
    const ok = await acao("registrar-pagamento", {
      ok: "Pagamento registrado",
      falhou: "Não deu pra registrar o pagamento"
    }, () => onChange([...lista, {
      quando: agora(),
      valor: v,
      arquivo,
      origem: "manual"
    }]));
    if (ok) {
      setValor("");
      setArquivo(null);
    }
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PM.Modal, {
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
  }, p.quando || (p.origem === "site" ? "Pelo site" : "Manual")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-tiny)",
      color: "var(--text-muted)"
    }
  }, p.origem === "site" ? (p.quando ? "Pelo site · " : "") + (p.meio || "Pix") : "Manual")), /*#__PURE__*/React.createElement("span", {
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
  }), p.origem === "site" ? /*#__PURE__*/React.createElement("span", null) : /*#__PURE__*/React.createElement(PM.IconButton, {
    icon: "trash-2",
    label: "Remover pagamento",
    size: 36,
    onClick: () => setRemover(i)
  }))) : /*#__PURE__*/React.createElement("div", {
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
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(PM.Field, {
    label: "Novo pagamento",
    error: erroValor
  }, /*#__PURE__*/React.createElement(PM.Input, {
    type: "number",
    prefix: "R$",
    step: "0.01",
    min: "0",
    placeholder: "0,00",
    invalid: !!erroValor,
    value: valor,
    onChange: e => {
      setValor(e.target.value);
      setErroValor(null);
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 40,
      marginTop: 21,
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Anexo, {
    arquivo: arquivo,
    onFile: setArquivo
  })), /*#__PURE__*/React.createElement(PM.Button, {
    tone: "success",
    icon: "plus",
    loading: pendente === "registrar-pagamento",
    onClick: registrar,
    style: {
      marginTop: 21
    }
  }, "Registrar"))), remover != null ? /*#__PURE__*/React.createElement(PM.ConfirmDialog, {
    tone: "danger",
    icon: "trash-2",
    title: "Remover pagamento?",
    message: `O registro de ${brl(lista[remover].valor)} sai da lista. Não dá pra desfazer.`,
    confirmLabel: "Sim, remover",
    cancelLabel: "Voltar",
    pending: pendente === "remover-pagamento",
    onCancel: () => setRemover(null),
    onConfirm: async () => {
      const i = remover;
      await acao("remover-pagamento", {
        ok: "Pagamento removido",
        falhou: "Não deu pra remover o pagamento"
      }, () => onChange(lista.filter((_, j) => j !== i)));
      setRemover(null);
    }
  }) : null);
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
const ITEM_COLS = "minmax(0,1fr) 80px 130px 44px";

/* What Criar pedido needs before it can write to Coda: the required fields plus one priced item. */
const faltas = r => {
  const f = {};
  if (!r.cliente.trim()) f.cliente = "Preencha o nome do cliente";
  if (!r.tel.trim()) f.tel = "Preencha o WhatsApp";
  if (!r.data) f.data = "Escolha a data de entrega";
  if (!r.itens.some(it => it.nome.trim() && parseFloat(String(it.preco).replace(",", ".")) > 0)) f.itens = "Adicione pelo menos um produto com preço";
  return f;
};
const preenchido = r => !!(r.cliente || r.tel || r.data || r.hora || r.obs || r.itens.some(it => it.nome || it.preco));
function ManualModal({
  compact,
  onClose,
  onToast,
  acao,
  pendente
}) {
  const [lista, setLista] = React.useState([novoRascunho(0)]);
  const [ativo, setAtivo] = React.useState(0);
  const [tentou, setTentou] = React.useState(false);
  const [sair, setSair] = React.useState(false);
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
  const erros = tentou ? faltas(r) : {};
  const fechar = () => pendente === "criar-pedido" ? null : lista.some(preenchido) ? setSair(true) : onClose();
  /* Drafts stay on screen until the server confirms; a failed write keeps everything typed. */
  const criar = async () => {
    const i = lista.findIndex(x => Object.keys(faltas(x)).length);
    if (i >= 0) {
      setTentou(true);
      setAtivo(i);
      return;
    }
    const ok = await acao("criar-pedido", {
      ok: n > 1 ? `${n} pedidos criados` : "Pedido criado",
      falhou: n > 1 ? "Não deu pra criar os pedidos" : "Não deu pra criar o pedido"
    });
    if (ok) onClose();
  };
  const item = (it, j) => {
    const campos = [/*#__PURE__*/React.createElement(PM.Input, {
      key: "n",
      size: "sm",
      "aria-label": "Produto",
      placeholder: "Ex.: Bolo de chocolate 2kg",
      value: it.nome,
      onChange: e => setItem(j, "nome", e.target.value)
    }), /*#__PURE__*/React.createElement(PM.Input, {
      key: "q",
      size: "sm",
      "aria-label": "Quantidade",
      type: "number",
      min: "1",
      value: it.qtd,
      onChange: e => setItem(j, "qtd", e.target.value)
    }), /*#__PURE__*/React.createElement(PM.Input, {
      key: "p",
      size: "sm",
      "aria-label": "Pre\xE7o unit\xE1rio",
      type: "number",
      prefix: "R$",
      step: "0.01",
      placeholder: "0,00",
      value: it.preco,
      onChange: e => setItem(j, "preco", e.target.value)
    }), /*#__PURE__*/React.createElement(PM.IconButton, {
      key: "x",
      icon: "trash-2",
      label: "Remover item",
      disabled: r.itens.length === 1,
      style: r.itens.length === 1 ? {
        opacity: "var(--disabled-opacity)",
        cursor: "not-allowed"
      } : undefined,
      onClick: () => r.itens.length > 1 && set("itens", r.itens.filter((_, i) => i !== j))
    })];
    return compact ? /*#__PURE__*/React.createElement("div", {
      key: j,
      style: {
        display: "grid",
        gridTemplateColumns: "72px minmax(0,1fr) 44px",
        gap: 8,
        alignItems: "center",
        padding: "10px 12px",
        borderTop: j ? "var(--border-hairline) solid var(--color-border)" : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1 / -1"
      }
    }, campos[0]), campos[1], campos[2], campos[3]) : /*#__PURE__*/React.createElement("div", {
      key: j,
      style: {
        display: "grid",
        gridTemplateColumns: ITEM_COLS,
        gap: 10,
        alignItems: "center",
        padding: "8px 12px",
        borderTop: "var(--border-hairline) solid var(--color-border)"
      }
    }, campos);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PM.Modal, {
    width: 860,
    title: n > 1 ? "Pedidos manuais" : "Pedido manual",
    onClose: fechar,
    subtitle: "Mesmo fluxo do site: registra no Coda, notifica o Telegram (Confirmar Estoque) e segue o ciclo normal \u2014 cobran\xE7a, fila da cozinha, avisos no WhatsApp do cliente.",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PM.Button, {
      variant: "ghost",
      block: true,
      onClick: fechar
    }, "Cancelar"), /*#__PURE__*/React.createElement(PM.Button, {
      block: true,
      icon: "check",
      loading: pendente === "criar-pedido",
      onClick: criar
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
    const comErro = tentou && Object.keys(faltas(x)).length > 0;
    return /*#__PURE__*/React.createElement("div", {
      key: x.uid,
      style: {
        display: "flex",
        alignItems: "center",
        borderRadius: "var(--radius-md)",
        border: "var(--border-hairline) solid " + (comErro ? "var(--action-danger)" : on ? "var(--color-accent)" : "var(--color-border)"),
        background: on ? "var(--color-accent-soft)" : "var(--color-surface)"
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-pressed": on,
      onClick: () => setAtivo(i),
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        lineHeight: 1.25,
        padding: "6px 8px 6px 12px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "var(--font-ui)",
        borderRadius: "var(--radius-md)"
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
        color: "var(--text-body)"
      }
    }, brl(totalRascunho(x)))), n > 1 ? /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": `Remover ${x.cliente || `pedido ${i + 1}`}`,
      onClick: () => remover(i),
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        marginRight: 4,
        padding: 0,
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
      gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
      gap: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement(PM.Field, {
    label: "Cliente",
    required: true,
    error: erros.cliente
  }, /*#__PURE__*/React.createElement(PM.Input, _extends({
    placeholder: "Nome do cliente",
    invalid: !!erros.cliente
  }, ctl("cliente")))), /*#__PURE__*/React.createElement(PM.Field, {
    label: "WhatsApp",
    required: true,
    error: erros.tel
  }, /*#__PURE__*/React.createElement(PM.Input, _extends({
    placeholder: "(38) 99999-9999",
    invalid: !!erros.tel
  }, ctl("tel")))), /*#__PURE__*/React.createElement(PM.Field, {
    label: "Tipo de cliente"
  }, /*#__PURE__*/React.createElement(PM.Select, _extends({
    options: ["Pessoa física", "Empresa", "Festa"]
  }, ctl("tipo")))), /*#__PURE__*/React.createElement(PM.Field, {
    label: "Data de entrega",
    required: true,
    error: erros.data
  }, /*#__PURE__*/React.createElement(PM.Input, _extends({
    type: "date",
    invalid: !!erros.data
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
      border: "var(--border-hairline) solid " + (erros.itens ? "var(--action-danger)" : "var(--color-border)"),
      borderRadius: "var(--radius-sm)",
      overflow: "hidden"
    }
  }, compact ? null : /*#__PURE__*/React.createElement("div", {
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
  }, /*#__PURE__*/React.createElement("span", null, "Produto"), /*#__PURE__*/React.createElement("span", null, "Qtd"), /*#__PURE__*/React.createElement("span", null, "Pre\xE7o un."), /*#__PURE__*/React.createElement("span", null)), r.itens.map(item), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
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
  }, brl(totalRascunho(r)))))), erros.itens ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontSize: "var(--fs-tiny)",
      color: "var(--action-danger)"
    }
  }, erros.itens) : null), sair ? /*#__PURE__*/React.createElement(PM.ConfirmDialog, {
    tone: "danger",
    icon: "trash-2",
    title: n > 1 ? "Descartar pedidos?" : "Descartar pedido?",
    message: "O que foi preenchido aqui se perde.",
    confirmLabel: "Sim, descartar",
    cancelLabel: "Voltar",
    onCancel: () => setSair(false),
    onConfirm: () => {
      setSair(false);
      onClose();
    }
  }) : null);
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

/* Rail counts are derived, never typed in: open orders (not Finalizado or Cancelado),
   commitments on the shop day, and the kitchen queue. */
const FECHADOS = ["Finalizado", "Cancelado"];
const navItems = () => {
  const d = window.DLUH;
  return [{
    id: "visao",
    label: "Visão geral",
    icon: "layout-dashboard"
  }, {
    id: "pedidos",
    label: "Pedidos",
    icon: "receipt-text",
    count: d.pedidos.filter(p => !FECHADOS.includes(p.status)).length
  }, {
    id: "agenda",
    label: "Agenda",
    icon: "calendar-days",
    count: d.agenda.filter(x => x.data === d.hoje).length
  }, {
    id: "cozinha",
    label: "Cozinha",
    icon: "chef-hat",
    count: d.fila.length
  }, {
    id: "financeiro",
    label: "Financeiro",
    icon: "wallet"
  }];
};
function RailItem({
  icon,
  label,
  count,
  active,
  badge,
  open,
  instant,
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
      background: active ? "var(--color-accent-strong)" : h ? "var(--color-accent-soft)" : "transparent",
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
      transition: instant ? "none" : "opacity var(--dur-fast) var(--ease-out)"
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
      background: active ? "var(--color-accent-contrast)" : "var(--color-accent-strong)",
      color: active ? "var(--color-accent-strong)" : "var(--color-accent-contrast)",
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
  const [viaTeclado, setViaTeclado] = React.useState(false);
  /* The rail opens for keyboard focus as well as hover, so labels are never mouse-only. Opened
     from the keyboard it snaps open: Tab runs through it many times a day and should never wait
     on an animation. The hover expand keeps its documented 250ms. */
  const abrir = teclado => {
    setViaTeclado(teclado);
    setOpen(true);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "var(--rail-w)",
      flex: "0 0 auto",
      position: "relative",
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Principal",
    onMouseEnter: () => abrir(false),
    onMouseLeave: () => setOpen(false),
    onFocus: e => {
      if (!open) abrir(e.target.matches(":focus-visible"));
    },
    onBlur: e => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
    },
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
      transition: viaTeclado ? "none" : "width var(--dur-move) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)"
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
  })), navItems().map(it => /*#__PURE__*/React.createElement(RailItem, _extends({
    key: it.id
  }, it, {
    open: open,
    instant: viaTeclado,
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
    instant: viaTeclado,
    onClick: onNotif
  }), /*#__PURE__*/React.createElement(RailItem, {
    icon: "settings",
    label: "Configura\xE7\xF5es",
    open: open,
    instant: viaTeclado,
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
    role: "Dona",
    compact: !open
  }))));
}
function BottomNav({
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Principal",
    style: {
      display: "flex",
      borderTop: "1px solid var(--color-border)",
      background: "var(--color-surface)",
      padding: "6px 4px calc(8px + env(safe-area-inset-bottom))",
      gap: 2,
      flex: "0 0 auto"
    }
  }, navItems().map(it => {
    const active = it.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      onClick: () => onChange(it.id),
      "aria-current": active ? "page" : undefined,
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
        color: active ? "var(--text-accent)" : "var(--text-muted)",
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
        background: "var(--color-accent-strong)",
        color: "var(--color-accent-contrast)",
        fontSize: "var(--fs-micro)",
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
      "--toast-offset": compact ? "64px" : "0px",
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
      padding: compact ? "12px 12px 0" : "var(--space-10) var(--space-11) 0"
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
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Configura\xE7\xF5es",
    onClick: () => setCfg(true),
    style: {
      padding: 0,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      borderRadius: "var(--radius-md)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(UserChip, {
    name: "Luciana",
    compact: true
  }))) : null), /*#__PURE__*/React.createElement("main", {
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
  navItems
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/VisaoGeral.jsx
try { (() => {
const {
  Card,
  ListRow,
  StatusBadge,
  Button,
  IconButton,
  Badge,
  Icon,
  EmptyState
} = window.DLuhFestasDesignSystem_c861a2;
function ChartCard({
  compact,
  serie
}) {
  const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const max = Math.max(1, ...serie);
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
  }, !serie.length || !serie.some(v => v > 0) ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "chart-no-axes-column",
    title: "Sem receita registrada nesta semana"
  }) : /*#__PURE__*/React.createElement("div", {
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
      background: "var(--color-accent-soft)",
      border: "1px solid var(--color-accent)"
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
  const carga = useCarga(() => window.DLUH_API.carregar());
  if (carga.estado === "erro" && !carga.dados) return /*#__PURE__*/React.createElement(ErroCarga, {
    erro: carga.erro,
    oque: "a vis\xE3o geral",
    onTentar: carga.tentar
  });
  if (!carga.dados) return /*#__PURE__*/React.createElement(Carregando, {
    oque: "a vis\xE3o geral"
  });
  const d = {
    ...carga.dados,
    pagamentos: carga.dados.pagamentos || [],
    recentes: carga.dados.recentes || [],
    serieReceita: carga.dados.serieReceita || []
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--gap-section)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padded: false,
    header: /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-title)",
        fontWeight: "var(--fw-semibold)"
      }
    }, "Indicadores")
  }, /*#__PURE__*/React.createElement(EmptyState, {
    icon: "chart-no-axes-column",
    title: "Sem dados para os indicadores ainda",
    description: "Pedidos do dia, valor a receber, fila da cozinha e ticket m\xE9dio aparecem aqui quando houver uma fonte de dados ligada."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: compact ? "1fr" : "1.6fr 1fr",
      gap: 12,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(ChartCard, {
    compact: compact,
    serie: d.serieReceita
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
  }, d.pagamentos.length ? d.pagamentos.map((p, i) => /*#__PURE__*/React.createElement(ListRow, {
    key: i,
    icon: p.icon,
    title: p.title,
    subtitle: p.sub,
    value: p.value,
    tone: p.tone
  })) : /*#__PURE__*/React.createElement(EmptyState, {
    icon: "wallet",
    title: "Nenhum pagamento recente"
  }))), /*#__PURE__*/React.createElement(Card, {
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
    }, d.recentes.length === 1 ? "O mais recente" : `Os ${d.recentes.length} mais recentes`)), /*#__PURE__*/React.createElement(Button, {
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
  }, "Total")), !d.recentes.length ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "receipt-text",
    title: "Nenhum pedido ainda"
  }) : d.recentes.map(r => compact ? /*#__PURE__*/React.createElement("div", {
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
      color: "var(--text-strong)",
      minWidth: 0,
      overflowWrap: "anywhere"
    }
  }, r.nome || "Cliente sem nome"), /*#__PURE__*/React.createElement("span", {
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
      color: "var(--text-strong)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    },
    title: r.nome
  }, r.nome || "Cliente sem nome"), /*#__PURE__*/React.createElement("div", {
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
  /* The shop day the fake rows are built around. Agenda opens on it and the rail counts it. */
  hoje: "2026-06-12",
  pedidos: [{
    id: "PED-2291",
    data: "2026-06-12",
    hora: "15:00",
    modo: "Entrega em endereço",
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
    data: "2026-06-13",
    hora: "11:00",
    modo: "Retirada no local",
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
    data: "2026-06-14",
    hora: "07:00",
    modo: "Entrega em endereço",
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
    data: "2026-06-10",
    hora: "18:00",
    modo: "Retirada no local",
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
    data: "2026-06-09",
    hora: "16:00",
    modo: "Retirada no local",
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
