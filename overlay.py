import json, re, sys
from urllib.parse import unquote
S = open('hdr_style.txt').read()
# calico cat + night silhouette, lifted from the current template (raw SVG, 2400-space, translate(860 1393))
def grab(start, end):
    i = S.index(start); j = S.index(end, i) + len(end); return unquote(S[i:j])
CAT = grab("%3Cg%20transform%3D%27translate%28860%201393%29%27%3E%3Cdefs", "%3C%2Fg%3E' %}")[:-len("' %}")]
SIL = grab("%3Cg%20transform%3D%27translate%28860%201393%29%27%20fill%3D%27%230d0c1b%27", "%3C%2Fg%3E') %}")[:-len("') %}")]
UP = [(841.2,1324,120,170.4),(975.6,1324,120,170.4),(1303.2,1324,120,170.4),(1437.6,1324,120,170.4)]
DOWN = [(1059.6,1798,349.2,284.4),(1423.2,1798,134.4,284.4)]
DEFS = ("<defs><radialGradient id='w' cx='0.5' cy='0.45' r='0.7'><stop offset='0' stop-color='#fff1bf'/><stop offset='0.6' stop-color='#f8cf6f'/><stop offset='1' stop-color='#e9a944'/></radialGradient>"
        "<linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#a7babb'/><stop offset='0.55' stop-color='#7f9497'/><stop offset='1' stop-color='#55696d'/></linearGradient>"
        "<linearGradient id='n' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#2a2e48'/><stop offset='1' stop-color='#16182c'/></linearGradient></defs>")
def rects(rs, fill):
    return ''.join(f"<rect x='{x}' y='{y}' width='{w}' height='{h}' fill='{fill}' rx='2'/>" for x,y,w,h in rs)
def parts(day):
    off = 'url(#g)' if day else 'url(#n)'
    return {'up_on': rects(UP,'url(#w)'), 'up_off': rects(UP, off), 'down_on': rects(DOWN,'url(#w)'), 'down_off': rects(DOWN, off)}
LIT_UP = {'sunny-night', 'partlycloudy-night', 'windy-night'}  # drawings with upstairs already lit
def inner(slug, up, down):
    tod = slug.rsplit('-', 1)[1]
    p = parts(tod == 'day')
    # downstairs is drawn lit in every variant: only darken it when the lamps are off
    out = p['up_on'] if up else (p['up_off'] if slug in LIT_UP else '')
    out += '' if down else rects(DOWN, 'url(#g)' if tod == 'day' else 'url(#n)')
    return out + (CAT if (up or tod == 'day') else SIL)
def svg(slug, low, up, down):
    dy = 467.42 if low else 417.25
    return f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 887 1662'>{DEFS}<g transform='translate(0 {dy}) scale(0.369583)'>{inner(slug,up,down)}</g></svg>"
if __name__ == '__main__':
    meta = json.load(open('hh_meta.json'))
    for slug, up, down in [a.split(':') for a in sys.argv[1:]] if False else []: pass
