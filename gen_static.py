# Static header style (no Jinja, so card-mod applies it on the first frame) + the overlay pieces for the bar script.
import json
from urllib.parse import quote
import overlay as O
S = open('hdr_style.txt').read()
q = lambda x: quote(x, safe='')
# the cat swishes her tail now and then: a few quick flicks, then still for a while
import re
SWISH = ("<animateTransform attributeName='transform' type='rotate' dur='9s' repeatCount='indefinite' calcMode='spline' "
         "keyTimes='0;0.05;0.1;0.15;0.2;0.25;1' values='0 58 93;-22 58 93;8 58 93;-18 58 93;6 58 93;0 58 93;0 58 93' "
         "keySplines='0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0 0 1 1'/>")
m = re.search(r"<path d='M58 93[^>]*/><path d='M58 93[^>]*/><path d='M73 66[^>]*/>", O.CAT)
assert m, 'tail not found'
O.CAT = O.CAT.replace(m.group(0), "<g>" + SWISH + m.group(0) + "</g>")
m = re.search(r"<path d='M58 93[^>]*/>", O.SIL)
O.SIL = O.SIL.replace(m.group(0), "<g>" + SWISH.replace("dur='9s'", "dur='11s'") + m.group(0) + "</g>")
P = {
  'head': q(f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 887 1662'>{O.DEFS}<g transform='translate(0 467.42) scale(0.369583)'>"),
  'upOn': q(O.rects(O.UP, 'url(#w)')), 'upOff': q(O.rects(O.UP, 'url(#n)')),
  'downDay': q(O.rects(O.DOWN, 'url(#g)')), 'downNight': q(O.rects(O.DOWN, 'url(#n)')),
  'cat': q(O.CAT), 'sil': q(O.SIL), 'tail': q('</g></svg>'),
}
json.dump(P, open('ov_parts.json', 'w'))
i = S.index("ha-card { --title-font-size")
css = S[i:S.index("@media (prefers-color-scheme: dark)", i)]
old_bg = css[css.index("background: linear-gradient(to bottom, transparent 86%"):css.index("animation: np-house-stay")]
fade = old_bg[len("background: "):old_bg.index(", {{ dayo }}")]
css = css.replace(old_bg, "background: " + fade + ", var(--np-ov, none) left 0 bottom / 100% auto no-repeat, var(--np-house, none) center bottom / 100% auto no-repeat var(--np-sky, #2c3245); ")
css = css.replace("margin-bottom: calc(-26.1vw - 28px);", "margin-bottom: calc(-20.44vw - 28px);")
css = css.replace("background-size: auto, cover, 100% 100%, cover !important; background-position: 0 0, center bottom, 0 0, center bottom !important;",
                  "background-size: auto, cover, cover !important; background-position: 0 0, center bottom, center bottom !important;")
style = "/* illustration, windows/cat overlay and sky colour come from the bar script as --np-house / --np-ov / --np-sky */ " + css
assert '{%' not in style and '{{' not in style
open('hdr_style_static.txt', 'w').write(style)
print(len(style), {k: len(v) for k, v in P.items()})
