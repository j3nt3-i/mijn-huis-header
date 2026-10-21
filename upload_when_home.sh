#!/bin/zsh
# Wait until Home Assistant is reachable on the home network, then upload the SMIL drawings one by one
# and put the new bar script live. Stops at the first problem.
cd "${0:A:h}"
source ~/.ha-env
U=http://homeassistant.local
for i in $(seq 1 840); do   # up to 14 hours, every minute
  [ "$(curl -s -m 8 -o /dev/null -w '%{http_code}' $U/manifest.json)" = "200" ] && break
  sleep 60
done
[ "$(curl -s -m 8 -o /dev/null -w '%{http_code}' $U/manifest.json)" = "200" ] || { echo "$(date +%T) never reached the home network"; exit 1; }
echo "$(date +%T) home network reachable, waiting 2 minutes"
sleep 120
[ "$(curl -s -m 8 -o /dev/null -w '%{http_code}' $U/manifest.json)" = "200" ] || { echo "$(date +%T) not stable, stopping"; exit 1; }
n=0
for f in hh_anim/*.svg; do
  s=$(basename $f .svg)
  c=$(curl -s -m 60 -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $HA_TOKEN" -F "media_content_id=media-source://media_source/local/." -F "file=@$f;type=image/svg+xml;filename=huis-$s.svg" "$U/api/media_source/local_source/upload")
  [ "$c" = "200" ] || { echo "$(date +%T) STOP at $s ($c) after $n"; exit 1; }
  n=$((n+1)); sleep 4
  [ "$(curl -s -m 8 -o /dev/null -w '%{http_code}' $U/manifest.json)" = "200" ] || { echo "$(date +%T) HA stopped responding after $s ($n done)"; exit 1; }
done
echo "$(date +%T) $n uploaded"
r=$(node haws.mjs "$(cat res_smil.json)" | grep -c '"id"')
[ "$r" = "1" ] && echo "$(date +%T) bar script updated" || { echo "$(date +%T) bar script update FAILED"; exit 1; }
