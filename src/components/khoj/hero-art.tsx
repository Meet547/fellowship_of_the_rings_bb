/**
 * Abstract background art for the hero — layered flowing bands in the
 * reference's periwinkle/lavender palette with a soft grain. Pure SVG/CSS,
 * no stock imagery.
 */
export function HeroArt() {
  return (
    <div
      aria-hidden="true"
      className="noise absolute inset-0 overflow-hidden bg-cream"
    >
      {/* base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #f6f5f2 0%, #eceafc 34%, #d9d7f4 62%, #f5f4fd 100%)",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="band-a" x1="0" y1="0" x2="1" y2="0.25">
            <stop offset="0" stopColor="#c9c6f0" />
            <stop offset="0.5" stopColor="#a7a5e8" />
            <stop offset="1" stopColor="#d4d2f6" />
          </linearGradient>
          <linearGradient id="band-b" x1="0" y1="0.2" x2="1" y2="0">
            <stop offset="0" stopColor="#b3b0ec" />
            <stop offset="0.55" stopColor="#8f8ce0" />
            <stop offset="1" stopColor="#c2bff2" />
          </linearGradient>
          <linearGradient id="band-c" x1="0" y1="0" x2="1" y2="0.1">
            <stop offset="0" stopColor="#e2e0fa" />
            <stop offset="0.5" stopColor="#c5c2f1" />
            <stop offset="1" stopColor="#eeedfb" />
          </linearGradient>
          <linearGradient id="fade-bottom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f5f4fd" stopOpacity="0" />
            <stop offset="1" stopColor="#f5f4fd" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="fade-top" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#f6f5f2" stopOpacity="0.9" />
            <stop offset="1" stopColor="#f6f5f2" stopOpacity="0" />
          </linearGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
          <filter id="softer" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="48" />
          </filter>
        </defs>

        {/* flowing silk bands */}
        <path
          d="M-120 560 C 240 420, 520 640, 820 500 S 1380 380, 1600 470 L 1600 900 L -120 900 Z"
          fill="url(#band-a)"
          opacity="0.55"
          filter="url(#softer)"
        />
        <path
          d="M-140 640 C 200 520, 560 720, 900 560 S 1420 480, 1620 560 L 1620 900 L -140 900 Z"
          fill="url(#band-b)"
          opacity="0.6"
          filter="url(#soft)"
        />
        <path
          d="M-120 760 C 260 640, 640 820, 980 660 S 1440 600, 1620 680 L 1620 900 L -120 900 Z"
          fill="url(#band-c)"
          opacity="0.75"
          filter="url(#soft)"
        />
        {/* light streaks, echo of the render's vertical sheen */}
        <rect x="118" y="180" width="3" height="620" fill="white" opacity="0.5" filter="url(#soft)" />
        <rect x="1322" y="140" width="3" height="660" fill="white" opacity="0.45" filter="url(#soft)" />
        <rect x="252" y="300" width="2" height="480" fill="white" opacity="0.35" filter="url(#soft)" />
        <rect x="1188" y="260" width="2" height="520" fill="white" opacity="0.3" filter="url(#soft)" />

        {/* blend into the neighbouring bands */}
        <rect x="0" y="0" width="1440" height="240" fill="url(#fade-top)" />
        <rect x="0" y="620" width="1440" height="280" fill="url(#fade-bottom)" />
      </svg>
    </div>
  );
}
