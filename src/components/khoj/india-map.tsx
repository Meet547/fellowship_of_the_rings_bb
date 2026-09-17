"use client";

/**
 * Stylized India map — outline generated from real GeoJSON (Natural Earth
 * data via world.geo.json), linear projection into a 340x400 viewBox.
 * City dots use the same projection, so positions are geographically
 * consistent with the outline.
 */

export type MapDot = {
  x: number;
  y: number;
  level: "high" | "medium" | "low";
};

const PATH =
  "M114.4 45.5 L126.5 58.7 L125.3 67.8 L129.8 73.6 L129.4 79.3 L121.4 77.8 L124.5 90.2 L135.6 97.3 L151.2 105.1 L144 110.2 L139.7 120.7 L150.6 125 L161.1 130.5 L175.8 136.8 L191.2 138.2 L197.6 143.9 L206.3 145 L219.8 147.6 L229.2 147.4 L230.4 143 L229 135.8 L229.8 131 L236.7 128.7 L237.6 137.5 L248.1 144 L255.1 142.2 L264.6 143 L273.7 142.7 L274.5 135.8 L270 132.2 L279 130.8 L289.2 122.4 L302.2 115.3 L311.6 118.1 L319.6 113.3 L324.8 120.3 L321.1 125 L333.2 126.7 L334 130.9 L330.1 133 L331 139.9 L323 137.9 L308.4 145.6 L308.8 152.1 L302.6 161.5 L302 166.9 L297 176.2 L288.2 173.6 L287.8 185.3 L285.3 189.1 L286.5 193.8 L280.9 196.5 L275 178.7 L271.9 178.7 L270.1 185.9 L263.9 180.1 L267.4 173.7 L272.4 173.1 L277.6 163.6 L271.1 161.6 L260.7 161.8 L250 160.3 L249 152.5 L243.7 151.9 L234.8 147.1 L230.8 154.7 L238.9 160.6 L231.9 164.8 L229.4 168.9 L236.3 171.9 L234.4 178.7 L238.3 187.1 L240.1 196.3 L238.5 200.4 L230.8 200.3 L217 202.6 L217.6 211.1 L211.6 217.7 L195.5 225.3 L182.9 238.5 L174.5 245.5 L163.3 252.9 L163.3 258.1 L157.7 260.8 L147.6 264.8 L142.3 265.4 L139 274 L141.3 288.6 L141.9 297.9 L137.1 308.6 L137.1 327.6 L131.3 328.2 L126.2 336.7 L129.6 340.4 L119.4 343.6 L115.6 351.2 L111.1 354.5 L100.5 344 L95.3 328.3 L91 317 L87 311.7 L81.1 300.9 L78.3 286.8 L76.3 279.8 L66.1 264.4 L61.5 242.7 L58.1 228.3 L58.2 214.7 L56 204.2 L39.7 210.9 L31.7 209.6 L17.1 196 L22.5 191.9 L19.2 187.5 L6 178 L13.5 170.5 L38.2 170.5 L35.9 160.9 L29.6 155.2 L28.4 146.6 L21 141.5 L33.4 129.8 L46.4 130.6 L58.2 118.8 L65.2 107.4 L76.1 96.2 L75.9 88.2 L85.5 81.7 L76.4 76.2 L72.5 68.6 L68.5 58.7 L74.1 53.9 L91.1 56.6 L103.6 55 Z";

export const CITY = {
  mumbai: { x: 58.8, y: 229.7 },
  delhi: { x: 106.1, y: 122.4 },
  patna: { x: 196.4, y: 156.5 },
  lucknow: { x: 149.4, y: 142.5 },
  kolkata: { x: 232.5, y: 190.6 },
  hyderabad: { x: 121.7, y: 248.7 },
  bengaluru: { x: 111.6, y: 298.3 },
  chennai: { x: 141.7, y: 297.1 },
  jaipur: { x: 91.4, y: 141.9 },
  bhopal: { x: 109.6, y: 182.8 },
  ahmedabad: { x: 55.3, y: 185.5 },
} as const;

