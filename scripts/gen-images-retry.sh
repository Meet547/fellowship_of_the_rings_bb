#!/bin/bash
# Retry failed images sequentially with delays to avoid rate limiting
cd /home/z/my-project/public/images

gen() {
  local prompt="$1" output="$2" size="$3"
  if [ -f "$output" ]; then echo "SKIP $output (exists)"; return 0; fi
  for attempt in 1 2 3 4; do
    echo ">>> $output attempt $attempt"
    if z-ai image -p "$prompt" -o "$output" -s "$size" 2>&1 | tail -1 | grep -q "completed"; then
      echo "OK $output"
      return 0
    fi
    sleep 15
  done
  echo "FAILED $output"
}

gen "Layered misty mountain ridges with soft fog rolling through valleys, moody atmospheric minimalism, muted gray and warm beige tones, film photography, serene, high quality" "./auth-mountains.jpg" "864x1152"
sleep 8
gen "Lone person sitting on a hilltop overlooking a foggy valley at dawn, contemplative, tiny figure against vast misty landscape, muted warm earthy tones, film photography, editorial, high quality" "./auth-person.jpg" "864x1152"
sleep 8
gen "Documentary headshot portrait of an elderly Indian man around 62 years old, short gray hair, wearing glasses, light stubble, gentle neutral expression, wearing a plain light shirt, soft natural window light, muted realistic tones, dignified, photorealistic, high quality" "./portrait-ramesh.jpg" "864x1152"
sleep 8
gen "Documentary headshot portrait of an Indian man around 58 years old, weathered kind face, gray mustache, short dark hair with gray at temples, wearing a simple light colored shirt, soft natural light, muted realistic tones, photorealistic, high quality" "./portrait-suresh.jpg" "864x1152"
sleep 8
gen "Golden sunset over Mumbai coastal city skyline with distant hills, warm golden haze, silhouetted buildings and palm trees, atmospheric layers, film photography, muted warm tones, cinematic, high quality" "./sunset-city.jpg" "1152x864"
sleep 8
gen "Mountain ridgelines at golden hour, soft warm morning light, gentle mist in valleys, minimalist layered composition, muted warm beige and gray tones, film photography, high quality" "./profile-mountains.jpg" "864x1152"
echo "ALL DONE"
ls -la /home/z/my-project/public/images/
