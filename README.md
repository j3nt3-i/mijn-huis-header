# Mijn huis — geïllustreerde header

De bewegende header van het Home Assistant-dashboard **Mijn huis**: Jentes eigen tekeningen van het huis voor
14 weertypes × 4 dagdelen, waarin regen, sneeuw, wind, wolken en bliksem bewegen, de ramen meegaan met de lampen,
de lapjeskat met haar staart zwiept, vogels, een hond en voorbijgangers langskomen en muzieknootjes uit het raam zweven.
's Nachts twinkelen de sterren en valt er af en toe een ster, overdag vliegt er soms een vliegtuig over, en de zon
staat waar hij echt staat (het huis kijkt naar het noorden: oost links, west rechts). De maan ook: een ronde maan in
Jentes maankleuren met de echte schijngestalte, de verlichte kant naar de zon, berekend uit de tijd en de locatie van het huis.

## Snel bekijken

Online: **https://j3nt3-i.github.io/mijn-huis-header/**

Of lokaal:

```bash
python3 -m http.server 8765
```

Open daarna `http://localhost:8765/viewer.html`. Kies het weer en dagdeel, zet lampen en muziek aan of uit,
of blader met ← →. De testpagina gebruikt precies dezelfde code als het dashboard.

## Hoe het werkt

- **`hh/`**: de tekeningen (887 × 1662), alleen witruimte ingekort.
- **`hh_prep/`**: dezelfde tekeningen, voorbereid door `prepare.py`. Elk bestand is nog steeds de complete
  tekening (dat is ook de terugvaloptie), maar de bewegende delen zijn gemarkeerd met `data-np="…"`:
  `fall` (regen/sneeuw), `lamp` (druppels in het lamplicht), `streak` (windstrepen), `leaf`, `cloud`,
  `bolt`/`glow`/`dark` (onweer), `light` (lichtgloed van de woonkamer), `sun` (zon en zongloed), `moon` (maan en maanlicht) en
  `twinkle`/`sparkle` (sterren).
- **`clearbar.js`**: het script dat als dashboard-resource draait. Het kiest de tekening (dagdeel volgt de zon,
  het weer kiest de tekening, sneeuwdek via Open-Meteo), haalt het bestand op en splitst het op de telefoon in
  lagen: de stilstaande delen worden één keer getekend, elke bewegende laag schuift de grafische chip
  (Web Animations, transform/opacity). Daarnaast regelt het de doorzichtige balk, het testpaneel
  (5× tikken op de illustratie) en de ramen-/kat-overlay.
- **`make_viewer.py`** bouwt `viewer.html` uit `clearbar.js`; draai het opnieuw na wijzigingen in het script.

## Nieuwe tekeningen verwerken

1. Tekeningen inkorten naar `hh/` (witruimte tussen tags weg, zie de werkwijze in de geschiedenis).
2. `python3 period.py` — vindt de ingebouwde herhaling van de regenlagen.
3. Luchtkleur meten: `swiftc -O sky.swift -o sky && ./sky hh/*.svg` → `sky.json` (en de `SKY`-tabel in `clearbar.js`).
4. Huis/ramen controleren met `overlay.py` + `crop.swift`.
5. `python3 prepare.py` → `hh_prep/`, daarna `python3 make_viewer.py` en testen in de viewer.
6. Uploaden naar de mediamap van Home Assistant (`upload_when_home.sh`, alleen via het thuisnetwerk) en
   `SIG_KEY` in `clearbar.js` ophogen zodat telefoons de nieuwe versies ophalen.

Inloggegevens staan nooit in deze repository: de scripts lezen `HA_URL` en `HA_TOKEN` uit `~/.ha-env`.
