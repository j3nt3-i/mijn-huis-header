  // ---- People ------------------------------------------------------------------------------------------------
  // Now and then someone passes: walking or cycling on the little street behind the hedge (only the upper body shows
  // above it), or walking a dog over the grass. In the rain walkers carry an umbrella and nobody cycles.
  // Figures are small flat SVGs in the drawing's palette, built here with random colours; legs, arms and wheels move
  // with SMIL inside the tiny image, the walk across the picture is a page animation (composited).
  const PEOPLE_COLORS = {
    coat: ['#c0564b', '#3f6e8c', '#d79b3f', '#5c7a4f', '#7a5a8c', '#2f3b4c', '#b8746a', '#4f8f88'],
    pants: ['#2c3440', '#3d4a5c', '#4a3f38', '#24303a', '#5a5047'],
    skin: ['#f1c9a5', '#d9a47c', '#a8724f', '#7a4f35', '#f5d6bb'],
    hair: ['#2a2420', '#5b3a24', '#a8743f', '#d8c08a', '#8a8a8a', '#1d1d1f'],
    umbrella: ['#d64545', '#2f6fb3', '#f0b429', '#3a3a3a', '#7d4fb3', '#2e9c6a'],
  };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const svgUri = (s) => 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s) + '")';
  // a walking person, facing right, feet at the bottom of a 44 x 136 box (drawing units: about 1.75 m tall)
  const walkerSVG = (c, umbrella) => {
    const step = (a, b, dur, cx, cy) => `<animateTransform attributeName="transform" type="rotate" values="${a} ${cx} ${cy};${b} ${cx} ${cy};${a} ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite"/>`;
    const leg = (fill, a, b) => `<g>${step(a, b, 1.1, 22, 84)}<rect x="18.5" y="84" width="7" height="44" rx="3.5" fill="${fill}"/><path d="M18 126 h12 a3 3 0 0 1 0 6 h-12 z" fill="#1f1f22"/></g>`;
    const backArm = umbrella ? '' : `<g>${step(18, -18, 1.1, 22, 58)}<rect x="19" y="56" width="6" height="30" rx="3" fill="${c.coatDark}"/></g>`;
    const frontArm = umbrella
      ? `<path d="M24 60 L33 50 L33 46" fill="none" stroke="${c.coat}" stroke-width="6" stroke-linecap="round"/><circle cx="33" cy="45" r="3" fill="${c.skin}"/>`
      : `<g>${step(-18, 18, 1.1, 22, 58)}<rect x="19" y="56" width="6" height="30" rx="3" fill="${c.coat}"/><circle cx="22" cy="86" r="3" fill="${c.skin}"/></g>`;
    const brolly = umbrella
      ? `<line x1="33" y1="47" x2="33" y2="2" stroke="#3a3a3a" stroke-width="1.6"/><path d="M5 14 Q33 -16 61 14 Q54 9 47 14 Q40 9 33 14 Q26 9 19 14 Q12 9 5 14 Z" fill="${c.umbrella}"/><path d="M33 -2 L33 -6" stroke="#3a3a3a" stroke-width="1.6"/>`
      : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${umbrella ? '-4 -8 70 144' : '0 0 44 136'}"><g>` +
      `<animateTransform attributeName="transform" type="translate" values="0 0;0 -1.2;0 0;0 -1.2;0 0" dur="1.1s" repeatCount="indefinite"/>` +
      leg(c.pantsDark, 20, -20) + backArm + leg(c.pants, -20, 20) +
      `<rect x="12" y="52" width="21" height="38" rx="8" fill="${c.coat}"/>` +
      `<rect x="19" y="44" width="7" height="10" rx="3" fill="${c.skin}"/>` +
      `<circle cx="23" cy="36" r="10" fill="${c.skin}"/>` +
      `<path d="M13 35 Q13 23 24 23 Q34 23 34 33 Q28 29 22 30 Q17 31 16 38 Z" fill="${c.hair}"/>` +
      `<circle cx="28.5" cy="36" r="1.2" fill="#1d1d1f"/>` +
      frontArm + brolly + `</g></svg>`;
  };
  // a cyclist, facing right, wheels on the ground, 96 x 120 box
  const cyclistSVG = (c) => {
    const spin = `<animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="0.9s" repeatCount="indefinite"/>`;
    const wheel = (x) => `<g transform="translate(${x} 102)"><circle r="16" fill="none" stroke="#2a2a2e" stroke-width="3"/><g>${spin}<path d="M-15 0H15M0 -15V15M-10.6 -10.6L10.6 10.6M-10.6 10.6L10.6 -10.6" stroke="#6d6d74" stroke-width="1"/></g><circle r="2" fill="#6d6d74"/></g>`;
    const legs = (fill, phase) => `<g><animateTransform attributeName="transform" type="rotate" values="${-10 + phase} 46 70;${22 - phase} 46 70;${-10 + phase} 46 70" dur="0.9s" repeatCount="indefinite"/>` +
      `<rect x="43" y="68" width="7" height="22" rx="3.5" fill="${fill}" transform="rotate(-35 46 70)"/></g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 120">` +
      wheel(18) + wheel(78) +
      `<path d="M18 102 L40 74 L66 74 L78 102 M40 74 L50 102 L66 74 M50 102 L18 102" fill="none" stroke="${c.bike}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M66 74 L70 60 M64 60 H76" stroke="#2a2a2e" stroke-width="3" stroke-linecap="round"/><path d="M36 70 H46" stroke="#2a2a2e" stroke-width="4" stroke-linecap="round"/>` +
      legs(c.pantsDark, 14) + legs(c.pants, 0) +
      `<path d="M44 70 L56 40" stroke="${c.coat}" stroke-width="13" stroke-linecap="round"/>` +
      `<path d="M55 44 L70 58" stroke="${c.coat}" stroke-width="5.5" stroke-linecap="round"/><circle cx="71" cy="59" r="2.8" fill="${c.skin}"/>` +
      `<circle cx="61" cy="27" r="9.5" fill="${c.skin}"/><path d="M51 26 Q52 15 62 15 Q71 16 71 25 Q65 21 59 22 Q54 23 54 30 Z" fill="${c.hair}"/><circle cx="66" cy="27" r="1.2" fill="#1d1d1f"/>` +
      `</svg>`;
  };
  // someone walking a small dog on a leash (dog ahead, on the right)
  const dogWalkerSVG = (c, umbrella) => {
    const person = walkerSVG(c, umbrella).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    const dogInner = (typeof DOG_SVG === 'string' ? DOG_SVG : '').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -8 140 144">${person}` +
      `<path d="M${umbrella ? 34 : 23} ${umbrella ? 47 : 86} Q60 ${umbrella ? 96 : 104} 104 112" fill="none" stroke="#3a2a22" stroke-width="1.2"/>` +
      `<g transform="translate(76 104) scale(0.62)">${dogInner}</g></svg>`;
  };
  const shade = (hex, f) => '#' + hex.slice(1).match(/../g).map((x) => Math.max(0, Math.min(255, Math.round(parseInt(x, 16) * f))).toString(16).padStart(2, '0')).join('');
  const newColors = () => {
    const coat = pick(PEOPLE_COLORS.coat), pants = pick(PEOPLE_COLORS.pants);
    return { coat, coatDark: shade(coat, 0.78), pants, pantsDark: shade(pants, 0.8), skin: pick(PEOPLE_COLORS.skin), hair: pick(PEOPLE_COLORS.hair),
      umbrella: pick(PEOPLE_COLORS.umbrella), bike: pick(['#2f6fb3', '#c0564b', '#2a2a2e', '#4f8f88', '#e0a32e']) };
  };
  // where they go, in drawing units (887 wide): feet on the street behind the hedge, or on the grass in front of it
  const PEOPLE_KINDS = {
    walker: { layer: 'street', w: 44, h: 136, feet: 1328, speed: 42, svg: (c, u) => walkerSVG(c, u) },
    umbrella: { layer: 'street', w: 70, h: 144, feet: 1328, speed: 38, svg: (c) => walkerSVG(c, true), umbrella: true },
    cyclist: { layer: 'street', w: 96, h: 120, feet: 1336, speed: 120, svg: (c) => cyclistSVG(c) },
    dogwalker: { layer: 'grass', w: 140, h: 144, feet: 1404, speed: 40, svg: (c, u) => dogWalkerSVG(c, u), scale: 1.12 },
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
