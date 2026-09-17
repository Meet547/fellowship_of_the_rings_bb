"""Generate a compact, smooth SVG path for India from GeoJSON."""
import json, math

d = json.load(open('/tmp/india.json'))
ring = d['features'][0]['geometry']['coordinates'][0]

# bounds of India in this dataset
lons = [p[0] for p in ring]
lats = [p[1] for p in ring]
lon0, lon1 = min(lons), max(lons)
lat0, lat1 = min(lats), max(lats)
W, H = 340.0, 400.0
pad = 6
sx = (W - 2 * pad) / (lon1 - lon0)
sy = (H - 2 * pad) / (lat1 - lat0)
s = min(sx, sy)
ox = (W - (lon1 - lon0) * s) / 2
oy = (H - (lat1 - lat0) * s) / 2

def pt(lon, lat):
    return (round(ox + (lon - lon0) * s, 1), round(H - (oy + (lat - lat0) * s), 1))

pts = [pt(lon, lat) for lon, lat in ring]

# light decimation: drop points closer than 3px
out = [pts[0]]
for p in pts[1:]:
    if math.dist(p, out[-1]) >= 3:
        out.append(p)
if math.dist(out[0], out[-1]) < 4:
    out.pop()

path = 'M' + ' L'.join(f'{x} {y}' for x, y in out) + ' Z'
print('POINTS:', len(out))
print(path)

# also emit helper for city dots
cities = {
    'Mumbai': (72.88, 19.08),
    'Thane': (72.97, 19.22),
    'Delhi': (77.10, 28.64),
    'Patna': (85.14, 25.61),
    'Lucknow': (80.95, 26.85),
    'Kolkata': (88.36, 22.57),
    'Hyderabad': (78.49, 17.39),
    'Bengaluru': (77.59, 12.97),
    'Chennai': (80.27, 13.08),
    'Jaipur': (75.79, 26.91),
    'Bhopal': (77.41, 23.26),
    'Ahmedabad': (72.57, 23.02),
}
print('---CITY DOTS (x,y)---')
for name, (lon, lat) in cities.items():
    x, y = pt(lon, lat)
    print(f"{name}: {{ x: {x}, y: {y} }},")
