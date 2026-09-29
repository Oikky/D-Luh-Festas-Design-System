"""Marca D em camadas, como a peça física:
  1. D (letra Bodoni Moda, encaixada na foto) — embaixo;
  2. chapéu (contorno de largura constante) — por cima, abrindo uma folga no D;
  3. laço + coração (fita de largura variável, ponta fina) — por cima, com folga no D.
Saída: camadas.json com os caminhos SVG, larguras e folga."""
import heapq
import json

import cv2
import numpy as np
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from scipy.interpolate import UnivariateSpline

mask = np.load("mask.npy").astype(np.uint8)
esq = np.load("esqueleto.npy")
dist = np.load("dist.npy")
FOLGA = 5.0

# ── 1. D ──
aj = json.load(open("ajuste-d.json"))
fonte = TTFont("fontes/outras/bodoni500.ttf")
gs = fonte.getGlyphSet()
nome = fonte.getBestCmap()[ord("D")]
g = gs[nome]
# caixa do glifo em unidades da fonte
from fontTools.pens.boundsPen import BoundsPen
bp = BoundsPen(gs)
g.draw(bp)
xmin, ymin, xmax, ymax = bp.bounds
x, y, w, h = aj["caixa"]
sx, sy = w / (xmax - xmin), h / (ymax - ymin)
# fonte: y pra cima; svg: y pra baixo
matriz = (sx, 0, 0, -sy, x - xmin * sx, y + ymax * sy)
sp = SVGPathPen(gs, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
g.draw(TransformPen(sp, matriz))
d_letra = sp.getCommands()

# raster do D pra saber onde o laço cruza a letra
from fontTools.pens.basePen import BasePen


class Achatar(BasePen):
    def __init__(self, gs):
        super().__init__(gs); self.cs, self.at = [], []
    def _moveTo(self, p): self.at = [p]
    def _lineTo(self, p): self.at.append(p)
    def _qCurveToOne(self, a, b):
        p0 = self.at[-1]
        for t in np.linspace(0, 1, 10)[1:]:
            u = 1 - t
            self.at.append((u*u*p0[0]+2*u*t*a[0]+t*t*b[0], u*u*p0[1]+2*u*t*a[1]+t*t*b[1]))
    def _curveToOne(self, a, b, c):
        p0 = self.at[-1]
        for t in np.linspace(0, 1, 14)[1:]:
            u = 1 - t
            self.at.append((u**3*p0[0]+3*u*u*t*a[0]+3*u*t*t*b[0]+t**3*c[0], u**3*p0[1]+3*u*u*t*a[1]+3*u*t*t*b[1]+t**3*c[1]))
    def _closePath(self): self.cs.append(np.array(self.at)); self.at = []
    _endPath = _closePath


ap = Achatar(gs)
g.draw(TransformPen(ap, matriz))
letra = np.zeros_like(mask)
cv2.fillPoly(letra, [np.round(c).astype(np.int32) for c in ap.cs], 1)
letra_larga = cv2.dilate(letra, np.ones((9, 9), np.uint8))

# ── caminhos pelo esqueleto ──
ys, xs = np.where(esq == 1)
pix = set(zip(xs.tolist(), ys.tolist()))


def perto(px, py):
    i = int(np.argmin((xs - px) ** 2 + (ys - py) ** 2))
    return int(xs[i]), int(ys[i])


def rota(pontos):
    saida = []
    for a, b in zip(pontos, pontos[1:]):
        ini, fim = perto(*a), perto(*b)
        fila, custo, veio = [(0.0, ini)], {ini: 0.0}, {}
        while fila:
            c, u = heapq.heappop(fila)
            if u == fim:
                break
            if c > custo[u]:
                continue
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    v = (u[0] + dx, u[1] + dy)
                    if v == u or v not in pix:
                        continue
                    nc = c + (1.4142 if dx and dy else 1.0)
                    if nc < custo.get(v, 1e18):
                        custo[v] = nc; veio[v] = u; heapq.heappush(fila, (nc, v))
        r = [fim]
        while r[-1] != ini:
            r.append(veio[r[-1]])
        r = r[::-1]
        saida.extend(r if not saida else r[1:])
    return np.array(saida, float)


def suavizar(pts, s_fator, fechado=False, larguras=None):
    """Spline por comprimento de arco; devolve pontos a cada ~2 px (e larguras)."""
    seg = np.r_[0, np.cumsum(np.hypot(*np.diff(pts, axis=0).T))]
    _, idx = np.unique(seg, return_index=True)
    pts, seg = pts[idx], seg[idx]
    if larguras is not None:
        larguras = larguras[idx]
    L = seg[-1]
    t = np.linspace(0, L, int(L / 2))
    sx = UnivariateSpline(seg, pts[:, 0], s=len(pts) * s_fator)
    sy = UnivariateSpline(seg, pts[:, 1], s=len(pts) * s_fator)
    out = np.stack([sx(t), sy(t)], 1)
    if larguras is not None:
        sw = UnivariateSpline(seg, larguras, s=len(pts) * s_fator * 2)
        return out, np.clip(sw(t), 1.2, None)
    return out


def d_linha(p, fechar=False):
    return "M" + "L".join(f"{a:.1f} {b:.1f}" for a, b in p) + ("Z" if fechar else "")


# ── 2. chapéu: contorno fechado + faixa, largura constante ──
# contorno do chapéu: sai da borda de baixo da faixa (junto do D), desce ao canto, sobe pela
# esquerda, dá a volta na nuvem e desce pela direita até encostar no D.
laco_chapeu = rota([(312, 548), (290, 553), (247, 578), (229, 543), (202, 522), (160, 505), (148, 450),
                    (205, 430), (215, 385), (300, 368), (345, 335), (405, 380), (382, 450), (380, 470), (397, 512)])
faixa = rota([(229, 543), (300, 500), (380, 470)])
LARG_CHAPEU = 15.5  # medido na foto (a máscara engorda o traço)
larg_chapeu = LARG_CHAPEU
chapeu = suavizar(laco_chapeu, 1.2)
faixa_s = suavizar(faixa, 2.0)

# ── 3. laço + coração: fita com largura variável ──
bruto = rota([(48, 828), (40, 780), (110, 725), (200, 715), (300, 758), (350, 800), (430, 855), (525, 895),
              (620, 905), (745, 880), (835, 830), (858, 775), (815, 748), (775, 765), (735, 745), (712, 790), (745, 880)])
fora = np.array([letra_larga[int(b), int(a)] == 0 for a, b in bruto])
larg = np.array([max(1.2, dist[int(b), int(a)] * 2 - 6) for a, b in bruto])  # tira o engorde da máscara
pts_fora, larg_fora = bruto[fora], larg[fora]
laco, larg_laco = suavizar(pts_fora, 3.0, larguras=larg_fora)
# ponta fina à esquerda, afinando nos primeiros ~45 px
n_ponta = 22
larg_laco[:n_ponta] *= np.linspace(0.18, 1, n_ponta)
larg_laco = np.minimum(larg_laco, np.percentile(larg_laco, 92))


def fita(p, w):
    tg = np.gradient(p, axis=0)
    tg /= np.linalg.norm(tg, axis=1, keepdims=True) + 1e-9
    nrm = np.stack([-tg[:, 1], tg[:, 0]], 1)
    esq_ = p + nrm * (w[:, None] / 2)
    dir_ = p - nrm * (w[:, None] / 2)
    return np.concatenate([esq_, dir_[::-1]])


poly_laco = fita(laco, larg_laco)

# ── pinceladas do corpo (D + chapéu, mesma camada) ──
def pincel(pontos, largura, s_fator=1.5):
    return {"d": d_linha(suavizar(rota(pontos), s_fator)[::3]), "largura": largura}


pinceis = [
    pincel([(350, 548), (349, 700), (348, 925)], 78),                                        # 1 haste
    pincel([(288, 936), (350, 928), (440, 935), (520, 905), (566, 866), (610, 810), (632, 690),
            (590, 570), (470, 518), (405, 516)], 88),                                         # 2a pé → barriga → topo
    pincel([(397, 512), (380, 470), (382, 450), (405, 380), (345, 335), (300, 368), (215, 385),
            (205, 430), (148, 450), (160, 505), (202, 522), (229, 543), (247, 578), (290, 553), (312, 548)], 30),  # 2b chapéu
    pincel([(229, 543), (300, 500), (380, 470)], 28),                                        # 2c faixa
]

saida = {
    "viewBox": "23 303 859 648",
    "folga": FOLGA,
    "letra": d_letra,
    "chapeu": {"d": d_linha(chapeu), "largura": round(larg_chapeu, 1)},
    "faixa": {"d": d_linha(faixa_s), "largura": round(larg_chapeu, 1)},
    "pinceis": pinceis,
    "laco": {"d": d_linha(poly_laco, True), "centro": d_linha(laco), "largura_max": round(float(larg_laco.max()), 1)},
}
json.dump(saida, open("camadas.json", "w", encoding="utf8"))
print("chapéu", round(larg_chapeu, 1), "laço máx", round(float(larg_laco.max()), 1), "min", round(float(larg_laco.min()), 1),
      "pts laço", len(laco), "letra", len(d_letra))
