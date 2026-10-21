import re
import xml.etree.ElementTree as ET
N = '{http://www.w3.org/2000/svg}'
FALL = re.compile(r'^(Regen|Stortregen|Natte vlokken|Sneeuwval|Vlokken)( (ver|midden|dichtbij|in het lamplicht))$')
def layers(path):
    root = ET.parse(path).getroot()
    parent = {c: p for p in root.iter() for c in p}
    out = []
    for e in root.iter():
        i = e.get('id', '')
        if FALL.match(i):
            nums = []
            for k in e.iter():
                d = k.get('d')
                if d: nums += [tuple(map(float, m)) for m in re.findall(r'(-?[\d.]+)[ ,](-?[\d.]+)', d)]
                for a, b in (('cx', 'cy'), ('x', 'y')):
                    if k.get(a) is not None and k.get(b) is not None: nums.append((float(k.get(a)), float(k.get(b))))
            xs = [n[0] for n in nums]; ys = [n[1] for n in nums]
            tags = {}
            for k in e.iter():
                t = k.tag.replace(N, ''); tags[t] = tags.get(t, 0) + 1
            out.append(dict(id=i, tag=e.tag.replace(N, ''), attrs={k: v[:40] for k, v in e.attrib.items() if k not in ('id', 'd')},
                            parent=parent[e].get('id'), pattrs={k: v[:40] for k, v in parent[e].attrib.items() if k != 'id'},
                            tags=tags, x=(min(xs), max(xs)) if xs else None, y=(min(ys), max(ys)) if ys else None))
    return out
if __name__ == '__main__':
    import sys
    for f in sys.argv[1:]:
        for l in layers(f):
            print(f.split('/')[-1][:-4], '|', l['id'], l['tag'], l['tags'], 'x', l['x'], 'y', l['y'])
            print('     attrs', l['attrs'], '| parent', l['parent'], l['pattrs'])
