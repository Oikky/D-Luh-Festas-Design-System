"""Vetoriza o D dourado da foto (foto-logo-d.jpg) em SVG.
Máscara por cor (dourado) -> contornos suavizados -> curvas Catmull-Rom.
Gera d-dluh.svg (preenchido) usado no site."""
import cv2
import numpy as np

im = cv2.imread("foto-logo-d.jpg")
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
h, s, v = cv2.split(hsv)
m = ((h >= 12) & (h <= 38) & (s >= 70) & (v >= 90)).astype(np.uint8) * 255
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
mask = np.zeros_like(m)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] > 1500:
        mask[lab == i] = 255
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))

K = 4
big = cv2.resize(mask, None, fx=K, fy=K, interpolation=cv2.INTER_CUBIC)
big = cv2.GaussianBlur(big, (0, 0), K * 2.4)
_, big = cv2.threshold(big, 127, 255, cv2.THRESH_BINARY)
cs, _ = cv2.findContours(big, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)

ys, xs = np.where(mask > 0)
pad = 10
x0, y0 = xs.min() - pad, ys.min() - pad
W, H = xs.max() - x0 + pad, ys.max() - y0 + pad


def suave(p, janela=7):
    n = len(p)
    k = np.ones(janela) / janela
    out = np.empty_like(p)
    for d in range(2):
        ext = np.concatenate([p[-janela:, d], p[:, d], p[:janela, d]])
        out[:, d] = np.convolve(ext, k, "same")[janela:janela + n]
    return out


def caminho(p):
    f = lambda v: f"{v:.1f}".rstrip("0").rstrip(".")
    n = len(p)
    s = f"M{f(p[0][0])} {f(p[0][1])}"
    for i in range(n):
        p0, p1, p2, p3 = p[i - 1], p[i], p[(i + 1) % n], p[(i + 2) % n]
        c1 = p1 + (p2 - p0) / 6
        c2 = p2 - (p3 - p1) / 6
        s += f"C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}"
    return s + "Z"


partes = []
for c in cs:
    if cv2.contourArea(c) < K * K * 40:
        continue
    p = c[:, 0, :].astype(float) / K - np.array([x0, y0])
    p = suave(p[::2], 17)
    ap = cv2.approxPolyDP(p.astype(np.float32).reshape(-1, 1, 2), 0.35, True)[:, 0, :].astype(float)
    partes.append(caminho(ap))

d = "".join(partes)
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">'
       f'<path fill="#c9a24a" fill-rule="evenodd" d="{d}"/></svg>')
open("d-dluh.svg", "w").write(svg)
print(len(partes), "contornos", W, H, round(len(svg) / 1024, 1), "KB")
