#!/bin/bash
# Generate all photo assets for KHOJ website
cd /home/z/my-project/public/images

# Hero - boy looking over city (landing + homepage)
z-ai image -p "Young Indian boy seen from behind, head and shoulders in profile, gazing out over a hazy Indian city skyline at dusk, contemplative hopeful mood, muted warm sepia and gray tones, film grain photography, soft diffused light, editorial magazine photography, high quality" -o "./hero-boy.jpg" -s 864x1152 &
P1=$!

# Auth side - misty mountains
z-ai image -p "Layered misty mountain ridges with soft fog rolling through valleys, moody atmospheric minimalism, muted gray and warm beige tones, film photography, serene, high quality" -o "./auth-mountains.jpg" -s 864x1152 &
P2=$!

# Auth side - person on hill
z-ai image -p "Lone person sitting on a hilltop overlooking a foggy valley at dawn, contemplative, tiny figure against vast misty landscape, muted warm earthy tones, film photography, editorial, high quality" -o "./auth-person.jpg" -s 864x1152 &
P3=$!

# Portrait - Ramesh Kumar (elderly man)
z-ai image -p "Documentary headshot portrait of an elderly Indian man around 62 years old, short gray hair, wearing glasses, light stubble, gentle neutral expression, wearing a plain light shirt, soft natural window light, muted realistic tones, dignified, photorealistic, high quality" -o "./portrait-ramesh.jpg" -s 864x1152 &
P4=$!

# Portrait - Suresh Patil (man ~58)
z-ai image -p "Documentary headshot portrait of an Indian man around 58 years old, weathered kind face, gray mustache, short dark hair with gray at temples, wearing a simple light colored shirt, soft natural light, muted realistic tones, photorealistic, high quality" -o "./portrait-suresh.jpg" -s 864x1152 &
P5=$!

# Sunset city (You're not alone section)
z-ai image -p "Golden sunset over Mumbai coastal city skyline with distant hills, warm golden haze, silhouetted buildings and palm trees, atmospheric layers, film photography, muted warm tones, cinematic, high quality" -o "./sunset-city.jpg" -s 1152x864 &
P6=$!

# Profile side - mountains warm light
z-ai image -p "Mountain ridgelines at golden hour, soft warm morning light, gentle mist in valleys, minimalist layered composition, muted warm beige and gray tones, film photography, high quality" -o "./profile-mountains.jpg" -s 864x1152 &
P7=$!

# Dashboard side - city bridge dusk
z-ai image -p "Long sea bridge leading into a hazy city skyline at dusk, warm muted golden light, calm water, atmospheric fog, film photography, editorial, muted tones, high quality" -o "./dashboard-city.jpg" -s 864x1152 &
P8=$!

wait $P1 $P2 $P3 $P4 $P5 $P6 $P7 $P8
echo "ALL DONE"
ls -la /home/z/my-project/public/images/
