import { Check } from "lucide-react";
import { PIPELINE } from "../../utils/constants";

// New -> Contacted -> Interested -> In Progress -> Won   (alternative ending: Lost)
export default function StatusPipeline({ status, onChange, disabled }) {
  const currentIndex = PIPELINE.indexOf(status);

  return (
    <div className="pipeline-wrap">
      <ol className="pipeline" aria-label="Lead status">
        {PIPELINE.map((step, i) => {
          const done = currentIndex > i;
          const active = status === step;
          return (
            <li key={step} className={`${done ? "done" : ""} ${active ? "active" : ""}`}>
              <button type="button" onClick={() => onChange(step)} disabled={disabled || active} aria-current={active ? "step" : undefined}>
                <span className="dot">{done ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
                <span className="label">{step}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        className={`lost-btn ${status === "Lost" ? "active" : ""}`}
        onClick={() => onChange("Lost")}
        disabled={disabled || status === "Lost"}
      >
        Mark as Lost
      </button>
    </div>
  );
}
