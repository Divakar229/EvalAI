export const colors = {
  bg: "#0d1117",
  surface: "#161b22",
  sidebar: "#0d1117",
  border: "#30363d",
  borderHover: "#484f58",
  text: "#e6edf3",
  muted: "#8b949e",
  faint: "#484f58",
  fainter: "#21262d",
  accent: "#f0a500",
  accentDark: "#c88400",
  accentGlow: "rgba(240,165,0,0.1)",
  green: "#3fb950",
  red: "#f85149",
  yellow: "#d29922",
  blue: "#58a6ff",
  purple: "#bc8cff",
};

export const field = {
  width: "100%",
  background: "#0d1117",
  border: "1.5px solid #30363d",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#e6edf3",
  fontSize: 13,
  outline: "none",
  marginBottom: 12,
};

export const card = {
  background: "#161b22",
  border: "1.5px solid #30363d",
  borderRadius: 12,
  padding: 20,
};

export const scoreColor = (pct) =>
  pct >= 0.75 ? "#3fb950" : pct >= 0.5 ? "#d29922" : "#f85149";