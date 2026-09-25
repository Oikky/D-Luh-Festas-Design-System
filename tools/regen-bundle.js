// Re-splices edited sources into _ds_bundle.js. The admin (and every card in guidelines/) loads
// components from the bundle, not from the .jsx files, so an edit to a component only takes effect
// after its bundle section is regenerated.
//
// Usage (from anywhere):
//   node tools/regen-bundle.js components/core/Button.jsx ui_kits/admin/Pedidos.jsx
//   node tools/regen-bundle.js --all
//
// It mirrors the bundle's own format: imports from other components become __ds_scope.X reads,
// `export` is dropped and exported names are assigned to __ds_scope. JSX is compiled with the same
// Babel standalone the admin loads from the CDN (7.29.0), cached in tools/.cache on first run.
// This is a one-off maintenance script, not a build step: the admin still runs with no build.
const fs = require("fs"), path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BUNDLE = path.join(ROOT, "_ds_bundle.js");
const BABEL_URL = "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js";
const BABEL_FILE = path.join(__dirname, ".cache", "babel-standalone-7.29.0.min.js");

async function loadBabel() {
  if (!fs.existsSync(BABEL_FILE)) {
    console.log("downloading " + BABEL_URL);
    const res = await fetch(BABEL_URL);
    if (!res.ok) throw new Error("could not download Babel: HTTP " + res.status);
    fs.mkdirSync(path.dirname(BABEL_FILE), { recursive: true });
    fs.writeFileSync(BABEL_FILE, await res.text());
  }
  return require(BABEL_FILE);
}

function scopePlugin({ types: t }) {
  return {
    visitor: {
      Program: {
        exit(p, state) {
          const names = state.exported || [];
          if (names.length) p.pushContainer("body", t.expressionStatement(t.callExpression(
            t.memberExpression(t.identifier("Object"), t.identifier("assign")),
            [t.identifier("__ds_scope"), t.objectExpression(names.map(n => t.objectProperty(t.identifier(n), t.identifier(n), false, true)))])));
        }
      },
      ImportDeclaration(p) {
        if (p.node.source.value !== "react") {
          for (const s of p.node.specifiers) {
            const b = p.scope.getBinding(s.local.name);
            const imported = s.imported ? s.imported.name : s.local.name;
            if (b) for (const r of b.referencePaths) r.replaceWith(r.isJSXIdentifier()
              ? t.jsxMemberExpression(t.jsxIdentifier("__ds_scope"), t.jsxIdentifier(imported))
              : t.memberExpression(t.identifier("__ds_scope"), t.identifier(imported)));
          }
        }
        p.remove();
      },
      ExportNamedDeclaration(p, state) {
        const d = p.node.declaration;
        state.exported = state.exported || [];
        if (d.id) state.exported.push(d.id.name);
        else d.declarations.forEach(x => state.exported.push(x.id.name));
        p.replaceWith(d);
      }
    }
  };
}

(async () => {
  const args = process.argv.slice(2);
  let bundle = fs.readFileSync(BUNDLE, "utf8");
  const files = args.includes("--all")
    ? [...bundle.matchAll(/^\/\/ (\S+\.jsx?)\ntry \{ \(\(\) => \{$/gm)].map(m => m[1])
    : args.map(f => path.relative(ROOT, path.resolve(f)).split(path.sep).join("/"));
  if (!files.length) { console.error("usage: node tools/regen-bundle.js <file>... | --all"); process.exit(1); }

  const Babel = await loadBabel();
  for (const rel of files) {
    const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const out = Babel.transform(src, { presets: [["react", { runtime: "classic" }]], plugins: [scopePlugin], sourceType: "module" }).code;
    const head = `// ${rel}\ntry { (() => {\n`;
    const tail = `\n})(); } catch (e) { __ds_ns.__errors.push({ path: "${rel}"`;
    const a = bundle.indexOf(head), b = bundle.indexOf(tail, a);
    if (a < 0 || b < 0) { console.error("not in the bundle: " + rel); process.exitCode = 1; continue; }
    bundle = bundle.slice(0, a + head.length) + out.trim() + bundle.slice(b);
    console.log("regenerated " + rel);
  }
  new Function(bundle); // throws on a syntax error before anything is written
  fs.writeFileSync(BUNDLE, bundle);
})().catch(e => { console.error(e.message); process.exit(1); });
