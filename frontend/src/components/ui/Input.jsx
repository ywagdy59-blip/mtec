import { forwardRef, useId } from "react";

// as: "input" | "textarea" | "select"
const Input = forwardRef(function Input(
  { label, error, hint, as: Tag = "input", className = "", id, required, children, ...props },
  ref
) {
  const autoId = useId();
  const fieldId = id || autoId;
  const messageId = `${fieldId}-msg`;
  const typeClass = Tag === "textarea" ? "textarea" : Tag === "select" ? "select" : "";

  return (
    <div className={`field ${error ? "field-error" : ""} ${className}`.trim()}>
      {label && (
        <label htmlFor={fieldId}>
          {label}
          {required && <span className="req" aria-hidden="true"> *</span>}
        </label>
      )}
      <Tag
        ref={ref}
        id={fieldId}
        className={`input ${typeClass}`.trim()}
        aria-invalid={Boolean(error)}
        aria-required={required || undefined}
        aria-describedby={error || hint ? messageId : undefined}
        {...props}
      >
        {children}
      </Tag>
      {error ? (
        <p className="field-msg" id={messageId} role="alert">{error}</p>
      ) : hint ? (
        <p className="field-hint" id={messageId}>{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
