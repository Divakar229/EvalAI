import { scoreColor } from "../styles";

export default function ScoreRing({ score, total, size = 120 }) {
  const pct   = total > 0 ? score / total : 0;
  const color = scoreColor(pct);
  const r     = size / 2 - 9;
  const circ  = 2 * Math.PI * r;
  const cx    = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#21262d" strokeWidth="9" />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", display: "flex", alignItems: "baseline", gap: 2 }}>
        <span style={{ fontSize: size * 0.2, fontWeight: 800, color }}>{score}</span>
        <span style={{ fontSize: size * 0.1, color: "#484f58" }}>/{total}</span>
      </div>
    </div>
  );
}