# remove the "YOUCAN" print from the figure's shorts, frame by frame, by template matching: three templates cut from the
# clip itself (the back-waistband "YOUCAN", the front-waistband stacked "YOU / CAN", the vertical "YOUCAN" down the leg),
# searched at several scales; every match above the threshold is inpainted from the fabric around it.
import sys, glob, os, numpy as np, cv2
src, dst, ref = sys.argv[1], sys.argv[2], sys.argv[3]; dbg = len(sys.argv) > 4
def tpl(n, x0, y0, x1, y1): return cv2.cvtColor(cv2.imread(f"{ref}/{n}.png"), cv2.COLOR_BGR2GRAY)[y0:y1, x0:x1]
T = [tpl("0311", 324, 965, 393, 990), tpl("0481", 343, 778, 364, 800), tpl("0161", 248, 820, 274, 939), tpl("0620", 334, 810, 360, 823), tpl("0291", 436, 908, 482, 937)]   # + the close-up front "YOU" (orange light), the skewed back print during the camera move
SC = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.12, 1.25, 1.4, 1.6, 1.8]
TH = [0.6, 0.6, 0.62, 0.6, 0.55]
MED = [70, 70, 35, 70, 70]    # the box must sit on fabric: the waistband (~40-55) for the first two, the near-black shorts (~10-20) for the leg print   # per template (the stacked front print is tiny and low-contrast)
def find(g):
    out = []
    for t, th, md in zip(T, TH, MED):
        best = (0, None)
        for s in SC:
            tt = cv2.resize(t, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
            if tt.shape[0] < 8 or tt.shape[1] < 8 or tt.shape[0] >= g.shape[0] or tt.shape[1] >= g.shape[1]: continue
            r = cv2.matchTemplate(g, tt, cv2.TM_CCOEFF_NORMED)
            _, mx, _, loc = cv2.minMaxLoc(r)
            if mx > best[0]:
                x0, y0, x1, y1 = loc[0], loc[1], loc[0] + tt.shape[1], loc[1] + tt.shape[0]
                # the print sits on black fabric: the box must be dark overall (skin/legs are not)
                if np.median(g[y0:y1, x0:x1]) < md: best = (mx, (x0, y0, x1, y1))
        if best[0] > th:
            if t is T[3] and best[1]:
                x0, y0, x1, y1 = best[1]; best = (best[0], (x0, y0, x1, min(g.shape[0], y1 + (y1 - y0) + 3)))
            out.append(best)
    return out
hits = 0
for f in sorted(glob.glob(f"{src}/*.png")):
    img = cv2.imread(f); g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    ms = find(g)
    if ms:
        hits += 1
        m = np.zeros(g.shape, np.uint8)
        for sc, (x0, y0, x1, y1) in ms:
            box = g[y0:y1, x0:x1]
            # only the print's own bright pixels (and a hair around them), so the fabric's folds stay
            loc = (box > np.percentile(box, 35) + 18).astype(np.uint8)
            m[y0:y1, x0:x1] |= loc
        m = cv2.dilate(m, np.ones((5, 5), np.uint8))
        img = cv2.inpaint(img, m * 255, 4, cv2.INPAINT_TELEA)
        if dbg:
            for sc, (x0, y0, x1, y1) in ms: cv2.rectangle(img, (x0 - 6, y0 - 6), (x1 + 6, y1 + 6), (0, 0, 255), 1); cv2.putText(img, f"{sc:.2f}", (x0, y0 - 10), 0, 0.5, (0, 0, 255), 1)
    cv2.imwrite(f"{dst}/{os.path.basename(f)}", img)
print("frames cleaned:", hits)
