# Build viewer.html: a local test page that renders every illustration with exactly the dashboard's code
# (layered scene, windows/cat overlay, birds, dog, music notes), with pickers for weather, time of day, lamps and music.
import re
c = open('clearbar.js').read()
grab = lambda a, b: c[c.index(a):c.index(b)]
sky = re.search(r"  const SKY = .*?;\n", c, re.S).group(0)
ov = re.search(r"  const OV = .*?;\n", c).group(0) + grab("  // The ceiling lamp in our porch", "  const DOWN_AREAS")
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
.panel h2{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#8a8a8a;margin:10px 0 -4px}
.panel [hidden]{display:none!important}
.phone.wide{border-radius:18px}.phone.wide .bar{background:var(--primary-background-color);color:#e3e3e3;padding:0 12px}
.phone.wide .bar .seg{background:rgba(255,255,255,.07);-webkit-backdrop-filter:none;backdrop-filter:none}.phone.wide .bar .seg span.on{background:rgba(255,255,255,.14)}
</style>
<div class="phone"><div class="bar" id="bar"><span class="ic"><svg viewBox="0 0 24 24"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg></span><span class="seg"><span class="on"><svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></span><span><svg viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg></span><span><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a2 2 0 0 1 2 2v5.3a3.5 3.5 0 1 1-4 0V8a2 2 0 0 1 2-2z"/></svg></span></span><span class="ic"><svg viewBox="0 0 24 24"><path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg></span></div><div class="scroller" id="scroller"><div id="host"></div></div></div>
<div class="panel">
  <h1>Header testen</h1>
  <h2>Tekening</h2>
  <label>Weergave<select id="device"><option value="phone">Telefoon</option><option value="tablet">Tablet (1180 × 820)</option><option value="desktop">Desktop (1440 × 900)</option></select></label>
  <label>Weer<select id="wx"></select></label>
  <label>Dagdeel<select id="tod"><option value="dawn">Ochtendschemer</option><option value="day">Dag</option><option value="dusk">Avondschemer</option><option value="night">Nacht</option></select></label>
  <label>Wind<select id="wind"><option value="0">Geen</option><option value="1">Winderig (vanaf 29 km/u)</option><option value="2">Storm (vanaf 50 km/u)</option></select></label>
  <label>Hoeveelheid regen of sneeuw<select id="rainamt"><option value="normal">Normaal (0,5 mm/u of meer)</option><option value="light">Licht (minder dan 0,5 mm/u)</option></select></label>
  <label>Windrichting<select id="winddir"><option value="-1">Westenwind (van rechts naar links)</option><option value="1">Oostenwind (van links naar rechts)</option></select></label>
  <div class="row"><button id="prev">← Vorige</button><button id="next">Volgende →</button></div>
  <button id="enter">▶ Laadanimatie afspelen</button>
  <label class="check"><input type="checkbox" id="light"> Lichte modus</label>
  <h2>Huis</h2>
  <label class="check"><input type="checkbox" id="down" checked> Lampen beneden aan</label>
  <label class="check"><input type="checkbox" id="up" checked> Lampen boven aan</label>
  <label class="check"><input type="checkbox" id="porch" checked> Voordeurlamp aan</label>
  <label class="check"><input type="checkbox" id="nacho" checked> Nacho in het raam</label>
  <label class="check"><input type="checkbox" id="music"> Muziek beneden (woonkamer/keuken)</label>
  <label class="check"><input type="checkbox" id="musicup"> Muziek boven (Hall display / first floor)</label>
  <h2>Langs komen</h2>
  <div class="row"><button id="pwalk">🚶 Wandelaar</button><button id="pbike" data-when="bike">🚲 Fietser</button><button id="pdog">🦮 Met hondje</button></div>
  <div class="row" data-when="critters"><button id="dog">🐕 Hond</button><button id="birds">🐦 Vogels</button></div>
  <h2 data-when="sky">Lucht</h2>
  <div class="row"><button id="shoot" data-when="shoot">🌠 Vallende ster</button><button id="plane" data-when="plane">✈️ Vliegtuig</button></div>
  <label data-when="sun">Stand van de zon (oost → west)<input type="range" id="sun" min="0" max="100" value="50" disabled></label>
  <label class="check" data-when="sun"><input type="checkbox" id="sunreal" checked> Zon zoals getekend</label>
  <label data-when="moon">Maan op dit moment (vanuit Nederland)<input type="datetime-local" id="moont"></label>
  <div class="row" data-when="moon"><button id="mh-">− 1 uur</button><button id="mh+">+ 1 uur</button><button id="md+">+ 1 dag</button></div>
  <label class="check" data-when="moon"><input type="checkbox" id="moonreal"> Maan zoals getekend</label>
  <div class="hint">Pijltjestoetsen ← → wisselen van tekening. Je ziet alleen wat bij deze tekening hoort: vogels en de hond bij droog weer overdag, de fietser niet in de regen, vallende sterren in nachten met sterren, geen vliegtuigen bij mist, stortregen of onweer.</div>
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
    @media (min-width:0){ha-card{margin-bottom:calc(-81.76px - 10px)}}  /* = the dashboard's calc(-20.44vw - 40px) plus the 30px its sections add; cards overlap the picture 92px at 400px wide */
    ha-card::before{content:'';position:absolute;z-index:-1;top:-56px;left:0;width:100%;height:calc(100% + 56px);background:var(--np-house,none) center bottom/100% auto no-repeat var(--np-sky,#2c3245)}
    /* tablet and desktop: the whole drawing as a panel on the left that stays put while the rooms scroll on the right */
    :host(.wide){display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:28px;padding:76px 28px 28px;align-items:start}
    :host(.wide) ha-card{grid-column:1;grid-row:1/span 20;position:sticky;top:76px;height:calc(var(--frame-h) - 100px);width:auto;aspect-ratio:887/1662;margin:0!important;padding:30px 24px 0;border-radius:28px;overflow:hidden}
    :host(.wide) ha-card::before{display:none}
    :host(.wide) np-scene{top:0!important;height:100%!important;-webkit-mask:none!important;mask:none!important}
    :host(.wide) np-scene .pin{animation:none!important}:host(.wide) np-scene .pin::after{display:none}
    :host(.wide) np-scene .stage{bottom:0!important}
    :host(.wide) h2{font-size:26px}:host(.wide) p{max-width:85%}
    :host(.wide) .scenes{grid-column:2;flex-wrap:wrap;overflow:visible;padding:0 0 12px}:host(.wide) .scenes::after{display:none}
    :host(.wide) .room,:host(.wide) .rest{grid-column:2;padding-left:0;padding-right:0}
    :host(.wide) .lights{grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
    @keyframes np-house-stay{from{transform:translateY(0)}to{transform:translateY(1000px)}}
    h2{margin:0;font-size:28px;text-shadow:0 1px 10px #0003}p{margin:6px 0 0;font-size:14px;color:#ffffffe0;max-width:72%}
    .scenes{display:flex;gap:10px;padding:0 20px 20px;position:relative;overflow-x:auto;scrollbar-width:none}.scenes::-webkit-scrollbar{display:none}.sc{position:relative;display:flex;box-sizing:border-box;cursor:pointer;background:var(--card,#2b2b2b);color:var(--txt,#f1f1f1);-webkit-tap-highlight-color:transparent;transition:transform 160ms cubic-bezier(.2,.8,.2,1)}.sc:active{transform:scale(.95)}
    .sc .ic{display:grid;place-items:center;border-radius:50%}.sc .ic svg{fill:currentColor}
    .scenes.new .sc{flex:0 0 128px;height:140px;border-radius:28px;padding:14px 14px 16px;flex-direction:column}
    .scenes.new .sc .ic{width:44px;height:44px;background:color-mix(in srgb,rgb(var(--c)) 45%,#fff);color:#1d1d1f}.scenes.new .sc .ic svg{width:22px;height:22px}
    .scenes.new .sc b{margin-top:auto;font-size:17px;font-weight:700;letter-spacing:-.01em;line-height:1.2}
    .scenes.new .sc small{margin-top:3px;font-size:13px;color:var(--sub,#a0a0a0)}
    @keyframes np-pop{0%{transform:scale(1)}35%{transform:scale(1.18)}65%{transform:scale(.94)}100%{transform:scale(1)}}
    @keyframes np-spin{from{transform:rotate(0)}to{transform:rotate(180deg)}}
    @keyframes np-bounce{0%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}55%{transform:translateY(1px)}75%{transform:translateY(-1.5px)}}
    @keyframes np-tilt{0%,100%{transform:rotate(0)}30%{transform:rotate(-12deg)}60%{transform:rotate(6deg)}}
    @keyframes np-rock{0%,100%{transform:rotate(0)}25%{transform:rotate(-25deg)}55%{transform:rotate(12deg)}80%{transform:rotate(-5deg)}}
    @keyframes np-run{0%,100%{transform:translateX(0)}40%{transform:translateX(6px)}70%{transform:translateX(-2px)}}
    .scenes.new .sc.on .ic{animation:np-pop .5s cubic-bezier(.2,.8,.2,1)}.scenes.new .sc.on .ic svg{animation:var(--anim)}
    .scenes.new .sc.on{background:color-mix(in srgb,rgb(var(--c)) 50%,#fff);color:#1d1d1f}.scenes.new .sc.on .ic{background:#fff}.scenes.new .sc.on small{color:rgba(0,0,0,.55)}
    .scenes::after{content:'';flex:0 0 10px}
    .rest{padding:20px;display:grid;gap:12px}.rest i{display:block;height:90px;border-radius:14px;background:var(--card,#2b2b2b)}
    .room{padding:4px 20px 8px;color:var(--txt,#f1f1f1)}.room-head{display:flex;align-items:center;gap:10px;height:56px}
    .room-head h3{margin:0;font-size:24px;font-weight:700;letter-spacing:-.01em}.room-head .t{margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:15px;color:var(--sub,#a0a0a0)}
    .room-head .t svg{width:16px;height:16px;fill:rgb(255,87,34)}.room-head .pw{width:44px;height:44px;display:grid;place-items:center}.room-head .pw svg{width:30px;height:30px;fill:rgb(255,193,7)}
    .lights{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .lc{background:var(--card,#2b2b2b);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:12px;cursor:pointer}
    .lc .top{display:flex;align-items:center;gap:10px}.lc .ic{flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:rgba(var(--c),.2)}
    .lc .ic svg{width:22px;height:22px;fill:rgb(var(--c))}.lc b{display:block;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lc small{font-size:12px;color:var(--sub,#a0a0a0)}
    .lc .bar{position:relative;height:42px;border-radius:12px;background:rgba(var(--c),.2);overflow:hidden}.lc .bar i{position:absolute;inset:0 auto 0 0;display:block;background:rgb(var(--c));border-radius:0}
    .lc.off .ic{background:rgba(111,111,111,.2)}.lc.off .ic svg{fill:var(--sub,#a0a0a0)}.lc.off .bar{background:rgba(111,111,111,.2)}.lc.off .bar i{display:none}
    @media (prefers-color-scheme:dark){.lc .bar,.lc .ic{filter:saturate(.78) brightness(.85)}}
  </style><ha-card><div><h2>Good evening, Jente!</h2><p>Testpagina · zelfde lagen als op het dashboard</p></div></ha-card>
  <div class="scenes new"></div><div class="room"></div><div class="rest"><i></i><i></i><i></i></div>`;
  const hc = sr.querySelector('ha-card');
  // the scene cards below the illustration, the real scenes from the dashboard; tap one to make it the active scene
  const MDI = { sofa: 'M12.5 7C12.5 5.89 13.39 5 14.5 5H18C19.1 5 20 5.9 20 7V9.16C18.84 9.57 18 10.67 18 11.97V14H12.5V7M6 11.96V14H11.5V7C11.5 5.89 10.61 5 9.5 5H6C4.9 5 4 5.9 4 7V9.15C5.16 9.56 6 10.67 6 11.96M20.66 10.03C19.68 10.19 19 11.12 19 12.12V15H5V12C5 10.9 4.11 10 3 10S1 10.9 1 12V17C1 18.1 1.9 19 3 19V21H5V19H19V21H21V19C22.1 19 23 18.1 23 17V12C23 10.79 21.91 9.82 20.66 10.03Z',
    sun: 'M3.55 19.09L4.96 20.5L6.76 18.71L5.34 17.29M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12C18 8.68 15.31 6 12 6M20 13H23V11H20M17.24 18.71L19.04 20.5L20.45 19.09L18.66 17.29M20.45 5L19.04 3.6L17.24 5.39L18.66 6.81M13 1H11V4H13M6.76 5.39L4.96 3.6L3.55 5L5.34 6.81L6.76 5.39M1 13H4V11H1M13 20H11V23H13',
    bed: 'M19,7H11V14H3V5H1V20H3V17H21V20H23V11A4,4 0 0,0 19,7M7,13A3,3 0 0,0 10,10A3,3 0 0,0 7,7A3,3 0 0,0 4,10A3,3 0 0,0 7,13Z',
    sleep: 'M18.73,18C15.4,21.69 9.71,22 6,18.64C2.33,15.31 2.04,9.62 5.37,5.93C6.9,4.25 9,3.2 11.27,3C7.96,6.7 8.27,12.39 12,15.71C13.63,17.19 15.78,18 18,18C18.25,18 18.5,18 18.73,18Z',
    exit: 'M13.34,8.17C12.41,8.17 11.65,7.4 11.65,6.47A1.69,1.69 0 0,1 13.34,4.78C14.28,4.78 15.04,5.54 15.04,6.47C15.04,7.4 14.28,8.17 13.34,8.17M10.3,19.93L4.37,18.75L4.71,17.05L8.86,17.9L10.21,11.04L8.69,11.64V14.5H7V10.54L11.4,8.67L12.07,8.59C12.67,8.59 13.17,8.93 13.5,9.44L14.36,10.79C15.04,12 16.39,12.82 18,12.82V14.5C16.14,14.5 14.44,13.67 13.34,12.4L12.84,14.94L14.61,16.63V23H12.92V17.9L11.14,16.21L10.3,19.93M21,23H19V3H6V16.11L4,15.69V1H21V23M6,23H4V19.78L6,20.2V23Z',
  };
  const SCENES = [['Chill time', 'sofa', '255, 152, 0', '6 devices', 'Living Room'], ['Day time', 'sun', '255, 193, 7', '6 devices', 'Living Room'],
    ['Bed time', 'bed', '0, 150, 136', '2 devices', 'Bedroom'], ['Sleep', 'sleep', '103, 58, 183', '2 devices', 'Bedroom'], ['Going out', 'exit', '33, 150, 243', 'Whole house', 'Whole house']];
  const svgIcon = (d, cls) => '<svg viewBox="0 0 24 24"' + (cls ? ' class="' + cls + '"' : '') + '><path d="' + d + '"/></svg>';
  const scenesEl = sr.querySelector('.scenes');
  const drawCards = () => {
    scenesEl.querySelectorAll('.sc').forEach((el) => el.remove());
    SCENES.forEach(([name, icon, rgb, devices, area], i) => {
      const el = document.createElement('div');
      el.className = 'sc' + (i === 0 ? ' on' : '');
      el.style.setProperty('--c', rgb);
      el.style.setProperty('--anim', { sun: 'np-spin .9s cubic-bezier(.2,.8,.2,1)', sofa: 'np-bounce .7s ease-out', bed: 'np-tilt .7s ease-in-out', sleep: 'np-rock .9s ease-in-out', exit: 'np-run .6s ease-in-out' }[icon]);
      el.innerHTML = '<span class="ic">' + svgIcon(MDI[icon]) + '</span><b>' + name + '</b><small>' + devices + '</small>';
      el.onclick = () => { scenesEl.querySelectorAll('.sc').forEach((x) => x.classList.toggle('on', x === el)); };
      scenesEl.appendChild(el);
    });
  };
  drawCards();
  // phone, tablet or desktop: the frame takes that size (shrunk to fit this window) and the dashboard mock its layout
  const DEVICES = { phone: [400, 860], tablet: [1180, 820], desktop: [1440, 900] };
  const setDevice = () => {
    const [w, h] = DEVICES[$('device').value], wide = w > 870, ph = document.querySelector('.phone');
    Object.assign(ph.style, { width: w + 'px', height: h + 'px', zoom: wide ? String(Math.min(1, (innerWidth - 420) / w)) : '' });
    ph.classList.toggle('wide', wide); host.classList.toggle('wide', wide);
    host.style.setProperty('--frame-h', h + 'px');
  };
  $('device').addEventListener('change', setDevice);
  // the Living Room section under the scenes, as on the dashboard (mushroom light cards, half width); tap a light to switch it
  const LIGHTS = [['Living room light', '255, 154, 59'], ['Table light', '255, 155, 61'], ['Corner light', '255, 144, 71'],
    ['Round boll', '255, 162, 81'], ['Square lamp', '255, 155, 61'], ['Standing light', '255, 151, 51', 'floor']];
  const BULB = 'M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z';
  const FLOOR = 'M15,2L17,9H7L9,2M11,10H13V20H16V22H8V20H11V10Z';
  const POWER = 'M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13';
  const FIRE = 'M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z';
  const room = sr.querySelector('.room');
  room.innerHTML = '<div class="room-head"><h3>Living Room</h3><span class="t">' + svgIcon(FIRE) + '18.5 °C</span><span class="pw">' + svgIcon(POWER) + '</span></div><div class="lights"></div>';
  LIGHTS.forEach(([name, rgb, kind], i) => {
    const el = document.createElement('div');
    const pct = [100, 80, 65, 100, 45, 100][i];
    el.className = 'lc';
    el.style.setProperty('--c', rgb);
    el.innerHTML = '<div class="top"><span class="ic">' + svgIcon(kind === 'floor' ? FLOOR : BULB) + '</span><span><b>' + name + '</b><small>' + pct + '%</small></span></div><div class="bar"><i style="width:' + pct + '%"></i></div>';
    el.onclick = () => { el.classList.toggle('off'); el.querySelector('small').textContent = el.classList.contains('off') ? 'Off' : pct + '%'; };
    room.querySelector('.lights').appendChild(el);
  });
  host.style.setProperty('--np-scenes-offset', 'calc(-81.76px - 4px)');  // 20.44vw of the 400px phone
  // the bird/dog/notes layer, exactly as the dashboard script builds it
  const st = document.createElement('style'); st.textContent = BIRD_CSS.replace(/@media \(min-width: 871px\)/g, '@media (min-width: 99999px)').replace(/100vw/g, '400px').replace(/(\d+(?:\.\d+)?)vw/g, (m, n) => (n * 4) + 'px'); sr.appendChild(st);
  const nb = document.createElement('np-birds'); nb.innerHTML = birdHTML + '<u></u><s class="dn"></s><s class="dn n2"></s><s class="dn n3"></s><s class="dn n4"></s><s class="up"></s><s class="up n2"></s><s class="up n3"></s><s class="up n4"></s><s class="up l"></s><s class="up l n2"></s><s class="up l n3"></s>'; hc.appendChild(nb);
  let busy = 0;
  const render = async () => {
    // the same choice as the dashboard: a dry day with wind gets the windy drawing
    wind = { level: Number($('wind').value), dir: Number($('winddir').value), light: $('rainamt').value === 'light' };
    const wx0 = $('wx').value, tod = $('tod').value;
    const wx = wind.level && ['sunny', 'cloudy'].includes(wx0) ? (wx0 === 'cloudy' ? 'windy-variant' : 'windy') : wx0, slug = wx + '-' + tod;
    const down = $('down').checked, up = $('up').checked;
    document.documentElement.style.setProperty('--np-sky', SKY[slug] || '#2c3245');
    document.documentElement.style.setProperty('--np-ov-l', 'url("data:image/svg+xml;charset=utf-8,' + OV.head + (up ? OV.upOn : (LIT_UP.includes(slug) ? OV.upOff : '')) +
      (down ? '' : (tod === 'day' ? OV.downDay : OV.downNight)) + ($('nacho').checked ? (up || tod === 'day' ? OV.cat : OV.sil) : '') + ($('porch').checked ? PORCH(tod) : '') + OV.tail + '")');
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
    // only the controls that do something in this drawing
    const has = (k) => sc.layers.some((L) => L.kind === k);
    const when = { bike: !RAINY.includes(wx), critters: BIRD_WEATHER.includes(wx) && tod !== 'night', shoot: tod === 'night' && has('twinkle'),
      plane: !NO_PLANES.includes(wx), sun: has('sun'), moon: has('moon') };
    when.sky = when.shoot || when.plane || when.sun || when.moon;
    for (const el of document.querySelectorAll('[data-when]')) el.hidden = !when[el.dataset.when];
    for (const row of document.querySelectorAll('.panel .row:not([data-when])')) row.hidden = ![...row.children].some((b) => !b.hidden);
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
  for (const id of ['wx', 'tod', 'wind', 'winddir', 'rainamt', 'down', 'up', 'porch', 'nacho', 'music', 'musicup']) $(id).addEventListener('change', render);
  $('light').addEventListener('change', () => {
    const l = $('light').checked;
    document.documentElement.style.setProperty('--primary-background-color', l ? '#f2f2f2' : '#1c1c1c');
    host.style.setProperty('--card', l ? '#fff' : '#2b2b2b');
    host.style.setProperty('--txt', l ? '#1d1d1f' : '#f1f1f1');
    host.style.setProperty('--sub', l ? '#8a8a8e' : '#a0a0a0');
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
  // the entrance: the bar and content are there at once; the house appears behind them (fade from the sky + slight zoom)
  const playEntrance = async () => {
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
         "  const showOverlay = () => {};\n  let houseSlug = null;\n  const appearFirst = false;  // the test page plays the entrance itself\n  const last = {};\n  const remember = () => {};\n") + scene
html = (html.replace('__SKY__', sky).replace('__OV__', ov).replace('__CRITTERS__', critters).replace('__WEATHER__', weather + scene))
open('viewer.html', 'w').write(html)
print('viewer.html', len(html) // 1024, 'KB')
