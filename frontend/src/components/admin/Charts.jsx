import { motion } from "framer-motion";
import { monthLabel } from "../../utils/format";
import { statusClass } from "../../utils/constants";

// horizontal bars (used for status and service)
export function BarList({ rows, colorFor }) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <ul className="bar-list">
      {rows.map((row, i) => (
        <li key={row.label}>
          <div className="bar-head">
            <span>{row.label}</span>
            <b>{row.count}</b>
          </div>
          <div className="bar-track">
            <motion.i
              className={colorFor ? colorFor(row.label) : ""}
              initial={{ width: 0 }}
              animate={{ width: `${(row.count / max) * 100}%` }}
              transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export const statusBarColor = (label) => `bar-${statusClass(label)}`;

// vertical columns (leads per month)
export function MonthColumns({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="columns" role="img" aria-label="Leads per month">
      {rows.map((row, i) => (
        <div key={row.month} className="column">
          <b>{row.count}</b>
          <div className="column-track">
            <motion.i
              initial={{ height: 0 }}
              animate={{ height: `${(row.count / max) * 100}%` }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span>{monthLabel(row.month)}</span>
        </div>
      ))}
    </div>
  );
}
