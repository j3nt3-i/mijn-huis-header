# Animate Jente's own layers (no new drops, flakes or clouds) with SMIL <animate*> elements.
# SMIL instead of CSS animations: WebKit (the iPhone app) runs SMIL in SVG-as-image far more reliably.
# - rain/snow layers fall straight down and loop (rain layers contain their own vertical repeat;
#   the others get one copy of themselves right above); lamplight drops fall inside a soft mask
# - wind streaks drift right, leaves tumble across; lightning flickers; clouds sway slowly
import json, re, os, glob
from clouds_inv import clouds
periods = json.load(open('periods.json'))
H = 1662
SPEED = {  # drawing units per second (the drawing is 887 wide)
    ('Regen', 'ver'): 105, ('Regen', 'midden'): 160, ('Regen', 'dichtbij'): 245,
    ('Stortregen', 'ver'): 145, ('Stortregen', 'midden'): 215, ('Stortregen', 'dichtbij'): 320,
    ('Sneeuwval', 'ver'): 28, ('Sneeuwval', 'midden'): 40, ('Sneeuwval', 'dichtbij'): 58,
    ('Natte vlokken', 'ver'): 90, ('Natte vlokken', 'midden'): 120, ('Natte vlokken', 'dichtbij'): 160,
}
LAMP = {'Regen': ('Regen', 'dichtbij'), 'Stortregen': ('Stortregen', 'dichtbij'), 'Sneeuwval': ('Sneeuwval', 'midden'), 'Vlokken': ('Natte vlokken', 'midden')}
EASE = '0.42 0 0.58 1'
def bb(d):
    nums = [tuple(map(float, m)) for m in re.findall(r'(-?[\d.]+)[ ,](-?[\d.]+)', d)]
    return min(n[0] for n in nums), min(n[1] for n in nums), max(n[0] for n in nums), max(n[1] for n in nums)
def path_el(s, lid):
    return re.search(r'<path id="' + re.escape(lid) + r'"[^>]*/>', s)
def move(frm, to, dur, begin=0):
    b = f' begin="{-begin}s"' if begin else ''
    return f'<animateTransform attributeName="transform" type="translate" from="{frm}" to="{to}" dur="{dur}s"{b} repeatCount="indefinite"/>'
def add_child(s, lid, child):
    # put an <animate> inside the element with this id (self-closing elements are opened up)
    m = re.search(r'<(\w+) ([^>]*?)id="' + re.escape(lid) + r'"([^>]*?)(/?)>', s)
    if not m: return s
    tag, closed = m.group(1), m.group(4) == '/'
    new = m.group(0)[:-2] + '>' + child + f'</{tag}>' if closed else m.group(0) + child
    return s[:m.start()] + new + s[m.end():]
