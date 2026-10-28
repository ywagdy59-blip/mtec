import { statusClass } from "../../utils/constants";

export default function StatusBadge({ status }) {
  return <span className={`status ${statusClass(status)}`}>{status}</span>;
}
