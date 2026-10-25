# Prepare Jente's drawings for the layered header. Each file stays one complete, valid SVG (it is also the static
# fallback), with the moving parts tagged so the bar script can split it on the phone:
#   data-np="fall|lamp|streak|leaf|bolt|glow|dark|cloud|light|sun|moon|twinkle|sparkle" + parameters  -> separate layers the page moves (cheap, composited)
#   clouds get a slow SMIL sway in 2 steps per second (only the sky layer is redrawn, twice a second)
#   data-np-break="1" on the last cloud ends the sky layer, so the heavy trees/house/hedge layer never has to be redrawn
import json, re, os, glob
from clouds_inv import clouds
from animate import SPEED, LAMP, periods, H, bb, path_el
def tag(s, el, attrs):
    """add attributes to the element string el inside s"""
    new = re.sub(r'^<(\w+) ', lambda m: f'<{m.group(1)} ' + ' '.join(f'{k}="{v}"' for k, v in attrs.items()) + ' ', el, count=1)
    return s.replace(el, new, 1)
def elem(s, lid):
    return re.search(r'<(\w+) [^>]*?id="' + re.escape(lid) + r'"[^>]*?/?>', s)
def ease(t):  # ease-in-out like cubic-bezier(.42,0,.58,1), close enough
    return t * t * (3 - 2 * t)
