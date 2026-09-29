"""Monta www.dluhfestas.com no repositório do site (Oikky/dluhfestas, padrão ~/Downloads/dluhfestas):
   - site dos clientes: site/{index,cardapio,pedido}.html + css/ js/ img/ midia/
   - admin em /admin: ui_kits/admin + o que ele usa do design system (styles.css, tokens/, _ds_bundle.js,
     assets/logo) dentro de admin/ds/. Na cópia publicada o admin já abre ligado ao sistema de verdade
     (sem ?fonte=firebase); o modo demonstração fica em ?fonte=demo.
   Não faz commit nem push. Uso:  python tools/publicar-site.py [pasta do repositório do site]"""
import os, re, shutil, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/Downloads/dluhfestas"))
if not os.path.isdir(os.path.join(DESTINO, ".git")):
    sys.exit(f"{DESTINO} não é o repositório do site")

def copiar(de, para):
    de, para = os.path.join(RAIZ, de), os.path.join(DESTINO, para)
    if os.path.isdir(de):
        shutil.rmtree(para, ignore_errors=True)
        shutil.copytree(de, para, ignore=shutil.ignore_patterns("README.md", "*.map"))
    else:
        os.makedirs(os.path.dirname(para), exist_ok=True)
        shutil.copy2(de, para)

# Site dos clientes
for f in ["index.html", "cardapio.html", "pedido.html"]:
    copiar(f"site/{f}", f)
for d in ["css", "js", "img", "midia"]:
    copiar(f"site/{d}", d)

# Admin
admin = os.path.join(DESTINO, "admin")
shutil.rmtree(admin, ignore_errors=True)
copiar("ui_kits/admin", "admin")
copiar("styles.css", "admin/ds/styles.css")
copiar("tokens", "admin/ds/tokens")
copiar("_ds_bundle.js", "admin/ds/_ds_bundle.js")
copiar("assets/logo-dluh-festas.png", "admin/ds/assets/logo-dluh-festas.png")

for nome in os.listdir(admin):
    p = os.path.join(admin, nome)
    if not nome.endswith((".html", ".js", ".jsx")):
        continue
    s = open(p, encoding="utf8").read()
    s = s.replace('"../../', '"ds/')
    # Modo real por padrão; demonstração só com ?fonte=demo.
    s = re.sub(r'get\("fonte"\)\s*===\s*"firebase"', 'get("fonte") !== "demo"', s)
    if nome == "index.html" and "noindex" not in s:
        s = s.replace("<head>", '<head>\n  <meta name="robots" content="noindex, nofollow">', 1)
    open(p, "w", encoding="utf8").write(s)

restos = [n for n in os.listdir(admin) if n.endswith((".html", ".js", ".jsx"))
          and "../../" in open(os.path.join(admin, n), encoding="utf8").read()]
print("site e admin montados em", DESTINO, "| caminhos ../../ sobrando:", restos or "nenhum")
