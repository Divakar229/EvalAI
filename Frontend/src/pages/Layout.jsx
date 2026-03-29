import { Outlet, useNavigate, useLocation } from "react-router-dom";

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      border: "2px solid #f0a500",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8l3.5 3.5L13 4.5" stroke="#f0a500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#e6edf3", letterSpacing: -0.5 }}>EvalAI</div>
      <div style={{ fontSize: 10, color: "#f0a500", letterSpacing: 1, textTransform: "uppercase", marginTop: -2 }}>for India</div>
    </div>
  </div>
);

const NAV = [
  { path: "/", label: "Evaluate", icon: "⚡" },
  { path: "/results", label: "History", icon: "📋" },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const teacher = localStorage.getItem("teacherName") || "Teacher";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teacherName");
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#e6edf3" }}>

      {/* Sidebar */}
      <div style={{ width: 210, background: "#0d1117", borderRight: "1px solid #21262d", display: "flex", flexDirection: "column", padding: "24px 14px", flexShrink: 0 }}>
        <Logo />

        {/* Nav */}
        {NAV.map(n => {
          const active = location.pathname === n.path;
          return (
            <div key={n.path} onClick={() => navigate(n.path)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8, cursor: "pointer",
              marginBottom: 4, fontSize: 13, fontWeight: 500,
              color: active ? "#f0a500" : "#8b949e",
              background: active ? "rgba(240,165,0,0.08)" : "transparent",
              border: `1px solid ${active ? "rgba(240,165,0,0.2)" : "transparent"}`,
              transition: "all 0.15s"
            }}>
              <span style={{ fontSize: 14 }}>{n.icon}</span>
              {n.label}
            </div>
          );
        })}

        {/* Bottom */}
        <div style={{ marginTop: "auto", borderTop: "1px solid #21262d", paddingTop: 16 }}>
          <div style={{ fontSize: 11, color: "#484f58", marginBottom: 2 }}>Logged in as</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#8b949e", marginBottom: 12 }}>{teacher}</div>
          <button onClick={logout} style={{
            width: "100%", background: "none", border: "1px solid #30363d",
            color: "#8b949e", borderRadius: 7, padding: "7px 0",
            fontSize: 12, cursor: "pointer", transition: "0.15s"
          }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ borderBottom: "1px solid #21262d", padding: "14px 28px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e6edf3" }}>
            {NAV.find(n => n.path === location.pathname)?.label || "EvalAI"}
          </div>
        </div>
        <div style={{ padding: 28, maxWidth: 920, width: "100%" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}