# Build viewer.html: a local test page that renders every illustration with exactly the dashboard's code
# (layered scene, windows/cat overlay, birds, dog, music notes), with pickers for weather, time of day, lamps and music.
import re
c = open('clearbar.js').read()
grab = lambda a, b: c[c.index(a):c.index(b)]
sky = re.search(r"  const SKY = .*?;\n", c, re.S).group(0)
ov = re.search(r"  const OV = .*?;\n", c).group(0)
critters = grab("  const NOTE1 = ", "  const BIRD_WEATHER")
weather = grab("  const BIRD_WEATHER", "  let headerCard = null;")
scene = grab("  // ---- Layered scene", "  let hui = null;\n  const findHui")
html = r'''<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Header testen</title>
<style>
:root{--primary-background-color:#1c1c1c;color-scheme:dark}
body{margin:0;background:#111;color:#ddd;font:14px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;display:flex;gap:24px;padding:20px;flex-wrap:wrap;align-items:flex-start}
.phone{width:400px;height:860px;border-radius:44px;overflow:hidden;background:var(--primary-background-color);box-shadow:0 0 0 10px #2a2a2a,0 20px 60px #000a;position:relative;flex:none}
.scroller{position:absolute;inset:0;overflow:auto;scrollbar-width:none;isolation:isolate}
.panel{display:flex;flex-direction:column;gap:14px;min-width:260px;max-width:340px}
.panel h1{font-size:18px;margin:0}
label{display:flex;flex-direction:column;gap:5px;font-size:12px;color:#aaa}
select,button{font:inherit;font-size:15px;color:#eee;background:#2a2a2a;border:1px solid #3a3a3a;border-radius:10px;padding:8px 10px}
button{cursor:pointer}
.row{display:flex;gap:8px;flex-wrap:wrap}
.check{flex-direction:row;align-items:center;gap:8px;font-size:14px;color:#ddd}
.info{font:12px ui-monospace,Menlo,monospace;color:#888;white-space:pre-wrap;line-height:1.5}
.bar{position:absolute;top:0;left:0;right:0;height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 6px;z-index:2;pointer-events:none;color:#fff}
.bar>*{display:flex;align-items:center;justify-content:center}
.bar .ic{width:44px;height:44px}.bar svg{width:24px;height:24px;fill:currentColor}
.bar .seg{gap:2px;padding:3px;border-radius:999px;background:rgba(255,255,255,.16);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);margin-top:8px}
.bar .seg span{width:58px;height:34px;border-radius:999px;display:flex;align-items:center;justify-content:center}.bar .seg span.on{background:rgba(255,255,255,.3)}
.bar .seg svg{width:22px;height:22px}
.hint{font-size:12px;color:#888;line-height:1.5}
</style>
<div class="phone"><div class="bar" id="bar"><span class="ic"><svg viewBox="0 0 24 24"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg></span><span class="seg"><span class="on"><svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></span><span><svg viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg></span><span><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a2 2 0 0 1 2 2v5.3a3.5 3.5 0 1 1-4 0V8a2 2 0 0 1 2-2z"/></svg></span></span><span class="ic"><svg viewBox="0 0 24 24"><path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg></span></div><div class="scroller" id="scroller"><div id="host"></div></div></div>
<div class="panel">
  <h1>Header testen</h1>
  <label>Weer<select id="wx"></select></label>
  <label>Dagdeel<select id="tod"><option value="dawn">Ochtendschemer</option><option value="day">Dag</option><option value="dusk">Avondschemer</option><option value="night">Nacht</option></select></label>
  <div class="row"><button id="prev">← Vorige</button><button id="next">Volgende →</button></div>
  <label>Laadanimatie<select id="style"><option value="cascade">Huidig (alles schuift in)</option><option value="apple">Apple-stijl (alleen het huis verschijnt)</option></select></label>
  <button id="enter">▶ Laadanimatie afspelen</button>
  <label class="check"><input type="checkbox" id="down" checked> Lampen beneden aan</label>
  <label class="check"><input type="checkbox" id="up" checked> Lampen boven aan</label>
  <label class="check"><input type="checkbox" id="music"> Muziek beneden (woonkamer/keuken)</label>
  <label class="check"><input type="checkbox" id="musicup"> Muziek boven (Hall display / first floor)</label>
  <label class="check"><input type="checkbox" id="light"> Lichte modus</label>
  <div class="row"><button id="dog">🐕 Hond nu laten lopen</button><button id="birds">🐦 Vogels nu laten vliegen</button></div>
  <div class="row"><button id="pwalk">🚶 Wandelaar</button><button id="pbike">🚲 Fietser</button><button id="pdog">🦮 Met hondje</button></div>
  <div class="row"><button id="shoot">🌠 Vallende ster</button><button id="plane">✈️ Vliegtuig</button></div>
  <label>Stand van de zon (oost → west)<input type="range" id="sun" min="0" max="100" value="50" disabled></label>
  <label class="check"><input type="checkbox" id="sunreal" checked> Zon zoals getekend</label>
  <label>Maan op dit moment (vanuit Nederland)<input type="datetime-local" id="moont"></label>
  <div class="row"><button id="mh-">− 1 uur</button><button id="mh+">+ 1 uur</button><button id="md+">+ 1 dag</button></div>
  <label class="check"><input type="checkbox" id="moonreal"> Maan zoals getekend</label>
  <div class="hint">Pijltjestoetsen ← → wisselen van tekening. Vogels en hond verschijnen alleen bij droog weer (zonnig, half bewolkt, bewolkt, winderig, sneeuw zonnig) en niet ’s nachts, zoals op het dashboard. Ze komen maar af en toe langs; met de knoppen start je meteen een ronde. De hond loopt over het gras voor de haag.</div>
  <div class="info" id="info"></div>
</div>
<script>
(() => {
__SKY____OV____CRITTERS____WEATHER__
  const WX = [['sunny','Zonnig'],['partlycloudy','Half bewolkt'],['cloudy','Bewolkt'],['fog','Mist'],['rainy','Regen'],['pouring','Stortregen'],
    ['lightning','Onweer'],['lightning-rainy','Onweersbui'],['snowy','Sneeuw'],['snowy-rainy','Natte sneeuw'],['sleet','Natte sneeuw met sneeuwdek'],
    ['snowsun','Sneeuw zonnig'],['windy','Winderig'],['windy-variant','Winderig en bewolkt']];
  const LIT_UP = ['sunny-night', 'partlycloudy-night', 'windy-night', 'snowsun-night'];
  const $ = (id) => document.getElementById(id);
  for (const [v, n] of WX) { const o = document.createElement('option'); o.value = v; o.textContent = n; $('wx').appendChild(o); }
  const host = $('host'); const sr = host.attachShadow({ mode: 'open' });
  sr.innerHTML = `<style>
    ha-card{display:block;position:relative;aspect-ratio:2400/3690;--header-height:56px;margin-top:32px;margin-bottom:calc(-81.76px - 4px);padding:44px 20px 0;box-sizing:border-box;color:#fff;font-family:inherit}
    @media (min-width:0){ha-card{margin-bottom:calc(-81.76px - 28px)}}
    ha-card::before{content:'';position:absolute;z-index:-1;top:-56px;left:0;width:100%;height:calc(100% + 56px);background:var(--np-house,none) center bottom/100% auto no-repeat var(--np-sky,#2c3245)}
    @keyframes np-house-stay{from{transform:translateY(0)}to{transform:translateY(1000px)}}
    h2{margin:0;font-size:28px;text-shadow:0 1px 10px #0003}p{margin:6px 0 0;font-size:14px;color:#ffffffe0;max-width:72%}
    .scenes{display:flex;gap:10px;padding:0 20px 20px;position:relative;overflow-x:auto;scrollbar-width:none}.scenes::-webkit-scrollbar{display:none}.scenes i{flex:0 0 100px;height:120px;border-radius:14px;background:var(--card,#2b2b2b)}.scenes::after{content:'';flex:0 0 10px}
    .rest{padding:20px;display:grid;gap:12px}.rest i{display:block;height:90px;border-radius:14px;background:var(--card,#2b2b2b)}
  </style><ha-card><div><h2>Good evening, Jente!</h2><p>Testpagina · zelfde lagen als op het dashboard</p></div></ha-card>
  <div class="scenes"><i></i><i></i><i></i><i></i><i></i></div><div class="rest"><i></i><i></i><i></i><i></i></div>`;
  const hc = sr.querySelector('ha-card');
  host.style.setProperty('--np-scenes-offset', 'calc(-81.76px - 4px)');  // 20.44vw of the 400px phone
  // the bird/dog/notes layer, exactly as the dashboard script builds it
  const st = document.createElement('style'); st.textContent = BIRD_CSS.replace(/@media \(min-width: 871px\)/g, '@media (min-width: 99999px)').replace(/100vw/g, '400px').replace(/(\d+(?:\.\d+)?)vw/g, (m, n) => (n * 4) + 'px'); sr.appendChild(st);
  const nb = document.createElement('np-birds'); nb.innerHTML = birdHTML + '<u></u><s class="dn"></s><s class="dn n2"></s><s class="dn n3"></s><s class="dn n4"></s><s class="up"></s><s class="up n2"></s><s class="up n3"></s><s class="up n4"></s><s class="up l"></s><s class="up l n2"></s><s class="up l n3"></s>'; hc.appendChild(nb);
  let busy = 0;
  const render = async () => {
    const wx = $('wx').value, tod = $('tod').value, slug = wx + '-' + tod;
    const down = $('down').checked, up = $('up').checked;
    document.documentElement.style.setProperty('--np-sky', SKY[slug] || '#2c3245');
    document.documentElement.style.setProperty('--np-ov', 'url("data:image/svg+xml;charset=utf-8,' + OV.head + (up ? OV.upOn : (LIT_UP.includes(slug) ? OV.upOff : '')) +
      (down ? '' : (tod === 'day' ? OV.downDay : OV.downNight)) + (up || tod === 'day' ? OV.cat : OV.sil) + OV.tail + '")');
    nb.toggleAttribute('show', BIRD_WEATHER.includes(wx) && tod !== 'night');
    nb.toggleAttribute('dim', tod === 'dawn' || tod === 'dusk');
    nb.toggleAttribute('music-down', $('music').checked);
    nb.toggleAttribute('music-up', $('musicup').checked);
    const me = ++busy;
    const t0 = performance.now();
    const text = await fetch('hh_prep/' + slug + '.svg').then((r) => r.text());
    if (me !== busy) return;
    const t1 = performance.now();
    const sc = buildScene(text, slug);
    showScene(hc, sc);
    setLights(down, up);
    const t2 = performance.now();
    $('info').textContent = slug + '\nladen ' + Math.round(t1 - t0) + ' ms · lagen bouwen ' + Math.round(t2 - t1) + ' ms\n' +
      sc.layers.length + ' lagen: ' + sc.layers.map((l) => l.kind).join(', ');
    history.replaceState(null, '', '#' + slug);
  };
  const step = (d) => {
    const all = WX.flatMap(([w]) => ['dawn', 'day', 'dusk', 'night'].map((t) => [w, t]));
    let i = all.findIndex(([w, t]) => w === $('wx').value && t === $('tod').value);
    i = (i + d + all.length) % all.length;
    $('wx').value = all[i][0]; $('tod').value = all[i][1]; render();
  };
  for (const id of ['wx', 'tod', 'down', 'up', 'music', 'musicup']) $(id).addEventListener('change', render);
  $('light').addEventListener('change', () => {
    const l = $('light').checked;
    document.documentElement.style.setProperty('--primary-background-color', l ? '#f2f2f2' : '#1c1c1c');
    host.style.setProperty('--card', l ? '#fff' : '#2b2b2b');
  });
  // start a pass right now instead of waiting for the next one (only visible in dry weather and not at night)
  const restart = (els) => { for (const el of els) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; el.style.animationDelay = '0s'; } };
  $('dog').onclick = () => restart(nb.querySelectorAll('u'));
  // people: the same code as the dashboard (in the rain the walker carries an umbrella and the cyclist walks)
  for (const [id, kind] of [['pwalk', 'walker'], ['pbike', 'cyclist'], ['pdog', 'dogwalker']]) $(id).onclick = () => sendPerson(kind, $('wx').value, $('tod').value);
  // sky: shooting stars (nights with stars) and aeroplanes, the same code as the dashboard
  $('shoot').onclick = () => shootingStar();
  $('plane').onclick = () => sendPlane($('tod').value);
  // the sun: on the dashboard it follows sun.sun; here a slider walks it from east (left) to west (right)
  const sunTest = () => {
    $('sun').disabled = $('sunreal').checked;
    const t = $('sun').value / 100;
    sunSky = $('sunreal').checked ? null : { az: 60 + 240 * t, el: 58 * Math.sin(Math.PI * t) };
    placeSun();
  };
  $('sun').addEventListener('input', sunTest);
  // the moon: on the dashboard it is worked out for now and the home location; here for any moment you pick
  const pad = (n) => String(n).padStart(2, '0');
  const local = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  const moonTest = () => {
    const t = Date.parse($('moont').value);
    moonSky = $('moonreal').checked || isNaN(t) ? null : moonNow(t, 52.09, 5.12);
    placeMoon();
  };
  const moonStep = (h) => { $('moont').value = local(new Date(Date.parse($('moont').value) + h * 3600e3)); moonTest(); };
  { const d = new Date(); d.setHours(21, 0, 0, 0); $('moont').value = local(d); moonTest(); }
  $('moont').addEventListener('change', moonTest);
  $('moonreal').addEventListener('change', moonTest);
  $('mh-').onclick = () => moonStep(-1); $('mh+').onclick = () => moonStep(1); $('md+').onclick = () => moonStep(24);
  $('sunreal').addEventListener('change', sunTest);
  $('birds').onclick = () => restart(nb.querySelectorAll('b'));
  const SLOW = Number(new URLSearchParams(location.search).get('slow') || 1);
  // the house and the cards live in a shadow root: include its animations too
  const slowDown = () => { if (SLOW !== 1) for (const a of [...document.getAnimations(), ...sr.getAnimations()]) if (a.effect && a.effect.getTiming().iterations !== Infinity) a.playbackRate = 1 / SLOW; };
  const playEntrance = async () => {
    if ($('style').value === 'apple') return playApple();
    const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
    const view = host, bar = [...$('bar').children], sections = [...sr.querySelectorAll('.scenes, .rest > i')];
    for (const el of [view, ...bar, ...sections]) el.style.opacity = '0';
    $('scroller').scrollTop = 0;
    await render();                                   // rebuild the layers, like a fresh page load
    await new Promise((r) => setTimeout(r, 450 * SLOW));     // the dashboard waits until every layer is decoded
    for (const el of [view, ...bar, ...sections]) el.style.opacity = '';
    view.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 650, easing: 'ease-out', fill: 'backwards' });
    bar.forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }],
      { duration: 450, delay: 250 + i * 70, easing: ease, fill: 'backwards' }));
    sections.forEach((el, k) => el.animate([{ opacity: 0, transform: 'translateY(36px)' }, { opacity: 1, transform: 'none' }],
      { duration: 600, delay: 300 + k * 80, easing: ease, fill: 'backwards' }));
    slowDown();
  };
  // Apple-style: the bar and content are there at once; the house appears behind them (fade from the sky + slight zoom)
  const playApple = async () => {
    $('scroller').scrollTop = 0;
    const old = sr.querySelector('np-scene .pin');
    if (old) old.style.opacity = '0';
    nb.style.opacity = '0';
    await render();
    await new Promise((r) => setTimeout(r, 450 * SLOW));     // the time the dashboard needs to decode the layers
    const ns = sr.querySelector('np-scene');
    ns.querySelector('.pin').style.opacity = ''; nb.style.opacity = '';
    appearHouse(ns, nb);
    slowDown();
  };
  $('style').addEventListener('change', () => { try { localStorage.setItem('np-entrance', ENTRANCE); } catch (e) {} playEntrance(); });
  try { const s = localStorage.getItem('np-entrance'); if (s) $('style').value = s; } catch (e) {}
  // ?style=cascade|apple picks the entrance, ?bare hides the controls (used by the side-by-side comparison)
  const qs = new URLSearchParams(location.search);
  if (qs.get('style')) $('style').value = qs.get('style');
  if (qs.has('bare')) { document.querySelector('.panel').style.display = 'none'; document.body.style.padding = '12px'; }
  $('enter').onclick = playEntrance;
  $('prev').onclick = () => step(-1); $('next').onclick = () => step(1);
  addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  const h = location.hash.slice(1).match(/^(.+)-(dawn|day|dusk|night)$/);
  if (h) { $('wx').value = h[1]; $('tod').value = h[2]; } else { $('wx').value = 'cloudy'; $('tod').value = 'day'; }
  playEntrance().catch((e) => { $('info').textContent = 'Fout: ' + e.message; });  // like opening the dashboard
})();
</script></html>'''
scene = scene.replace('@media (max-width: 870px) { ha-card[np-layered]', '@media (min-width: 0px) { ha-card[np-layered]')  # the phone frame is narrow, the window is not
# helpers the scene code shares with the dashboard script's house logic
scene = ("  const whenLoaded = (url) => new Promise((ok) => { const i = new Image(); i.onload = i.onerror = () => ok(); i.src = url; });\n"
         "  const showOverlay = () => {};\n  const enterPage = () => {};\n  let houseSlug = null;\n  let ENTRANCE = 'cascade';\n  const last = {};\n  const remember = () => {};\n") + scene
html = (html.replace('__SKY__', sky).replace('__OV__', ov).replace('__CRITTERS__', critters).replace('__WEATHER__', weather + scene))
open('viewer.html', 'w').write(html)
print('viewer.html', len(html) // 1024, 'KB')
