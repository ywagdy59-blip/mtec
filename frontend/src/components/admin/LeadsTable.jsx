import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { STATUSES, statusClass } from "../../utils/constants";
import { formatDate } from "../../utils/format";

export default function LeadsTable({ leads, onStatusChange, onDelete, busyId, compact = false }) {
  return (
    <div className="table-wrap">
      <table className="leads-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Service</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Created Date</th>
            <th className="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td data-label="Name">
                <Link to={`/admin/leads/${lead.id}`} className="lead-name">{lead.name}</Link>
                <span className="lead-email">{lead.email}</span>
              </td>
              <td data-label="Company">{lead.company || "-"}</td>
              <td data-label="Service">{lead.service}</td>
              <td data-label="Phone" dir="ltr" className="num">{lead.phone}</td>
              <td data-label="Status">
                {compact ? (
                  <StatusBadge status={lead.status} />
                ) : (
                  <select
                    className={`status-select ${statusClass(lead.status)}`}
                    value={lead.status}
                    disabled={busyId === lead.id}
                    onChange={(e) => onStatusChange(lead, e.target.value)}
                    aria-label={`Status for ${lead.name}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </td>
              <td data-label="Created">{formatDate(lead.created_at)}</td>
              <td data-label="Actions" className="td-actions">
                <div className="actions">
                  <Link className="btn btn-light btn-sm" to={`/admin/leads/${lead.id}`} aria-label={`View ${lead.name}`}>
                    <Eye size={16} /> View
                  </Link>
                  {!compact && (
                    <>
                      <Link className="btn btn-light btn-sm btn-icon" to={`/admin/leads/${lead.id}?edit=1`} aria-label={`Edit ${lead.name}`}>
                        <Pencil size={16} />
                      </Link>
                      <button className="btn btn-danger-soft btn-sm btn-icon" onClick={() => onDelete(lead)} aria-label={`Delete ${lead.name}`}>
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
