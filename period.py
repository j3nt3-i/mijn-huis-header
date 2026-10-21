import re, collections, glob, json
import xml.etree.ElementTree as ET
from layers import FALL
def starts(e):
    pts = []
    for k in e.iter():
        d = k.get('d')
        if d: pts += [tuple(map(float, m)) for m in re.findall(r'M(-?[\d.]+)[ ,](-?[\d.]+)', d)]
        if k.get('cx'): pts.append((float(k.get('cx')), float(k.get('cy'))))
    return pts
res = {}
for f in sorted(glob.glob('hh/*.svg')):
    root = ET.parse(f).getroot()
    for e in root.iter():
        i = e.get('id', '')
        if not FALL.match(i): continue
        P = starts(e)
        c = collections.Counter()
        for a in P:
            for b in P:
                if b[1] - a[1] > 150: c[(round(b[0]-a[0]), round(b[1]-a[1]))] += 1
        (off, n) = c.most_common(1)[0] if c else ((0, 0), 0)
        frac = 2 * n / max(len(P), 1)
        res.setdefault(f[3:-4], {})[i] = {'n': len(P), 'off': off, 'paired': round(frac, 2)}
        print(f[3:-4], '|', i, len(P), off, round(frac, 2))
json.dump(res, open('periods.json', 'w'))
