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
