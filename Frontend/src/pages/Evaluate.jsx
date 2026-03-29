import { useState } from "react";
import UploadBox from "../components/UploadBox";
import QuestionCard from "../components/QuestionCard";
import ScoreRing from "../components/ScoreRing";
import { api } from "../api";
import { field, card, scoreColor } from "../styles";

const STAGES = [
  "Extracting pages from PDFs...",
  "Reading handwriting with Gemini...",
  "Parsing question paper structure...",
  "Detecting choice questions & marks...",
  "Evaluating answers question by question...",
  "Applying stepwise & keyword marking...",
  "Saving results to database...",
];

function Processing() {
  const [idx, setIdx] = useState(0);
  useState(() => {
    const iv = setInterval(() => setIdx(p => Math.min(p + 1, STAGES.length - 1)), 3500);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ position: "relative", width: 64, height: 64, margin: "0 auto 24px" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#f0a500", animation: "spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#c88400", animation: "spin 0.7s linear infinite reverse" }} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#e6edf3", marginBottom: 8 }}>Evaluating Answer Sheet</div>
      <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 20 }}>{STAGES[idx]}</div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        {STAGES.map((_, i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i <= idx ? "#f0a500" : "#21262d", transition: "background 0.3s" }} />
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Result({ data, onReset }) {
  const pct = data.percentage ?? ((data.marks_obtained / data.total_marks) * 100).toFixed(1);
  const blank = data.questions?.filter(q => q.status === "blank").length || 0;
  const gradeColor = { "A+": "#3fb950", A: "#3fb950", B: "#58a6ff", C: "#d29922", D: "#bc8cff", F: "#f85149" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#e6edf3" }}>Evaluation Complete</div>
        <button onClick={onReset} style={{ background: "#161b22", border: "1.5px solid #30363d", color: "#8b949e", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          ← New Evaluation
        </button>
      </div>

      <div style={{ ...card, display: "flex", gap: 24, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <ScoreRing score={data.marks_obtained} total={data.total_marks} />
        <div style={{ flex: 1, minWidth: 160 }}>
          {[["Percentage", `${pct}%`], ["Grade", data.grade], ["Questions", data.questions?.length || 0], ["Blanks", blank]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #21262d", padding: "7px 0" }}>
              <span style={{ fontSize: 12, color: "#8b949e" }}>{l}</span>
              <span style={{ fontSize: l === "Grade" ? 16 : 13, fontWeight: 700, color: l === "Grade" ? (gradeColor[v] || "#e6edf3") : "#e6edf3" }}>{v}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: "#8b949e", fontStyle: "italic", marginTop: 8 }}>{data.overall_remarks}</div>
        </div>
      </div>

      {blank > 0 && (
        <div style={{ background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.2)", color: "#f85149", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>
          ⚠️ {blank} question{blank > 1 ? "s" : ""} left blank by student
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 700, color: "#8b949e", marginBottom: 10 }}>Question-wise Breakdown</div>
      {data.questions?.map((q, i) => <QuestionCard key={i} q={q} />)}
    </div>
  );
}

export default function Evaluate() {
  const [step, setStep]     = useState(0);
  const [qPDF, setQPDF]     = useState(null);
  const [akPDF, setAkPDF]   = useState(null);
  const [stPDF, setStPDF]   = useState(null);
  const [form, setForm]     = useState({ student_name: "", roll_number: "", subject: "", exam_name: "" });
  const [error, setError]   = useState("");
  const [result, setResult] = useState(null);

  const canSubmit = qPDF && akPDF && stPDF && form.student_name && form.roll_number && form.subject && form.exam_name;

  const handle = async () => {
    setError(""); setStep(1);
    const fd = new FormData();
    fd.append("question_paper", qPDF);
    fd.append("answer_key", akPDF);
    fd.append("student_answer", stPDF);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    try {
      const data = await api.evaluate(fd);
      setResult(data);
      setStep(2);
    } catch (e) {
      setError(e.message);
      setStep(0);
    }
  };

  const reset = () => {
    setStep(0); setResult(null);
    setQPDF(null); setAkPDF(null); setStPDF(null);
    setForm({ student_name: "", roll_number: "", subject: "", exam_name: "" });
    setError("");
  };

  if (step === 1) return <Processing />;
  if (step === 2 && result) return <Result data={result} onReset={reset} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <div style={{ background: "#161b22", border: "1.5px solid #30363d", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#8b949e", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Student Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["student_name", "Student Name"], ["roll_number", "Roll Number"], ["subject", "Subject"], ["exam_name", "Exam Name"]].map(([key, label]) => (
            <input key={key} style={{ ...field, marginBottom: 0 }} placeholder={label}
              value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        <UploadBox label="Question Paper"       sub="PDF with questions & marks" icon="📋" file={qPDF}  onFile={setQPDF}  borderColor="#58a6ff" />
        <UploadBox label="Answer Key"           sub="Teacher's model answers"    icon="🔑" file={akPDF} onFile={setAkPDF} borderColor="#f0a500" />
        <UploadBox label="Student Answer Sheet" sub="Scanned handwritten PDF"    icon="✍️" file={stPDF} onFile={setStPDF} borderColor="#3fb950" />
      </div>

      <div style={{ background: "rgba(240,165,0,0.06)", border: "1px solid rgba(240,165,0,0.15)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#f0a500" }}>
        ℹ️ Total marks are auto-detected from the question paper. No manual input needed.
      </div>

      {error && (
        <div style={{ background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.25)", color: "#f85149", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <button onClick={handle} disabled={!canSubmit} style={{
        width: "100%", padding: 14, borderRadius: 10, border: "none",
        background: canSubmit ? "#f0a500" : "#21262d",
        color: canSubmit ? "#0d1117" : "#484f58",
        fontSize: 14, fontWeight: 800, cursor: canSubmit ? "pointer" : "not-allowed",
        transition: "all 0.2s"
      }}>
        Evaluate Answer Sheet →
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
        {["✓ Reads cursive handwriting", "✓ Auto-detects total marks", "✓ Choice question aware", "✓ Stepwise marking", "✓ Blank detection", "✓ Saves to database"].map(t => (
          <span key={t} style={{ background: "rgba(240,165,0,0.06)", border: "1px solid rgba(240,165,0,0.12)", color: "#f0a500", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 500 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}