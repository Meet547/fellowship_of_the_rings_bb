#!/bin/bash
# KHOJ design assets — matches reference design (cream editorial, heritage India)
cd /home/z/my-project/public/images

gen() {
  local prompt="$1" output="$2" size="$3"
  if [ -f "$output" ]; then echo "SKIP $output (exists)"; return 0; fi
  for attempt in 1 2 3 4 5; do
    echo ">>> $output attempt $attempt"
    if z-ai image -p "$prompt" -o "$output" -s "$size" 2>&1 | tail -1 | grep -q "completed"; then
      echo "OK $output"
      return 0
    fi
    sleep 12
  done
  echo "FAILED $output"
}

# 1. Hero detective illustration (light, on cream, ink sketch)
gen "Vintage ink illustration of a man wearing a fedora hat and round glasses seen from behind, three-quarter back view, looking over an Indian city with the Gateway of India arch monument below, flying birds around him, monochrome grayscale pencil sketch with soft edges fading into a warm cream paper background, detective mood, editorial magazine style, high detail" "./khoj-hero-detective.jpg" "1024x1024"
sleep 6

# 2. Dark hero — Varanasi dusk silhouette
gen "Cinematic photograph of Varanasi ghats at deep dusk, dark temple silhouettes and rooftops along the river, glowing warm oil lamps reflecting on dark water, a lone man silhouette in the foreground, birds in the sky, moody dark brown and amber tones, film noir atmosphere, film photography, high quality" "./khoj-dark-hero.jpg" "1152x864"
sleep 6

# 3. Varanasi sunset man and child
gen "Warm golden hour photograph at Varanasi ghat, elderly man and a young boy sitting together on stone steps facing the river, boats on the water, temple towers and havelis in background, birds flying, golden sunset light, documentary film photography, warm amber tones, emotional, high quality" "./khoj-varanasi.jpg" "1152x864"
sleep 6

# 4. Dark colonial street — detective walking (footer CTA)
gen "Moody film noir photograph of a man in a fedora hat walking away down a dark colonial era Indian street at night, old heritage buildings on both sides, warm street lamp glow, wet reflective pavement, deep shadows, cinematic dark brown and black tones, mysterious atmosphere, high quality" "./khoj-detective-walk.jpg" "1152x864"
sleep 6

# 5. Heritage building (report sidebar)
gen "Vintage photograph of Mumbai Chhatrapati Shivaji Terminus heritage railway station, grand Victorian gothic architecture with dome and arches, warm sepia dusk light, people walking below, film photography, muted warm cream and brown tones, nostalgic, high quality" "./khoj-heritage.jpg" "864x1152"
sleep 6

# 6. Ramesh Sharma — elderly match
gen "Documentary portrait photograph of an elderly Indian man around 62 years old, full grey beard and grey hair, weathered dignified face, gentle hopeful expression, wearing a saffron orange shirt, soft natural daylight, warm realistic tones, photorealistic, high quality" "./khoj-ramesh.jpg" "864x1152"
sleep 6

# 7. Aarav Mehta — teenage boy
gen "Documentary portrait photograph of an Indian teenage boy around 14 years old, short black hair, innocent gentle expression, wearing a simple blue shirt, soft natural daylight, warm realistic tones, photorealistic, high quality" "./khoj-aarav.jpg" "864x1152"
sleep 6

# 8. Sunita Devi — woman
gen "Documentary portrait photograph of an Indian woman around 32 years old, dark hair tied back, wearing a simple red saree with modest jewellery, calm dignified expression, soft natural daylight, warm realistic tones, photorealistic, high quality" "./khoj-sunita.jpg" "864x1152"
sleep 6

# 9. Ramesh Kumar — older man with cap
gen "Documentary portrait photograph of an elderly Indian man around 67 years old, white stubble beard, weathered wrinkled face, wearing an old flat cap and simple khadi shirt, tired but hopeful eyes, soft natural daylight, warm realistic tones, photorealistic, high quality" "./khoj-rameshkumar.jpg" "864x1152"
sleep 6

# 10. Unknown unidentified — man in hat, face turned away
gen "Mysterious photograph of a middle aged Indian man wearing a dark fedora hat and shawl, face mostly turned away and obscured in shadow, standing at a railway platform, grainy documentary film photography, muted desaturated warm gray tones, anonymous, high quality" "./khoj-unknown.jpg" "864x1152"

echo "ALL DONE"
