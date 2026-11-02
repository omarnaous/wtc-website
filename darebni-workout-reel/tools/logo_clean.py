import cv2, numpy as np
K = {k: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)) for k in (5, 9, 25, 61)}
def logo_mask(bgr):
    """light brand lettering printed on the dark shorts/mats: bright, colourless, thin, sitting inside a large dark
    patch, in word-sized clusters. Long thin things (bars, cables, edges) and anything on skin are left alone."""
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    sat = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)[..., 1]
    base = cv2.morphologyEx(g, cv2.MORPH_OPEN, K[25])            # the fabric under the letters
    fabric = cv2.morphologyEx((base < 78).astype(np.uint8), cv2.MORPH_OPEN, K[61])   # big dark patches only
    th = cv2.subtract(g, base)
    m = ((th > 28) & (sat < 70) & (fabric > 0)).astype(np.uint8)
    words = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (19, 11)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(words)
    keep = np.zeros(n, bool)
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a < 25 or max(w, h) > 220 or min(w, h) > 70: continue
        if max(w, h) / max(1, min(w, h)) > 8: continue
        keep[i] = True
    out = keep[lab].astype(np.uint8)
    return cv2.dilate(out, K[9]), base
def clean(bgr):
    m, base = logo_mask(bgr)
    # flatten the letters into the fabric (darker fill keeps folds; no smeared bright inpaint)
    filled = cv2.inpaint(bgr, m * 255, 5, cv2.INPAINT_TELEA)
    filled = np.minimum(filled, cv2.cvtColor(np.minimum(base + 12, 255).astype(np.uint8), cv2.COLOR_GRAY2BGR) + 0)
    out = bgr.copy(); out[m > 0] = filled[m > 0]
    return out, m
