"""Gera a marca D em duas camadas:
- contorno limpo (preenchimento), com quinas preservadas e curvas suavizadas por spline;
- pinceladas: caminhos pelo esqueleto do desenho, na ordem de quem pinta, com a largura do traço.
Saída: marca-d.json (viewBox, contorno, pinceladas)."""
import heapq
import json

import cv2
import numpy as np
from scipy.interpolate import splev, splprep

mask = np.load("mask.npy")
esq = np.load("esqueleto.npy")
dist = np.load("dist.npy")
Hh, Ww = mask.shape

# ── contorno ──
K = 4
big = cv2.resize(mask * 255, None, fx=K, fy=K, interpolation=cv2.INTER_CUBIC)
big = cv2.GaussianBlur(big, (0, 0), K * 1.2)
_, big = cv2.threshold(big, 127, 255, cv2.THRESH_BINARY)
cs, _ = cv2.findContours(big, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)


def angulo(p, i, w):
    a, b, c = p[(i - w) % len(p)], p[i], p[(i + w) % len(p)]
    v1, v2 = a - b, c - b
    cos = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-9)
    return np.degrees(np.arccos(np.clip(cos, -1, 1)))


def contorno_limpo(pts):
    p = pts.astype(float)
    n = len(p)
    w = 24  # ~6 px na escala original
    ang = np.array([angulo(p, i, w) for i in range(n)])
    cand = [i for i in range(n) if ang[i] < 118 and ang[i] == ang[max(0, i - w):i + w + 1].min()]
    quinas = []
    for i in cand:
        if not quinas or i - quinas[-1] > w * 2:
            quinas.append(i)
    saida = []
    if len(quinas) < 2:
        tck, _ = splprep([p[:, 0], p[:, 1]], s=len(p) * 6.0, per=1)
        u = np.linspace(0, 1, max(40, n // 10))
        x, y = splev(u, tck)
        return np.stack([x, y], 1)
    for k in range(len(quinas)):
        a, b = quinas[k], quinas[(k + 1) % len(quinas)]
        seg = p[a:b + 1] if b > a else np.concatenate([p[a:], p[:b + 1]])
        if len(seg) < 8:
            saida.extend(seg[:-1])
            continue
        tck, _ = splprep([seg[:, 0], seg[:, 1]], s=len(seg) * 6.0, k=3)
        u = np.linspace(0, 1, max(4, len(seg) // 10))
        x, y = splev(u, tck)
        saida.extend(np.stack([x, y], 1)[:-1])
    return np.array(saida)


partes = []
for c in cs:
    if cv2.contourArea(c) < K * K * 40:
        continue
    q = contorno_limpo(c[:, 0, :]) / K
    partes.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in q) + "Z")

# ── pinceladas pelo esqueleto ──
ys, xs = np.where(esq == 1)
pix = set(zip(xs.tolist(), ys.tolist()))


def perto(x, y):
    d = (xs - x) ** 2 + (ys - y) ** 2
    i = int(np.argmin(d))
    return int(xs[i]), int(ys[i])


def caminho(a, b):
    ini, fim = perto(*a), perto(*b)
    prox = [(0.0, ini)]
    custo = {ini: 0.0}
    veio = {}
    while prox:
        c, u = heapq.heappop(prox)
        if u == fim:
            break
        if c > custo[u]:
            continue
        x, y = u
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                v = (x + dx, y + dy)
                if v == u or v not in pix:
                    continue
                nc = c + (1.4142 if dx and dy else 1.0)
                if nc < custo.get(v, 1e18):
                    custo[v] = nc
                    veio[v] = u
                    heapq.heappush(prox, (nc, v))
    rota = [fim]
    while rota[-1] != ini:
        rota.append(veio[rota[-1]])
    return rota[::-1]


def pincelada(pontos, nome):
    rota = []
    for a, b in zip(pontos, pontos[1:]):
        r = caminho(a, b)
        rota.extend(r if not rota else r[1:])
    r = np.array(rota, float)
    largura = float(np.percentile([dist[int(y), int(x)] for x, y in rota], 90) * 2 + 6)
    s = max(3, len(r) // 6)
    tck, _ = splprep([r[:, 0], r[:, 1]], s=len(r) * 1.5, k=3)
    u = np.linspace(0, 1, s)
    x, y = splev(u, tck)
    d = "M" + "L".join(f"{a:.1f} {b:.1f}" for a, b in zip(x, y))
    return {"nome": nome, "d": d, "largura": round(largura, 1)}


PINCELADAS = [
    ("haste do D", [(350, 548), (349, 700), (348, 925)]),
    ("barriga do D", [(372, 536), (470, 518), (590, 570), (632, 690), (610, 810), (566, 866)]),
    ("pé do D", [(288, 936), (350, 928), (440, 935), (520, 905)]),
    ("chapéu", [(236, 552), (160, 505), (148, 450), (205, 430), (215, 385), (300, 368), (345, 335), (405, 380), (393, 470), (400, 512)]),
    ("faixa do chapéu", [(242, 552), (310, 505), (385, 478)]),
    ("laço e coração", [(48, 828), (40, 780), (110, 725), (200, 715), (300, 758), (350, 800), (430, 855), (525, 895), (620, 905), (745, 880), (712, 790), (735, 745), (775, 765), (815, 748), (858, 775), (835, 830), (745, 880)]),
]
pinceladas = [pincelada(p, n) for n, p in PINCELADAS]

saida = {"viewBox": f"0 0 {Ww} {Hh}", "contorno": "".join(partes), "pinceladas": pinceladas}
json.dump(saida, open("marca-d.json", "w", encoding="utf8"), ensure_ascii=False)
ys2, xs2 = np.where(mask > 0)
print("bbox", xs2.min(), xs2.max(), ys2.min(), ys2.max())
print([(p["nome"], p["largura"], len(p["d"])) for p in pinceladas], round(len(saida["contorno"]) / 1024, 1), "KB contorno")
