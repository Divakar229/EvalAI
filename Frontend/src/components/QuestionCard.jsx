import { useState } from "react";
import { scoreColor } from "../styles";

function Badge({ text, color, bg }) {
  return (
    <span style={{ background: bg, color, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
      {text}
    </span>
  );
}

export default function QuestionCard({ q }) {
  const [open, setOpen] = useState(false);
  const pct   = q.marks_awarded / q.total_marks;
  const color = scoreColor(pct);

  return (
    <div style={{ background: "#161b22", border: "1.5px solid #30363d", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer" }}>
        <span style={{ background: "rgba(240,165,0,0.1)", color: "#f0a500", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
          Q{q.question_number}
        </span>
        <span style={{ flex: 1, fontSize: 12, color: "#8b949e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {q.question_text || `Question ${q.question_number}`}
        </span>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {q.status === "blank"   && <Badge text="BLANK"   color="#f85149" bg="rgba(248,81,73,0.1)" />}
          {q.is_choice            && <Badge text="CHOICE"  color="#d29922" bg="rgba(210,153,34,0.1)" />}
          {q.is_stepwise          && <Badge text="STEPS"   color="#58a6ff" bg="rgba(88,166,255,0.1)" />}
          {q.status === "partial" && <Badge text="PARTIAL" color="#bc8cff" bg="rgba(188,140,255,0.1)" />}
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color, flexShrink: 0 }}>
          {q.marks_awarded}<span style={{ fontSize: 10, color: "#484f58" }}>/{q.total_marks}</span>
        </span>
        <span style={{ color: "#484f58", fontSize: 16, transform: open ? "rotate(90deg)" : "none", transition: "0.2s", flexShrink: 0 }}>›</span>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid #21262d", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {q.parts?.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#484f58", marginBottom: 8 }}>
                {q.is_choice ? "Choice Parts (Best Taken)" : "Parts Breakdown"}
              </div>
              {q.parts.map((p, i) => (
                <div key={i} style={{ background: "#0d1117", borderRadius: 8, padding: "10px 12px", marginBottom: 6, border: "1px solid #21262d" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#f0a500" }}>Part {p.part?.toUpperCase()}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#e6edf3" }}>{p.marks_awarded}/{p.marks || q.total_marks}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#8b949e", fontStyle: "italic" }}>{p.feedback}</span>
                </div>
              ))}
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#484f58", marginBottom: 4 }}>Student Answer</div>
            <div style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.6 }}>{q.student_answer_summary || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#484f58", marginBottom: 4 }}>Feedback</div>
            <div style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.6, fontStyle: "italic" }}>{q.feedback}</div>
          </div>
          <div style={{ height: 3, background: "#21262d", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct * 100}%`, background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
          </div>
        </div>
      )}
    </div>
  );
}