def animate(slug, src):
    s = open(src).read()
    defs, n, changed = [], 0, False
    # falling rain and snow
    for lid, info in periods.get(slug, {}).items():
        lamp = lid.endswith('in het lamplicht')
        kind, depth = (lid[:-len(' in het lamplicht')], 'lamp') if lamp else lid.rsplit(' ', 1)
        m = path_el(s, lid)
        if not m: continue
        el = m.group(0); n += 1; k = f'npf{n}'
        if lamp:
            sp = SPEED[LAMP[kind]]
            x0, y0, x1, y1 = bb(re.search(r' d="([^"]+)"', el).group(1))
            x0 -= 30; y0 -= 30; x1 += 30; y1 += 30
            dist = round(y1 - y0, 1)
            defs.append(f'<radialGradient id="{k}g" cx="0.5" cy="0.5" r="0.5"><stop offset="0.55" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
                        f'<mask id="{k}m" maskUnits="userSpaceOnUse" x="{x0}" y="{y0}" width="{x1-x0}" height="{y1-y0}"><rect x="{x0}" y="{y0}" width="{x1-x0}" height="{y1-y0}" fill="url(#{k}g)"/></mask>')
            new = f'<g mask="url(#{k}m)"><g>{move("0 0", f"0 {dist}", round(dist / sp, 2))}{el}<use href="#{lid}" y="{-dist}"/></g></g>'
        else:
            sp = SPEED[(kind, depth)]
            off = info['off']
            own = info['paired'] >= 0.95 and off[0] == 0     # Jente's own repeat
            dist = off[1] if own else H
            new = f'<g>{move("0 0", f"0 {dist}", round(dist / sp, 2))}{el}' + ('' if own else f'<use href="#{lid}" y="{-H}"/>') + '</g>'
        s = s.replace(el, new, 1); changed = True
    # thunderstorm with rain was too heavy: hide the middle rain layer, soften the far one
    # (only where the far layer is still there: if Jente already took it out, leave the rest as drawn)
    if slug.startswith('lightning-rainy') and 'id="Stortregen ver"' in s:
        s = s.replace('<path id="Stortregen midden"', '<path display="none" id="Stortregen midden"', 1)
        s = s.replace('<path id="Stortregen ver"', '<path opacity="0.6" id="Stortregen ver"', 1)
    # wind streaks drift to the right; a copy one width to the left makes it loop
    m = path_el(s, 'Windstrepen')
    if m:
        x0, y0, x1, y1 = bb(re.search(r' d="([^"]+)"', m.group(0)).group(1))
        W = round(x1 + 20)
        s = s.replace(m.group(0), f'<g>{move("0 0", f"{W} 0", round(W / 110, 1))}{m.group(0)}<use href="#Windstrepen" x="{-W}"/></g>', 1); changed = True
    # leaves tumble across the picture, each at its own pace, and come back in on the left
    for i, m in enumerate(list(re.finditer(r'<path id="Opwaaiend blad(?:_\d+)?"[^>]*/>', s))):
        el = m.group(0)
        x0, y0, x1, y1 = bb(re.search(r' d="([^"]+)"', el).group(1))
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        dur = 7 + (i * 37 % 50) / 10
        rise = 30 + (i * 53 % 60)
        spin = 360 + (i * 97 % 360)
        a, b = -(cx + 50), 887 - cx + 50
        begin = round(dur * (cx + 50) / 987, 2)
        anim = (f'<animateTransform attributeName="transform" type="translate" values="{a:.0f} {rise*0.4:.0f};{(a+b)/2:.0f} {-rise*0.3:.0f};{b:.0f} {-rise:.0f}" dur="{dur}s" begin="-{begin}s" repeatCount="indefinite"/>'
                f'<animateTransform attributeName="transform" type="rotate" additive="sum" values="0 {cx:.1f} {cy:.1f};{spin/2:.0f} {cx:.1f} {cy:.1f};{spin} {cx:.1f} {cy:.1f}" dur="{dur}s" begin="-{begin}s" repeatCount="indefinite"/>')
        s = s.replace(el, f'<g>{anim}{el}</g>', 1); changed = True
    # lightning: the bolt flickers, the glow in the clouds lights up, the dark storm layer lifts for a moment
    if 'id="Bliksem"' in s:
        cyc = 11 if 'rainy' in slug else 9
        kt = '0;0.85;0.86;0.87;0.885;0.91;1'
        s = add_child(s, 'Bliksem', f'<animate attributeName="opacity" values="0;0;1;0.15;1;0;0" keyTimes="{kt}" dur="{cyc}s" repeatCount="indefinite"/>')
        s = add_child(s, 'Bliksemlicht in de wolken', f'<animate attributeName="opacity" values="0.35;0.35;1;0.5;1;0.35;0.35" keyTimes="0;0.85;0.86;0.87;0.885;0.93;1" dur="{cyc}s" repeatCount="indefinite"/>')
        s = add_child(s, 'Onweerslicht', f'<animate attributeName="opacity" values="1;1;0;0.6;0;1;1" keyTimes="0;0.85;0.86;0.87;0.885;0.93;1" dur="{cyc}s" repeatCount="indefinite"/>')
        changed = True
    # clouds sway slowly; layers glued to (or near) the picture edge only move away from it, so no gap opens
    for i, (e, bx, _) in enumerate(clouds(src)):
        if not bx or e.tag.split('}')[1] != 'path': continue
        x0, y0, x1, y1 = bx
        A = 22 + (i * 7 % 18)
        right = A if x0 > 40 else min(A, max(0, -x0))
        left = A if x1 < 847 else min(A, max(0, x1 - 887))
        if right + left < 8: continue
        m = path_el(s, e.get('id'))
        if not m: continue
        dur = 26 + (i * 11 % 17)
        anim = (f'<animateTransform attributeName="transform" type="translate" values="{-left} 0;{right} 0;{-left} 0" keyTimes="0;0.5;1" '
                f'calcMode="spline" keySplines="{EASE};{EASE}" dur="{2*dur}s" begin="-{i * 5 % dur}s" repeatCount="indefinite"/>')
        s = s.replace(m.group(0), f'<g>{anim}{m.group(0)}</g>', 1); changed = True
    if not changed: return None
    if defs:
        head_end = s.index('>', s.index('<svg')) + 1
        s = s[:head_end] + f'<defs>{"".join(defs)}</defs>' + s[head_end:]
    return s
if __name__ == '__main__':
    os.makedirs('hh_anim', exist_ok=True)
    for slug in sorted(os.path.basename(f)[:-4] for f in glob.glob('hh/*.svg')):
        out = animate(slug, f'hh/{slug}.svg')
        if out:
            open(f'hh_anim/{slug}.svg', 'w').write(out); print(slug, len(out))
