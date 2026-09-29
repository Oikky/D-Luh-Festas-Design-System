"""Máscara limpa do D a partir da foto frontal no granito (foto-frontal.jpg)."""
import cv2
import numpy as np

im = cv2.imread("foto-frontal.jpg")
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
h, s, v = cv2.split(hsv)
dourado = (h >= 10) & (h <= 40) & (s >= 60) & (v >= 120)
brilho = (v >= 225) & (s <= 60)
m = (dourado | brilho).astype(np.uint8) * 255
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
maior = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
mask = np.where(lab == maior, 255, 0).astype(np.uint8)
# fecha furinhos internos (reflexos), sem fechar os vazados de verdade (chapéu, D, coração)
inv = cv2.bitwise_not(mask)
n2, lab2, st2, _ = cv2.connectedComponentsWithStats(inv)
for i in range(1, n2):
    if st2[i, cv2.CC_STAT_AREA] < 400:
        mask[lab2 == i] = 255
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
cv2.imwrite("mascara-frontal.png", mask)
ys, xs = np.where(mask > 0)
print("bbox", xs.min(), xs.max(), ys.min(), ys.max(), "area", int((mask > 0).sum()))
