"""Desenha o D a partir da foto (não da fonte): o D da peça tem a barriga terminando numa ponta
solta que passa do laço, e a base fechada por uma curva que emenda no laço.
- tira da máscara o chapéu e o laço (do modelo atual);
- preenche por baixo do laço (fica escondido pela folga) pra os pedaços do D se emendarem;
- contorno suavizado -> pontos de controle com marcação de canto vivo.
Atualiza modelo-marca.json: d.contornos = [[[x, y, canto], ...], ...]."""
import json

import cv2
import numpy as np
from scipy.interpolate import splev, splprep

mask = np.load("mask.npy").astype(np.uint8)
m = json.load(open("modelo-marca.json", encoding="utf8"))
H, W = mask.shape


def catmull(pts, passo=2.0):
    pts = [np.array(p[:2], float) for p in pts]
    out = []
    for i in range(len(pts) - 1):
        p0, p1, p2, p3 = pts[max(0, i - 1)], pts[i], pts[i + 1], pts[min(len(pts) - 1, i + 2)]
        n = max(2, int(np.ceil(np.linalg.norm(p2 - p1) / passo)))
        for k in range(n):
            t = k / n
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(pts[-1])
    return np.array(out)


# laço (fita) e chapéu do modelo, rasterizados
laco = np.array(m["laco"]["pts"], float)
dens = catmull([p for p in laco])
larg = np.interp(np.linspace(0, len(laco) - 1, len(dens)), np.arange(len(laco)), laco[:, 2])
fita = np.zeros_like(mask)
for (x, y), w in zip(dens, larg):
    cv2.circle(fita, (int(round(x)), int(round(y))), max(1, int(round(w / 2))), 1, -1)
chapeu = np.zeros_like(mask)
for chave in ("chapeu", "faixa"):
    p = catmull(m[chave]["pts"]).astype(np.int32)
    cv2.polylines(chapeu, [p], False, 1, int(m[chave]["largura"] + 6))

# o D: tira laço (com folga + engorde da máscara) e chapéu
folga = m["folga"]
sem = mask.copy()
sem[cv2.dilate(fita, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(2 * folga + 9),) * 2)) > 0] = 0
sem[chapeu > 0] = 0
n, lab, st, _ = cv2.connectedComponentsWithStats(sem)
# fica com os pedaços grandes na região do D
d = np.zeros_like(mask)
for i in range(1, n):
    x, y, w, h, a = st[i]
    cx, cy = x + w / 2, y + h / 2
    if a > 800 and 250 < cx < 720 and 480 < cy < 960:
        d[lab == i] = 1
# emenda os pedaços por baixo do laço: fecha só dentro da faixa do laço+folga (o que ficar ali some)
ponte = cv2.dilate(fita, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(2 * folga + 9),) * 2))
fechado = cv2.morphologyEx(d, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (45, 45)))
d = ((d > 0) | ((fechado > 0) & (ponte > 0))).astype(np.uint8)
cv2.imwrite("d-tracado.png", d * 255)

K = 4
big = cv2.resize(d * 255, None, fx=K, fy=K, interpolation=cv2.INTER_CUBIC)
big = cv2.GaussianBlur(big, (0, 0), K * 1.6)
_, big = cv2.threshold(big, 165, 255, cv2.THRESH_BINARY)  # afina ~1,5 px (a máscara engorda o traço)
cs, hier = cv2.findContours(big, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)


def angulo(p, i, w):
    a, b, c = p[(i - w) % len(p)], p[i], p[(i + w) % len(p)]
    v1, v2 = a - b, c - b
    return np.degrees(np.arccos(np.clip(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-9), -1, 1)))


contornos = []
for c in cs:
    if cv2.contourArea(c) < K * K * 150:
        continue
    p = c[:, 0, :].astype(float) / K
    # suaviza por spline periódica e reamostra
    tck, _ = splprep([p[:, 0], p[:, 1]], s=len(p) * 0.6, per=1)
    q = np.stack(splev(np.linspace(0, 1, len(p) // 2, endpoint=False), tck), 1)
    ap = cv2.approxPolyDP(q.astype(np.float32).reshape(-1, 1, 2), 1.6, True)[:, 0, :]
    idx = [int(np.argmin(np.hypot(*(q - v).T))) for v in ap]
    pontos = []
    for v, i in zip(ap, idx):
        canto = 1 if angulo(q, i, 6) < 125 else 0
        pontos.append([round(float(v[0]), 1), round(float(v[1]), 1), canto])
    contornos.append(pontos)
m["d"] = {"dx": 0, "dy": 0, "escala": 1, "contornos": contornos}
m.pop("letra", None)
m["recorte"] = None
json.dump(m, open("modelo-marca.json", "w", encoding="utf8"))
print(len(contornos), "contornos", [len(c) for c in contornos], "cantos", [sum(p[2] for p in c) for c in contornos])
