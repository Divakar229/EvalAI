import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { field } from "../styles";

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 8 }}>
    <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid #f0a500", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <path d="M3 8l3.5 3.5L13 4.5" stroke="#f0a500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#e6edf3", letterSpacing: -0.5 }}>EvalAI</div>
      <div style={{ fontSize: 10, color: "#f0a500", letterSpacing: 1, textTransform: "uppercase" }}>for India</div>
    </div>
  </div>
);

export default function Login() {
  const [tab, setTab]           = useState(0);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const handle = async () => {
    setError(""); setLoading(true);
    try {
      const data = tab === 0
        ? await api.login(email, password)
        : await api.register(name, email, password);
      const token = data.access_token || data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("teacherName", data.name);
      navigate("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#161b22", border: "1.5px solid #30363d", borderRadius: 16, padding: 32 }}>

        <Logo />
        <div style={{ textAlign: "center", fontSize: 12, color: "#8b949e", marginBottom: 24 }}>
          AI-powered answer sheet evaluation
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #30363d", marginBottom: 20 }}>
          {["Login", "Register"].map((t, i) => (
            <div key={t} onClick={() => setTab(i)} style={{
              flex: 1, textAlign: "center", padding: "8px 0",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              color: tab === i ? "#f0a500" : "#8b949e",
              borderBottom: `2px solid ${tab === i ? "#f0a500" : "transparent"}`,
              transition: "0.2s"
            }}>{t}</div>
          ))}
        </div>

        {tab === 1 && (
          <input style={field} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
        )}
        <input style={field} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={field} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handle()} />

        {error && (
          <div style={{ background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", color: "#f85149", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 12 }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={handle} disabled={loading} style={{
          width: "100%", padding: 12, borderRadius: 10, border: "none",
          background: "#f0a500", color: "#0d1117",
          fontSize: 14, fontWeight: 800, cursor: "pointer", marginTop: 4,
          opacity: loading ? 0.7 : 1
        }}>
          {loading ? "Please wait..." : tab === 0 ? "Login" : "Create Account"}
        </button>
      </div>
    </div>
  );
}