def prepare(slug, src):
    s = open(src).read()
    # falling rain and snow
    for lid, info in periods.get(slug, {}).items():
        m = path_el(s, lid)
        if not m: continue
        el = m.group(0)
        if lid.endswith('in het lamplicht'):
            sp = SPEED[LAMP[lid[:-len(' in het lamplicht')]]]
            x0, y0, x1, y1 = bb(re.search(r' d="([^"]+)"', el).group(1))
            x0, y0, x1, y1 = x0 - 30, y0 - 30, x1 + 30, y1 + 30
            d = round(y1 - y0, 1)
            s = tag(s, el, {'data-np': 'lamp', 'data-box': f'{x0:.1f} {y0:.1f} {x1:.1f} {y1:.1f}', 'data-d': d, 'data-dur': round(d / sp, 2)})
        else:
            kind, depth = lid.rsplit(' ', 1)
            sp = SPEED[(kind, depth)]
            own = info['paired'] >= 0.95 and info['off'][0] == 0
            d = info['off'][1] if own else H
            s = tag(s, el, {'data-np': 'fall', 'data-d': d, 'data-copy': 0 if own else 1, 'data-dur': round(d / sp, 2)})
    # thunderstorm with rain: hide the middle layer, soften the far one (only where Jente kept the far layer)
    if slug.startswith('lightning-rainy') and 'id="Stortregen ver"' in s:
        s = s.replace('<path data-np="fall"', '<path data-np="fall"', 1)
        s = re.sub(r'(<path [^>]*?)id="Stortregen midden"', r'\1display="none" id="Stortregen midden"', s, count=1)
        s = re.sub(r'(<path [^>]*?)id="Stortregen ver"', r'\1opacity="0.6" id="Stortregen ver"', s, count=1)
    # wind streaks and leaves
    m = path_el(s, 'Windstrepen')
    if m:
        x0, y0, x1, y1 = bb(re.search(r' d="([^"]+)"', m.group(0)).group(1))
        W = round(x1 + 20)
        s = tag(s, m.group(0), {'data-np': 'streak', 'data-w': W, 'data-box': f'0 {y0 - 6:.1f} 887 {y1 + 6:.1f}', 'data-dur': round(W / 110, 1)})
    for i, m in enumerate(list(re.finditer(r'<path id="Opwaaiend blad(?:_\d+)?"[^>]*/>', s))):
        x0, y0, x1, y1 = bb(re.search(r' d="([^"]+)"', m.group(0)).group(1))
        cx = (x0 + x1) / 2
        dur = 7 + (i * 37 % 50) / 10
        rise = 30 + (i * 53 % 60)
        spin = 360 + (i * 97 % 360)
        a, b = -(cx + 50), 887 - cx + 50
        s = tag(s, m.group(0), {'data-np': 'leaf', 'data-box': f'{x0 - 2:.1f} {y0 - 2:.1f} {x1 + 2:.1f} {y1 + 2:.1f}',
                                'data-k': f'{a:.0f} {b:.0f} {rise} {spin} {dur} {round(dur * (cx + 50) / 987, 2)}'})
    # lightning: bolt, glow in the clouds and the dark storm layer flash together (all moved by the page, same clock)
    if 'id="Bliksem"' in s:
        cyc = 11 if 'rainy' in slug else 9
        m = elem(s, 'Bliksem')
        start = m.start(); depth = 0
        for t in re.finditer(r'<(/?)g\b[^>]*?(/?)>', s[start:]):
            if t.group(2): continue
            depth += -1 if t.group(1) else 1
            if depth == 0: end = start + t.end(); break
        x0, y0, x1, y1 = bb(' '.join(re.findall(r' d="([^"]+)"', s[start:end])))
        s = tag(s, m.group(0), {'data-np': 'bolt', 'data-box': f'{x0 - 25:.1f} {y0 - 25:.1f} {x1 + 25:.1f} {y1 + 25:.1f}', 'data-cyc': cyc})
        m = elem(s, 'Bliksemlicht in de wolken')
        if m:
            g = dict(re.findall(r'\b(cx|cy|rx|ry)="([\d.]+)"', m.group(0)))
            cx, cy, rx, ry = (float(g[k]) for k in ('cx', 'cy', 'rx', 'ry'))
            s = tag(s, m.group(0), {'data-np': 'glow', 'data-box': f'{cx - rx:.1f} {cy - ry:.1f} {cx + rx:.1f} {cy + ry:.1f}', 'data-cyc': cyc})
        m = elem(s, 'Onweerslicht')
        if m: s = tag(s, m.group(0), {'data-np': 'dark', 'data-cyc': cyc})
    # light from the living room on the facade, hedge, grass or snow: its own layer that follows the downstairs lamps
    # (the window itself is darkened by the overlay; the neighbours' lit windows stay as drawn)
    import xml.etree.ElementTree as ET
    from clouds_inv import bbox as ebox
    GLOW = re.compile(r'^(Lamplicht in de schemer|Lichtgloed over metselwerk|Zachte lichtuitstraling|Gevellicht|Lichtkrans woonkamer|Licht op de haag|'
                      r'Warm licht op de gevel|Lichtval op de gevel|Lichtvlek in het gras|Zachte lichtval op het gras|Lamplicht op de sneeuw|Licht in de mist|Lichthalo woonkamer)(_\d+)?$')
    root = ET.fromstring(s)
    tagged = set()
    def visit(el, inside):
        i = el.get('id') or ''
        hit = bool(GLOW.match(i)) and not inside
        if hit: tagged.add(i)
        for k in el: visit(k, inside or hit)
    visit(root, False)
    for i in tagged:
        e = root.find(f".//*[@id='{i}']")
        bx = ebox(e)
        m = elem(s, i)
        if not m: continue
        box = f'{bx[0] - 8:.1f} {bx[1] - 8:.1f} {bx[2] + 8:.1f} {bx[3] + 8:.1f}' if bx else '0 0 887 1662'
        s = tag(s, m.group(0), {'data-np': 'light', 'data-room': 'down', 'data-box': box})
    # clouds: every cloud becomes its own layer that the page sways smoothly (composited, 120 Hz, nothing redrawn).
    # Clouds glued to an edge only move away from it; clouds running edge to edge "breathe" (stretch a little).
    for i, (e, bx, _) in enumerate(clouds(src)):
        if not bx or e.tag.split('}')[1] != 'path': continue
        x0, y0, x1, y1 = bx
        A = 40 + (i * 7 % 16)                         # 40–55 units
        right = A if x0 > 40 else min(A, max(0, -x0))
        left = A if x1 < 847 else min(A, max(0, x1 - 887))
        m = path_el(s, e.get('id'))
        if not m: continue
        dur = 14 + (i * 5 % 7)                        # 14–20 s each way
        attrs = {'data-np': 'cloud', 'data-box': f'{x0 - 4:.1f} {y0 - 4:.1f} {x1 + 4:.1f} {y1 + 4:.1f}', 'data-dur': dur, 'data-begin': i * 3 % dur}
        if right + left < 8: attrs['data-breathe'] = 0.06
        else: attrs.update({'data-l': round(left, 1), 'data-r': round(right, 1)})
        s = tag(s, m.group(0), attrs)
    # wind on any weather: Jente's wind streaks (and, for rain and thunder, her blowing leaves) from the windy drawing of
    # the same time of day ride along, hidden (display none, so the plain drawing stays as drawn); the page shows them
    # only when it is windy. They go in just before the rain or snow, or on top when there is none.
    wx, tod = slug.rsplit('-', 1)
    if not wx.startswith('windy'):
        windy = prepare(f'windy-{tod}', f'hh/windy-{tod}.svg')
        def borrowed(kind):
            out = []
            for m in re.finditer(r'<path data-np="' + kind + r'"[^>]*/>', windy):
                el = m.group(0).replace('<path data-np="' + kind + '"', '<path data-np="' + kind + '" data-wind="1" display="none"', 1)
                out.append(re.sub(r' id="([^"]*)"', lambda i: ' id="' + i.group(1) + ' (wind)"', el, count=1))
            return ''.join(out)
        extra = borrowed('streak') + (borrowed('leaf') if wx in ('rainy', 'pouring', 'lightning', 'lightning-rainy') else '')
        first_fall = re.search(r'<path data-np="fall"', s)
        at = first_fall.start() if first_fall else s.rindex('</svg>')
        s = s[:at] + extra + s[at:]
    # the trees behind the house can sway in the wind: each tree (or tree crown) gets its own layer box, with room for
    # the lean; the page only splits them off when it is windy, otherwise they stay part of the still drawing
    root = ET.fromstring(s)
    tree = re.compile(r'^(Boom|Kleine boom|Boomkruin)(_\d+)?$')
    def visit_tree(el, inside):
        i = el.get('id') or ''
        hit = bool(tree.match(i)) and not inside
        if hit:
            bx = ebox(el)
            m = elem(s_ref[0], i)
            if bx and m and bx[3] - bx[1] < 250 and 'data-np=' not in m.group(0):
                s_ref[0] = tag(s_ref[0], m.group(0), {'data-np': 'tree', 'data-box': f'{bx[0] - 14:.1f} {bx[1] - 6:.1f} {bx[2] + 14:.1f} {bx[3]:.1f}'})
        for k in el: visit_tree(k, inside or hit)
    s_ref = [s]
    visit_tree(root, False)
    s = s_ref[0]
    # the sun (day, dawn, dusk): sun and glow move together to where the sun really is (azimuth/elevation)
    for lid in ('Zon', 'Zongloed'):
        m = elem(s, lid)
        c = m and re.search(r' cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"', s[m.start():m.start() + 300])  # a circle, or a group of circles
        if not c: continue
        cx, cy, r = map(float, c.groups())
        s = tag(s, m.group(0), {'data-np': 'sun', 'data-box': f'{cx - r - 2:.1f} {cy - r - 2:.1f} {cx + r + 2:.1f} {cy + r + 2:.1f}', 'data-c': f'{cx} {cy}'})
    # the moon: Jente's crescent becomes a round moon in her colours, with the real phase and place (the page draws
    # it); the moonlight around it moves along and is brighter the fuller the moon
    root = ET.fromstring(s)
    def byid(i): return next((e for e in root.iter() if e.get('id') == i), None)
    for disc_id, glow_id in (('Maansikkel', 'Maanlicht'), ('Wassende maan', 'Maangloed')):
        d, g = byid(disc_id), byid(glow_id)
        if d is None: continue
        bx = ebox(d)
        if not bx: continue
        r = (bx[3] - bx[1]) / 2
        gx = ebox(g) if g is not None else None
        cx, cy = ((gx[0] + gx[2]) / 2, (gx[1] + gx[3]) / 2) if gx else ((bx[0] + bx[2]) / 2, (bx[1] + bx[3]) / 2)
        fill = d.get('fill') or '#e8e8d0'
        gm = re.match(r'url\(#([^)]+)\)', fill)
        if gm:
            gr = re.search(r'<(?:linear|radial)Gradient id="' + re.escape(gm.group(1)) + r'".*?</(?:linear|radial)Gradient>', s, re.S).group(0)
            c1, c2 = (re.findall(r'stop-color="(#[0-9A-Fa-f]{6})"', gr) + [None, None])[:2]
        else:
            c1 = c2 = fill
        m = elem(s, disc_id)
        s = tag(s, m.group(0), {'data-np': 'moon', 'data-moon': 'disc', 'data-c': f'{cx:.1f} {cy:.1f}', 'data-r': f'{r:.1f}',
                                'data-box': f'{cx - r - 3:.1f} {cy - r - 3:.1f} {cx + r + 3:.1f} {cy + r + 3:.1f}',
                                'data-c1': c1, 'data-c2': c2 or c1, 'data-op': d.get('opacity') or '1'})
        if gx:
            m = elem(s, glow_id)
            s = tag(s, m.group(0), {'data-np': 'moon', 'data-moon': 'glow', 'data-c': f'{cx:.1f} {cy:.1f}',
                                    'data-box': f'{gx[0] - 2:.1f} {gx[1] - 2:.1f} {gx[2] + 2:.1f} {gx[3] + 2:.1f}'})
    # stars twinkle: every unbroken run of stars is split into three groups that each dim and brighten at their own
    # pace (one layer per group, so it stays cheap), and Jente's "Fonkelende ster" sparkles each get their own layer
    star = re.compile(r'<circle id="Ster(?:_\d+)?"[^>]*/>')
    runs, run, end = [], [], -1
    for m in star.finditer(s):
        if run and s[end:m.start()].strip(): runs.append(run); run = []
        run.append(m); end = m.end()
    if run: runs.append(run)
    for k, run in enumerate(reversed(runs)):
        groups = []
        for g in range(3):
            items = run[g::3]
            if not items: continue
            xs = [float(re.search(r' cx="([\d.]+)"', i.group(0)).group(1)) for i in items]
            ys = [float(re.search(r' cy="([\d.]+)"', i.group(0)).group(1)) for i in items]
            dur = round(3.2 + (g * 1.3 + k * 0.7) % 2.6, 1)
            groups.append(f'<g data-np="twinkle" data-box="{min(xs) - 4:.1f} {min(ys) - 4:.1f} {max(xs) + 4:.1f} {max(ys) + 4:.1f}" '
                          f'data-dur="{dur}" data-begin="{round((g * 1.7 + k) % dur, 1)}">' + ''.join(i.group(0) for i in items) + '</g>')
        s = s[:run[0].start()] + ''.join(groups) + s[run[-1].end():]
    root = ET.fromstring(s)
    for n, e in enumerate([e for e in root.iter() if re.match(r'Fonkelende ster(_\d+)?$', e.get('id') or '')]):
        bx = ebox(e)
        m = elem(s, e.get('id'))
        if not bx or not m: continue
        s = tag(s, m.group(0), {'data-np': 'sparkle', 'data-box': f'{bx[0] - 3:.1f} {bx[1] - 3:.1f} {bx[2] + 3:.1f} {bx[3] + 3:.1f}',
                                'data-dur': round(2.4 + n * 0.55, 2), 'data-begin': round(n * 0.9, 1)})
    return s
if __name__ == '__main__':
    os.makedirs('hh_prep', exist_ok=True)
    for f in sorted(glob.glob('hh/*.svg')):
        slug = os.path.basename(f)[:-4]
        open(f'hh_prep/{slug}.svg', 'w').write(prepare(slug, f))
    print('done')
