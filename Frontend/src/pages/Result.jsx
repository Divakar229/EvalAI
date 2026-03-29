import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import ScoreRing from "../components/ScoreRing";
import QuestionCard from "../components/QuestionCard";
import { card, scoreColor } from "../styles";

const gradeColor = { "A+": "#3fb950", A: "#3fb950", B: "#58a6ff", C: "#d29922", D: "#bc8cff", F: "#f85149" };

function Detail({ id, onBack }) {
  const [data, setData] = useState(null);
  useEffect(() => { api.getResult(id).then(setData); }, [id]);

  if (!data) return <div style={{ textAlign: "center", padding: 60, color: "#8b949e" }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "#161b22", border: "1.5px solid #30363d", color: "#8b949e", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          ← Back
        </button>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#e6edf3" }}>{data.student_name} — {data.subject}</div>
      </div>

      <div style={{ ...card, display: "flex", gap: 24, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <ScoreRing score={data.marks_obtained} total={data.total_marks} />
        <div style={{ flex: 1, minWidth: 160 }}>
          {[["Roll No.", data.roll_number], ["Exam", data.exam_name], ["Percentage", `${data.percentage}%`], ["Grade", data.grade], ["Date", new Date(data.evaluated_at).toLocaleDateString("en-IN")]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", padding: "7px 0" }}>
              <span style={{ fontSize: 12, color: "#8b949e" }}>{l}</span>
              <span style={{ fontSize: l === "Grade" ? 16 : 13, fontWeight: 700, color: l === "Grade" ? (gradeColor[v] || "#e6edf3") : "#e6edf3" }}>{v}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: "#8b949e", fontStyle: "italic", marginTop: 8 }}>{data.overall_remarks}</div>
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "#8b949e", marginBottom: 10 }}>Question-wise Breakdown</div>
      {data.questions?.map((q, i) => <QuestionCard key={i} q={q} />)}
    </div>
  );
}

export default function Results() {
  const [list, setList]         = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => { api.listResults().then(setList).catch(() => setList([])); }, []);

  if (selected) return <Detail id={selected} onBack={() => setSelected(null)} />;

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#e6edf3", marginBottom: 20 }}>Past Evaluations</div>

      {!list ? (
        <div style={{ textAlign: "center", padding: 60, color: "#8b949e" }}>Loading...</div>
      ) : list.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <div style={{ color: "#8b949e", fontSize: 14 }}>No evaluations yet.</div>
        </div>
      ) : (
        <div style={{ background: "#161b22", border: "1.5px solid #30363d", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 0.6fr 0.4fr", padding: "10px 16px", background: "#0d1117", borderBottom: "1px solid #21262d" }}>
            {["Student", "Roll No.", "Subject", "Exam", "Score", "Grade", ""].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#484f58", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
            ))}
          </div>
          {list.map(e => (
            <div key={e.id} onClick={() => setSelected(e.id)}
              style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 0.6fr 0.4fr", padding: "11px 16px", borderBottom: "1px solid #21262d", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={ev => ev.currentTarget.style.background = "rgba(240,165,0,0.03)"}
              onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>{e.student_name}</div>
              <div style={{ fontSize: 12, color: "#8b949e" }}>{e.roll_number}</div>
              <div style={{ fontSize: 12, color: "#8b949e" }}>{e.subject}</div>
              <div style={{ fontSize: 12, color: "#8b949e" }}>{e.exam_name}</div>
              <div style={{ fontSize: 12, color: "#8b949e" }}>
                <b style={{ color: "#e6edf3" }}>{e.marks_obtained}</b>/{e.total_marks}
                <span style={{ color: "#484f58", fontSize: 11 }}> ({e.percentage}%)</span>
              </div>
              <div>
                <span style={{ background: `${gradeColor[e.grade] || "#8b949e"}18`, color: gradeColor[e.grade] || "#8b949e", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                  {e.grade}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#f0a500", fontWeight: 600 }}>View →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}