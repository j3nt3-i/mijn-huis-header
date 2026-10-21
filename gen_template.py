import json
from urllib.parse import quote
import overlay as O
S = open('hdr_style.txt').read()
sky = json.load(open('sky.json'))
q = lambda x: quote(x, safe='')
head = lambda dy: q(f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 887 1662'>{O.DEFS}<g transform='translate(0 {dy}) scale(0.369583)'>")
P = {
  'HEAD_HIGH': head(417.25), 'HEAD_LOW': head(467.42),
  'UP_ON': q(O.rects(O.UP, 'url(#w)')), 'UP_OFF': q(O.rects(O.UP, 'url(#n)')),
  'DOWN_D': q(O.rects(O.DOWN, 'url(#g)')), 'DOWN_N': q(O.rects(O.DOWN, 'url(#n)')),
  'CAT': q(O.CAT), 'SIL': q(O.SIL), 'TAIL': q('</g></svg>'),
}
WX = ['sunny','partlycloudy','cloudy','fog','rainy','pouring','snowy','snowy-rainy','lightning','lightning-rainy','windy','windy-variant']
lamps = S[:S.index("{% set wxp")]   # ns.d / ns.u from the room lights, unchanged
jinja = lamps + (
  "{% set el = state_attr('sun.sun', 'elevation') | float(10) %}"
  "{% set tod = 'night' if el < -6 else ('day' if el > 6 else ('dawn' if state_attr('sun.sun', 'rising') else 'dusk')) %}"
  "{% set wxp = states('input_select.weather_preview') %}"
  "{% set wx = states('weather.forecast_home') if wxp in ['Echt weer', 'unknown', 'unavailable'] else wxp %}"
  "{% set wx = {'clear-night': 'sunny', 'hail': 'snowy-rainy', 'exceptional': 'cloudy'}.get(wx, wx) %}"
  "{% set wx = wx if wx in " + json.dumps(WX).replace('"', "'") + " else 'cloudy' %}"
  "{% set snow = states('input_number.sneeuwdek') | float(0) >= 1 %}"
  "{% set wx = 'snowsun' if snow and wx in ['sunny', 'partlycloudy', 'windy'] else ('sleet' if snow and wx == 'snowy-rainy' else wx) %}"
  "{% set slug = wx ~ '-' ~ tod %}"
  "{% set sky = " + json.dumps(sky).replace('"', "'") + "[slug] %}"
  " /*np-house: illustration itself comes from the bar script as --np-house (signed media URL)*/ "
  "{% set ov = \"url(\\\"data:image/svg+xml;charset=utf-8,\" ~ '" + P['HEAD_LOW'] + "'"
  " ~ ('" + P['UP_ON'] + "' if ns.u else ('" + P['UP_OFF'] + "' if slug in ['sunny-night', 'partlycloudy-night', 'windy-night', 'snowsun-night'] else ''))"
  " ~ ('' if ns.d else ('" + P['DOWN_D'] + "' if tod == 'day' else '" + P['DOWN_N'] + "'))"
  " ~ ('" + P['CAT'] + "' if (ns.u or tod == 'day') else '" + P['SIL'] + "')"
  " ~ '" + P['TAIL'] + "' ~ \"\\\")\" %}"
  " /*np-win*/ /*np-cat*/ "
)
i = S.index("ha-card { --title-font-size")
css = S[i:S.index("@media (prefers-color-scheme: dark)", i)]
# illustration layers: fade, windows/cat overlay, the drawing (sky colour fills above it)
old_bg = css[css.index("background: linear-gradient(to bottom, transparent 86%"):css.index("animation: np-house-stay")]
fade = old_bg[len("background: "):old_bg.index(", {{ dayo }}")]
css = css.replace(old_bg, "background: " + fade + ", {{ ov }} left 0 bottom / 100% auto no-repeat, var(--np-house, none) center bottom / 100% auto no-repeat {{ sky }}; ")
css = css.replace("margin-bottom: calc(-26.1vw - 28px);", "margin-bottom: calc(-20.44vw - 28px);")
css = css.replace("background-size: auto, cover, 100% 100%, cover !important; background-position: 0 0, center bottom, 0 0, center bottom !important;",
                  "background-size: auto, cover, cover !important; background-position: 0 0, center bottom, center bottom !important;")
flash = ("{% if wx in ['lightning', 'lightning-rainy'] %}ha-card::after { content: ''; position: absolute; z-index: -1; pointer-events: none; "
  "top: calc(-1 * (var(--header-height, 56px) + env(safe-area-inset-top, 0px))); left: 0; width: 100%; height: calc(100% + (var(--header-height, 56px) + env(safe-area-inset-top, 0px))); "
  "-webkit-mask: linear-gradient(to bottom, #000 calc(100% - 48px), transparent 100%) top / 100% 100% no-repeat; mask: linear-gradient(to bottom, #000 calc(100% - 48px), transparent 100%) top / 100% 100% no-repeat; "
  "animation: np-house-stay linear both, np-flash 9s linear infinite; animation-timeline: scroll(root), auto; animation-range: 0 1000px, normal; } {% endif %}")
kf = S[S.index("@keyframes np-flash"):]
style = jinja + css  # lightning now flashes inside the drawing itself
open('hdr_style_new.txt', 'w').write(style)
print(len(S), '->', len(style))
