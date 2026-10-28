import { Link } from "react-router-dom";

// variant: primary | outline | light | ghost | danger | dark | success
export default function Button({
  to,
  href,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  block = false,
  className = "",
  children,
  type = "button",
  disabled,
  ...props
}) {
  const cls = ["btn", `btn-${variant}`, size !== "md" && `btn-${size}`, block && "btn-block", !children && "btn-icon", className]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading ? <span className="spinner spinner-sm" aria-hidden="true" /> : icon}
      {children}
    </>
  );

  if (to) return <Link to={to} className={cls} {...props}>{content}</Link>;
  if (href) return <a href={href} className={cls} {...props}>{content}</a>;

  return (
    <button type={type} className={cls} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
