"""Monta o SVG em camadas (camadas.json) e uma prova sobreposta à foto."""
import base64
import json

c = json.load(open("camadas.json", encoding="utf8"))
F = c["folga"]
ouro = ('<linearGradient id="ouro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f6a22"/>'
        '<stop offset=".28" stop-color="#d9b45e"/><stop offset=".5" stop-color="#f3dd98"/>'
        '<stop offset=".72" stop-color="#c29a48"/><stop offset="1" stop-color="#9a7429"/></linearGradient>')
wc, wf = c["chapeu"]["largura"], c["faixa"]["largura"]
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{c["viewBox"]}">
<defs>{ouro}
<mask id="folga" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="1200">
  <rect x="0" y="0" width="1200" height="1200" fill="#fff"/>
  <rect x="0" y="0" width="309" height="521" fill="#000"/>
  <path d="{c["laco"]["d"]}" fill="#000" stroke="#000" stroke-width="{2 * F}" stroke-linejoin="round"/>
  <path d="{c["chapeu"]["d"]}" fill="none" stroke="#000" stroke-width="{wc + 2 * F}" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="{c["faixa"]["d"]}" fill="none" stroke="#000" stroke-width="{wf + 2 * F}" stroke-linecap="round"/>
</mask></defs>
<path fill="url(#ouro)" d="{c["letra"]}" mask="url(#folga)"/>
<path d="{c["chapeu"]["d"]}" fill="none" stroke="url(#ouro)" stroke-width="{wc}" stroke-linejoin="round" stroke-linecap="round"/>
<path d="{c["faixa"]["d"]}" fill="none" stroke="url(#ouro)" stroke-width="{wf}" stroke-linecap="round"/>
<path d="{c["laco"]["d"]}" fill="url(#ouro)"/>
</svg>'''
open("d-camadas.svg", "w", encoding="utf8").write(svg)
foto = base64.b64encode(open("foto-logo-d.jpg", "rb").read()).decode()
prova = f'''<html><body style="margin:0;background:#fff">
<div style="position:relative;width:899px;height:1599px">
<img src="data:image/jpeg;base64,{foto}" style="position:absolute;inset:0;opacity:.45">
<div style="position:absolute;left:0;top:0;width:899px;height:1599px">{svg.replace(f'viewBox="{c["viewBox"]}"', 'viewBox="0 0 899 1599" width="899" height="1599" style="opacity:.75"')}</div>
</div></body></html>'''
open("prova.html", "w", encoding="utf8").write(prova)
print("ok")
