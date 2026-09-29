"""Procura a fonte cujo D mais se parece com o D da peça, e o encaixe (escala/posição) exato.
Compara só onde o D aparece sozinho (tira o laço e o chapéu, que ficam por cima)."""
import json

import cv2
import numpy as np
from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont

mask = np.load("mask.npy").astype(np.uint8)
dados = json.load(open("marca-d.json", encoding="utf8"))


def pontos(d):
    return np.array([[float(a) for a in p.split()] for p in d[1:].split("L")])


excl = np.zeros_like(mask)
for p in dados["pinceladas"]:
    if p["nome"] in ("chapéu", "faixa do chapéu", "laço e coração"):
        pts = pontos(p["d"]).astype(np.int32)
        cv2.polylines(excl, [pts], False, 1, int(p["largura"] * 0.9 + 10))
X0, X1, Y0, Y1 = 250, 720, 495, 960
regiao = np.zeros_like(mask)
regiao[Y0:Y1, X0:X1] = 1
valido = (regiao == 1) & (excl == 0)


class Achatar(BasePen):
    def __init__(self, gs):
        super().__init__(gs)
        self.contornos, self.atual = [], []

    def _moveTo(self, p):
        self.atual = [p]

    def _lineTo(self, p):
        self.atual.append(p)

    def _curveToOne(self, a, b, c):
        p0 = self.atual[-1]
        for t in np.linspace(0, 1, 14)[1:]:
            u = 1 - t
            self.atual.append((u**3 * p0[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t**3 * c[0],
                               u**3 * p0[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t**3 * c[1]))

    def _qCurveToOne(self, a, b):
        p0 = self.atual[-1]
        for t in np.linspace(0, 1, 10)[1:]:
            u = 1 - t
            self.atual.append((u * u * p0[0] + 2 * u * t * a[0] + t * t * b[0], u * u * p0[1] + 2 * u * t * a[1] + t * t * b[1]))

    def _closePath(self):
        self.contornos.append(np.array(self.atual))
        self.atual = []

    _endPath = _closePath


def glifo(arq):
    f = TTFont(arq)
    gs = f.getGlyphSet()
    nome = f.getBestCmap()[ord("D")]
    pen = Achatar(gs)
    gs[nome].draw(pen)
    cs = [c * np.array([1, -1]) for c in pen.contornos]  # y pra baixo
    tudo = np.concatenate(cs)
    mn, mx = tudo.min(0), tudo.max(0)
    return [(c - mn) / (mx - mn) for c in cs]  # normalizado 0..1


def raster(cs, x, y, w, h):
    img = np.zeros_like(mask)
    pol = [np.round(c * [w, h] + [x, y]).astype(np.int32) for c in cs]
    cv2.fillPoly(img, pol, 1)  # regra par-ímpar pelo fillPoly com todos os contornos juntos
    return img


def nota(img):
    a, b = img[valido], mask[valido]
    return (a & b).sum() / max(1, (a | b).sum())


alvo = (272, 512, 690 - 272, 942 - 512)
resultados = []
import glob
for arq in sorted(glob.glob("fontes/bm_*.ttf")):
    cs = glifo(arq)
    melhor = (0, None)
    x, y, w, h = alvo
    for dx in range(-14, 15, 4):
        for dy in range(-10, 11, 5):
            for sw in (0.94, 0.97, 1.0, 1.03, 1.06):
                for sh in (0.97, 1.0, 1.03):
                    n = nota(raster(cs, x + dx, y + dy, w * sw, h * sh))
                    if n > melhor[0]:
                        melhor = (n, (x + dx, y + dy, w * sw, h * sh))
    resultados.append((melhor[0], arq, melhor[1]))
    print(f"{arq:28s} {melhor[0]:.3f}")
resultados.sort(reverse=True)
n, arq, caixa = resultados[0]
# refino fino no vencedor
cs = glifo(arq)
x, y, w, h = caixa
for dx in range(-3, 4):
    for dy in range(-3, 4):
        for sw in (0.985, 1.0, 1.015):
            for sh in (0.985, 1.0, 1.015):
                c2 = (x + dx, y + dy, w * sw, h * sh)
                v = nota(raster(cs, *c2))
                if v > n:
                    n, caixa = v, c2
print("VENCEDOR", arq, round(n, 3), [round(v, 1) for v in caixa])
json.dump({"fonte": arq, "caixa": caixa, "nota": n}, open("ajuste-d.json", "w"))
vis = np.stack([mask * 255, raster(cs, *caixa) * 255, np.zeros_like(mask)], -1).astype(np.uint8)
cv2.imwrite("ajuste-d.png", vis[480:970, 240:740])
