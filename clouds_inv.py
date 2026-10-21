import re
import xml.etree.ElementTree as ET
N = '{http://www.w3.org/2000/svg}'
CLOUD = re.compile(r'wolk|bewolk', re.I)
SKIP = re.compile(r'weerspiegel|reflectie|bliksem|lucht en bomen|^bewolkte (dag|nacht|lucht)$|half bewolkt (dag|nacht|ochtend|avond)', re.I)
def bbox(e):
    nums = []
    for k in e.iter():
        d = k.get('d')
        if d: nums += [tuple(map(float, m)) for m in re.findall(r'(-?[\d.]+)[ ,](-?[\d.]+)', d)]
        for a, b, w, h in (('x', 'y', 'width', 'height'),):
            if k.get(w) and k.tag.endswith('rect'): nums += [(float(k.get(a, 0)), float(k.get(b, 0))), (float(k.get(a, 0)) + float(k.get(w)), float(k.get(b, 0)) + float(k.get(h)))]
        if k.get('cx'): 
            rx = float(k.get('rx', k.get('r', 0))); ry = float(k.get('ry', k.get('r', 0)))
            nums += [(float(k.get('cx')) - rx, float(k.get('cy')) - ry), (float(k.get('cx')) + rx, float(k.get('cy')) + ry)]
    if not nums: return None
    return (min(n[0] for n in nums), min(n[1] for n in nums), max(n[0] for n in nums), max(n[1] for n in nums))
def clouds(path):
    root = ET.parse(path).getroot()
    parent = {c: p for p in root.iter() for c in p}
    cand = [e for e in root.iter() if e.get('id') and CLOUD.search(e.get('id')) and not SKIP.search(e.get('id'))]
    # deepest only: drop candidates that contain another candidate
    cs = set(cand)
    out = []
    for e in cand:
        if any(k in cs for k in e.iter() if k is not e): continue
        out.append((e, bbox(e), parent[e]))
    return out
if __name__ == '__main__':
    import sys
    for f in sys.argv[1:]:
        print('==', f)
        for e, bb, p in clouds(f):
            print('  ', e.get('id'), e.tag.replace(N, ''), 'bbox', tuple(round(v) for v in bb) if bb else None, '| attrs', {k: v[:25] for k, v in e.attrib.items() if k not in ('id', 'd')}, '| parent', p.get('id'), {k: v[:25] for k, v in p.attrib.items() if k != 'id'})
