
// mijn-huis: on the Huis view on phones, the top bar is see-through with white icons 
// so the house illustration shows behind it. Once you scroll it takes the sky colour of the illustration.
// It also picks the illustration (time of day x weather) for the header card.
(() => {
  if (window.__npClearBar) return;
  window.__npClearBar = true;
  // top sky colour of each illustration ({weather}-{time of day}), measured from the SVGs
  const SKY = {"cloudy-dawn":"#a39ba8","cloudy-day":"#98a0aa","cloudy-dusk":"#a28e93","cloudy-night":"#3f4457","fog-dawn":"#bdb1c0","fog-day":"#b8c0c8","fog-dusk":"#bda2a6","fog-night":"#454d61","lightning-dawn":"#867f8e","lightning-day":"#6e747f","lightning-dusk":"#87747a","lightning-night":"#353b4b","lightning-rainy-dawn":"#6f707e","lightning-rainy-day":"#6c757e","lightning-rainy-dusk":"#6f6973","lightning-rainy-night":"#353948","partlycloudy-dawn":"#35497a","partlycloudy-day":"#2e8ce8","partlycloudy-dusk":"#2b2c5c","partlycloudy-night":"#120f2f","pouring-dawn":"#878691","pouring-day":"#7b838d","pouring-dusk":"#887d83","pouring-night":"#363a49","rainy-dawn":"#a39ba8","rainy-day":"#98a0aa","rainy-dusk":"#a28e93","rainy-night":"#3f4454","snowy-dawn":"#aaa0ab","snowy-day":"#a8adb2","snowy-dusk":"#ab9597","snowy-night":"#414555","snowy-rainy-dawn":"#a29ba8","snowy-rainy-day":"#929ba3","snowy-rainy-dusk":"#a28e92","snowy-rainy-night":"#3d4254","sunny-dawn":"#35497a","sunny-day":"#2e8ce8","sunny-dusk":"#2a2c5c","sunny-night":"#120f2f","windy-dawn":"#35497a","windy-day":"#2e8ce8","windy-dusk":"#2a2c5c","windy-night":"#120f2f","windy-variant-dawn":"#a39ba8","windy-variant-day":"#98a0a9","windy-variant-dusk":"#a28f93","windy-variant-night":"#3f4457","snowsun-dawn":"#35497a","snowsun-day":"#4397ea","snowsun-dusk":"#2a2c5c","snowsun-night":"#120f2f","sleet-dawn":"#a79da9","sleet-day":"#a0a5ab","sleet-dusk":"#a69092","sleet-night":"#404454"};
  const WX_FILE = { 'clear-night': 'sunny', hail: 'snowy-rainy', exceptional: 'cloudy' };
  const css ='.header { transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.8s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.8s cubic-bezier(0.4, 0, 0.2, 1), -webkit-backdrop-filter 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important; } ' +
    ':host([np-clear]) .header { background: transparent !important; background-color: transparent !important; box-shadow: none !important; border-bottom-color: transparent !important; ' +
    'color: #fff !important; --app-header-text-color: #fff; --app-header-selection-bar-color: #fff; --sidebar-icon-color: #fff; } ' +
    '.toolbar { transition: border-color 0.8s cubic-bezier(0.4, 0, 0.2, 1); } :host([np-clear]) .toolbar { border-bottom-color: transparent !important; } ' +
    // once the scene cards have passed under the bar, it takes the page background colour
    ':host([np-page]) .header { background-color: color-mix(in srgb, var(--primary-background-color) 72%, transparent) !important; ' +
    '-webkit-backdrop-filter: blur(16px) saturate(1.4); backdrop-filter: blur(16px) saturate(1.4); box-shadow: none !important; } ' +
    ':host([np-page]) .toolbar { border-bottom-color: transparent !important; } ' +
    // page entrance: hidden until the illustration is ready, then it fades in and the rest slides into place
    // first load: the page waits (a few frames) until the greeting card has its final size, so nothing below it moves
    ':host([np-wait]) #view { opacity: 0 !important; }';
  // Tabs as a segmented control: a rounded track with a filled pill behind the active tab, no underline.
  const segCss = ' /*np-seg*/ ' +
    'ha-tab-group::part(tabs) { transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1); gap: 2px; padding: 3px; border-radius: 999px; background: rgba(var(--rgb-primary-text-color), 0.06); margin: 8px auto 0 auto; width: fit-content; height: 40px !important; box-sizing: border-box; align-items: center !important; border: none !important; } ' +
    'ha-tab-group::part(nav) { display: flex; align-items: center; justify-content: center; height: 100%; } ' +
    'ha-tab-group-tab { height: 34px !important; min-height: 34px; margin: 0 !important; border-radius: 999px; border-bottom: none !important; box-shadow: none !important; transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important; color: inherit !important; } ' +
    // one colour transition only (on the header); tabs, their inner part and icons just inherit it, so all three change
    // together (on iOS each tab's own transition ran at a different pace)
    'ha-tab-group-tab::part(base) { height: 34px; padding: 0 14px; border-radius: 999px; color: inherit !important; transition: none !important; } ' +
    'ha-tab-group-tab ha-icon { color: inherit !important; transition: none !important; } ' +
    'ha-tab-group-tab[active] { background: rgba(var(--rgb-primary-text-color), 0.12); } ' +
    ':host([np-clear]) ha-tab-group::part(tabs) { background: rgba(255, 255, 255, 0.16); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); } ' +
    ':host([np-clear]) ha-tab-group-tab[active] { background: rgba(255, 255, 255, 0.3); } ' +
    ':host([np-clear]) ha-tab-group { color: #fff; } ' +
    // weather preview button, right next to the segmented control
    '.np-wx-btn { position: absolute; top: 8px; width: 40px; height: 40px; padding: 0; border: none; border-radius: 999px; cursor: pointer; ' +
    'display: none; align-items: center; justify-content: center; color: inherit; background: rgba(var(--rgb-primary-text-color), 0.06); ' +
    'transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1); -webkit-tap-highlight-color: transparent; } ' +
    '.np-wx-btn ha-icon { --mdc-icon-size: 22px; color: inherit !important; transition: none !important; } ' +
    '.np-wx-btn[data-preview] { box-shadow: inset 0 0 0 2px currentColor; } ' +
    ':host([np-huis][np-test]) .np-wx-btn { display: flex; } ' +
    '.np-wx-panel { position: absolute; top: 56px; right: 8px; z-index: 10; display: none; flex-direction: column; gap: 10px; width: 220px; padding: 14px; border-radius: 16px; ' +
    'background: var(--card-background-color, #fff); color: var(--primary-text-color); box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28); font: 14px var(--ha-font-family-body, Roboto, sans-serif); } ' +
    ':host([np-huis][np-test]) .np-wx-panel[open] { display: flex; } ' +
    '.np-wx-panel label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--secondary-text-color); } ' +
    '.np-wx-panel select { font: inherit; font-size: 15px; color: var(--primary-text-color); background: var(--secondary-background-color, #f2f2f2); border: none; border-radius: 10px; padding: 8px 10px; } ' +
    '.np-wx-panel button { font: inherit; font-size: 14px; border: none; border-radius: 10px; padding: 9px 10px; cursor: pointer; color: var(--text-primary-color, #fff); background: var(--primary-color); } ' +
    ':host([np-clear]) .np-wx-btn { background: rgba(255, 255, 255, 0.16); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }';
  const WX_ICON = { 'Echt weer': 'mdi:weather-partly-cloudy', sunny: 'mdi:weather-sunny', partlycloudy: 'mdi:weather-partly-cloudy', cloudy: 'mdi:weather-cloudy',
    fog: 'mdi:weather-fog', rainy: 'mdi:weather-rainy', pouring: 'mdi:weather-pouring', snowy: 'mdi:weather-snowy', 'snowy-rainy': 'mdi:weather-snowy-rainy',
    lightning: 'mdi:weather-lightning', 'lightning-rainy': 'mdi:weather-lightning-rainy', windy: 'mdi:weather-windy', 'windy-variant': 'mdi:weather-windy-variant', snowsun: 'mdi:snowflake', sleet: 'mdi:weather-snowy-rainy' };
  const WX_NAME = { 'Echt weer': 'Echt weer', sunny: 'Zonnig', partlycloudy: 'Half bewolkt', cloudy: 'Bewolkt', fog: 'Mist', rainy: 'Regen',
    pouring: 'Stortregen', snowy: 'Sneeuw', 'snowy-rainy': 'Natte sneeuw', lightning: 'Onweer', 'lightning-rainy': 'Onweersbui', windy: 'Winderig', 'windy-variant': 'Winderig en bewolkt', snowsun: 'Sneeuw zonnig', sleet: 'Natte sneeuw met sneeuwdek' };
  const TOD_NAME = { echt: 'Volgt de zon', dawn: 'Ochtendschemer', day: 'Dag', dusk: 'Avondschemer', night: 'Nacht' };
  // The greeting card that carries the illustration: it already has our layers, or its card-mod ::before paints the
  // fade gradient (other title cards have no ::before). Works before the drawing has loaded, too.
  const isHeaderCard = (hc) => !!hc && (!!hc.querySelector('np-scene, np-birds') || getComputedStyle(hc, '::before').backgroundImage.includes('gradient'));
  // Hidden test panel: tap the illustration 5 times to show the weather button (and 5 times to hide it).
  // The button opens a panel to pick a weather type and time of day; this only changes this device.
  const TEST_KEY = 'np-wx-test';
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } };
  let test = load(TEST_KEY, { on: false, wx: 'Echt weer', tod: 'echt' });
  const setTest = (patch) => { test = Object.assign({}, test, patch); save(TEST_KEY, test); update(); };
  const ensureButton = (h) => {
    const tb = h.shadowRoot.querySelector('.toolbar');
    if (!tb) return null;
    let b = tb.querySelector('.np-wx-btn');
    if (!b) {
      if (getComputedStyle(tb).position === 'static') tb.style.position = 'relative';
      b = document.createElement('button');
      b.className = 'np-wx-btn';
      b.setAttribute('aria-label', 'Weer testen');
      b.appendChild(document.createElement('ha-icon'));
      const p = document.createElement('div');
      p.className = 'np-wx-panel';
      const pick = (label, key, names) => {
        const l = document.createElement('label');
        l.textContent = label;
        const sel = document.createElement('select');
        for (const [v, n] of Object.entries(names)) { const o = document.createElement('option'); o.value = v; o.textContent = n; sel.appendChild(o); }
        sel.dataset.key = key;
        sel.addEventListener('change', () => setTest({ [key]: sel.value }));
        l.appendChild(sel);
        return l;
      };
      p.appendChild(pick('Weer', 'wx', WX_NAME));
      p.appendChild(pick('Dagdeel', 'tod', TOD_NAME));
      const back = document.createElement('button');
      back.textContent = 'Terug naar echt weer';
      back.addEventListener('click', () => { setTest({ wx: 'Echt weer', tod: 'echt' }); p.removeAttribute('open'); });
      p.appendChild(back);
      b.addEventListener('click', () => p.toggleAttribute('open'));
      tb.appendChild(b);
      tb.appendChild(p);
    }
    return b;
  };
  // 5 quick taps on the illustration (the greeting card) toggle test mode
  let taps = [];
  window.addEventListener('click', (ev) => {
    if (!/\/mijn-huis(\/huis)?\/?$/.test(location.pathname)) return;
    // only the greeting card with the illustration behind it, not other title cards
    const card = ev.composedPath().find((n) => n.tagName === 'MUSHROOM-TITLE-CARD');
    const hc = card && card.shadowRoot && card.shadowRoot.querySelector('ha-card');
    if (!isHeaderCard(hc)) return;
    const now = Date.now();
    taps = taps.filter((t) => now - t < 2500).concat(now);
    if (taps.length >= 5) {
      taps = [];
      setTest(test.on ? { on: false, wx: 'Echt weer', tod: 'echt' } : { on: true });
      const ha = document.querySelector('home-assistant');
      if (ha) ha.dispatchEvent(new CustomEvent('hass-notification', { detail: { message: test.on ? 'Weer testen aan' : 'Weer testen uit', duration: 1500 }, bubbles: true, composed: true }));
    }
  }, true);
  // Which illustration: time of day follows the sun, the weather picks the drawing.
  // The SVGs live in the media folder, which needs a signed URL; the header card reads --np-house / --np-ov / --np-sky.
  const slugFor = (states) => {
    const sun = states['sun.sun'];
    const el = sun ? Number(sun.attributes.elevation) : 10;
    let tod = el < -6 ? 'night' : el > 6 ? 'day' : (sun && sun.attributes.rising ? 'dawn' : 'dusk');
    if (test.on && test.tod !== 'echt') tod = test.tod;
    const real = states['weather.forecast_home'] ? states['weather.forecast_home'].state : 'cloudy';
    const picked = test.on && test.wx !== 'Echt weer';
    let wx = picked ? test.wx : real;
    wx = WX_FILE[wx] || wx;
    if (!SKY[wx + '-' + tod]) wx = 'cloudy';
    // met.no never reports "windy": strong wind on a clear day picks the windy drawing, on a cloudy day the windy and
    // cloudy one; partly cloudy keeps its own drawing (the right amount of cloud) and gets the wind on top
    if (!picked && windFrom(states).level && ['sunny', 'cloudy'].includes(wx)) wx = wx === 'cloudy' ? 'windy-variant' : 'windy';
    // snow on the ground (Open-Meteo, see below): the snowy versions of clear weather and sleet
    const snow = !picked && states[SNOW] ? Number(states[SNOW].state) >= 1 : false;
    if (snow && ['sunny', 'partlycloudy', 'windy'].includes(wx)) wx = 'snowsun';
    if (snow && wx === 'snowy-rainy') wx = 'sleet';
    return wx + '-' + tod;
  };
  // Snow depth at home from Open-Meteo (model estimate, free, no key), every 30 minutes,
  // written to input_number.sneeuwdek (visible in HA as well).
  const SNOW = 'input_number.sneeuwdek';
  const SNOW_KEY = 'np-snow-checked';
  let snowBusy = false;
  const checkSnow = async (ha) => {
    let last = 0;
    try { last = Number(localStorage.getItem(SNOW_KEY) || 0); } catch (e) { /* private mode */ }
    if (snowBusy || Date.now() - last < 30 * 60e3 || !ha.hass.states[SNOW]) return;
    snowBusy = true;
    try {
      const lat = ha.hass.config.latitude.toFixed(2), lon = ha.hass.config.longitude.toFixed(2);
      const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=snow_depth');
      const cm = Math.round(((await r.json()).current.snow_depth || 0) * 1000) / 10;
      if (Number(ha.hass.states[SNOW].state) !== cm) await ha.hass.callService('input_number', 'set_value', { entity_id: SNOW, value: cm });
      try { localStorage.setItem(SNOW_KEY, String(Date.now())); } catch (e) { /* private mode */ }
    } catch (e) { /* offline: try again next time */ }
    snowBusy = false;
  };
  // Wind, gusts and rain at home from Open-Meteo, every 15 minutes (met.no gives no gusts and no current amount);
  // kept on the device, used for how hard the wind blows and how hard it rains in the picture
  const METEO_KEY = 'np-meteo';
  let meteo = null, meteoBusy = false;
  try { meteo = JSON.parse(localStorage.getItem(METEO_KEY) || 'null'); } catch (e) { meteo = null; }
  const checkMeteo = async (ha) => {
    if (meteoBusy || (meteo && Date.now() - meteo.t < 15 * 60e3) || !ha.hass.config) return;
    meteoBusy = true;
    try {
      const lat = ha.hass.config.latitude.toFixed(2), lon = ha.hass.config.longitude.toFixed(2);
      const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=wind_speed_10m,wind_gusts_10m,precipitation');
      const cur = (await r.json()).current;
      meteo = { t: Date.now(), speed: cur.wind_speed_10m, gust: cur.wind_gusts_10m, rate: (cur.precipitation || 0) * 3600 / (cur.interval || 900) };
      try { localStorage.setItem(METEO_KEY, JSON.stringify(meteo)); } catch (e) { /* private mode */ }
    } catch (e) { /* offline: try again next time */ }
    meteoBusy = false;
  };
  // On a fresh load the bar and content are there at once; only the house settles into view (appearHouse)
  const appearFirst = true;
  const SIG_KEY = 'np-house-sig-18';  // bump when the SVGs are replaced, so browsers fetch the new ones
  let sigs = {};
  try { sigs = JSON.parse(localStorage.getItem(SIG_KEY) || '{}'); } catch (e) { sigs = {}; }
  let houseSlug = null, pending = null;
  // last illustration, windows and sky are remembered so the first frame after a reload is already right
  const LAST_KEY = 'np-house-last';
  let last = {};
  try { last = JSON.parse(localStorage.getItem(LAST_KEY) || '{}'); } catch (e) { last = {}; }
  const remember = (k, v) => { last[k] = v; try { localStorage.setItem(LAST_KEY, JSON.stringify(last)); } catch (e) { /* private mode */ } };
  const setVar = (k, v) => { if (document.documentElement.style.getPropertyValue(k) !== v) document.documentElement.style.setProperty(k, v); };
  // The windows/cat overlay only appears once the illustration under it has loaded, so the windows never float on
  // an empty sky (it is tiny inline code and would otherwise always win the race). The layered scene reads
  // --np-ov-l; the card's own background only gets --np-ov while it shows the plain drawing, so a card that HA has
  // just built anew never shows windows on an empty sky.
  let houseReady = false, plainShown = false;
  const whenLoaded = (url) => new Promise((ok) => { const i = new Image(); i.onload = i.onerror = () => ok(); i.src = url; });
  const showOverlay = () => { houseReady = true; if (!last.ov) return; setVar('--np-ov-l', last.ov); if (plainShown) setVar('--np-ov', last.ov); };
  const applyHouse = (slug, url) => {
    setVar('--np-sky', SKY[slug]);
    houseSlug = slug;
    remember('house', url); remember('sky', SKY[slug]);
    fallbackLater(url);
  };
  // only show the plain drawing if the layered scene has not appeared after 4 s
  let fallbackTimer = 0;
  const fallbackLater = (url) => {
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(() => { if (!scene) { plainShown = true; setVar('--np-house', 'url("' + url + '")'); showOverlay(); } }, 4000);
  };
  if (last.house && last.sky) setVar('--np-sky', last.sky);
  // Window light and the calico cat, drawn over the illustration (pieces are URL-encoded SVG, 2400-wide house coordinates).
  // Downstairs is drawn lit in every illustration, so it only gets darkened when its lamps are off;
  // upstairs gets warm light when its lamps are on, and is only darkened on the clear nights where it is drawn lit.
  const OV = {"head":"%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%20887%201662%27%3E%3Cdefs%3E%3CradialGradient%20id%3D%27w%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.7%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23fff1bf%27%2F%3E%3Cstop%20offset%3D%270.6%27%20stop-color%3D%27%23f8cf6f%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23e9a944%27%2F%3E%3C%2FradialGradient%3E%3ClinearGradient%20id%3D%27g%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%270%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23a7babb%27%2F%3E%3Cstop%20offset%3D%270.55%27%20stop-color%3D%27%237f9497%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%2355696d%27%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%27n%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%270%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%232a2e48%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%2316182c%27%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cg%20transform%3D%27translate%280%20467.42%29%20scale%280.369583%29%27%3E","upOn":"%3Crect%20x%3D%27841.2%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23w%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%27975.6%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23w%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%271303.2%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23w%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%271437.6%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23w%29%27%20rx%3D%272%27%2F%3E","upOff":"%3Crect%20x%3D%27841.2%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23n%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%27975.6%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23n%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%271303.2%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23n%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%271437.6%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23n%29%27%20rx%3D%272%27%2F%3E","downDay":"%3Crect%20x%3D%271059.6%27%20y%3D%271798%27%20width%3D%27349.2%27%20height%3D%27284.4%27%20fill%3D%27url%28%23g%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%271423.2%27%20y%3D%271798%27%20width%3D%27134.4%27%20height%3D%27284.4%27%20fill%3D%27url%28%23g%29%27%20rx%3D%272%27%2F%3E","downNight":"%3Crect%20x%3D%271059.6%27%20y%3D%271798%27%20width%3D%27349.2%27%20height%3D%27284.4%27%20fill%3D%27url%28%23n%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%271423.2%27%20y%3D%271798%27%20width%3D%27134.4%27%20height%3D%27284.4%27%20fill%3D%27url%28%23n%29%27%20rx%3D%272%27%2F%3E","cat":"%3Cg%20transform%3D%27translate%28860%201393%29%27%3E%3Cdefs%3E%3CclipPath%20id%3D%27cc%27%3E%3Cellipse%20cx%3D%2738%27%20cy%3D%2774%27%20rx%3D%2725%27%20ry%3D%2725%27%2F%3E%3Crect%20x%3D%2713%27%20y%3D%2774%27%20width%3D%2750%27%20height%3D%2726%27%20rx%3D%276%27%2F%3E%3Ccircle%20cx%3D%2738%27%20cy%3D%2738%27%20r%3D%2717%27%2F%3E%3Cpath%20d%3D%27M23%2030%20L26%209%20L36%2023%20Z%20M40%2023%20L50%209%20L53%2030%20Z%27%2F%3E%3C%2FclipPath%3E%3C%2Fdefs%3E%3Cg%3E%3CanimateTransform%20attributeName%3D%27transform%27%20type%3D%27rotate%27%20dur%3D%279s%27%20repeatCount%3D%27indefinite%27%20calcMode%3D%27spline%27%20keyTimes%3D%270%3B0.05%3B0.1%3B0.15%3B0.2%3B0.25%3B1%27%20values%3D%270%2058%2093%3B-22%2058%2093%3B8%2058%2093%3B-18%2058%2093%3B6%2058%2093%3B0%2058%2093%3B0%2058%2093%27%20keySplines%3D%270.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%3B0%200%201%201%27%2F%3E%3Cpath%20d%3D%27M58%2093%20C80%2095%2082%2070%2070%2058%27%20fill%3D%27none%27%20stroke%3D%27%235b4636%27%20stroke-width%3D%279%27%20stroke-linecap%3D%27round%27%2F%3E%3Cpath%20d%3D%27M58%2093%20C80%2095%2082%2070%2070%2058%27%20fill%3D%27none%27%20stroke%3D%27%23e08a3c%27%20stroke-width%3D%276%27%20stroke-linecap%3D%27round%27%2F%3E%3Cpath%20d%3D%27M73%2066%20C72%2062%2071%2060%2070%2058%27%20fill%3D%27none%27%20stroke%3D%27%232a2420%27%20stroke-width%3D%276%27%20stroke-linecap%3D%27round%27%2F%3E%3C%2Fg%3E%3Cg%20fill%3D%27%23f4ecdc%27%20stroke%3D%27%235b4636%27%20stroke-width%3D%273%27%3E%3Cellipse%20cx%3D%2738%27%20cy%3D%2774%27%20rx%3D%2725%27%20ry%3D%2725%27%2F%3E%3Crect%20x%3D%2713%27%20y%3D%2774%27%20width%3D%2750%27%20height%3D%2726%27%20rx%3D%276%27%2F%3E%3Ccircle%20cx%3D%2738%27%20cy%3D%2738%27%20r%3D%2717%27%2F%3E%3Cpath%20d%3D%27M23%2030%20L26%209%20L36%2023%20Z%20M40%2023%20L50%209%20L53%2030%20Z%27%2F%3E%3C%2Fg%3E%3Cg%20fill%3D%27%23f4ecdc%27%3E%3Cellipse%20cx%3D%2738%27%20cy%3D%2774%27%20rx%3D%2725%27%20ry%3D%2725%27%2F%3E%3Crect%20x%3D%2713%27%20y%3D%2774%27%20width%3D%2750%27%20height%3D%2726%27%20rx%3D%276%27%2F%3E%3Ccircle%20cx%3D%2738%27%20cy%3D%2738%27%20r%3D%2717%27%2F%3E%3Cpath%20d%3D%27M23%2030%20L26%209%20L36%2023%20Z%20M40%2023%20L50%209%20L53%2030%20Z%27%2F%3E%3C%2Fg%3E%3Cg%20clip-path%3D%27url%28%23cc%29%27%3E%3Cellipse%20cx%3D%2722%27%20cy%3D%2780%27%20rx%3D%2714%27%20ry%3D%2717%27%20fill%3D%27%23e08a3c%27%2F%3E%3Cellipse%20cx%3D%2756%27%20cy%3D%2768%27%20rx%3D%2711%27%20ry%3D%2713%27%20fill%3D%27%232a2420%27%2F%3E%3Cpath%20d%3D%27M38%2018%20L56%208%20L58%2040%20C50%2034%2044%2030%2038%2030%20Z%27%20fill%3D%27%23e08a3c%27%2F%3E%3Cpath%20d%3D%27M18%208%20L36%2022%20C34%2034%2026%2040%2020%2040%20Z%27%20fill%3D%27%232a2420%27%2F%3E%3C%2Fg%3E%3Ccircle%20cx%3D%2732%27%20cy%3D%2739%27%20r%3D%272.8%27%20fill%3D%27%237fb547%27%2F%3E%3Ccircle%20cx%3D%2744%27%20cy%3D%2739%27%20r%3D%272.8%27%20fill%3D%27%237fb547%27%2F%3E%3Ccircle%20cx%3D%2732%27%20cy%3D%2739%27%20r%3D%271.1%27%20fill%3D%27%231b1b1b%27%2F%3E%3Ccircle%20cx%3D%2744%27%20cy%3D%2739%27%20r%3D%271.1%27%20fill%3D%27%231b1b1b%27%2F%3E%3Cpath%20d%3D%27M36%2045%20L40%2045%20L38%2047.5%20Z%27%20fill%3D%27%23e79aa6%27%2F%3E%3C%2Fg%3E","sil":"%3Cg%20transform%3D%27translate%28860%201393%29%27%20fill%3D%27%230d0c1b%27%3E%3Cellipse%20cx%3D%2738%27%20cy%3D%2774%27%20rx%3D%2725%27%20ry%3D%2725%27%2F%3E%3Crect%20x%3D%2713%27%20y%3D%2774%27%20width%3D%2750%27%20height%3D%2726%27%20rx%3D%276%27%2F%3E%3Ccircle%20cx%3D%2738%27%20cy%3D%2738%27%20r%3D%2717%27%2F%3E%3Cpath%20d%3D%27M23%2030%20L26%209%20L36%2023%20Z%20M40%2023%20L50%209%20L53%2030%20Z%27%2F%3E%3Cg%3E%3CanimateTransform%20attributeName%3D%27transform%27%20type%3D%27rotate%27%20dur%3D%2711s%27%20repeatCount%3D%27indefinite%27%20calcMode%3D%27spline%27%20keyTimes%3D%270%3B0.05%3B0.1%3B0.15%3B0.2%3B0.25%3B1%27%20values%3D%270%2058%2093%3B-22%2058%2093%3B8%2058%2093%3B-18%2058%2093%3B6%2058%2093%3B0%2058%2093%3B0%2058%2093%27%20keySplines%3D%270.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%3B0%200%201%201%27%2F%3E%3Cpath%20d%3D%27M58%2093%20C80%2095%2082%2070%2070%2058%27%20fill%3D%27none%27%20stroke%3D%27%230d0c1b%27%20stroke-width%3D%277%27%20stroke-linecap%3D%27round%27%2F%3E%3C%2Fg%3E%3Ccircle%20cx%3D%2732%27%20cy%3D%2738%27%20r%3D%272.6%27%20fill%3D%27%23ffd866%27%2F%3E%3Ccircle%20cx%3D%2744%27%20cy%3D%2738%27%20r%3D%272.6%27%20fill%3D%27%23ffd866%27%2F%3E%3C%2Fg%3E","tail":"%3C%2Fg%3E%3C%2Fsvg%3E"};
  // The ceiling lamp in our porch (light.front_door_light): a light point at the porch ceiling, a warm glow below it
  // (clipped at the ceiling, so nothing shines upwards) and light falling down the recess and the door. Drawn in drawing units; it sits inside the overlay's scaled group, so it
  // first undoes that scale. Strongest at night, faint by day.
  const PORCH = (tod) => {
    const k = tod === 'night' ? 1 : tod === 'day' ? 0.35 : 0.7;
    return encodeURIComponent("<g transform='scale(2.70575) translate(0 -467.42)'><defs>" +
      "<radialGradient id='pg'><stop offset='0' stop-color='#ffe2a8' stop-opacity='" + 0.75 * k + "'/><stop offset='.45' stop-color='#ffc978' stop-opacity='" + 0.3 * k + "'/><stop offset='1' stop-color='#ffb85c' stop-opacity='0'/></radialGradient>" +
      "<clipPath id='pc'><rect x='280' y='1129.6' width='124' height='160'/></clipPath><linearGradient id='pf' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#ffd28a' stop-opacity='" + 0.42 * k + "'/><stop offset='1' stop-color='#ffc070' stop-opacity='" + 0.06 * k + "'/></linearGradient></defs>" +
      "<path d='M302 1133H380V1266H302Z' fill='url(#pf)'/><ellipse cx='342' cy='1130' rx='46' ry='64' fill='url(#pg)' clip-path='url(#pc)'/>" +
      "<ellipse cx='342' cy='1130' rx='5.5' ry='1.8' fill='#fff6dc' opacity='" + (0.6 + 0.4 * k) + "'/></g>");
  };
  // Nacho, the calico cat, is not always in the window: the day is cut into 20-minute slots and each slot decides
  // whether she sits there (the same on every device and steady across reloads) - about half the time by day, a third
  // at night. When she has just arrived she fades in.
  const NACHO_SLOT = 20 * 60e3;
  const nachoIn = (slot, tod) => { const h = Math.sin(slot * 12.9898) * 43758.5453; return h - Math.floor(h) < (tod === 'night' ? 0.33 : 0.5); };
  const nacho = (tod, part, t = Date.now()) => {
    const slot = Math.floor(t / NACHO_SLOT);
    if (!nachoIn(slot, tod)) return '';
    const fresh = t - slot * NACHO_SLOT < 60e3 && !nachoIn(slot - 1, tod);
    return fresh ? encodeURIComponent("<g opacity='0'><animate attributeName='opacity' from='0' to='1' dur='1.5s' fill='freeze'/>") + part + encodeURIComponent('</g>') : part;
  };
  const DOWN_AREAS = ['living_room', 'kitchen', 'hall'];
  const UP_AREAS = ['bedroom', 'bathroom', 'jente_s_room', 'donnas_room'];
  const LIT_UP = ['sunny-night', 'partlycloudy-night', 'windy-night', 'snowsun-night'];
  const lampsOn = (hass, areas) => Object.values(hass.entities || {}).some((e) => {
    if (!e.entity_id.startsWith('light.')) return false;
    const area = e.area_id || (e.device_id && hass.devices[e.device_id] ? hass.devices[e.device_id].area_id : null);
    return areas.includes(area) && hass.states[e.entity_id] && hass.states[e.entity_id].state === 'on';
  });
  const setOverlay = (hass, slug) => {
    const tod = slug.split('-').pop();
    const down = lampsOn(hass, DOWN_AREAS), up = lampsOn(hass, UP_AREAS);
    if (down !== lamps.down || up !== lamps.up) setLights(down, up);
    const door = hass.states['light.front_door_light'];
    const svg = OV.head + (up ? OV.upOn : (LIT_UP.includes(slug) ? OV.upOff : '')) +
      (down ? '' : (tod === 'day' ? OV.downDay : OV.downNight)) + nacho(tod, up || tod === 'day' ? OV.cat : OV.sil) +
      (door && door.state === 'on' ? PORCH(tod) : '') + OV.tail;
    const v = 'url("data:image/svg+xml;charset=utf-8,' + svg + '")';
    if (last.ov !== v) remember('ov', v);
    if (houseReady) setVar('--np-ov-l', v);
    if (plainShown) setVar('--np-ov', v);
  };
  // Drawings are kept on the device in IndexedDB (Cache Storage needs https; the app often uses http on the LAN),
  // keyed by SIG_KEY so a new upload is fetched again. Then a reopen needs no network at all.
  const idb = () => new Promise((ok, no) => {
    const r = indexedDB.open('np-house', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('d');
    r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error);
  });
  const idbGet = async (k) => {
    try { const db = await idb(); return await new Promise((ok) => { const q = db.transaction('d').objectStore('d').get(k); q.onsuccess = () => ok(q.result || null); q.onerror = () => ok(null); }); }
    catch (e) { return null; }
  };
  const idbPut = async (k, v) => {
    try {
      const db = await idb();
      const st = db.transaction('d', 'readwrite').objectStore('d');
      st.put(v, k);
      // drop drawings from older uploads
      const keys = st.getAllKeys();
      keys.onsuccess = () => keys.result.filter((x) => !String(x).startsWith(SIG_KEY + ':')).forEach((x) => st.delete(x));
    } catch (e) { /* no storage: the network is used every time */ }
  };
  const drawingKey = (slug) => SIG_KEY + ':' + slug;
  const signed = async (ha, slug) => {
    const path = '/media/local/huis-' + slug + '.svg';
    let s = sigs[slug];
    if (!s || s.exp < Date.now() + 3600e3) {
      const r = await ha.hass.callWS({ type: 'auth/sign_path', path, expires: 7 * 86400 });
      s = { url: r.path, exp: Date.now() + 7 * 86400e3 };
      sigs[slug] = s;
      try { localStorage.setItem(SIG_KEY, JSON.stringify(sigs)); } catch (e) { /* private mode */ }
    }
    return s.url;
  };
  // put built layers in, or keep them until the header card exists (right after a refresh)
  const placeBuilt = (built) => {
    if (!headerCard || !headerCard.isConnected) headerCard = findHeaderCard(hui ? hui.shadowRoot : document);
    const hc = headerCard && headerCard.shadowRoot && headerCard.shadowRoot.querySelector('ha-card');
    if (hc) showScene(hc, built); else pendingScene = built;
  };
  // Early start: right when the script loads, build the last shown drawing from the device copy, while Home Assistant
  // itself is still starting up. If the drawing turns out to be the same once the states are in, nothing is redone.
  let earlySlug = null;
  if (last.slug) idbGet(drawingKey(last.slug)).then((text) => {
    if (!text || houseSlug || scene || pendingScene) return;
    try { earlySlug = last.slug; placeBuilt(buildScene(text, last.slug)); } catch (e) { earlySlug = null; }
  });
  const setHouse = async (ha, slug) => {
    if (slug === houseSlug || slug === pending) return;
    pending = slug;
    try {
      if (slug === earlySlug && (scene || pendingScene)) {
        // already built at startup from the device copy
        houseSlug = slug;
        remember('sky', SKY[slug]); setVar('--np-sky', SKY[slug]);
        signed(ha, slug).then((url) => remember('house', url)).catch(() => {});
      } else {
        let text = await idbGet(drawingKey(slug));
        let url = null;
        if (!text) {
          url = await signed(ha, slug);
          try { text = await fetch(url, { cache: 'force-cache' }).then((r) => (r.ok ? r.text() : null)); } catch (e) { text = null; }
          if (text) idbPut(drawingKey(slug), text);
        }
        if (pending === slug) {
          if (!url) url = await signed(ha, slug).catch(() => null);
          if (url) applyHouse(slug, url); else houseSlug = slug;
          remember('slug', slug);
          // split it into layers; if anything goes wrong the plain (static) drawing is the fallback
          try { if (text) placeBuilt(buildScene(text, slug)); } catch (e) { console.warn('np-scene', e); }
        }
      }
    } catch (e) { /* try again on the next tick */ }
    if (pending === slug) pending = null;
  };
  // iOS pauses animated images while the app is in the background and does not always resume them.
  // When the page becomes visible again, take the illustration off for two frames and put it back: that restarts it.
  const restartHouse = () => {
    const cur = document.documentElement.style.getPropertyValue('--np-house');
    if (!cur || cur === 'none') return;
    document.documentElement.style.setProperty('--np-house', 'none');
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.style.setProperty('--np-house', cur)));
    if (scene) for (const L of scene.layers) {
      if (L.smil && L.node) { const bg = L.node.style.backgroundImage; L.node.style.backgroundImage = 'none'; requestAnimationFrame(() => requestAnimationFrame(() => { L.node.style.backgroundImage = bg; })); }
      if (L.running && sceneSeen) L.running.play();
    }
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) restartHouse(); });
  window.addEventListener('pageshow', (ev) => { if (ev.persisted) restartHouse(); });
  // Birds now and then, and a dog walking over the grass: separate layers over the illustration (moved by the page,
  // so they cost almost nothing), only in dry weather and not at night. Wing flap and walk cycle are inside the small SVGs.
  const NOTE1 = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2014%2020%22%3E%3Cg%20fill%3D%22%23fff4d6%22%3E%3Cellipse%20cx%3D%224.6%22%20cy%3D%2216%22%20rx%3D%224.2%22%20ry%3D%223%22%20transform%3D%22rotate%28-22%204.6%2016%29%22%2F%3E%3Crect%20x%3D%227.4%22%20y%3D%222%22%20width%3D%221.5%22%20height%3D%2214%22%20rx%3D%220.7%22%2F%3E%3Cpath%20d%3D%22M8.2%202%20C10%204.5%2013.6%205.5%2012.8%2010.2%20C12.4%208%2010.6%207%208.2%206.6%20Z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')";
  const NOTE2 = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2022%2020%22%3E%3Cg%20fill%3D%22%23fff4d6%22%3E%3Cellipse%20cx%3D%224.4%22%20cy%3D%2216.2%22%20rx%3D%224%22%20ry%3D%222.9%22%20transform%3D%22rotate%28-22%204.4%2016.2%29%22%2F%3E%3Cellipse%20cx%3D%2216.4%22%20cy%3D%2214.2%22%20rx%3D%224%22%20ry%3D%222.9%22%20transform%3D%22rotate%28-22%2016.4%2014.2%29%22%2F%3E%3Crect%20x%3D%227.2%22%20y%3D%223.4%22%20width%3D%221.5%22%20height%3D%2212.8%22%20rx%3D%220.7%22%2F%3E%3Crect%20x%3D%2219.2%22%20y%3D%221.4%22%20width%3D%221.5%22%20height%3D%2212.8%22%20rx%3D%220.7%22%2F%3E%3Cpath%20d%3D%22M7.2%203.4%20L20.7%201.4%20L20.7%204.4%20L7.2%206.4%20Z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')";
  const DOG_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><defs><linearGradient id="fur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98b55"/><stop offset="1" stop-color="#a86d3f"/></linearGradient><linearGradient id="furD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93592f"/><stop offset="1" stop-color="#7a4826"/></linearGradient></defs><ellipse cx="31" cy="37.6" rx="17" ry="1.8" fill="#1d2a1a" opacity="0.22"/><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -0.7;0 0;0 -0.7;0 0" dur="0.56s" repeatCount="indefinite"/><path d="M19.5 22 h3.4 v13.3 a1.7 1.7 0 0 1 -3.4 0 z" fill="url(#furD)"><animateTransform attributeName="transform" type="rotate" values="20 21.2 22;-20 21.2 22;20 21.2 22" dur="0.56s" repeatCount="indefinite"/></path><path d="M39.5 22 h3.4 v13.3 a1.7 1.7 0 0 1 -3.4 0 z" fill="url(#furD)"><animateTransform attributeName="transform" type="rotate" values="-20 41.2 22;20 41.2 22;-20 41.2 22" dur="0.56s" repeatCount="indefinite"/></path><path d="M15 18 C10 16 8 12 9 7" fill="none" stroke="#a86d3f" stroke-width="3" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="-14 15 18;12 15 18;-14 15 18" dur="0.42s" repeatCount="indefinite"/></path><rect x="13" y="13" width="33" height="13.5" rx="6.8" fill="url(#fur)"/><path d="M20 24.8 Q30 27.6 40 24.8 L40 26.2 Q30 28.6 20 26.2 Z" fill="#f1dcbc" opacity="0.55"/><path d="M15.8 21 h3.6 v14.3 a1.8 1.8 0 0 1 -3.6 0 z" fill="url(#fur)"><animateTransform attributeName="transform" type="rotate" values="-20 17.6 21;20 17.6 21;-20 17.6 21" dur="0.56s" repeatCount="indefinite"/></path><path d="M36 21 h3.6 v14.3 a1.8 1.8 0 0 1 -3.6 0 z" fill="url(#fur)"><animateTransform attributeName="transform" type="rotate" values="20 37.8 21;-20 37.8 21;20 37.8 21" dur="0.56s" repeatCount="indefinite"/></path><path d="M40 18 Q44 9 50 8 L52 15 Q47 17 45 22 Z" fill="url(#fur)"/><circle cx="50.5" cy="10.5" r="6.6" fill="url(#fur)"/><ellipse cx="56.6" cy="13" rx="5.2" ry="3.6" fill="#e8c79c"/><circle cx="61" cy="11.9" r="1.6" fill="#2a1d16"/><circle cx="52.6" cy="8.6" r="1.05" fill="#2a1d16"/><path d="M45.4 5.6 Q42 7 43 14.2 Q46.6 12.6 47.8 7.4 Z" fill="url(#furD)"/><path d="M44.2 15.4 Q47 19.6 51.4 16.6" fill="none" stroke="#d64545" stroke-width="1.8" stroke-linecap="round"/></g></svg>';
  const DOG = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2040%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22fur%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23c98b55%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23a86d3f%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22furD%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%2393592f%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%237a4826%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cellipse%20cx%3D%2231%22%20cy%3D%2237.6%22%20rx%3D%2217%22%20ry%3D%221.8%22%20fill%3D%22%231d2a1a%22%20opacity%3D%220.22%22%2F%3E%3Cg%3E%3CanimateTransform%20attributeName%3D%22transform%22%20type%3D%22translate%22%20values%3D%220%200%3B0%20-0.7%3B0%200%3B0%20-0.7%3B0%200%22%20dur%3D%220.56s%22%20repeatCount%3D%22indefinite%22%2F%3E%3Cpath%20d%3D%22M19.5%2022%20h3.4%20v13.3%20a1.7%201.7%200%200%201%20-3.4%200%20z%22%20fill%3D%22url%28%23furD%29%22%3E%3CanimateTransform%20attributeName%3D%22transform%22%20type%3D%22rotate%22%20values%3D%2220%2021.2%2022%3B-20%2021.2%2022%3B20%2021.2%2022%22%20dur%3D%220.56s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M39.5%2022%20h3.4%20v13.3%20a1.7%201.7%200%200%201%20-3.4%200%20z%22%20fill%3D%22url%28%23furD%29%22%3E%3CanimateTransform%20attributeName%3D%22transform%22%20type%3D%22rotate%22%20values%3D%22-20%2041.2%2022%3B20%2041.2%2022%3B-20%2041.2%2022%22%20dur%3D%220.56s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M15%2018%20C10%2016%208%2012%209%207%22%20fill%3D%22none%22%20stroke%3D%22%23a86d3f%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%3E%3CanimateTransform%20attributeName%3D%22transform%22%20type%3D%22rotate%22%20values%3D%22-14%2015%2018%3B12%2015%2018%3B-14%2015%2018%22%20dur%3D%220.42s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2Fpath%3E%3Crect%20x%3D%2213%22%20y%3D%2213%22%20width%3D%2233%22%20height%3D%2213.5%22%20rx%3D%226.8%22%20fill%3D%22url%28%23fur%29%22%2F%3E%3Cpath%20d%3D%22M20%2024.8%20Q30%2027.6%2040%2024.8%20L40%2026.2%20Q30%2028.6%2020%2026.2%20Z%22%20fill%3D%22%23f1dcbc%22%20opacity%3D%220.55%22%2F%3E%3Cpath%20d%3D%22M15.8%2021%20h3.6%20v14.3%20a1.8%201.8%200%200%201%20-3.6%200%20z%22%20fill%3D%22url%28%23fur%29%22%3E%3CanimateTransform%20attributeName%3D%22transform%22%20type%3D%22rotate%22%20values%3D%22-20%2017.6%2021%3B20%2017.6%2021%3B-20%2017.6%2021%22%20dur%3D%220.56s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M36%2021%20h3.6%20v14.3%20a1.8%201.8%200%200%201%20-3.6%200%20z%22%20fill%3D%22url%28%23fur%29%22%3E%3CanimateTransform%20attributeName%3D%22transform%22%20type%3D%22rotate%22%20values%3D%2220%2037.8%2021%3B-20%2037.8%2021%3B20%2037.8%2021%22%20dur%3D%220.56s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M40%2018%20Q44%209%2050%208%20L52%2015%20Q47%2017%2045%2022%20Z%22%20fill%3D%22url%28%23fur%29%22%2F%3E%3Ccircle%20cx%3D%2250.5%22%20cy%3D%2210.5%22%20r%3D%226.6%22%20fill%3D%22url%28%23fur%29%22%2F%3E%3Cellipse%20cx%3D%2256.6%22%20cy%3D%2213%22%20rx%3D%225.2%22%20ry%3D%223.6%22%20fill%3D%22%23e8c79c%22%2F%3E%3Ccircle%20cx%3D%2261%22%20cy%3D%2211.9%22%20r%3D%221.6%22%20fill%3D%22%232a1d16%22%2F%3E%3Ccircle%20cx%3D%2252.6%22%20cy%3D%228.6%22%20r%3D%221.05%22%20fill%3D%22%232a1d16%22%2F%3E%3Cpath%20d%3D%22M45.4%205.6%20Q42%207%2043%2014.2%20Q46.6%2012.6%2047.8%207.4%20Z%22%20fill%3D%22url%28%23furD%29%22%2F%3E%3Cpath%20d%3D%22M44.2%2015.4%20Q47%2019.6%2051.4%2016.6%22%20fill%3D%22none%22%20stroke%3D%22%23d64545%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')";
  const BIRD = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2040%2020%22%3E%3Cpath%20fill%3D%22%232b3340%22%3E%3Canimate%20attributeName%3D%22d%22%20dur%3D%220.6s%22%20repeatCount%3D%22indefinite%22%20calcMode%3D%22spline%22%20keyTimes%3D%220%3B0.25%3B0.5%3B0.75%3B1%22%20keySplines%3D%220.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%22%20values%3D%22M2%203%20Q10%206%2016%2010%20Q18%2011%2020%2012%20Q22%2011%2024%2010%20Q30%206%2038%203%20Q31%209%2024%2013%20Q22%2014.5%2020%2015%20Q18%2014.5%2016%2013%20Q9%209%202%203%20Z%3B%20M1%209%20Q9%208%2016%2010.5%20Q18%2011%2020%2012%20Q22%2011%2024%2010.5%20Q31%208%2039%209%20Q31%2011%2024%2013%20Q22%2014.5%2020%2015%20Q18%2014.5%2016%2013%20Q9%2011%201%209%20Z%3B%20M4%2016%20Q10%2012%2016%2011%20Q18%2011%2020%2012%20Q22%2011%2024%2011%20Q30%2012%2036%2016%20Q30%2014%2024%2013.5%20Q22%2014.5%2020%2015%20Q18%2014.5%2016%2013.5%20Q10%2014%204%2016%20Z%3B%20M1%209%20Q9%208%2016%2010.5%20Q18%2011%2020%2012%20Q22%2011%2024%2010.5%20Q31%208%2039%209%20Q31%2011%2024%2013%20Q22%2014.5%2020%2015%20Q18%2014.5%2016%2013%20Q9%2011%201%209%20Z%3B%20M2%203%20Q10%206%2016%2010%20Q18%2011%2020%2012%20Q22%2011%2024%2010%20Q30%206%2038%203%20Q31%209%2024%2013%20Q22%2014.5%2020%2015%20Q18%2014.5%2016%2013%20Q9%209%202%203%20Z%22%2F%3E%3C%2Fpath%3E%3C%2Fsvg%3E')";
  // size in px; flock = several small birds flying together
  const BIRDS = [
    { top: 26, dur: 37, cross: 10, delay: 4, size: 18 },
    { top: 20, dur: 53, cross: 15, delay: 22, size: 11, op: 0.8 },
    { top: 33, dur: 47, cross: 11, delay: 15, size: 15, rtl: true },
    { top: 17, dur: 67, cross: 16, delay: 35, size: 10, op: 0.85, flock: [[0, 0], [16, -7], [30, 4]] },
    { top: 29, dur: 79, cross: 13, delay: 48, size: 13, rtl: true },
  ];
  const birdHTML = BIRDS.map((b, n) => '<b class="b' + n + '">' + (b.flock || [[0, 0]]).map(([x, y], k) =>
    '<i style="left:' + x + 'px;top:' + y + 'px;width:' + b.size + 'px;height:' + b.size / 2 + 'px;opacity:' + (b.op || 1) +
    ';animation-duration:' + (1.5 + ((n + k) % 4) * 0.3).toFixed(1) + 's;animation-delay:-' + (k * 0.6) + 's"></i>').join('') + '</b>').join('');
  const BIRD_CSS = 'np-birds[np-paused], np-birds[np-paused] * { animation-play-state: paused !important; } np-birds { position: absolute; z-index: -1; pointer-events: none; left: 0; width: 100%; overflow: hidden; display: block; ' +
    'top: calc(-1 * (var(--header-height, 56px) + env(safe-area-inset-top, 0px))); height: calc(100% + (var(--header-height, 56px) + env(safe-area-inset-top, 0px))); ' +
    'will-change: transform; animation: np-pin linear both; animation-timeline: scroll(root); animation-range: 0 1000px; } ' +
    '@keyframes np-pin { from { transform: translateY(0); } to { transform: translateY(1000px); } } ' +
    'np-birds:not([show]) b, np-birds:not([show]) u { display: none; } ' +
    // music notes drift up out of the living room window (music downstairs) and out of an upstairs window
    // (Hall display / first floor group); both when everything plays
    'np-birds s { position: absolute; display: none; left: 49vw; bottom: 58vw; width: 3.6vw; aspect-ratio: 14 / 20; background: ' + NOTE1 + ' center / contain no-repeat; ' +
    'filter: drop-shadow(0 0 1.5px rgba(40, 25, 0, 0.45)); opacity: 0; will-change: transform, opacity; animation: np-note-a 3.6s ease-out infinite; } ' +
    'np-birds[music-down] s.dn, np-birds[music-up] s.up { display: block; } np-birds s.up { left: 56vw; bottom: 79vw; } np-birds s.up.l { left: 39vw; } ' +
    'np-birds s.n2 { margin-left: 2.5vw; width: 5.4vw; aspect-ratio: 22 / 20; background-image: ' + NOTE2 + '; animation-name: np-note-b; animation-delay: -0.9s; } ' +
    'np-birds s.n3 { margin-left: 5vw; width: 3vw; animation-delay: -1.8s; } ' +
    'np-birds s.n4 { margin-left: -1.5vw; width: 4.6vw; aspect-ratio: 22 / 20; background-image: ' + NOTE2 + '; animation-name: np-note-b; animation-delay: -2.7s; } ' +
    'np-birds s.up { animation-duration: 4.1s; } np-birds s.up.l { animation-duration: 4.5s; margin-top: 0; animation-delay: -2.2s; } np-birds s.up.l.n2 { animation-delay: -0.4s; } np-birds s.up.l.n3 { animation-delay: -3.3s; } ' +
    '@keyframes np-note-a { 0% { opacity: 0; transform: translate(0, 0) scale(0.6) rotate(-10deg); } 15% { opacity: 1; } ' +
    '55% { transform: translate(2.5vw, -7vw) scale(1) rotate(8deg); } 100% { opacity: 0; transform: translate(-1vw, -14vw) scale(0.9) rotate(-6deg); } } ' +
    '@keyframes np-note-b { 0% { opacity: 0; transform: translate(0, 0) scale(0.6) rotate(8deg); } 15% { opacity: 1; } ' +
    '55% { transform: translate(-2.5vw, -7vw) scale(1) rotate(-8deg); } 100% { opacity: 0; transform: translate(1.5vw, -14vw) scale(0.9) rotate(6deg); } } ' +
    '@media (min-width: 871px) { np-birds s { display: none !important; } } ' +
    'np-birds b { position: absolute; left: 0; will-change: transform; animation: linear infinite; } ' +
    'np-birds b i { position: absolute; display: block; background: ' + BIRD + ' center / contain no-repeat; animation: np-bob ease-in-out infinite alternate; } ' +
    // each bird (or the little flock) crosses in a few seconds and then waits off-screen for the rest of its cycle
    BIRDS.map((b, n) => {
      const cross = Math.round(b.cross / b.dur * 1000) / 10;
      const [from, to] = b.rtl ? ['calc(100vw + 40px)', '-40px'] : ['-40px', 'calc(100vw + 40px)'];
      return 'np-birds .b' + n + ' { top: ' + b.top + '%; animation-name: np-fly' + n + '; animation-duration: ' + b.dur + 's; animation-delay: -' + b.delay + 's; } ' +
        '@keyframes np-fly' + n + ' { 0% { transform: translateX(' + from + '); } ' + cross + '% { transform: translateX(' + to + '); } 100% { transform: translateX(' + to + '); } } ';
    }).join('') +
    // the dog walks over the grass in front of the hedge (phones only: on wide screens the drawing is cropped differently)
    'np-birds u { position: absolute; left: 0; bottom: 29.5vw; width: 11vw; aspect-ratio: 64 / 40; background: ' + DOG + ' center / contain no-repeat; ' +
    'will-change: transform; animation: np-walk 80s linear infinite; animation-delay: -18s; } ' +
    'np-birds[dim] u { filter: brightness(0.72) saturate(0.85); } ' +
    '@media (min-width: 871px) { np-birds u { display: none; } } ' +
    '@keyframes np-walk { 0% { transform: translateX(-12vw) scaleX(1); } 14% { transform: translateX(101vw) scaleX(1); } 15%, 50% { transform: translateX(101vw) scaleX(-1); } ' +
    '64% { transform: translateX(-12vw) scaleX(-1); } 65%, 100% { transform: translateX(-12vw) scaleX(1); } } ' +
    '@keyframes np-bob { from { transform: translateY(-4px); } to { transform: translateY(5px); } } ' +
    '@media (prefers-reduced-motion: reduce) { np-birds { display: none !important; } }';
  const BIRD_WEATHER = ['sunny', 'partlycloudy', 'cloudy', 'windy', 'windy-variant', 'snowsun'];
  let headerCard = null;
  const findHeaderCard = (root) => {
    for (const n of root.querySelectorAll('*')) {
      if (n.tagName === 'MUSHROOM-TITLE-CARD' && n.shadowRoot) {
        const hc = n.shadowRoot.querySelector('ha-card');
        if (isHeaderCard(hc)) return n;
      }
      if (n.shadowRoot) { const f = findHeaderCard(n.shadowRoot); if (f) return f; }
    }
    return null;
  };
  const setBirds = (h, slug, states) => {
    if (!headerCard || !headerCard.isConnected) headerCard = findHeaderCard(h.shadowRoot);
    const sr = headerCard && headerCard.shadowRoot;
    const hc = sr && sr.querySelector('ha-card');
    if (!hc) return;
    if (!sr.querySelector('style[data-np-birds]')) {
      const st = document.createElement('style');
      st.setAttribute('data-np-birds', '');
      st.textContent = BIRD_CSS;
      sr.appendChild(st);
    }
    const want = pendingScene || (hc.querySelector('np-scene') ? null : scene);
    if (want) { pendingScene = null; try { if (want !== scene || !moveScene(hc)) showScene(hc, want); } catch (e) { /* plain drawing stays */ } }
    let nb = hc.querySelector('np-birds');
    if (!nb) {
      nb = document.createElement('np-birds');
      nb.innerHTML = birdHTML + '<u></u>' + '<s class="dn"></s><s class="dn n2"></s><s class="dn n3"></s><s class="dn n4"></s><s class="up"></s><s class="up n2"></s><s class="up n3"></s><s class="up n4"></s><s class="up l"></s><s class="up l n2"></s><s class="up l n3"></s>';
      hc.appendChild(nb);
    }
    const [wx, tod] = [slug.slice(0, slug.lastIndexOf('-')), slug.split('-').pop()];
    nb.toggleAttribute('show', BIRD_WEATHER.includes(wx) && tod !== 'night');
    nb.toggleAttribute('dim', tod === 'dawn' || tod === 'dusk');
    // same source as 'music in …' in the greeting: the media players that are playing right now
    const np = states['input_text.now_playing_shown'];
    const playing = np ? np.state.split('|').filter((x) => x && !['unknown', 'unavailable'].includes(x)) : [];
    // upstairs: the Hall display and the first floor group (also when they play outside the greeting's list)
    const isUp = (id) => /first_floor|hall_display/.test(id) || /hall display|first floor/i.test((states[id] && states[id].attributes.friendly_name) || '');
    const upPlaying = Object.keys(states).filter((id) => id.startsWith('media_player.') && isUp(id) && states[id].state === 'playing');
    const everywhere = playing.includes('media_player.all_speakers');
    nb.toggleAttribute('music-down', everywhere || playing.some((p) => !isUp(p)));
    nb.toggleAttribute('music-up', everywhere || upPlaying.length > 0 || playing.some(isUp));
  };
  // ---- Layered scene ---------------------------------------------------------------------------------------
  // The drawing is split on the phone into stacked layers: the sky with its slow clouds, the static trees/house/hedge
  // (drawn once), and every moving part (rain, snow, wind, leaves, lightning) as its own small image that the page
  // moves with transforms/opacity. The heavy drawing is then never redrawn per frame, which keeps the iPhone smooth.
  const NONPAINT = new Set(['defs', 'mask', 'clipPath', 'linearGradient', 'radialGradient', 'filter', 'pattern', 'symbol',
    'style', 'title', 'desc', 'metadata', 'animate', 'animateTransform', 'set']);
  // np-scene is a frame that scrolls with the page (its soft bottom edge stays put, no mask animation);
  // inside it, .pin keeps the illustration still with a scroll-linked translate only, which the GPU can do.
  const SCENE_CSS = 'np-scene { position: absolute; z-index: -1; pointer-events: none; left: 0; width: 100%; overflow: hidden; ' +
    'top: calc(-1 * (var(--header-height, 56px) + env(safe-area-inset-top, 0px))); height: calc(100% + (var(--header-height, 56px) + env(safe-area-inset-top, 0px))); ' +
    '-webkit-mask: linear-gradient(to bottom, #000 calc(100% - 20px), transparent 100%) top / 100% 100% no-repeat; mask: linear-gradient(to bottom, #000 calc(100% - 20px), transparent 100%) top / 100% 100% no-repeat; } ' +
    'np-scene .pin { position: absolute; inset: 0; background: var(--np-sky, #2c3245); will-change: transform; ' +
    'animation: np-pin linear both; animation-timeline: scroll(root); animation-range: 0 1000px; } ' +
    '@keyframes np-pin { from { transform: translateY(0); } to { transform: translateY(1000px); } } ' +
    'np-scene .pin::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 95%, color-mix(in srgb, var(--primary-background-color) 15%, transparent) 96.5%, ' +
    'color-mix(in srgb, var(--primary-background-color) 50%, transparent) 98%, color-mix(in srgb, var(--primary-background-color) 85%, transparent) 99.3%, var(--primary-background-color) 100%); } ' +
    'np-scene .stage { position: absolute; left: 0; bottom: 0; width: 100%; aspect-ratio: 887 / 1662; transform-origin: 50% 65%; } ' +
    'np-scene .stage > i { position: absolute; display: block; background: center / 100% 100% no-repeat; } ' +
    'np-scene .stage > i.full { inset: 0; } np-scene .stage > i.mask { overflow: hidden; } ' +
    'np-scene .stage > i.mask > i { position: absolute; left: 0; width: 100%; display: block; background: center / 100% 100% no-repeat; } ' +
    'np-scene .stage > i.ov { background-image: var(--np-ov-l, none); } ' +
    // the fade into the page lands halfway down the scene cards: the picture stops 16px above the header card's bottom
    // edge (the stage runs on under the clip); --np-run says how far it runs on, +N in the colour of its ground
    'np-scene[np-ext] { --np-run: -16px; height: calc(100% + (var(--header-height, 56px) + env(safe-area-inset-top, 0px)) + var(--np-run)); } ' +
    'np-scene[np-ext] .stage { bottom: var(--np-run); } ' +
    'np-scene[np-ext] .pin { background: linear-gradient(to bottom, var(--np-sky, #2c3245) calc(100% - var(--np-run) - 1px), var(--np-ground) calc(100% - var(--np-run) - 1px)); } ' +
    // the old single-image layer goes away completely (also its sky colour, which would shine through the bottom fade)
    'ha-card[np-layered]::before { background: none !important; } ' +
    // tablet and desktop: the card is a panel with the whole drawing, so the scene simply fills it
    '@media (min-width: 871px) { np-scene, np-scene[np-ext] { top: 0; height: 100%; -webkit-mask: none; mask: none; } np-scene .pin { animation: none; } ' +
    'np-scene .pin::after { display: none; } np-scene .stage, np-scene[np-ext] .stage { bottom: 0; } }';
  const esc = (v) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const openTag = (el, skip) => '<' + el.localName + [...el.attributes].filter((a) => !skip.includes(a.name) && !a.name.startsWith('data-np'))
    .map((a) => ' ' + a.name + '="' + esc(a.value) + '"').join('') + '>';
  const nums = (s) => s.split(/\s+/).map(Number);
  let scene = null;  // { slug, urls, layers: [{ el, kind, box, anim }] }
  // Wind from the weather: level 0 calm, 1 windy (from 29 km/h, Beaufort 5, or gusts from 50), 2 stormy (from 50 km/h,
  // Beaufort 7, or gusts from 75, KNMI's warning level); dir is where it blows on screen. The house faces north, so we
  // look south: a west wind blows from right to left (-1). Speed from met.no, or Open-Meteo when that is higher; gusts
  // from Open-Meteo (less than 45 minutes old). light: it rains or snows less than 0.5 mm an hour.
  let wind = last.wind || { level: 0, dir: -1, light: false };
  const windFrom = (states) => {
    const a = states['weather.forecast_home'] ? states['weather.forecast_home'].attributes : {};
    const m = meteo && Date.now() - meteo.t < 45 * 60e3 ? meteo : null;
    const kmh = Math.max((Number(a.wind_speed) || 0) * (a.wind_speed_unit === 'm/s' ? 3.6 : 1), m ? m.speed || 0 : 0);
    const gust = m ? m.gust || 0 : 0, b = Number(a.wind_bearing);
    return { level: kmh >= 50 || gust >= 75 ? 2 : kmh >= 29 || gust >= 50 ? 1 : 0, dir: isNaN(b) || Math.sin(b * Math.PI / 180) < 0 ? -1 : 1,
      light: m ? m.rate < 0.5 : false };
  };
  let pendingScene = null;  // built before the header card existed
  let sceneToken = 0;
  const buildScene = (text, slug) => {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const root = doc.documentElement;
    if (root.localName !== 'svg') throw new Error('not an svg');
    // paint units in drawing order (definitions are kept in every layer, never counted)
    const units = [];
    // the hedge group ("Haag", "Haag en grasstrook", ...) gets a people layer right before it (the street behind
    // the hedge) and one right after it (the grass in front)
    let hedgeSeen = false;
    const walk = (el) => {
      for (const c of el.children) {
        if (NONPAINT.has(c.localName)) continue;
        const hedge = !hedgeSeen && /^Haag( en |$)/.test(c.getAttribute('id') || '');
        if (hedge) { hedgeSeen = true; units.push({ marker: 'street' }); }
        if (c.hasAttribute('data-np') || c.hasAttribute('data-np-cloud') || !c.firstElementChild || c.localName === 'use') units.push(c);
        else walk(c);
        if (hedge) units.push({ marker: 'grass' });
      }
    };
    walk(root);
    // a sky layer for shooting stars and aeroplanes: in front of the sky and the sun, behind clouds, stars and trees
    const np = (u) => !u.marker && u.getAttribute('data-np');
    let skyAt = units.findIndex((u) => ['cloud', 'twinkle', 'sparkle'].includes(np(u)));
    if (skyAt < 0) { skyAt = 1; units.forEach((u, i) => { if (np(u) === 'sun') skyAt = i + 1; }); }
    units.splice(skyAt, 0, { marker: 'sky' });
    // windy: real wind, or a windy drawing picked by hand (then it blows as for level 1)
    const windy = wind.level > 0 || slug.startsWith('windy'), gust = wind.level || 1;
    const segs = [];
    let cur = [];
    units.forEach((u, i) => {
      if (u.marker) { if (cur.length) { segs.push({ kind: 'static', ids: cur }); cur = []; } segs.push({ kind: u.marker }); return; }
      u.setAttribute('data-np-i', i);
      const np = u.getAttribute('data-np');
      const kind = np === 'light' || (np === 'tree' && !windy) ? null : np;
      if (kind) {
        if (cur.length) { segs.push({ kind: 'static', ids: cur }); cur = []; }
        if (u.getAttribute('display') !== 'none' || (u.hasAttribute('data-wind') && wind.level)) segs.push({ kind, el: u });
      } else {
        cur.push(String(i));
        if (u.hasAttribute('data-np-break')) { segs.push({ kind: 'static', ids: cur }); cur = []; }
      }
    });
    if (cur.length) segs.push({ kind: 'static', ids: cur });
    // light rain or snow: the nearer half of the falling layers stays away (they are drawn far to near)
    if (wind.light) {
      const falls = segs.filter((sg) => sg.kind === 'fall');
      falls.slice(Math.ceil(falls.length / 2)).forEach((sg) => segs.splice(segs.indexOf(sg), 1));
      falls.slice(0, Math.ceil(falls.length / 2)).forEach((sg) => { sg.faint = true; });
    }
    const ser = new XMLSerializer();
    const defs = [...root.querySelectorAll('defs, mask, clipPath, linearGradient, radialGradient, filter, pattern')]
      .filter((d) => !d.parentElement.closest('defs, mask, clipPath, linearGradient, radialGradient, filter, pattern'))
      .map((d) => ser.serializeToString(d)).join('');
    const urls = [];
    const blob = (svg) => { const u = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); urls.push(u); return u; };
    // one moving part on its own: its ancestors (for inherited paint and transforms, but without the canvas clip,
    // because the part itself moves) plus all definitions
    const partSvg = (el, viewBox, extra, keepClip, wrap) => {
      const chain = [];
      for (let p = el.parentElement; p && p !== root; p = p.parentElement) chain.unshift(p);
      const self = el.cloneNode(true);
      for (const a of [...self.attributes]) if (a.name.startsWith('data-np')) self.removeAttribute(a.name);
      if (el.hasAttribute('data-wind')) self.removeAttribute('display');
      // keep the drawing's own root attributes (Figma sets fill="none" there, which the strokes rely on)
      const rootAttrs = [...root.attributes].filter((a) => !['width', 'height', 'viewBox', 'xmlns'].includes(a.name))
        .map((a) => ' ' + a.name + '="' + esc(a.value) + '"').join('');
      return '<svg xmlns="http://www.w3.org/2000/svg"' + rootAttrs + ' viewBox="' + viewBox + '" preserveAspectRatio="none">' + defs +
        chain.map((p) => openTag(p, keepClip ? ['id'] : ['clip-path', 'mask', 'id'])).join('') + (wrap || String)(ser.serializeToString(self) + (extra || '')) +
        chain.map((p) => '</' + p.localName + '>').reverse().join('') + '</svg>';
    };
    const layers = [];
    for (const sg of segs) {
      const L = { kind: sg.kind };
      if (sg.kind === 'street' || sg.kind === 'grass' || sg.kind === 'sky') { layers.push(L); continue; }
      if (sg.kind === 'static') {
        const keep = new Set(sg.ids);
        const c = root.cloneNode(true);
        for (const u of c.querySelectorAll('[data-np-i]')) if (!keep.has(u.getAttribute('data-np-i'))) u.remove();
        L.url = blob(ser.serializeToString(c));
        L.smil = !!c.querySelector('animateTransform, animate');
        // living-room light in this layer: also a version without it, swapped in when the lamps are off
        const lights = [...c.querySelectorAll('[data-np="light"]')];
        if (lights.length) {
          L.room = lights[0].getAttribute('data-room') || 'down';
          lights.forEach((x) => x.remove());
          L.urlOff = blob(ser.serializeToString(c));
        }
        layers.push(L);
        continue;
      }
      const el = sg.el, id = el.getAttribute('id');
      const box = el.hasAttribute('data-box') ? nums(el.getAttribute('data-box')) : [0, 0, 887, 1662];
      const dur = Number(el.getAttribute('data-dur') || 0) * 1000;
      // with wind, rain and snow lean over: the drops are sheared (around the middle of their own area, with copies left
      // and right to fill the corners) and fall along the slant; per loop the layer moves sideways by tan(angle) x the
      // loop length, so its area reaches that far upwind and the loop stays seamless
      const slope = wind.level ? Math.tan((wind.level === 2 ? 24 : 14) * Math.PI / 180) : 0;
      const shear = (cy, span) => (s) => '<g transform="translate(0 ' + cy + ') skewX(' + (wind.dir * Math.atan(slope) * 180 / Math.PI).toFixed(2) + ') translate(0 ' + -cy + ')">' +
        '<g id="np-lean">' + s + '</g><use href="#np-lean" x="' + -span + '"/><use href="#np-lean" x="' + span + '"/></g>';
      if (sg.kind === 'fall') {
        const d = Number(el.getAttribute('data-d')), copy = el.getAttribute('data-copy') === '1', E = slope * d;
        L.box = [wind.dir > 0 ? -E : 0, -d, wind.dir < 0 ? 887 + E : 887, 1662];
        L.url = blob(partSvg(el, L.box[0] + ' ' + -d + ' ' + (L.box[2] - L.box[0]) + ' ' + (1662 + d), copy ? '<use href="#' + id + '" y="' + -d + '"/>' : '', false,
          slope ? shear(831, 887) : null));
        L.anim = (u) => [[{ transform: 'translate(0, 0)' }, { transform: 'translate(' + wind.dir * E * u + 'px, ' + d * u + 'px)' }], { duration: dur, iterations: Infinity }];
        if (sg.faint) L.opacity = 0.75;
      } else if (sg.kind === 'lamp') {
        const d = Number(el.getAttribute('data-d')), E = slope * d;
        const [x0, y0, x1, y1] = box;
        L.box = box; L.inner = [y0 - d, y1];
        L.innerX = [wind.dir > 0 ? x0 - E : x0, wind.dir < 0 ? x1 + E : x1];
        L.url = blob(partSvg(el, L.innerX[0] + ' ' + (y0 - d) + ' ' + (L.innerX[1] - L.innerX[0]) + ' ' + (y1 - y0 + d), '<use href="#' + id + '" y="' + -d + '"/>', false,
          slope ? shear((y0 + y1) / 2, x1 - x0) : null));
        L.anim = (u) => [[{ transform: 'translate(0, 0)' }, { transform: 'translate(' + wind.dir * E * u + 'px, ' + d * u + 'px)' }], { duration: dur, iterations: Infinity }];
      } else if (sg.kind === 'streak') {
        // Jente's streaks blow to the right; a west wind turns them round (mirrored, so their curls point downwind)
        const W = Number(el.getAttribute('data-w')), flip = wind.dir < 0 ? ' scaleX(-1)' : '', sdur = dur / (wind.level === 2 ? 1.6 : 1);
        L.box = wind.dir < 0 ? [0, box[1], 887 + W, box[3]] : [-W, box[1], 887, box[3]];
        L.url = blob(partSvg(el, -W + ' ' + box[1] + ' ' + (887 + W) + ' ' + (box[3] - box[1]), '<use href="#' + id + '" x="' + -W + '"/>'));
        L.anim = (u) => [[{ transform: 'translateX(0)' + flip }, { transform: 'translateX(' + wind.dir * W * u + 'px)' + flip }], { duration: sdur, iterations: Infinity }];
      } else if (sg.kind === 'leaf') {
        // the blown leaves go the wind's way too (the whole flight mirrored)
        const [a0, b0, rise, spin0, ldur, begin] = nums(el.getAttribute('data-k'));
        const m = wind.dir < 0 ? -1 : 1, a = a0 * m, b = b0 * m, spin = spin0 * m, flip = m < 0 ? ' scaleX(-1)' : '';
        L.box = m < 0 ? [887 - box[2], box[1], 887 - box[0], box[3]] : box;
        L.url = blob(partSvg(el, box[0] + ' ' + box[1] + ' ' + (box[2] - box[0]) + ' ' + (box[3] - box[1])));
        L.anim = (u) => [[{ transform: 'translate(' + a * u + 'px,' + rise * 0.4 * u + 'px) rotate(0deg)' + flip },
          { transform: 'translate(' + (a + b) / 2 * u + 'px,' + -rise * 0.3 * u + 'px) rotate(' + spin / 2 + 'deg)' + flip },
          { transform: 'translate(' + b * u + 'px,' + -rise * u + 'px) rotate(' + spin + 'deg)' + flip }],
          { duration: ldur * 1000, iterations: Infinity, delay: -begin * 1000 }];
      } else if (sg.kind === 'cloud') {
        // sways back and forth (or breathes, for clouds running edge to edge), smooth and composited; faster in wind
        L.box = box;
        L.url = blob(partSvg(el, box[0] + ' ' + box[1] + ' ' + (box[2] - box[0]) + ' ' + (box[3] - box[1])));
        const opt = { duration: dur / [1, 1.8, 2.8][wind.level], iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: -Number(el.getAttribute('data-begin') || 0) * 1000 };
        if (el.hasAttribute('data-breathe')) {
          const k = 1 + Number(el.getAttribute('data-breathe'));
          L.anim = () => [[{ transform: 'scaleX(1)' }, { transform: 'scaleX(' + k + ')' }], opt];
        } else if (windy && box[0] > 0 && box[2] < 887 && box[3] < 760) {
          // in wind a free-floating cloud drifts along: out on the downwind side, back in on the other, starting where it
          // is drawn; faster in harder wind, high clouds a little faster than low ones. Clouds drawn against an edge or
          // down behind the trees have a straight side that must stay hidden, so they keep swaying (faster) instead.
          const [x0, y0, x1] = box, pad = 10;
          const start = wind.dir < 0 ? 887 - x0 + pad : -x1 - pad, end = wind.dir < 0 ? -x1 - pad : 887 - x0 + pad;
          const speed = [0, 16, 34][gust] * (1.25 - 0.5 * Math.min(1, Math.max(0, y0 / 900)));
          const ddur = Math.abs(end - start) / speed * 1000;
          L.anim = (u) => [[{ transform: 'translateX(' + start * u + 'px)' }, { transform: 'translateX(' + end * u + 'px)' }],
            { duration: ddur, iterations: Infinity, easing: 'linear', delay: -(-start / (end - start)) * ddur }];
        } else {
          const l = Number(el.getAttribute('data-l')), r = Number(el.getAttribute('data-r'));
          L.anim = (u) => [[{ transform: 'translateX(' + -l * u + 'px)' }, { transform: 'translateX(' + r * u + 'px)' }], opt];
        }
      } else if (sg.kind === 'tree') {
        L.box = box;
        L.url = blob(partSvg(el, box[0] + ' ' + box[1] + ' ' + (box[2] - box[0]) + ' ' + (box[3] - box[1])));
        const i = Number(el.getAttribute('data-np-i')) || 0, sk = (f) => ({ transform: 'skewX(' + (-lean * f).toFixed(2) + 'deg)' });
        const lean = (gust === 2 ? 7 : 1.6) * wind.dir;
        // windy: a calm sway; storm: bent far over and thrashing in uneven gusts
        L.anim = () => gust === 2
          ? [[sk(0.35), sk(1), sk(0.55), sk(0.95), sk(0.3), sk(0.8), sk(0.35)], { duration: 2400 + (i * 337) % 900, iterations: Infinity, easing: 'ease-in-out', delay: -((i * 731) % 2400) }]
          : [[sk(0.25), sk(1)], { duration: 2600 + (i * 337) % 900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: -((i * 731) % 2000) }];
      } else if (sg.kind === 'twinkle') {
        // a third of the stars dims and brightens, at its own pace
        L.box = box;
        L.url = blob(partSvg(el, box[0] + ' ' + box[1] + ' ' + (box[2] - box[0]) + ' ' + (box[3] - box[1])));
        L.anim = () => [[{ opacity: 1 }, { opacity: 0.35, offset: 0.3 }, { opacity: 0.85, offset: 0.5 }, { opacity: 0.5, offset: 0.75 }, { opacity: 1 }],
          { duration: dur, iterations: Infinity, easing: 'ease-in-out', delay: -Number(el.getAttribute('data-begin') || 0) * 1000 }];
      } else if (sg.kind === 'sparkle') {
        // Jente's sparkling stars: shrink and fade, then flare up a little
        L.box = box;
        L.url = blob(partSvg(el, box[0] + ' ' + box[1] + ' ' + (box[2] - box[0]) + ' ' + (box[3] - box[1])));
        L.anim = () => [[{ opacity: 1, transform: 'scale(1)' }, { opacity: 0.3, transform: 'scale(0.55)', offset: 0.4 },
          { opacity: 1, transform: 'scale(1.18)', offset: 0.7 }, { opacity: 1, transform: 'scale(1)' }],
          { duration: dur, iterations: Infinity, easing: 'ease-in-out', delay: -Number(el.getAttribute('data-begin') || 0) * 1000 }];
      } else if (sg.kind === 'moon') {
        // Jente's moon as drawn (previews); with the real moon the page draws a round one instead (placeMoon)
        L.box = box; L.c = nums(el.getAttribute('data-c'));
        L.url = blob(partSvg(el, box[0] + ' ' + box[1] + ' ' + (box[2] - box[0]) + ' ' + (box[3] - box[1])));
        if (el.getAttribute('data-moon') === 'disc') L.disc = { r: Number(el.getAttribute('data-r')), c1: el.getAttribute('data-c1'), c2: el.getAttribute('data-c2'), op: el.getAttribute('data-op') };
      } else if (sg.kind === 'sun') {
        // stands where the sun really is (placeSun)
        L.box = box; L.c = nums(el.getAttribute('data-c'));
        L.url = blob(partSvg(el, box[0] + ' ' + box[1] + ' ' + (box[2] - box[0]) + ' ' + (box[3] - box[1])));
      } else if (sg.kind === 'bolt' || sg.kind === 'glow' || sg.kind === 'dark') {
        const cyc = Number(el.getAttribute('data-cyc')) * 1000;
        const v = sg.kind === 'bolt' ? [0, 0, 1, 0.15, 1, 0, 0] : sg.kind === 'glow' ? [0.35, 0.35, 1, 0.5, 1, 0.35, 0.35] : [1, 1, 0, 0.6, 0, 1, 1];
        const off = sg.kind === 'bolt' ? [0, 0.85, 0.86, 0.87, 0.885, 0.91, 1] : [0, 0.85, 0.86, 0.87, 0.885, 0.93, 1];
        L.box = box;
        // the dark storm layer is a plain colour with Jente's opacity; the flash multiplies into it
        const alpha = sg.kind === 'dark' ? Number(el.getAttribute('fill-opacity') || 1) : 1;
        if (sg.kind === 'dark') L.color = el.getAttribute('fill') || '#1e2430';
        else L.url = blob(partSvg(el, box[0] + ' ' + box[1] + ' ' + (box[2] - box[0]) + ' ' + (box[3] - box[1])));
        L.anim = () => [v.map((o, k) => ({ opacity: o * alpha, offset: off[k] })), { duration: cyc, iterations: Infinity }];
      }
      layers.push(L);
    }
    // the windows/cat overlay goes above the house (and the storm darkening), below rain, snow and wind
    let at = 0;
    layers.forEach((L, k) => { if (['static', 'dark', 'bolt', 'glow'].includes(L.kind)) at = k + 1; });
    const street = layers.findIndex((L) => L.kind === 'street');
    if (street >= 0) at = street;
    layers.splice(at, 0, { kind: 'ov' });
    return { slug, urls, layers, text };
  };
  // remembered, so an early-built scene starts with the right glow before the lamp states are in
  let lamps = last.lamps || { down: true, up: true };
  const setLights = (down, up) => {
    lamps = { down, up };
    if (!last.lamps || last.lamps.down !== down || last.lamps.up !== up) remember('lamps', lamps);
    if (scene) for (const L of scene.layers) if (L.urlOff && L.node) L.node.style.backgroundImage = 'url("' + ((L.room === 'up' ? up : down) ? L.url : L.urlOff) + '")';
  };
  // 'apple' entrance: the house settles into view (zoom 110% -> 100%, drops a little, blur -> sharp), like the wallpaper
  // when you unlock an iPhone. The bar, greeting and content are already there and do not move.
  const appearHouse = (ns, birds, content) => {
    const spring = 'cubic-bezier(0.25, 0.8, 0.25, 1)';
    ns.querySelector('.pin').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 800, easing: 'ease-out', fill: 'backwards' });
    ns.querySelector('.stage').animate([
      { transform: 'scale(1.12) translateY(-2%)', filter: 'blur(12px)' },
      { transform: 'none', filter: 'blur(0)' }], { duration: 1300, easing: spring, fill: 'backwards' });
    if (birds) birds.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 300, easing: 'ease-out', fill: 'backwards' });
    (content || []).forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
      { duration: 420, delay: 120 + i * 50, easing: spring, fill: 'backwards' }));
  };
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Where the sun really is, in the drawings that show it. The front of the house faces north, so we look south:
  // east on the left, west on the right, high above the middle at noon. Null (preview, test page): as drawn.
  let sunSky = null;
  const sunShift = (c, u) => {
    if (!sunSky) return '';
    const x = Math.max(-60, Math.min(947, 443.5 + (sunSky.az - 180) * 3.3));
    // a low arc: even at midsummer noon the sun stays under the greeting
    const y = 765 - Math.max(0, Math.min(62, sunSky.el)) * 4;
    return 'translate(' + (x - c[0]) * u + 'px,' + (y - c[1]) * u + 'px)';
  };
  const placeSun = () => {
    for (const L of (scene && scene.layers) || []) if (L.kind === 'sun' && L.node && L.node.parentElement) L.node.style.transform = sunShift(L.c, L.node.parentElement.clientWidth / 887);
  };
  const followSun = (states) => {
    const a = states['sun.sun'] && states['sun.sun'].attributes;
    const next = a && !(test.on && test.tod !== 'echt') ? { az: Number(a.azimuth), el: Number(a.elevation) } : null;
    if (!next !== !sunSky || (next && (Math.abs(next.az - sunSky.az) > 0.2 || Math.abs(next.el - sunSky.el) > 0.2))) { sunSky = next; placeSun(); }
  };
  // ---- Moon: where it really is and how much of it is lit (formulas after SunCalc by Vladimir Agafonkin) --------
  const RAD = Math.PI / 180, OBL = RAD * 23.4397;
  const astroDays = (t) => t / 864e5 - 0.5 + 2440588 - 2451545;
  const raOf = (l, b) => Math.atan2(Math.sin(l) * Math.cos(OBL) - Math.tan(b) * Math.sin(OBL), Math.cos(l));
  const decOf = (l, b) => Math.asin(Math.sin(b) * Math.cos(OBL) + Math.cos(b) * Math.sin(OBL) * Math.sin(l));
  const sunEq = (d) => {
    const M = RAD * (357.5291 + 0.98560028 * d), L = M + RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) + RAD * 102.9372 + Math.PI;
    return { ra: raOf(L, 0), dec: decOf(L, 0) };
  };
  const moonEq = (d) => {
    const L = RAD * (218.316 + 13.176396 * d), M = RAD * (134.963 + 13.064993 * d), F = RAD * (93.272 + 13.22935 * d);
    const l = L + RAD * 6.289 * Math.sin(M), b = RAD * 5.128 * Math.sin(F);
    return { ra: raOf(l, b), dec: decOf(l, b), dist: 385001 - 20905 * Math.cos(M) };
  };
  // azimuth (from north, east 90) and altitude in degrees
  const horizon = (q, d, lat, lon) => {
    const H = RAD * (280.16 + 360.9856235 * d) + RAD * lon - q.ra, phi = RAD * lat;
    const alt = Math.asin(Math.sin(phi) * Math.sin(q.dec) + Math.cos(phi) * Math.cos(q.dec) * Math.cos(H));
    const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(q.dec) * Math.cos(phi));
    return { az: (az / RAD + 540) % 360, alt: alt / RAD };
  };
  // lit: fraction of the disc that is lit; angle: where the lit side points on screen (towards the sun; we look south,
  // so west is to the right), in degrees, 0 = right, 90 = down
  const moonNow = (t, lat, lon) => {
    const d = astroDays(t), s = sunEq(d), m = moonEq(d), sd = 149598000;
    const phi = Math.acos(Math.sin(s.dec) * Math.sin(m.dec) + Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra));
    const inc = Math.atan2(sd * Math.sin(phi), m.dist - sd * Math.cos(phi));
    const mp = horizon(m, d, lat, lon), sp = horizon(s, d, lat, lon);
    const vec = (p) => [Math.sin(p.az * RAD) * Math.cos(p.alt * RAD), Math.cos(p.az * RAD) * Math.cos(p.alt * RAD), Math.sin(p.alt * RAD)];
    const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
    const mv = vec(mp), sv = vec(sp), k = dot(mv, sv), tv = sv.map((x, i) => x - k * mv[i]);
    const a = mp.az * RAD, h = mp.alt * RAD;
    const right = [Math.cos(a), -Math.sin(a), 0], up = [-Math.sin(a) * Math.sin(h), -Math.cos(a) * Math.sin(h), Math.cos(h)];
    return { az: mp.az, alt: mp.alt, lit: (1 + Math.cos(inc)) / 2, angle: Math.atan2(-dot(tv, up), dot(tv, right)) / RAD };
  };
  // a round moon in Jente's moon colours: the lit part (bright limb towards the sun, a few soft seas on it) over a
  // faint earthshine disc
  const moonDisc = (look, lit, angle) => {
    const R = look.r, B = R + 3, rx = R * Math.abs(1 - 2 * lit), turn = 'rotate(' + angle.toFixed(1) + ')';
    const part = 'M0 ' + -R + ' A' + R + ' ' + R + ' 0 0 1 0 ' + R + ' A' + rx.toFixed(2) + ' ' + R + ' 0 0 ' + (lit > 0.5 ? 1 : 0) + ' 0 ' + -R + ' Z';
    const mix = (a, b, f) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.substr(i, 2), 16) * (1 - f) + parseInt(b.substr(i, 2), 16) * f).toString(16).padStart(2, '0')).join('');
    const far = look.c1 === look.c2 ? look.c1 : mix(look.c1, look.c2, 0.25);
    const seas = [[-0.3, -0.25, 0.27], [0.18, -0.38, 0.17], [0.28, 0.08, 0.24], [-0.08, 0.36, 0.17], [-0.48, 0.16, 0.13]]
      .map(([x, y, s]) => '<circle cx="' + (x * R).toFixed(1) + '" cy="' + (y * R).toFixed(1) + '" r="' + (s * R).toFixed(1) + '"/>').join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + -B + ' ' + -B + ' ' + 2 * B + ' ' + 2 * B + '" opacity="' + look.op + '">' +
      '<defs><linearGradient id="m" gradientUnits="userSpaceOnUse" x1="' + R + '" y1="0" x2="' + -R + '" y2="0" gradientTransform="' + turn + '">' +
      '<stop stop-color="' + look.c1 + '"/><stop offset="1" stop-color="' + far + '"/></linearGradient><clipPath id="l"><path d="' + part + '" transform="' + turn + '"/></clipPath></defs>' +
      '<circle r="' + R + '" fill="' + look.c2 + '" opacity="0.2"/><path d="' + part + '" transform="' + turn + '" fill="url(#m)"/>' +
      '<g clip-path="url(#l)" fill="' + (look.c1 === look.c2 ? mix(look.c1, '#000000', 0.45) : look.c2) + '" opacity="0.16">' + seas + '</g></svg>';
  };
  let moonSky = null, moonAt = 0;  // null: the moon as Jente drew it (previews, test page)
  const placeMoon = () => {
    for (const L of (scene && scene.layers) || []) {
      if (L.kind !== 'moon' || !L.node || !L.node.parentElement) continue;
      const el = L.node, m = moonSky, u = el.parentElement.clientWidth / 887;
      if (!m) {
        Object.assign(el.style, { transform: '', visibility: '', opacity: '' });
        if (L.disc && L.drawn) { el.style.backgroundImage = 'url("' + L.url + '")'; L.drawn = null; }
        continue;
      }
      const x = Math.max(-80, Math.min(967, 443.5 + (m.az - 180) * 3.3)), y = 765 - Math.max(-8, Math.min(62, m.alt)) * 4;
      el.style.transform = 'translate(' + (x - L.c[0]) * u + 'px,' + (y - L.c[1]) * u + 'px)';
      el.style.visibility = m.alt < -1 ? 'hidden' : '';
      if (!L.disc) { el.style.opacity = (0.3 + 0.7 * m.lit).toFixed(2); continue; }
      const key = m.lit.toFixed(3) + ' ' + Math.round(m.angle);
      if (L.drawn !== key) { L.drawn = key; el.style.backgroundImage = svgUri(moonDisc(L.disc, m.lit, m.angle)); }
    }
  };
  const followWind = (states) => {
    const w = windFrom(states);
    if (w.level === wind.level && w.dir === wind.dir && w.light === wind.light) return;
    wind = w; remember('wind', w);
    if (scene && scene.text) placeBuilt(buildScene(scene.text, scene.slug));
  };
  const followMoon = (hass) => {
    const live = !(test.on && test.tod !== 'echt') && hass.config && hass.config.latitude != null;
    if (live === !!moonSky && Date.now() - moonAt < 60e3) return;
    moonAt = Date.now();
    moonSky = live ? moonNow(Date.now(), hass.config.latitude, hass.config.longitude) : null;
    placeMoon();
  };
  const placeScene = (stage) => {
    if (!scene) return;
    const u = stage.clientWidth / 887;
    if (!u) return;
    for (const L of scene.layers) {
      const el = L.node;
      if (L.box) {
        const [x0, y0, x1, y1] = L.box;
        Object.assign(el.style, { left: x0 * u + 'px', top: y0 * u + 'px', width: (x1 - x0) * u + 'px', height: (y1 - y0) * u + 'px' });
      }
      if (L.inner) Object.assign(L.target.style, { top: (L.inner[0] - L.box[1]) * u + 'px', height: (L.inner[1] - L.inner[0]) * u + 'px' });
      if (L.innerX) Object.assign(L.target.style, { left: (L.innerX[0] - L.box[0]) * u + 'px', width: (L.innerX[1] - L.innerX[0]) * u + 'px' });
      if (L.anim && !still) {
        const [kf, opt] = L.anim(u);
        if (L.running) L.running.effect.setKeyframes(kf);
        else L.running = L.target.animate(kf, opt);
      }
    }
    placeSun();
    placeMoon();
  };
  // The colour of the ground along the bottom of a drawing (the middle half of its very last row, averaged), worked
  // out once per drawing and remembered
  const grounds = last.groundsBottom || {};
  const groundOf = (slug, text) => {
    if (grounds[slug]) return Promise.resolve(grounds[slug]);
    return new Promise((ok) => {
      const url = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }));
      const img = new Image();
      img.onload = () => {
        try {
          const cv = document.createElement('canvas');
          cv.width = 96; cv.height = 180;
          const g = cv.getContext('2d');
          g.drawImage(img, 0, 0, 96, 180);
          const d = g.getImageData(24, 179, 48, 1).data, sum = [0, 0, 0];
          for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) sum[k] += d[i + k];
          ok('#' + sum.map((s) => Math.round(s / (d.length / 4)).toString(16).padStart(2, '0')).join(''));
        } catch (e) { ok(null); }  // a canvas that may not be read: no run-on, as before
        URL.revokeObjectURL(url);
      };
      img.onerror = () => { URL.revokeObjectURL(url); ok(null); };
      img.src = url;
    }).then((col) => { if (col) { grounds[slug] = col; remember('groundsBottom', grounds); } return col; });
  };
  const extendGround = (ns, next) => {
    if (!next.text) return;
    if (!grounds[next.slug]) ns.removeAttribute('np-ext');
    groundOf(next.slug, next.text).then((col) => {
      if (!col || scene !== next) return;
      ns.style.setProperty('--np-ground', col);
      ns.setAttribute('np-ext', '');
    });
  };
  // Only move what can be seen: once the picture has scrolled out of view, everything in it pauses (and the birds, dog
  // and notes too), and goes on where it was when it comes back. Nobody walks or flies past meanwhile.
  let sceneSeen = true;
  const held = new Set();
  const holdScene = () => {
    const first = scene && scene.layers.find((L) => L.node);
    const ns = first && first.node.closest('np-scene');
    if (!ns) return;
    if (!sceneSeen) {
      for (const a of ns.getAnimations({ subtree: true })) if (a.animationName !== 'np-pin' && a.playState === 'running') { a.pause(); held.add(a); }
    } else {
      for (const a of held) if (a.playState === 'paused') a.play();
      held.clear();
    }
    const nb = ns.parentElement && ns.parentElement.querySelector('np-birds');
    if (nb) nb.toggleAttribute('np-paused', !sceneSeen);
  };
  // HA sometimes builds the header card anew (often when the app comes back after a while): move the scene that is
  // already built and decoded into the new card, instead of building and decoding it all again
  const moveScene = (hc) => {
    const first = scene && scene.layers.find((L) => L.node);
    const ns = first && first.node.closest('np-scene');
    if (!ns || ns.isConnected) return false;
    const sr = hc.getRootNode();
    if (!sr.querySelector('style[data-np-scene]')) {
      const st = document.createElement('style');
      st.setAttribute('data-np-scene', '');
      st.textContent = SCENE_CSS;
      sr.appendChild(st);
    }
    hc.insertBefore(ns, hc.querySelector('np-birds'));
    hc.setAttribute('np-layered', '');
    for (const L of scene.layers) if (L.running && L.running.playState !== 'running') L.running.play();
    placeScene(ns.querySelector('.stage'));
    return true;
  };
  const showScene = (hc, next) => {
    const sr = hc.getRootNode();
    if (!sr.querySelector('style[data-np-scene]')) {
      const st = document.createElement('style');
      st.setAttribute('data-np-scene', '');
      st.textContent = SCENE_CSS;
      sr.appendChild(st);
    }
    let ns = hc.querySelector('np-scene');
    if (!ns) {
      ns = document.createElement('np-scene');
      ns.innerHTML = '<div class="pin"><div class="stage"></div></div>';
      hc.insertBefore(ns, hc.querySelector('np-birds'));
      const st = ns.querySelector('.stage');
      new ResizeObserver(() => placeScene(st)).observe(st);
      new IntersectionObserver((es) => { sceneSeen = es[es.length - 1].isIntersecting; holdScene(); }).observe(ns);
    }
    const stage = ns.querySelector('.stage');
    const frag = document.createDocumentFragment();
    for (const L of next.layers) {
      if (L.running) { L.running.cancel(); L.running = null; }
      const el = document.createElement('i');
      L.node = L.target = el;
      if (L.kind === 'static' || L.kind === 'ov' || L.kind === 'street' || L.kind === 'grass' || L.kind === 'sky') el.className = 'full' + (L.kind === 'ov' ? ' ov' : '');
      if (L.kind === 'dark') el.style.background = L.color;
      if (L.url && L.kind !== 'lamp') el.style.backgroundImage = 'url("' + L.url + '")';
      if (L.kind === 'lamp') {
        el.className = 'mask';
        el.style.webkitMaskImage = el.style.maskImage = 'radial-gradient(closest-side, #000 55%, transparent 100%)';
        const inner = document.createElement('i');
        inner.style.backgroundImage = 'url("' + L.url + '")';
        el.appendChild(inner);
        L.target = inner;
      }
      if (L.anim) el.style.willChange = ['bolt', 'glow', 'dark', 'twinkle'].includes(L.kind) ? 'opacity' : L.kind === 'sparkle' ? 'transform, opacity' : 'transform';
      if (L.kind === 'sun' || L.kind === 'moon') el.style.willChange = 'transform';
      if (L.kind === 'leaf' || L.kind === 'sparkle') el.style.transformOrigin = 'center';
      if (L.kind === 'tree') el.style.transformOrigin = '50% 100%';
      if (L.opacity) el.style.opacity = L.opacity;
      frag.appendChild(el);
    }
    // swap in the new layers only when all of them are decoded, so they appear together (at most 4 s wait)
    const token = ++sceneToken;
    const ready = Promise.race([Promise.all(next.urls.map(whenLoaded)), new Promise((ok) => setTimeout(ok, 4000))]);
    ready.then(() => {
      if (token !== sceneToken) return;  // a newer drawing was picked meanwhile
      const old = scene;
      const first = !old && appearFirst && !still;
      stage.replaceChildren(frag);
      next.people = {};
      for (const L of next.layers) if (L.kind === 'street' || L.kind === 'grass') next.people[L.kind] = L.node;
      next.sky = (next.layers.find((L) => L.kind === 'sky') || {}).node;
      extendGround(ns, next);
      scene = next;
      placeScene(stage);
      if (!sceneSeen) holdScene();
      hc.setAttribute('np-layered', '');
      setLights(lamps.down, lamps.up);
      showOverlay();
      // only the house comes in; the greeting and the content are already on screen and stay put
      if (first) appearHouse(ns, hc.querySelector('np-birds'));
      if (old && old !== next) setTimeout(() => old.urls.forEach((u) => URL.revokeObjectURL(u)), 1000);
    });
  };
  // ---- People ------------------------------------------------------------------------------------------------
  // Now and then someone passes: walking or cycling on the little street behind the hedge (only the upper body shows
  // above it), or walking a dog over the grass. In the rain walkers carry an umbrella and nobody cycles.
  // Figures are small flat SVGs in the drawing's palette with a random look (hair, glasses, scarf, bag, coat, bike).
  // Knees and elbows bend: every limb is solved per frame (two-bone IK) and played with SMIL inside the tiny image;
  // the walk across the picture is a page animation (composited).
  const PEOPLE_COLORS = {
    coat: ['#c0564b', '#3f6e8c', '#d79b3f', '#5c7a4f', '#7a5a8c', '#2f3b4c', '#b8746a', '#4f8f88'],
    pants: ['#2c3440', '#3d4a5c', '#4a3f38', '#24303a', '#5a5047', '#6b6f78'],
    skin: ['#f1c9a5', '#d9a47c', '#a8724f', '#7a4f35', '#f5d6bb'],
    hair: ['#2a2420', '#5b3a24', '#a8743f', '#d8c08a', '#8a8a8a', '#1d1d1f', '#9c4a2a'],
    knit: ['#c0564b', '#e0a32e', '#3f6e8c', '#e8e1d4', '#5c7a4f', '#7a5a8c'],  // scarves, beanies, caps
    bag: ['#6b4a32', '#2f3b4c', '#8a6a4a', '#3a3a3a', '#4f6b5a'],
    shoes: ['#1f1f22', '#5a3a26', '#ece8e0'],
    umbrella: ['#d64545', '#2f6fb3', '#f0b429', '#3a3a3a', '#7d4fb3', '#2e9c6a'],
    bike: ['#2f6fb3', '#c0564b', '#2a2a2e', '#4f8f88', '#e0a32e', '#e8e1d4', '#355e3b'],
  };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const chance = (p) => Math.random() < p;
  const svgUri = (s) => 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s) + '")';
  const shade = (hex, f) => '#' + hex.slice(1).match(/../g).map((x) => Math.max(0, Math.min(255, Math.round(parseInt(x, 16) * f))).toString(16).padStart(2, '0')).join('');
  const pt = (p) => Math.round(p[0] * 10) / 10 + ' ' + Math.round(p[1] * 10) / 10;
  // the joint between a fixed end a and a moving end b; bend +1 puts it forward (knees), -1 backward (elbows)
  const joint = (a, b, l1, l2, bend) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.max(0.01, Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01));
    const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - along * along));
    return [a[0] + dx * along / d + bend * dy * h / d, a[1] + dy * along / d - bend * dx * h / d];
  };
  const FRAMES = 16;
  const cycle = (f) => { const out = []; for (let i = 0; i <= FRAMES; i++) out.push(f(i / FRAMES)); return out; };
  const anim = (attr, vals, dur) => vals.length > 1 ? `<animate attributeName="${attr}" values="${vals.join(';')}" dur="${dur}s" repeatCount="indefinite"/>` : '';
  const moveAlong = (pts, dur) => pts.length > 1 ? `<animateTransform attributeName="transform" type="translate" values="${pts.map(pt).join(';')}" dur="${dur}s" repeatCount="indefinite"/>` : '';
  // a limb: upper and lower part as tapered strokes, then the hand or shoe at its end; frames: [[root, joint, end], ...]
  const limb = (frames, dur, w1, w2, color, end) => {
    const seg = (i, j) => `<path d="M${pt(frames[0][i])} L${pt(frames[0][j])}" stroke="${color}" stroke-width="${w1}" stroke-linecap="round">` +
      anim('d', frames.map((f) => `M${pt(f[i])} L${pt(f[j])}`), dur) + `</path>`;
    return seg(0, 1).replace(`stroke-width="${w1}"`, `stroke-width="${w1}"`) + seg(1, 2).replace(`stroke-width="${w1}"`, `stroke-width="${w2}"`) +
      (end ? `<g transform="translate(${pt(frames[0][2])})">${moveAlong(frames.map((f) => f[2]), dur)}${end}</g>` : '');
  };
  const shoe = (c) => `<path d="M-3.8 -2.6 L-3.8 3.6 L8 3.6 Q10.2 3.6 9 0.5 Q6.5 -2.4 1.6 -3.1 Z" fill="${c.shoes}"/>` +
    (c.shoes === '#ece8e0' ? `<path d="M-3.8 2.6 H9.6" stroke="#55555c" stroke-width="1.6"/>` : '');
  const hand = (c) => `<circle r="3.5" fill="${c.skin}"/>`;

  // neck and head facing right, head centre about (34.5, 26)
  const headSVG = (c) => {
    const H = c.hair, s = c.style, out = [];
    const shortTop = `<path d="M23.6 28.5 Q21.6 14.5 34.5 14 Q45.2 14.2 45.6 22.6 Q40.4 19.6 36.4 21 Q32.8 22.4 31.2 26 L29.8 31 Q25.6 31.6 23.6 28.5 Z" fill="${H}"/>`;
    const backHair = `<path d="M23.8 23.5 Q22.6 31.5 26.6 33.6 L29.4 26 Z" fill="${H}"/>`;
    out.push(`<path d="M30.6 33 L37.6 33 L37.2 44 L31 44 Z" fill="${c.skinDark}"/>`);
    if (s === 'long') out.push(`<path d="M24.2 21 Q18.6 40 24.6 50.5 L35.4 48.6 Q30.2 37.4 31.2 27 Z" fill="${H}"/>`);
    if (s === 'bun') out.push(`<circle cx="23.6" cy="17.6" r="5" fill="${H}"/>`);
    out.push(`<ellipse cx="34.5" cy="26" rx="10.2" ry="11" fill="${c.skin}"/>`);
    out.push(`<path d="M44.2 23.6 Q48.2 27.2 44.4 29.8 Z" fill="${c.skin}"/>`);  // nose
    if (s === 'short' || s === 'long' || s === 'bun') out.push(shortTop);
    if (s === 'curly') out.push(shortTop + [[24, 24.5, 4.6], [24.6, 18.4, 5], [29.6, 14.6, 5.2], [35.8, 13.6, 5], [41.4, 15.6, 4.6], [44.4, 19.8, 3.4], [23.8, 29.6, 3.8]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${H}"/>`).join(''));
    if (s === 'bald') out.push(`<path d="M23.6 29.5 Q22.6 22 27.4 18.8 Q25.6 25 28.2 32 Z" fill="${H}"/>`);
    if (s === 'beanie') out.push(backHair + `<path d="M22.8 25 Q22 11.6 34.5 11.6 Q47 11.6 46.2 24 Z" fill="${c.knit}"/>` +
      `<rect x="22.2" y="21.4" width="24.6" height="4.8" rx="2.2" fill="${shade(c.knit, 0.84)}"/><circle cx="34.5" cy="10.6" r="3.3" fill="${shade(c.knit, 1.1)}"/>`);
    if (s === 'cap') out.push(backHair + `<path d="M23.4 23.6 Q23.2 13.4 34.5 13.4 Q45.2 13.4 45.6 22.6 Z" fill="${c.knit}"/>` +
      `<path d="M43.4 21.4 Q50.4 20.8 54 23.8 Q49.4 25 43.4 24.2 Z" fill="${shade(c.knit, 0.8)}"/>`);
    if (s !== 'long') out.push(`<ellipse cx="30.8" cy="27.6" rx="2.3" ry="3" fill="${c.skinDark}"/>`);  // ear
    out.push(`<circle cx="40.4" cy="25" r="1.25" fill="#1d1d1f"/><path d="M38.4 21.6 L42 22" stroke="${H}" stroke-width="1.2" stroke-linecap="round"/>`);
    out.push(`<circle cx="39.6" cy="29.4" r="2.1" fill="#e2806e" opacity=".22"/>`);
    if (c.beard) out.push(`<path d="M31 28.4 Q31.6 37.8 38.6 38.2 Q44.2 38.2 44.8 31.4 Q42.6 33.6 39 33 Q35 32.4 33.2 29 Z" fill="${H}"/>`);
    else out.push(`<path d="M41 31.8 Q42.4 32.4 43.6 31.4" stroke="${c.skinDark}" stroke-width="0.9" fill="none" stroke-linecap="round"/>`);
    if (c.glasses) out.push(`<circle cx="40.8" cy="25.2" r="3" fill="none" stroke="#2a2a2e" stroke-width="0.9"/><path d="M37.8 25 L31.6 26" stroke="#2a2a2e" stroke-width="0.9"/>`);
    return out.join('');
  };
  // upper body around a shoulder line at y 40 and hem at `hem`; things on the back go first, straps and scarf after
  const torsoSVG = (c, hem) => {
    const C = c.coat, D = c.coatDark, out = [];
    if (c.pack === 'backpack') out.push(`<rect x="12.4" y="46" width="12" height="30" rx="4.6" fill="${c.bagColor}"/><rect x="13.4" y="58.5" width="9" height="10" rx="2" fill="${shade(c.bagColor, 0.85)}"/>`);
    const flare = c.longCoat ? 2 : 0;
    out.push(`<path d="M22.6 47 Q22 40.4 29 40 L37 40 Q42 40.4 42 47 L${42.4 + flare} ${hem} Q32 ${hem + 3.6} ${21.6 - flare} ${hem} Z" fill="${C}"/>`);
    out.push(`<path d="M22.6 47 Q22 40.4 28.6 40 L27.6 ${hem + 1.6} Q24 ${hem + 1} ${21.6 - flare} ${hem} Z" fill="${shade(C, 0.88)}"/>`);
    out.push(`<path d="M40.6 48 L${41 + flare / 2} ${hem - 1}" stroke="${D}" stroke-width="1"/><path d="M33.4 ${hem - 15} H40" stroke="${D}" stroke-width="1.5" stroke-linecap="round"/>`);
    if (c.longCoat) out.push([56, 68, 80, 92].map((y) => `<circle cx="39.4" cy="${y}" r="1.1" fill="${D}"/>`).join(''));
    if (c.scarf) out.push(`<path d="M27.6 38.6 Q33 44.6 39.4 39.4 L39.8 44.2 Q33 50.4 27.2 44 Z" fill="${c.knit}"/><path d="M29 44 Q27 52 26.6 61 L31.2 61 Q31.6 52 32.2 45.6 Z" fill="${shade(c.knit, 0.88)}"/>`);
    else out.push(`<path d="M28.6 40.4 L33 48 L37.4 40.4" stroke="${D}" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`);
    if (c.pack === 'backpack') out.push(`<path d="M25 42.6 Q30 46 30.6 62" stroke="${shade(c.bagColor, 0.75)}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
    if (c.pack === 'shoulder') out.push(`<path d="M37.4 41.4 L24 79" stroke="${shade(c.bagColor, 0.75)}" stroke-width="2"/><rect x="13.6" y="74" width="15.6" height="13.4" rx="2.6" fill="${c.bagColor}"/><path d="M13.6 78.4 H29.2" stroke="${shade(c.bagColor, 0.8)}" stroke-width="1.2"/>`);
    return out.join('');
  };
  // a walking person facing right, soles at y 156 (about 1.75 m from sole to crown); the body bobs, legs and arms swing
  // opts: dur (one stride, s), umbrella, leash (point to hold a leash to)
  const walkerParts = (c, opts) => {
    const dur = opts.dur, S = 15, AY = 152.4, HIP = 31, SH = [31, 45];
    const foot = (t) => { t = ((t % 1) + 1) % 1;
      if (t < 0.6) return [HIP + S * (1 - 2 * t / 0.6), AY];
      const s = (t - 0.6) / 0.4, e = s * s * (3 - 2 * s);
      return [HIP - S + 2 * S * e, AY - 8 * Math.sin(Math.PI * s)]; };
    const bob = (t) => -0.7 * Math.cos(4 * Math.PI * (t - 0.3));
    const leg = (ph) => cycle((t) => { const h = [HIP, 82.2 + bob(t)], f = foot(t + ph); return [h, joint(h, f, 35.8, 35.8, 1), f]; });
    const arm = (target) => cycle((t) => { const f = target(t); return [SH, joint(SH, f, 22, 21, -1), f]; });
    const swing = (sign, a) => (t) => { const hx = 1 + sign * a * Math.cos(2 * Math.PI * t), r = 40 - 2.5 * Math.max(0, hx) / a; return [SH[0] + hx, SH[1] + Math.sqrt(r * r - hx * hx)]; };
    const bobGroup = (inner) => `<g>${moveAlong(cycle((t) => [0, bob(t)]), dur)}${inner}</g>`;
    const hem = c.longCoat ? 106 : 86;
    let near = '', extra = '';
    if (opts.umbrella) {
      const H = [44, 57];
      near = limb([[SH, joint(SH, H, 22, 21, -1), H]], dur, 8.5, 7, c.coat, hand(c));
      extra = `<path d="M44 -16 V61 Q44 66 40.4 66" stroke="#45454b" stroke-width="1.5" fill="none" stroke-linecap="round"/>` +
        `<path d="M7 6 Q9 -14 44 -16 Q79 -14 81 6 Q75 2 69.5 6 Q63 1.6 56.5 6 Q50.5 1.6 44 6 Q37.5 1.6 31.5 6 Q25 1.6 18.5 6 Q13 2 7 6 Z" fill="${c.umbrella}"/>` +
        `<path d="M44 -16 Q20 -12 18.5 6 Q13 2 7 6 Q9 -14 44 -16 Z M44 -16 Q33 -10 31.5 6 Q37.5 1.6 44 6 Z M44 -16 Q57.6 -11 56.5 6 Q63 1.6 69.5 6 Q65 -11 44 -16 Z" fill="${shade(c.umbrella, 0.84)}"/>` +
        `<path d="M44 -16 V-20.5" stroke="#45454b" stroke-width="1.8" stroke-linecap="round"/>`;
    } else if (opts.leash) {
      const fr = arm((t) => [SH[0] + 8 + 1.5 * Math.cos(2 * Math.PI * t), SH[1] + 33]);
      near = limb(fr, dur, 8.5, 7, c.coat, hand(c));
      const L = opts.leash, leash = fr.map((f) => `M${pt(f[2])} Q${pt([(f[2][0] + L[0]) / 2, Math.max(f[2][1], L[1]) + 9])} ${pt(L)}`);
      extra = `<path d="${leash[0]}" stroke="#3a2a22" stroke-width="1.3" fill="none">${anim('d', leash, dur)}</path>`;
    } else near = limb(arm(swing(-1, 9)), dur, 8.5, 7, c.coat, hand(c));
    const far = limb(arm(swing(1, opts.umbrella ? 5 : 9)), dur, 8.5, 7, c.coatDark, hand(c));
    return bobGroup(far) +
      limb(leg(0.5), dur, 10.5, 8.5, c.pantsDark, shoe(c)) + limb(leg(0), dur, 10.5, 8.5, c.pants, shoe(c)) +
      bobGroup(torsoSVG(c, hem) + headSVG(c) + near) + (opts.leash ? extra : bobGroup(extra));
  };
  const walkerSVG = (c, opts) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -22 84 182">${walkerParts(c, opts)}</svg>`;
  // someone walking a small dog on a leash (dog ahead, on the right)
  const dogWalkerSVG = (c, opts) => {
    const dogInner = (typeof DOG_SVG === 'string' ? DOG_SVG : '').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    const collar = [116, 134.4];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -22 136 182">` +
      walkerParts(c, opts.umbrella ? opts : { ...opts, leash: collar }) +
      (opts.umbrella ? `<path d="M44 57 Q80 150 ${pt(collar)}" stroke="#3a2a22" stroke-width="1.3" fill="none"/>` : '') +
      `<g transform="translate(80 124) scale(0.8)">${dogInner}</g></svg>`;
  };
  // a Dutch city bike (mudguards, chain guard, rack, sometimes a crate or a pannier) with an upright rider, facing
  // right, tyres on y 166; dur is one turn of the wheels
  const cyclistSVG = (c, dur) => {
    const R = [30, 138], F = [120, 138], BB = [68, 143], HIP = [61, 86], crank = dur * 0.95, B = c.bike;
    const wheel = (x) => `<g transform="translate(${x} 138)"><circle r="28" fill="none" stroke="#2a2a2e" stroke-width="3.6"/><circle r="25.6" fill="none" stroke="#a7a7ae" stroke-width="1"/>` +
      `<g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${dur}s" repeatCount="indefinite"/>` +
      `<path d="${[0, 30, 60, 90, 120, 150].map((a) => { const r = a * Math.PI / 180, x1 = 25 * Math.cos(r), y1 = 25 * Math.sin(r); return `M${pt([x1, y1])} L${pt([-x1, -y1])}`; }).join('')}" stroke="#8c8c94" stroke-width="0.6"/></g>` +
      `<circle r="2.6" fill="#8c8c94"/></g>`;
    const pedalAt = (deg) => [BB[0] + 13.6 * Math.cos(deg * Math.PI / 180), BB[1] + 13.6 * Math.sin(deg * Math.PI / 180)];
    const pedalLeg = (ph, color) => {
      const fr = cycle((t) => { const p = pedalAt(ph + t * 360), f = [p[0] - 1.5, p[1] - 3]; return [HIP, joint(HIP, f, 35.5, 35.5, 1), f, p]; });
      const arm = `<path d="M${pt(BB)} L${pt(fr[0][3])}" stroke="#3a3a3e" stroke-width="2.6" stroke-linecap="round">${anim('d', fr.map((f) => `M${pt(BB)} L${pt(f[3])}`), crank)}</path>` +
        `<g transform="translate(${pt(fr[0][3])})">${moveAlong(fr.map((f) => f[3]), crank)}<rect x="-3.6" y="-1.2" width="7.2" height="2.4" rx="1" fill="#2a2a2e"/></g>`;
      return arm + limb(fr, crank, 10.5, 8.5, color, shoe(c));
    };
    const fender = (cx, a1, a2) => { const p = (a) => [cx + 31.5 * Math.cos(a * Math.PI / 180), 138 + 31.5 * Math.sin(a * Math.PI / 180)];
      return `<path d="M${pt(p(a1))} A31.5 31.5 0 0 1 ${pt(p(a2))}" stroke="${shade(B, 0.85)}" stroke-width="3" fill="none" stroke-linecap="round"/>`; };
    const tubes = c.stepThrough
      ? 'M110 101 Q88 113 69 141 M108 96.5 Q82 105 64.4 121'
      : 'M62 100 L108 96 M110 102 L68 143';
    const SH = [69, 50], grip = [95.6, 83];
    const armTo = (s, color) => limb([[s, joint(s, grip, 22, 21, -1), grip]], dur, 8.5, 7, color, hand(c));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 0 154 170">` +
      wheel(R[0]) + wheel(F[0]) + armTo([66.6, 50], c.coatDark) + pedalLeg(180, c.pantsDark) +
      `<path d="${tubes} M68 143 L61 96 M68 143 L30 138 M62 100 L30 138" stroke="${B}" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M108 93.6 L111 107" stroke="${B}" stroke-width="4.6" stroke-linecap="round"/><path d="M111 107 Q114 124 120 138" stroke="${B}" stroke-width="3" fill="none"/>` +
      fender(R[0], 168, 338) + fender(F[0], 202, 12) +
      `<path d="M12 103.4 H52 M16 103.4 L29 137 M50 103.4 L61.4 98" stroke="#6a6a70" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
      (c.pannier ? `<rect x="12.6" y="104.6" width="25" height="22" rx="3" fill="${c.bagColor}"/><path d="M12.6 111 H37.6" stroke="${shade(c.bagColor, 0.8)}" stroke-width="1.4"/>` : '') +
      (c.crate ? `<rect x="110.4" y="85.6" width="30" height="18.4" rx="1.6" fill="#8d6b45"/><path d="M110.4 91.8 H140.4 M110.4 97.8 H140.4" stroke="#6e5234" stroke-width="1.2"/>` : '') +
      `<circle cx="113.4" cy="107.6" r="2.3" fill="#efe3b0" stroke="#55555c" stroke-width="0.8"/>` +
      `<circle cx="68" cy="143" r="7.6" fill="none" stroke="#5a5a60" stroke-width="2"/>` +
      `<path d="M70 135 L34 134 Q27.4 138 34 142.6 L70 151 Q77 143 70 135 Z" fill="${shade(B, 0.7)}"/>` +
      `<path d="M61 96 L60.4 90.6" stroke="#9a9aa2" stroke-width="2.4"/><path d="M51 90 Q60 86.4 67 89.4 Q63 93.6 53 93 Z" fill="#3a2a22"/>` +
      `<path d="M108 94 L106 84" stroke="#9a9aa2" stroke-width="2.4"/><path d="M106 84 Q101 79 95 82.6" stroke="#2a2a2e" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
      pedalLeg(0, c.pants) +
      `<g transform="translate(38 4)">${torsoSVG({ ...c, longCoat: false, pack: c.pack === 'shoulder' ? 'none' : c.pack }, 88).replace(/<path d="M33\.4[^>]*>/, '')}${headSVG(c)}</g>` +
      armTo(SH, c.coat) + `<path d="M98.4 81.6 L94.2 83.4" stroke="#4a3a30" stroke-width="3.4" stroke-linecap="round" opacity=".6"/></svg>`;
  };
  const newColors = () => {
    const coat = pick(PEOPLE_COLORS.coat), pants = pick(PEOPLE_COLORS.pants), skin = pick(PEOPLE_COLORS.skin), bike = pick(PEOPLE_COLORS.bike);
    const style = pick(['short', 'short', 'long', 'long', 'bun', 'curly', 'beanie', 'cap', 'bald']);
    return { coat, coatDark: shade(coat, 0.78), pants, pantsDark: shade(pants, 0.8), skin, skinDark: shade(skin, 0.88),
      hair: style === 'bald' ? pick(['#8a8a8a', '#b5b0a8', '#5b3a24']) : pick(PEOPLE_COLORS.hair), style,
      knit: pick(PEOPLE_COLORS.knit), bagColor: pick(PEOPLE_COLORS.bag), shoes: pick(PEOPLE_COLORS.shoes), umbrella: pick(PEOPLE_COLORS.umbrella), bike,
      glasses: chance(0.25), beard: ['short', 'bald', 'cap', 'beanie'].includes(style) && chance(0.3), scarf: chance(0.3),
      longCoat: chance(0.35), pack: pick(['none', 'none', 'backpack', 'shoulder']), stepThrough: chance(0.5), crate: chance(0.35), pannier: chance(0.35) };
  };
  // where they go, in drawing units (887 wide): box bottom on the street behind the hedge, or on the grass in front of
  // it. Scale 0.9 makes a person about 127 units (1.8 m next to the 2.2 m door); people on the grass are nearer, so bigger.
  // speed = stride (30) / stance (0.6 of a step cycle) x scale, so the feet do not slide.
  const PEOPLE_KINDS = {
    walker: { layer: 'street', w: 84, h: 182, feet: 1325.6, scale: 0.9, speed: 45, svg: (c) => walkerSVG(c, { dur: 1 }) },
    umbrella: { layer: 'street', w: 84, h: 182, feet: 1325.6, scale: 0.9, speed: 39, svg: (c) => walkerSVG(c, { dur: 1.15, umbrella: true }) },
    // the cyclist rides the far side of the street, so the tops of the wheels peek over the hedge
    cyclist: { layer: 'street', w: 154, h: 170, feet: 1303.6, scale: 0.9, speed: 140, svg: (c) => cyclistSVG(c, 1.14) },
    dogwalker: { layer: 'grass', w: 136, h: 182, feet: 1408.2, scale: 1.05, speed: 50, svg: (c, rain) => dogWalkerSVG(c, { dur: 1.05, umbrella: rain }) },
  };
  const RAINY = ['rainy', 'pouring', 'lightning-rainy', 'snowy-rainy', 'sleet'];
  // send one person across now; kind: walker | cyclist | dogwalker; rain decides the umbrella
  const sendPerson = (kind, wx, tod) => {
    if (!scene || !scene.people) return null;
    const rain = RAINY.includes(wx);
    if (rain && kind === 'cyclist') kind = 'walker';
    const k = rain && kind === 'walker' ? PEOPLE_KINDS.umbrella : PEOPLE_KINDS[kind];
    const host = scene.people[k.layer];
    if (!host) return null;
    const u = host.parentElement.clientWidth / 887;
    if (!u) return null;
    const s = k.scale || 1;
    const el = document.createElement('i');
    const w = k.w * s, h = k.h * s;
    Object.assign(el.style, { position: 'absolute', left: '0', top: (k.feet - h) * u + 'px', width: w * u + 'px', height: h * u + 'px',
      background: svgUri(k.svg(newColors(), rain)) + ' center / 100% 100% no-repeat', willChange: 'transform' });
    if (tod === 'night') el.style.filter = 'brightness(0.55) saturate(0.8)';
    else if (tod !== 'day') el.style.filter = 'brightness(0.78) saturate(0.9)';
    host.appendChild(el);
    const rtl = Math.random() < 0.5;
    const from = rtl ? 887 + 20 : -w - 20, to = rtl ? -w - 20 : 887 + 20;
    const flip = rtl ? ' scaleX(-1)' : '';
    const dist = Math.abs(to - from);
    const a = el.animate([{ transform: 'translateX(' + from * u + 'px)' + flip }, { transform: 'translateX(' + to * u + 'px)' + flip }],
      { duration: dist / k.speed * 1000, easing: 'linear' });
    a.onfinish = a.oncancel = () => el.remove();
    return a;
  };
  // ---- Sky: now and then a shooting star at night, or an aeroplane passing high up -----------------------------------
  // Both live in the sky layer (behind clouds, stars and trees) and are page animations (composited).
  const SKY_DIM = { night: '', dawn: 'brightness(0.85)', dusk: 'brightness(0.8)', day: '' };
  const shootingStar = () => {
    const host = scene && scene.sky;
    const u = host && host.parentElement.clientWidth / 887;
    if (!u) return null;
    const len = 70 + Math.random() * 60, rtl = Math.random() < 0.5, ang = (18 + Math.random() * 22) * Math.PI / 180;
    const dx = Math.cos(ang) * (rtl ? -1 : 1), dy = Math.sin(ang), d = 150 + Math.random() * 90;
    const x = 140 + Math.random() * 600, y = 420 + Math.random() * 150;  // the visible sky, under the bar
    const el = document.createElement('i');
    // the head is at the right end of the streak; it is turned along its path around that end
    Object.assign(el.style, { position: 'absolute', left: (x - len) * u + 'px', top: y * u + 'px', width: len * u + 'px', height: Math.max(1.5, 2.4 * u) + 'px',
      borderRadius: '999px', background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(235,242,255,0.55) 70%, #fff)',
      filter: 'drop-shadow(0 0 ' + 2 * u + 'px rgba(210,225,255,0.9))', transformOrigin: '100% 50%', willChange: 'transform, opacity' });
    host.appendChild(el);
    const turn = 'rotate(' + Math.atan2(dy, dx) + 'rad)';
    const a = el.animate([
      { transform: 'translate(0,0) ' + turn + ' scaleX(0.2)', opacity: 0 },
      { transform: 'translate(' + dx * d * 0.25 * u + 'px,' + dy * d * 0.25 * u + 'px) ' + turn + ' scaleX(0.8)', opacity: 1, offset: 0.25 },
      { transform: 'translate(' + dx * d * u + 'px,' + dy * d * u + 'px) ' + turn + ' scaleX(1)', opacity: 0 }],
      { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(0.3, 0, 0.8, 1)' });
    a.onfinish = a.oncancel = () => el.remove();
    return a;
  };
  // an aeroplane facing right, 40 x 12; at night only its lights: steady white, a red beacon and a white strobe
  const PLANE_DAY = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 12"><path d="M3.4 5.4 L1.4 0.6 L4.6 0.6 L9.4 5.4 Z" fill="#c9d0da"/>' +
    '<path d="M2.2 6.6 Q2.2 5 4.2 5 L33 5 Q38.2 5.2 39.6 6.7 Q38.2 8.2 33 8.2 L4.2 8.2 Q2.2 8.2 2.2 6.6 Z" fill="#f2f5f8"/>' +
    '<path d="M4 7.4 L36 7.4 Q34.4 8.2 33 8.2 L4.2 8.2 Z" fill="#cdd4de"/><path d="M15.4 6.8 L24.6 6.8 L14.2 11.6 L11.6 11.6 Z" fill="#b7c0cc"/>' +
    '<path d="M35.6 5.8 L37.6 6.2 L35.6 6.6 Z" fill="#7d8796"/></svg>';
  const PLANE_NIGHT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 12"><circle cx="20" cy="6.5" r="1.5" fill="#fff" opacity=".85"/>' +
    '<circle cx="20" cy="8.6" r="1.5" fill="#ff5a4d"><animate attributeName="opacity" values="0;0;1;0" keyTimes="0;0.6;0.7;1" dur="1.3s" repeatCount="indefinite"/></circle>' +
    '<circle cx="37" cy="6.5" r="1.3" fill="#fff"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;0.04;0.1;1" dur="1.9s" repeatCount="indefinite"/></circle></svg>';
  const sendPlane = (tod) => {
    const host = scene && scene.sky;
    const u = host && host.parentElement.clientWidth / 887;
    if (!u) return null;
    const night = tod === 'night', rtl = Math.random() < 0.5, W = 30, H = 9, trail = night ? 0 : 160 + Math.random() * 120;
    const y = 450 + Math.random() * 140, rise = (Math.random() - 0.5) * 40;
    const el = document.createElement('b');
    Object.assign(el.style, { position: 'absolute', left: '0', top: y * u + 'px', width: (W + trail) * u + 'px', height: H * u + 'px', display: 'block',
      willChange: 'transform', filter: SKY_DIM[tod] || '' });
    // contrail behind the plane, fading out towards its far end
    if (trail) el.innerHTML = '<i style="position:absolute;left:0;top:' + 5.6 * u + 'px;width:' + (trail + 4) * u + 'px;height:' + Math.max(1, 1.6 * u) + 'px;' +
      'border-radius:999px;background:linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.75))"></i>';
    el.innerHTML += '<i style="position:absolute;right:0;top:0;width:' + W * u + 'px;height:' + H * u + 'px;background:' + svgUri(night ? PLANE_NIGHT : PLANE_DAY) + ' center / 100% 100% no-repeat"></i>';
    host.appendChild(el);
    const w = W + trail, from = rtl ? 887 + 20 : -w - 20, to = rtl ? -w - 20 : 887 + 20, flip = rtl ? ' scaleX(-1)' : '';
    const a = el.animate([{ transform: 'translate(' + from * u + 'px,0)' + flip }, { transform: 'translate(' + to * u + 'px,' + rise * u + 'px)' + flip }],
      { duration: Math.abs(to - from) / 22 * 1000, easing: 'linear' });
    a.onfinish = a.oncancel = () => el.remove();
    return a;
  };
  const NO_PLANES = ['fog', 'pouring', 'lightning', 'lightning-rainy'];
  const skyTick = () => {
    setTimeout(skyTick, (30 + Math.random() * 60) * 1000);
    if (document.hidden || still || !scene || !houseSlug || !sceneSeen) return;
    if (!/\/mijn-huis(\/huis)?\/?$/.test(location.pathname)) return;
    const tod = houseSlug.split('-').pop(), wx = houseSlug.slice(0, houseSlug.lastIndexOf('-'));
    const stars = scene.layers.some((L) => L.kind === 'twinkle');
    if (tod === 'night' && stars && Math.random() < 0.6) shootingStar();
    else if (!NO_PLANES.includes(wx) && Math.random() < 0.6) sendPlane(tod);
  };
  setTimeout(skyTick, (10 + Math.random() * 15) * 1000);
  const PEOPLE_MIX = [['walker', 45], ['cyclist', 25], ['dogwalker', 30]];
  const peopleTick = () => {
    setTimeout(peopleTick, (25 + Math.random() * 35) * 1000);
    if (document.hidden || still || !scene || !houseSlug || !sceneSeen) return;
    if (!/\/mijn-huis(\/huis)?\/?$/.test(location.pathname)) return;
    const tod = houseSlug.split('-').pop(), wx = houseSlug.slice(0, houseSlug.lastIndexOf('-'));
    if (tod === 'night' && Math.random() < 0.5) return;
    let r = Math.random() * 100, kind = 'walker';
    for (const [k, w] of PEOPLE_MIX) { if ((r -= w) < 0) { kind = k; break; } }
    sendPerson(kind, wx, tod);
  };
  setTimeout(peopleTick, (6 + Math.random() * 9) * 1000);
  let hui = null;
  const findHui = (root) => {
    for (const n of root.querySelectorAll('*')) {
      if (n.tagName === 'HUI-ROOT') return n;
      if (n.shadowRoot) { const f = findHui(n.shadowRoot); if (f) return f; }
    }
    return null;
  };
  const ensure = () => {
    if (!hui || !hui.isConnected) hui = findHui(document);
    if (hui) addBarStyle(hui);
    return hui;
  };
  const addBarStyle = (h) => {
    if (h.shadowRoot && !h.shadowRoot.querySelector('style[data-np-clear]')) {
      hui = h;
      const s = document.createElement('style');
      s.setAttribute('data-np-clear', '');
      s.textContent = css + segCss;
      hui.shadowRoot.appendChild(s);
      // first time on the Huis page: keep it hidden until the illustration is ready (at most 3 s), then enter
      if (/\/mijn-huis(\/huis)?\/?$/.test(location.pathname)) waitForHeader(hui);
    }
  };
  // Attach the styling the moment HA creates the top bar (before its first paint), so the plain tabs never show;
  // the per-frame watcher below stays as a fallback for a bar that already existed when this script loaded.
  customElements.whenDefined('hui-root').then(() => {
    const C = customElements.get('hui-root');
    if (!C || C.prototype.__npPatched) return;
    const orig = C.prototype.createRenderRoot;
    C.prototype.createRenderRoot = function () {
      const root = orig.call(this);
      try { addBarStyle(this); } catch (e) { /* fallback watcher handles it */ }
      return root;
    };
    C.prototype.__npPatched = true;
  });
  // Keep the Huis page invisible until the greeting card is laid out with its card-mod styling (its final height and
  // the scenes' offset), checked every frame; at most 2.5 s. Then show it at once: from then on nothing shifts.
  const waitForHeader = (h) => {
    h.setAttribute('np-wait', '');
    const t0 = performance.now();
    let lastSig = '', settled = 0, done = false;
    // safety net that does not depend on animation frames (a hidden or throttled page gets none): never stay invisible
    const reveal = () => { if (!done) { done = true; h.removeAttribute('np-wait'); } };
    setTimeout(reveal, 2500);
    const tick = () => {
      const card = findHeaderCard(h.shadowRoot);
      const hc = card && card.shadowRoot && card.shadowRoot.querySelector('ha-card');
      // tablet and desktop: the panel layout goes in while the page is still hidden, so it never jumps into place
      const wide = window.innerWidth > 870;
      if (wide) setPanel(h, true);
      let ready = false;
      if (hc && hc.getBoundingClientRect().height > 150 && (!wide || (panelView && panelView.hasAttribute('np-panel')))) {
        // and the layout below has settled: the positions of the sections and the scene cards are the same 4 frames in a row
        const boxes = [];
        const walk = (r) => { for (const n of r.querySelectorAll('*')) { if (n.tagName === 'HUI-SECTION' || n.tagName === 'HUI-CARD') boxes.push(n); if (n.shadowRoot) walk(n.shadowRoot); } };
        walk(h.shadowRoot.querySelector('#view') || h.shadowRoot);
        const sig = boxes.slice(0, 40).map((b) => { const r = b.getBoundingClientRect(); return Math.round(r.top) + ',' + Math.round(r.left) + ',' + Math.round(r.height); }).join(';');
        settled = sig === lastSig ? settled + 1 : 0;
        lastSig = sig;
        ready = settled >= 4;
      }
      if (done) return;
      // layers built early from the device copy go in as soon as the greeting card exists (no need to wait for HA's states)
      if (hc && pendingScene && isHeaderCard(hc)) { const p = pendingScene; pendingScene = null; headerCard = card; try { showScene(hc, p); } catch (e) { /* fallback */ } }
      if (ready || performance.now() - t0 > 2500) {
        if (hc) headerCard = card;
        reveal();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  // the scene carousel: the horizontally scrolling grid right below the illustration
  let carousel = null;
  const findCarousel = (root) => {
    for (const n of root.querySelectorAll('*')) {
      if (n.tagName === 'HUI-GRID-CARD' && n.shadowRoot) {
        const r = n.shadowRoot.querySelector('#root');
        if (r && getComputedStyle(r).overflowX === 'auto') return r;
      }
      if (n.shadowRoot) { const f = findCarousel(n.shadowRoot); if (f) return f; }
    }
    return null;
  };
  // Tablet and desktop: on the Huis view the first section (the illustration) becomes a panel on the left that stays put,
  // as tall as the window (narrower when the window is tight, so the rooms keep at least 300px), and the other sections
  // fill the columns that fit next to it (HA's grid is told the new count). The panel size (--np-pw, --np-panel-h) is
  // worked out below; the header card takes its height from --np-panel-h.
  const PANEL_CSS = '@media (min-width: 871px) { ' +
    ':host([np-panel]) .wrapper { --column-count: var(--np-cols) !important; --content-column-count: var(--np-cols) !important; ' +
    'max-width: calc(var(--np-pw) + var(--column-gap) + var(--np-cols) * var(--column-max-width) + (var(--np-cols) - 1) * var(--column-gap)) !important; } ' +
    ':host([np-panel]) .container { padding-left: calc(var(--np-pw) + var(--column-gap)); } ' +
    ':host([np-panel]) .content > .section:first-child { position: fixed; z-index: 1; top: calc(var(--header-height, 56px) + var(--row-gap)); left: var(--np-left, 0px); width: var(--np-pw); } ' +
    // sections wider than one column (HA may have narrowed their span to its own count) take the whole right side
    ':host([np-panel]) .content > .section:not(:first-child):not([style*="column-span:1;"]):not([style*="column-span: 1;"]) { grid-column: 1 / -1 !important; } }';
  let panelView = null;
  const findSectionsView = (root) => {
    for (const n of root.querySelectorAll('*')) {
      if (n.tagName === 'HUI-SECTIONS-VIEW') return n;
      if (n.shadowRoot) { const f = findSectionsView(n.shadowRoot); if (f) return f; }
    }
    return null;
  };
  const setPanel = (h, on) => {
    if (!panelView || !panelView.isConnected) panelView = findSectionsView(h.shadowRoot.querySelector('#view') || h.shadowRoot);
    const sv = panelView;
    if (!sv || !sv.shadowRoot) return;
    if (!sv.shadowRoot.querySelector('style[data-np-panel]')) {
      const st = document.createElement('style');
      st.setAttribute('data-np-panel', '');
      st.textContent = PANEL_CSS;
      sv.shadowRoot.appendChild(st);
      new ResizeObserver(() => update()).observe(sv);
    }
    sv.toggleAttribute('np-panel', on);
    const wrap = sv.shadowRoot.querySelector('.wrapper');
    if (!on || !wrap) return;
    const bar = h.shadowRoot.querySelector('.header'), barH = bar ? bar.getBoundingClientRect().height : 56, gap = 32;
    const room = sv.clientWidth - 2 * gap;
    const pw = Math.max(200, Math.min((window.innerHeight - barH - 48) * 887 / 1662, room - gap - 300));
    const cols = Math.max(1, Math.min(3, Math.floor((room - pw) / (300 + gap))));
    const set = (k, v) => { if (sv.style.getPropertyValue(k) !== v) sv.style.setProperty(k, v); };
    set('--np-cols', String(cols));
    set('--np-pw', Math.round(pw) + 'px');
    set('--np-panel-h', Math.round(pw * 1662 / 887) + 'px');
    const left = Math.round(wrap.getBoundingClientRect().left + gap) + 'px';
    if (sv.style.getPropertyValue('--np-left') !== left) sv.style.setProperty('--np-left', left);
  };
  const update = () => {
    const h = ensure();
    if (!h) return;
    const onHuis = /\/mijn-huis(\/huis)?\/?$/.test(location.pathname);
    const narrow = window.innerWidth <= 870;
    const scrolled = (window.scrollY || 0) > 0;
    // the bar stays see-through over the illustration and takes the page colour once the scenes reach it
    let atScenes = false;
    if (onHuis && narrow && scrolled) {
      if (!carousel || !carousel.isConnected) carousel = findCarousel(h.shadowRoot);
      const header = h.shadowRoot.querySelector('.header');
      if (carousel && header) atScenes = carousel.getBoundingClientRect().top <= header.getBoundingClientRect().bottom;
    }
    h.toggleAttribute('np-clear', onHuis && narrow && !atScenes);
    h.toggleAttribute('np-page', onHuis && narrow && atScenes);
    setPanel(h, onHuis && !narrow);
    const ha = document.querySelector('home-assistant');
    const states = (ha && ha.hass && ha.hass.states) || {};
    if (ha && ha.hass && states['sun.sun']) { const slug = slugFor(states); setHouse(ha, slug); setOverlay(ha.hass, slug); if (onHuis) setBirds(h, slug, states); followSun(states); followMoon(ha.hass); followWind(states); }
    if (ha && ha.hass && onHuis) { checkSnow(ha); checkMeteo(ha); }
    // weather preview button next to the segmented control (Huis view only)
    h.toggleAttribute('np-huis', onHuis);
    h.toggleAttribute('np-test', !!test.on);
    const b = onHuis && test.on ? ensureButton(h) : null;
    if (b) {
      const icon = b.querySelector('ha-icon');
      const want = test.tod === 'night' && test.wx === 'Echt weer' ? 'mdi:weather-night' : (WX_ICON[test.wx] || 'mdi:weather-partly-cloudy');
      if (icon.getAttribute('icon') !== want) icon.setAttribute('icon', want);
      b.toggleAttribute('data-preview', test.wx !== 'Echt weer' || test.tod !== 'echt');
      for (const sel of b.parentElement.querySelectorAll('.np-wx-panel select')) if (sel.value !== test[sel.dataset.key]) sel.value = test[sel.dataset.key];
      const g = h.shadowRoot.querySelector('ha-tab-group');
      const track = g && g.shadowRoot && g.shadowRoot.querySelector('[part=tabs]');
      const tb = b.parentElement;
      if (track && tb) b.style.left = Math.round(track.getBoundingClientRect().right - tb.getBoundingClientRect().left + 8) + 'px';
    }
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); }
  }, { passive: true });
  // Right after loading (and after switching pages) HA builds a fresh top bar. Check every frame until our styling is
  // in, so the plain tabs never flash before the segmented control appears; after that the slow interval is enough.
  let watching = false;
  const watchForBar = () => {
    if (watching) return;
    watching = true;
    const t0 = performance.now();
    const tick = () => {
      const h = ensure();
      if (h && h.shadowRoot && h.shadowRoot.querySelector('style[data-np-clear]')) { watching = false; update(); return; }
      if (performance.now() - t0 < 15000) requestAnimationFrame(tick); else watching = false;
    };
    tick();
  };
  window.addEventListener('location-changed', () => { watchForBar(); setTimeout(update, 50); });
  window.addEventListener('popstate', () => { watchForBar(); setTimeout(update, 50); });
  window.addEventListener('resize', update);
  setInterval(() => { if (!hui || !hui.isConnected) watchForBar(); update(); }, 1500);
  watchForBar();
  update();
})();
