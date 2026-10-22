
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
    ':host([np-page]) .toolbar { border-bottom-color: transparent !important; }';
  // Tabs as a segmented control: a rounded track with a filled pill behind the active tab, no underline.
  const segCss = ' /*np-seg*/ ' +
    'ha-tab-group::part(tabs) { transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1); gap: 2px; padding: 3px; border-radius: 999px; background: rgba(var(--rgb-primary-text-color), 0.06); margin: 8px auto 0 auto; width: fit-content; height: 40px !important; box-sizing: border-box; align-items: center !important; border: none !important; } ' +
    'ha-tab-group::part(nav) { display: flex; align-items: center; justify-content: center; height: 100%; } ' +
    'ha-tab-group-tab { height: 34px !important; min-height: 34px; margin: 0 !important; border-radius: 999px; border-bottom: none !important; box-shadow: none !important; transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1); } ' +
    'ha-tab-group-tab::part(base) { height: 34px; padding: 0 14px; border-radius: 999px; transition: color 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important; } ' +
    'ha-tab-group-tab[active] { background: rgba(var(--rgb-primary-text-color), 0.12); } ' +
    ':host([np-clear]) ha-tab-group::part(tabs) { background: rgba(255, 255, 255, 0.16); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); } ' +
    ':host([np-clear]) ha-tab-group-tab[active] { background: rgba(255, 255, 255, 0.3); } ' +
    ':host([np-clear]) ha-tab-group-tab { color: #fff !important; } ' +
    // weather preview button, right next to the segmented control
    '.np-wx-btn { position: absolute; top: 8px; width: 40px; height: 40px; padding: 0; border: none; border-radius: 999px; cursor: pointer; ' +
    'display: none; align-items: center; justify-content: center; color: inherit; background: rgba(var(--rgb-primary-text-color), 0.06); ' +
    'transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1); -webkit-tap-highlight-color: transparent; } ' +
    '.np-wx-btn ha-icon { --mdc-icon-size: 22px; } ' +
    '.np-wx-btn[data-preview] { box-shadow: inset 0 0 0 2px currentColor; } ' +
    ':host([np-huis][np-test]) .np-wx-btn { display: flex; } ' +
    '.np-wx-panel { position: absolute; top: 56px; right: 8px; z-index: 10; display: none; flex-direction: column; gap: 10px; width: 220px; padding: 14px; border-radius: 16px; ' +
    'background: var(--card-background-color, #fff); color: var(--primary-text-color); box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28); font: 14px var(--ha-font-family-body, Roboto, sans-serif); } ' +
    ':host([np-huis][np-test]) .np-wx-panel[open] { display: flex; } ' +
    '.np-wx-panel label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--secondary-text-color); } ' +
    '.np-wx-panel select { font: inherit; font-size: 15px; color: var(--primary-text-color); background: var(--secondary-background-color, #f2f2f2); border: none; border-radius: 10px; padding: 8px 10px; } ' +
    '.np-wx-panel button { font: inherit; font-size: 14px; border: none; border-radius: 10px; padding: 9px 10px; cursor: pointer; color: var(--text-primary-color, #fff); background: var(--primary-color); } ' +
    ':host([np-clear]) .np-wx-btn { background: rgba(255, 255, 255, 0.16); color: #fff; -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }';
  const WX_ICON = { 'Echt weer': 'mdi:weather-partly-cloudy', sunny: 'mdi:weather-sunny', partlycloudy: 'mdi:weather-partly-cloudy', cloudy: 'mdi:weather-cloudy',
    fog: 'mdi:weather-fog', rainy: 'mdi:weather-rainy', pouring: 'mdi:weather-pouring', snowy: 'mdi:weather-snowy', 'snowy-rainy': 'mdi:weather-snowy-rainy',
    lightning: 'mdi:weather-lightning', 'lightning-rainy': 'mdi:weather-lightning-rainy', windy: 'mdi:weather-windy', 'windy-variant': 'mdi:weather-windy-variant', snowsun: 'mdi:snowflake', sleet: 'mdi:weather-snowy-rainy' };
  const WX_NAME = { 'Echt weer': 'Echt weer', sunny: 'Zonnig', partlycloudy: 'Half bewolkt', cloudy: 'Bewolkt', fog: 'Mist', rainy: 'Regen',
    pouring: 'Stortregen', snowy: 'Sneeuw', 'snowy-rainy': 'Natte sneeuw', lightning: 'Onweer', 'lightning-rainy': 'Onweersbui', windy: 'Winderig', 'windy-variant': 'Winderig en bewolkt', snowsun: 'Sneeuw zonnig', sleet: 'Natte sneeuw met sneeuwdek' };
  const TOD_NAME = { echt: 'Volgt de zon', dawn: 'Ochtendschemer', day: 'Dag', dusk: 'Avondschemer', night: 'Nacht' };
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
    if (!hc || !(hc.querySelector('np-scene') || getComputedStyle(hc, '::before').backgroundImage.includes('huis-'))) return;
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
  const SIG_KEY = 'np-house-sig-14';  // bump when the SVGs are replaced, so browsers fetch the new ones
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
  // an empty sky (it is tiny inline code and would otherwise always win the race).
  let houseReady = false;
  const whenLoaded = (url) => new Promise((ok) => { const i = new Image(); i.onload = i.onerror = () => ok(); i.src = url; });
  const showOverlay = () => { houseReady = true; if (last.ov) setVar('--np-ov', last.ov); };
  const applyHouse = (slug, url) => {
    setVar('--np-sky', SKY[slug]);
    houseSlug = slug;
    remember('house', url); remember('sky', SKY[slug]);
    whenLoaded(url).then(() => { setVar('--np-house', 'url("' + url + '")'); showOverlay(); });
  };
  if (last.house && last.sky) {
    setVar('--np-sky', last.sky);
    whenLoaded(last.house).then(() => { if (!houseReady) { setVar('--np-house', 'url("' + last.house + '")'); showOverlay(); } });
  }
  // Window light and the calico cat, drawn over the illustration (pieces are URL-encoded SVG, 2400-wide house coordinates).
  // Downstairs is drawn lit in every illustration, so it only gets darkened when its lamps are off;
  // upstairs gets warm light when its lamps are on, and is only darkened on the clear nights where it is drawn lit.
  const OV = {"head":"%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%20887%201662%27%3E%3Cdefs%3E%3CradialGradient%20id%3D%27w%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.7%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23fff1bf%27%2F%3E%3Cstop%20offset%3D%270.6%27%20stop-color%3D%27%23f8cf6f%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23e9a944%27%2F%3E%3C%2FradialGradient%3E%3ClinearGradient%20id%3D%27g%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%270%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23a7babb%27%2F%3E%3Cstop%20offset%3D%270.55%27%20stop-color%3D%27%237f9497%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%2355696d%27%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%27n%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%270%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%232a2e48%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%2316182c%27%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cg%20transform%3D%27translate%280%20467.42%29%20scale%280.369583%29%27%3E","upOn":"%3Crect%20x%3D%27841.2%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23w%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%27975.6%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23w%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%271303.2%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23w%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%271437.6%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23w%29%27%20rx%3D%272%27%2F%3E","upOff":"%3Crect%20x%3D%27841.2%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23n%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%27975.6%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23n%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%271303.2%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23n%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%271437.6%27%20y%3D%271324%27%20width%3D%27120%27%20height%3D%27170.4%27%20fill%3D%27url%28%23n%29%27%20rx%3D%272%27%2F%3E","downDay":"%3Crect%20x%3D%271059.6%27%20y%3D%271798%27%20width%3D%27349.2%27%20height%3D%27284.4%27%20fill%3D%27url%28%23g%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%271423.2%27%20y%3D%271798%27%20width%3D%27134.4%27%20height%3D%27284.4%27%20fill%3D%27url%28%23g%29%27%20rx%3D%272%27%2F%3E","downNight":"%3Crect%20x%3D%271059.6%27%20y%3D%271798%27%20width%3D%27349.2%27%20height%3D%27284.4%27%20fill%3D%27url%28%23n%29%27%20rx%3D%272%27%2F%3E%3Crect%20x%3D%271423.2%27%20y%3D%271798%27%20width%3D%27134.4%27%20height%3D%27284.4%27%20fill%3D%27url%28%23n%29%27%20rx%3D%272%27%2F%3E","cat":"%3Cg%20transform%3D%27translate%28860%201393%29%27%3E%3Cdefs%3E%3CclipPath%20id%3D%27cc%27%3E%3Cellipse%20cx%3D%2738%27%20cy%3D%2774%27%20rx%3D%2725%27%20ry%3D%2725%27%2F%3E%3Crect%20x%3D%2713%27%20y%3D%2774%27%20width%3D%2750%27%20height%3D%2726%27%20rx%3D%276%27%2F%3E%3Ccircle%20cx%3D%2738%27%20cy%3D%2738%27%20r%3D%2717%27%2F%3E%3Cpath%20d%3D%27M23%2030%20L26%209%20L36%2023%20Z%20M40%2023%20L50%209%20L53%2030%20Z%27%2F%3E%3C%2FclipPath%3E%3C%2Fdefs%3E%3Cg%3E%3CanimateTransform%20attributeName%3D%27transform%27%20type%3D%27rotate%27%20dur%3D%279s%27%20repeatCount%3D%27indefinite%27%20calcMode%3D%27spline%27%20keyTimes%3D%270%3B0.05%3B0.1%3B0.15%3B0.2%3B0.25%3B1%27%20values%3D%270%2058%2093%3B-22%2058%2093%3B8%2058%2093%3B-18%2058%2093%3B6%2058%2093%3B0%2058%2093%3B0%2058%2093%27%20keySplines%3D%270.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%3B0%200%201%201%27%2F%3E%3Cpath%20d%3D%27M58%2093%20C80%2095%2082%2070%2070%2058%27%20fill%3D%27none%27%20stroke%3D%27%235b4636%27%20stroke-width%3D%279%27%20stroke-linecap%3D%27round%27%2F%3E%3Cpath%20d%3D%27M58%2093%20C80%2095%2082%2070%2070%2058%27%20fill%3D%27none%27%20stroke%3D%27%23e08a3c%27%20stroke-width%3D%276%27%20stroke-linecap%3D%27round%27%2F%3E%3Cpath%20d%3D%27M73%2066%20C72%2062%2071%2060%2070%2058%27%20fill%3D%27none%27%20stroke%3D%27%232a2420%27%20stroke-width%3D%276%27%20stroke-linecap%3D%27round%27%2F%3E%3C%2Fg%3E%3Cg%20fill%3D%27%23f4ecdc%27%20stroke%3D%27%235b4636%27%20stroke-width%3D%273%27%3E%3Cellipse%20cx%3D%2738%27%20cy%3D%2774%27%20rx%3D%2725%27%20ry%3D%2725%27%2F%3E%3Crect%20x%3D%2713%27%20y%3D%2774%27%20width%3D%2750%27%20height%3D%2726%27%20rx%3D%276%27%2F%3E%3Ccircle%20cx%3D%2738%27%20cy%3D%2738%27%20r%3D%2717%27%2F%3E%3Cpath%20d%3D%27M23%2030%20L26%209%20L36%2023%20Z%20M40%2023%20L50%209%20L53%2030%20Z%27%2F%3E%3C%2Fg%3E%3Cg%20fill%3D%27%23f4ecdc%27%3E%3Cellipse%20cx%3D%2738%27%20cy%3D%2774%27%20rx%3D%2725%27%20ry%3D%2725%27%2F%3E%3Crect%20x%3D%2713%27%20y%3D%2774%27%20width%3D%2750%27%20height%3D%2726%27%20rx%3D%276%27%2F%3E%3Ccircle%20cx%3D%2738%27%20cy%3D%2738%27%20r%3D%2717%27%2F%3E%3Cpath%20d%3D%27M23%2030%20L26%209%20L36%2023%20Z%20M40%2023%20L50%209%20L53%2030%20Z%27%2F%3E%3C%2Fg%3E%3Cg%20clip-path%3D%27url%28%23cc%29%27%3E%3Cellipse%20cx%3D%2722%27%20cy%3D%2780%27%20rx%3D%2714%27%20ry%3D%2717%27%20fill%3D%27%23e08a3c%27%2F%3E%3Cellipse%20cx%3D%2756%27%20cy%3D%2768%27%20rx%3D%2711%27%20ry%3D%2713%27%20fill%3D%27%232a2420%27%2F%3E%3Cpath%20d%3D%27M38%2018%20L56%208%20L58%2040%20C50%2034%2044%2030%2038%2030%20Z%27%20fill%3D%27%23e08a3c%27%2F%3E%3Cpath%20d%3D%27M18%208%20L36%2022%20C34%2034%2026%2040%2020%2040%20Z%27%20fill%3D%27%232a2420%27%2F%3E%3C%2Fg%3E%3Ccircle%20cx%3D%2732%27%20cy%3D%2739%27%20r%3D%272.8%27%20fill%3D%27%237fb547%27%2F%3E%3Ccircle%20cx%3D%2744%27%20cy%3D%2739%27%20r%3D%272.8%27%20fill%3D%27%237fb547%27%2F%3E%3Ccircle%20cx%3D%2732%27%20cy%3D%2739%27%20r%3D%271.1%27%20fill%3D%27%231b1b1b%27%2F%3E%3Ccircle%20cx%3D%2744%27%20cy%3D%2739%27%20r%3D%271.1%27%20fill%3D%27%231b1b1b%27%2F%3E%3Cpath%20d%3D%27M36%2045%20L40%2045%20L38%2047.5%20Z%27%20fill%3D%27%23e79aa6%27%2F%3E%3C%2Fg%3E","sil":"%3Cg%20transform%3D%27translate%28860%201393%29%27%20fill%3D%27%230d0c1b%27%3E%3Cellipse%20cx%3D%2738%27%20cy%3D%2774%27%20rx%3D%2725%27%20ry%3D%2725%27%2F%3E%3Crect%20x%3D%2713%27%20y%3D%2774%27%20width%3D%2750%27%20height%3D%2726%27%20rx%3D%276%27%2F%3E%3Ccircle%20cx%3D%2738%27%20cy%3D%2738%27%20r%3D%2717%27%2F%3E%3Cpath%20d%3D%27M23%2030%20L26%209%20L36%2023%20Z%20M40%2023%20L50%209%20L53%2030%20Z%27%2F%3E%3Cg%3E%3CanimateTransform%20attributeName%3D%27transform%27%20type%3D%27rotate%27%20dur%3D%2711s%27%20repeatCount%3D%27indefinite%27%20calcMode%3D%27spline%27%20keyTimes%3D%270%3B0.05%3B0.1%3B0.15%3B0.2%3B0.25%3B1%27%20values%3D%270%2058%2093%3B-22%2058%2093%3B8%2058%2093%3B-18%2058%2093%3B6%2058%2093%3B0%2058%2093%3B0%2058%2093%27%20keySplines%3D%270.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%3B0.4%200%200.6%201%3B0%200%201%201%27%2F%3E%3Cpath%20d%3D%27M58%2093%20C80%2095%2082%2070%2070%2058%27%20fill%3D%27none%27%20stroke%3D%27%230d0c1b%27%20stroke-width%3D%277%27%20stroke-linecap%3D%27round%27%2F%3E%3C%2Fg%3E%3Ccircle%20cx%3D%2732%27%20cy%3D%2738%27%20r%3D%272.6%27%20fill%3D%27%23ffd866%27%2F%3E%3Ccircle%20cx%3D%2744%27%20cy%3D%2738%27%20r%3D%272.6%27%20fill%3D%27%23ffd866%27%2F%3E%3C%2Fg%3E","tail":"%3C%2Fg%3E%3C%2Fsvg%3E"};
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
    const svg = OV.head + (up ? OV.upOn : (LIT_UP.includes(slug) ? OV.upOff : '')) +
      (down ? '' : (tod === 'day' ? OV.downDay : OV.downNight)) + (up || tod === 'day' ? OV.cat : OV.sil) + OV.tail;
    const v = 'url("data:image/svg+xml;charset=utf-8,' + svg + '")';
    if (last.ov !== v) remember('ov', v);
    if (houseReady) setVar('--np-ov', v);
  };
  const setHouse = async (ha, slug) => {
    if (slug === houseSlug || slug === pending) return;
    pending = slug;
    try {
      const path = '/media/local/huis-' + slug + '.svg';
      let s = sigs[slug];
      if (!s || s.exp < Date.now() + 3600e3) {
        const r = await ha.hass.callWS({ type: 'auth/sign_path', path, expires: 7 * 86400 });
        s = { url: r.path, exp: Date.now() + 7 * 86400e3 };
        sigs[slug] = s;
        try { localStorage.setItem(SIG_KEY, JSON.stringify(sigs)); } catch (e) { /* private mode */ }
      }
      // download it first so the swap does not flash an empty sky. Only the file is fetched (into the HTTP cache):
      // a hidden Image would keep a decoded, animated copy of every drawing around and could stop the real one from animating.
      let text = null;
      try { text = await fetch(s.url, { cache: 'force-cache' }).then((r) => r.text()); } catch (e) { /* the background loads it anyway */ }
      if (pending === slug) {
        applyHouse(slug, s.url);
        // split it into layers; if anything goes wrong the plain (static) drawing stays visible
        try {
          if (!headerCard || !headerCard.isConnected) headerCard = findHeaderCard(hui ? hui.shadowRoot : document);
          const hc = headerCard && headerCard.shadowRoot && headerCard.shadowRoot.querySelector('ha-card');
          // build the layers now; if the dashboard has not drawn the header card yet (right after a refresh),
          // keep them and let the update loop put them in as soon as the card is there
          if (text) { const built = buildScene(text, slug); if (hc) showScene(hc, built); else pendingScene = built; }
        } catch (e) { console.warn('np-scene', e); }
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
      if (L.running) L.running.play();
    }
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) restartHouse(); });
  window.addEventListener('pageshow', (ev) => { if (ev.persisted) restartHouse(); });
  // Birds now and then, and a dog walking over the grass: separate layers over the illustration (moved by the page,
  // so they cost almost nothing), only in dry weather and not at night. Wing flap and walk cycle are inside the small SVGs.
  const NOTE1 = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2014%2020%22%3E%3Cg%20fill%3D%22%23fff4d6%22%3E%3Cellipse%20cx%3D%224.6%22%20cy%3D%2216%22%20rx%3D%224.2%22%20ry%3D%223%22%20transform%3D%22rotate%28-22%204.6%2016%29%22%2F%3E%3Crect%20x%3D%227.4%22%20y%3D%222%22%20width%3D%221.5%22%20height%3D%2214%22%20rx%3D%220.7%22%2F%3E%3Cpath%20d%3D%22M8.2%202%20C10%204.5%2013.6%205.5%2012.8%2010.2%20C12.4%208%2010.6%207%208.2%206.6%20Z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')";
  const NOTE2 = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2022%2020%22%3E%3Cg%20fill%3D%22%23fff4d6%22%3E%3Cellipse%20cx%3D%224.4%22%20cy%3D%2216.2%22%20rx%3D%224%22%20ry%3D%222.9%22%20transform%3D%22rotate%28-22%204.4%2016.2%29%22%2F%3E%3Cellipse%20cx%3D%2216.4%22%20cy%3D%2214.2%22%20rx%3D%224%22%20ry%3D%222.9%22%20transform%3D%22rotate%28-22%2016.4%2014.2%29%22%2F%3E%3Crect%20x%3D%227.2%22%20y%3D%223.4%22%20width%3D%221.5%22%20height%3D%2212.8%22%20rx%3D%220.7%22%2F%3E%3Crect%20x%3D%2219.2%22%20y%3D%221.4%22%20width%3D%221.5%22%20height%3D%2212.8%22%20rx%3D%220.7%22%2F%3E%3Cpath%20d%3D%22M7.2%203.4%20L20.7%201.4%20L20.7%204.4%20L7.2%206.4%20Z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')";
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
  const BIRD_CSS = 'np-birds { position: absolute; z-index: -1; pointer-events: none; left: 0; width: 100%; overflow: hidden; display: block; ' +
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
        if (hc && (hc.querySelector('np-scene, np-birds') || getComputedStyle(hc, '::before').backgroundImage.includes('huis-'))) return n;
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
    if (want) { pendingScene = null; try { showScene(hc, want); } catch (e) { /* plain drawing stays */ } }
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
    '-webkit-mask: linear-gradient(to bottom, #000 calc(100% - 48px), transparent 100%) top / 100% 100% no-repeat; mask: linear-gradient(to bottom, #000 calc(100% - 48px), transparent 100%) top / 100% 100% no-repeat; } ' +
    'np-scene .pin { position: absolute; inset: 0; background: var(--np-sky, #2c3245); will-change: transform; ' +
    'animation: np-pin linear both; animation-timeline: scroll(root); animation-range: 0 1000px; } ' +
    '@keyframes np-pin { from { transform: translateY(0); } to { transform: translateY(1000px); } } ' +
    'np-scene .pin::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 86%, color-mix(in srgb, var(--primary-background-color) 15%, transparent) 90%, ' +
    'color-mix(in srgb, var(--primary-background-color) 50%, transparent) 94%, color-mix(in srgb, var(--primary-background-color) 85%, transparent) 98%, var(--primary-background-color) 100%); } ' +
    'np-scene .stage { position: absolute; left: 0; bottom: 0; width: 100%; aspect-ratio: 887 / 1662; } ' +
    'np-scene .stage > i { position: absolute; display: block; background: center / 100% 100% no-repeat; } ' +
    'np-scene .stage > i.full { inset: 0; } np-scene .stage > i.mask { overflow: hidden; } ' +
    'np-scene .stage > i.mask > i { position: absolute; left: 0; width: 100%; display: block; background: center / 100% 100% no-repeat; } ' +
    'np-scene .stage > i.ov { background-image: var(--np-ov, none); } ' +
    // the old single-image layer goes away completely (also its sky colour, which would shine through the bottom fade)
    'ha-card[np-layered]::before { background: none !important; } ' +
    // scenes sit a bit lower than before so more of the grass (and the dog) shows; phones only
    '@media (max-width: 870px) { ha-card[np-layered] { margin-bottom: var(--np-scenes-offset, calc(-20.44vw - 4px)) !important; } }';
  const esc = (v) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const openTag = (el, skip) => '<' + el.localName + [...el.attributes].filter((a) => !skip.includes(a.name) && !a.name.startsWith('data-np'))
    .map((a) => ' ' + a.name + '="' + esc(a.value) + '"').join('') + '>';
  const nums = (s) => s.split(/\s+/).map(Number);
  let scene = null;  // { slug, urls, layers: [{ el, kind, box, anim }] }
  let pendingScene = null;  // built before the header card existed
  let sceneToken = 0;
  const buildScene = (text, slug) => {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const root = doc.documentElement;
    if (root.localName !== 'svg') throw new Error('not an svg');
    // paint units in drawing order (definitions are kept in every layer, never counted)
    const units = [];
    const walk = (el) => {
      for (const c of el.children) {
        if (NONPAINT.has(c.localName)) continue;
        if (c.hasAttribute('data-np') || c.hasAttribute('data-np-cloud') || !c.firstElementChild || c.localName === 'use') units.push(c);
        else walk(c);
      }
    };
    walk(root);
    const segs = [];
    let cur = [];
    units.forEach((u, i) => {
      u.setAttribute('data-np-i', i);
      const kind = u.getAttribute('data-np') === 'light' ? null : u.getAttribute('data-np');
      if (kind) {
        if (cur.length) { segs.push({ kind: 'static', ids: cur }); cur = []; }
        if (u.getAttribute('display') !== 'none') segs.push({ kind, el: u });
      } else {
        cur.push(String(i));
        if (u.hasAttribute('data-np-break')) { segs.push({ kind: 'static', ids: cur }); cur = []; }
      }
    });
    if (cur.length) segs.push({ kind: 'static', ids: cur });
    const ser = new XMLSerializer();
    const defs = [...root.querySelectorAll('defs, mask, clipPath, linearGradient, radialGradient, filter, pattern')]
      .filter((d) => !d.parentElement.closest('defs, mask, clipPath, linearGradient, radialGradient, filter, pattern'))
      .map((d) => ser.serializeToString(d)).join('');
    const urls = [];
    const blob = (svg) => { const u = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); urls.push(u); return u; };
    // one moving part on its own: its ancestors (for inherited paint and transforms, but without the canvas clip,
    // because the part itself moves) plus all definitions
    const partSvg = (el, viewBox, extra, keepClip) => {
      const chain = [];
      for (let p = el.parentElement; p && p !== root; p = p.parentElement) chain.unshift(p);
      const self = el.cloneNode(true);
      for (const a of [...self.attributes]) if (a.name.startsWith('data-np')) self.removeAttribute(a.name);
      // keep the drawing's own root attributes (Figma sets fill="none" there, which the strokes rely on)
      const rootAttrs = [...root.attributes].filter((a) => !['width', 'height', 'viewBox', 'xmlns'].includes(a.name))
        .map((a) => ' ' + a.name + '="' + esc(a.value) + '"').join('');
      return '<svg xmlns="http://www.w3.org/2000/svg"' + rootAttrs + ' viewBox="' + viewBox + '" preserveAspectRatio="none">' + defs +
        chain.map((p) => openTag(p, keepClip ? ['id'] : ['clip-path', 'mask', 'id'])).join('') + ser.serializeToString(self) + (extra || '') +
        chain.map((p) => '</' + p.localName + '>').reverse().join('') + '</svg>';
    };
    const layers = [];
    for (const sg of segs) {
      const L = { kind: sg.kind };
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
      if (sg.kind === 'fall') {
        const d = Number(el.getAttribute('data-d')), copy = el.getAttribute('data-copy') === '1';
        L.box = [0, -d, 887, 1662];
        L.url = blob(partSvg(el, '0 ' + -d + ' 887 ' + (1662 + d), copy ? '<use href="#' + id + '" y="' + -d + '"/>' : ''));
        L.anim = (u) => [[{ transform: 'translateY(0)' }, { transform: 'translateY(' + d * u + 'px)' }], { duration: dur, iterations: Infinity }];
      } else if (sg.kind === 'lamp') {
        const d = Number(el.getAttribute('data-d'));
        const [x0, y0, x1, y1] = box;
        L.box = box; L.inner = [y0 - d, y1];
        L.url = blob(partSvg(el, x0 + ' ' + (y0 - d) + ' ' + (x1 - x0) + ' ' + (y1 - y0 + d), '<use href="#' + id + '" y="' + -d + '"/>'));
        L.anim = (u) => [[{ transform: 'translateY(0)' }, { transform: 'translateY(' + d * u + 'px)' }], { duration: dur, iterations: Infinity }];
      } else if (sg.kind === 'streak') {
        const W = Number(el.getAttribute('data-w'));
        L.box = [-W, box[1], 887, box[3]];
        L.url = blob(partSvg(el, -W + ' ' + box[1] + ' ' + (887 + W) + ' ' + (box[3] - box[1]), '<use href="#' + id + '" x="' + -W + '"/>'));
        L.anim = (u) => [[{ transform: 'translateX(0)' }, { transform: 'translateX(' + W * u + 'px)' }], { duration: dur, iterations: Infinity }];
      } else if (sg.kind === 'leaf') {
        const [a, b, rise, spin, ldur, begin] = nums(el.getAttribute('data-k'));
        L.box = box;
        L.url = blob(partSvg(el, box[0] + ' ' + box[1] + ' ' + (box[2] - box[0]) + ' ' + (box[3] - box[1])));
        L.anim = (u) => [[{ transform: 'translate(' + a * u + 'px,' + rise * 0.4 * u + 'px) rotate(0deg)' },
          { transform: 'translate(' + (a + b) / 2 * u + 'px,' + -rise * 0.3 * u + 'px) rotate(' + spin / 2 + 'deg)' },
          { transform: 'translate(' + b * u + 'px,' + -rise * u + 'px) rotate(' + spin + 'deg)' }],
          { duration: ldur * 1000, iterations: Infinity, delay: -begin * 1000 }];
      } else if (sg.kind === 'cloud') {
        // sways back and forth (or breathes, for clouds running edge to edge), smooth and composited
        L.box = box;
        L.url = blob(partSvg(el, box[0] + ' ' + box[1] + ' ' + (box[2] - box[0]) + ' ' + (box[3] - box[1])));
        const opt = { duration: dur, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: -Number(el.getAttribute('data-begin') || 0) * 1000 };
        if (el.hasAttribute('data-breathe')) {
          const k = 1 + Number(el.getAttribute('data-breathe'));
          L.anim = () => [[{ transform: 'scaleX(1)' }, { transform: 'scaleX(' + k + ')' }], opt];
        } else {
          const l = Number(el.getAttribute('data-l')), r = Number(el.getAttribute('data-r'));
          L.anim = (u) => [[{ transform: 'translateX(' + -l * u + 'px)' }, { transform: 'translateX(' + r * u + 'px)' }], opt];
        }
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
    layers.splice(at, 0, { kind: 'ov' });
    return { slug, urls, layers };
  };
  let lamps = { down: true, up: true };
  const setLights = (down, up) => {
    lamps = { down, up };
    if (scene) for (const L of scene.layers) if (L.urlOff && L.node) L.node.style.backgroundImage = 'url("' + ((L.room === 'up' ? up : down) ? L.url : L.urlOff) + '")';
  };
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      if (L.anim && !still) {
        const [kf, opt] = L.anim(u);
        if (L.running) L.running.effect.setKeyframes(kf);
        else L.running = L.target.animate(kf, opt);
      }
    }
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
    }
    const stage = ns.querySelector('.stage');
    const frag = document.createDocumentFragment();
    for (const L of next.layers) {
      if (L.running) { L.running.cancel(); L.running = null; }
      const el = document.createElement('i');
      L.node = L.target = el;
      if (L.kind === 'static' || L.kind === 'ov') el.className = 'full' + (L.kind === 'ov' ? ' ov' : '');
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
      if (L.anim) el.style.willChange = L.kind === 'bolt' || L.kind === 'glow' || L.kind === 'dark' ? 'opacity' : 'transform';
      if (L.kind === 'leaf') el.style.transformOrigin = 'center';
      frag.appendChild(el);
    }
    // swap in the new layers only when all of them are decoded, so they appear together (at most 4 s wait)
    const token = ++sceneToken;
    const ready = Promise.race([Promise.all(next.urls.map(whenLoaded)), new Promise((ok) => setTimeout(ok, 4000))]);
    ready.then(() => {
      if (token !== sceneToken) return;  // a newer drawing was picked meanwhile
      const old = scene;
      stage.replaceChildren(frag);
      scene = next;
      placeScene(stage);
      hc.setAttribute('np-layered', '');
      setLights(lamps.down, lamps.up);
      showOverlay();
      if (old && old !== next) setTimeout(() => old.urls.forEach((u) => URL.revokeObjectURL(u)), 1000);
    });
  };
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
    if (hui && hui.shadowRoot && !hui.shadowRoot.querySelector('style[data-np-clear]')) {
      const s = document.createElement('style');
      s.setAttribute('data-np-clear', '');
      s.textContent = css + segCss;
      hui.shadowRoot.appendChild(s);
    }
    return hui;
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
    const ha = document.querySelector('home-assistant');
    const states = (ha && ha.hass && ha.hass.states) || {};
    if (ha && ha.hass && states['sun.sun']) { const slug = slugFor(states); setHouse(ha, slug); setOverlay(ha.hass, slug); if (onHuis) setBirds(h, slug, states); }
    if (ha && ha.hass && onHuis) checkSnow(ha);
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
  window.addEventListener('location-changed', () => setTimeout(update, 50));
  window.addEventListener('popstate', () => setTimeout(update, 50));
  window.addEventListener('resize', update);
  setInterval(update, 1500);
  update();
})();
