import { useRef } from "react";

export default function UploadBox({ label, sub, icon, file, onFile, borderColor }) {
  const ref = useRef();
  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") onFile(f);
  };
  return (
    <div onClick={() => ref.current.click()} onDragOver={e => e.preventDefault()} onDrop={handleDrop}
      style={{
        background: "#161b22", border: `1.5px solid ${file ? borderColor : "#30363d"}`,
        borderRadius: 12, padding: "20px 14px", textAlign: "center",
        cursor: "pointer", transition: "border-color 0.2s"
      }}>
      <input ref={ref} type="file" accept=".pdf" hidden onChange={e => onFile(e.target.files[0])} />
      <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 10 }}>{sub}</div>
      {file ? (
        <div style={{ background: "rgba(240,165,0,0.08)", border: "1px solid rgba(240,165,0,0.2)", borderRadius: 6, padding: "4px 8px", fontSize: 11, color: "#f0a500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          📄 {file.name}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: "#484f58" }}>Click or drag PDF here</div>
      )}
    </div>
  );
}