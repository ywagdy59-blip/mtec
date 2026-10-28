import { Link } from "react-router-dom";

export function LogoMark({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#2F6BFF" />
      <path d="M15 46V21l17 17 17-17v25" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="14" r="4" fill="#27D3F5" />
    </svg>
  );
}

export default function Logo({ to = "/", light = false, className = "" }) {
  return (
    <Link to={to} className={`logo ${light ? "logo-light" : ""} ${className}`.trim()} aria-label="MTEC Software home">
      <LogoMark />
      <span className="logo-text">
        <strong>MTEC</strong>
        <small>Software</small>
      </span>
    </Link>
  );
}