export function IndiaMap({
  className = "",
  fill = "rgba(35,32,27,0.10)",
  stroke = "rgba(35,32,27,0.28)",
  dots = [],
  showTooltip = false,
  heat = false,
}: {
  className?: string;
  fill?: string;
  stroke?: string;
  dots?: MapDot[];
  showTooltip?: boolean;
  heat?: boolean;
}) {
  const dotColor = {
    high: "#c0452b",
    medium: "#d97b3f",
    low: "#e3c584",
  };
  return (
    <svg viewBox="0 0 340 400" className={className} role="img" aria-label="Map of India">
      <defs>
        <filter id="khoj-heat-blur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <path
        d={PATH}
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {heat && (
        <g filter="url(#khoj-heat-blur)">
          {dots.map((d, i) => (
            <circle
              key={`h${i}`}
              cx={d.x}
              cy={d.y}
              r={d.level === "high" ? 22 : d.level === "medium" ? 15 : 11}
              fill={dotColor[d.level]}
              opacity={0.4}
            />
          ))}
        </g>
      )}
      {dots.map((d, i) => (
        <g key={i}>
          <circle
            cx={d.x}
            cy={d.y}
            r={d.level === "high" ? 7 : d.level === "medium" ? 5 : 4}
            fill={dotColor[d.level]}
            opacity={0.22}
          />
          <circle
            cx={d.x}
            cy={d.y}
            r={d.level === "high" ? 3.6 : d.level === "medium" ? 2.6 : 2}
            fill={dotColor[d.level]}
          />
        </g>
      ))}
      {showTooltip && (
        <g>
          <line
            x1={78}
            y1={214}
            x2={96}
            y2={196}
            stroke="rgba(35,32,27,0.3)"
            strokeWidth="1"
          />
          <rect
            x={78}
            y={168}
            rx={8}
            width={110}
            height={44}
            fill="#fdfaf4"
            stroke="rgba(35,32,27,0.14)"
          />
          <text x={92} y={187} fontSize={12.5} fontWeight={600} fill="#23201b">
            Maharashtra
          </text>
          <text x={92} y={202} fontSize={10.5} fill="#6c6659">
            12,450 records
          </text>
        </g>
      )}
    </svg>
  );
}

/** Small route card map — Dadar → Thane (match detail view) */
export function RouteMap({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 190" className={className} role="img" aria-label="Route from Dadar to Thane">
      {/* soft street grid */}
      <g stroke="rgba(35,32,27,0.07)" strokeWidth="1.4" fill="none">
        <path d="M-10 40 C 60 52, 140 30, 310 46" />
        <path d="M-10 84 C 70 96, 150 74, 310 88" />
        <path d="M-10 128 C 80 140, 160 116, 310 132" />
        <path d="M-10 168 C 90 178, 170 156, 310 170" />
        <path d="M48 -10 C 56 60, 40 130, 58 200" />
        <path d="M120 -10 C 128 60, 112 130, 130 200" />
        <path d="M196 -10 C 204 60, 188 130, 206 200" />
        <path d="M258 -10 C 266 60, 250 130, 268 200" />
      </g>
      <g stroke="rgba(35,32,27,0.13)" strokeWidth="2.2" fill="none">
        <path d="M-10 62 C 70 74, 160 52, 310 66" />
        <path d="M86 -10 C 94 60, 78 130, 96 200" />
      </g>
      {/* water hint */}
      <path d="M-10 150 C 40 158, 80 150, 110 162 L110 200 L-10 200 Z" fill="rgba(120,150,170,0.10)" />
      {/* route */}
      <path
        d="M92 138 C 120 118, 138 96, 158 74 C 172 58, 186 46, 206 38"
        fill="none"
        stroke="#3e7b4f"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
      {/* origin */}
      <circle cx={92} cy={138} r={6.5} fill="#23201b" />
      <circle cx={92} cy={138} r={11} fill="none" stroke="#23201b" opacity={0.25} />
      <text x={92} y={158} fontSize={11.5} fontWeight={600} fill="#23201b" textAnchor="middle">
        Dadar
      </text>
      {/* destination pin */}
      <circle cx={206} cy={38} r={12} fill="#c0452b" opacity={0.18} />
      <circle cx={206} cy={38} r={6} fill="#c0452b" stroke="#fdfaf4" strokeWidth={1.8} />
      <text x={222} y={42} fontSize={11.5} fontWeight={600} fill="#23201b">
        Thane
      </text>
    </svg>
  );
}
