"""Máscara limpa (foto de fundo branco) + esqueleto (Zhang-Suen) do D, com grade pra ler coordenadas."""
import cv2
import numpy as np

im = cv2.imread("foto-logo-d.jpg")
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
h, s, v = cv2.split(hsv)
m = ((h >= 12) & (h <= 38) & (s >= 70) & (v >= 90)).astype(np.uint8) * 255
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
maior = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
mask = np.where(lab == maior, 1, 0).astype(np.uint8)
inv = 1 - mask
n2, lab2, st2, _ = cv2.connectedComponentsWithStats(inv)
for i in range(1, n2):
    if st2[i, cv2.CC_STAT_AREA] < 300:
        mask[lab2 == i] = 1
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
# suaviza a máscara antes do esqueleto (menos galhos espúrios)
suave = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 2.0)
mask_s = (suave > 0.5).astype(np.uint8)
np.save("mask.npy", mask_s)


def zhang_suen(img):
    img = img.copy().astype(np.uint8)
    mudou = True
    while mudou:
        mudou = False
        for passo in (0, 1):
            P = np.pad(img, 1)
            p2, p3, p4 = P[:-2, 1:-1], P[:-2, 2:], P[1:-1, 2:]
            p5, p6, p7 = P[2:, 2:], P[2:, 1:-1], P[2:, :-2]
            p8, p9 = P[1:-1, :-2], P[:-2, :-2]
            viz = [p2, p3, p4, p5, p6, p7, p8, p9]
            B = sum(x.astype(int) for x in viz)
            seq = viz + [p2]
            A = sum(((seq[i] == 0) & (seq[i + 1] == 1)).astype(int) for i in range(8))
            if passo == 0:
                c = (p2 * p4 * p6 == 0) & (p4 * p6 * p8 == 0)
            else:
                c = (p2 * p4 * p8 == 0) & (p2 * p6 * p8 == 0)
            rem = (img == 1) & (B >= 2) & (B <= 6) & (A == 1) & c
            if rem.any():
                img[rem] = 0
                mudou = True
    return img


esq = zhang_suen(mask_s)
np.save("esqueleto.npy", esq)
dist = cv2.distanceTransform(mask_s, cv2.DIST_L2, 5)
np.save("dist.npy", dist)

# visualização com grade de 50 px
vis = cv2.cvtColor((mask_s * 90).astype(np.uint8), cv2.COLOR_GRAY2BGR)
vis[esq == 1] = (0, 0, 255)
for x in range(0, vis.shape[1], 50):
    cv2.line(vis, (x, 0), (x, vis.shape[0]), (60, 60, 60), 1)
    cv2.putText(vis, str(x), (x + 2, 300), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 255), 1)
for y in range(0, vis.shape[0], 50):
    cv2.line(vis, (0, y), (vis.shape[1], y), (60, 60, 60), 1)
    cv2.putText(vis, str(y), (2, y - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 255), 1)
cv2.imwrite("esqueleto-grade.png", vis[290:970, 0:899])
print("ok", int(esq.sum()), "px de esqueleto; espessura máx", float(dist.max()) * 2)
