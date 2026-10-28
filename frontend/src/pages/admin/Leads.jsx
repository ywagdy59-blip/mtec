import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Inbox, Search } from "lucide-react";
import toast from "react-hot-toast";
import LeadsTable from "../../components/admin/LeadsTable";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Button from "../../components/ui/Button";
import { PageLoader } from "../../components/ui/Spinner";
import { useDebounce } from "../../hooks/useDebounce";
import { deleteLead, exportLeadsCsv, getLeads, updateLead } from "../../services/leadService";
import { SORT_OPTIONS, STATUSES } from "../../utils/constants";
import { getErrorMessage } from "../../utils/format";

const LIMIT = 10;

export default function Leads() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "All";
  const sort = params.get("sort") || "newest";
  const page = Number(params.get("page")) || 1;
  const urlSearch = params.get("search") || "";

  const [searchText, setSearchText] = useState(urlSearch);
  const debounced = useDebounce(searchText, 400);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const setParam = (key, value, keepPage = false) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== "All" && !(key === "sort" && value === "newest")) next.set(key, value);
        else next.delete(key);
        if (!keepPage) next.delete("page");
        return next;
      },
      { replace: key === "search" }
    );

  // search text -> URL after the admin stops typing
  useEffect(() => {
    if (debounced !== urlSearch) setParam("search", debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getLeads({ page, limit: LIMIT, search: urlSearch, status, sort }, controller.signal)
      .then((res) => {
        setData(res);
        setError("");
      })
      .catch((e) => {
        if (e.code !== "ERR_CANCELED") setError(getErrorMessage(e));
      })
      .finally(() => !controller.signal.aborted && setLoading(false));
    return () => controller.abort();
  }, [page, urlSearch, status, sort, version]);

  const refetch = () => setVersion((v) => v + 1);

  const handleStatusChange = async (lead, newStatus) => {
    setBusyId(lead.id);
    try {
      const res = await updateLead(lead.id, { status: newStatus });
      setData((d) => ({ ...d, leads: d.leads.map((l) => (l.id === lead.id ? res.lead : l)) }));
      toast.success(`Status changed to ${newStatus}`);
      if (status !== "All" && status !== newStatus) refetch();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteLead(target.id);
      toast.success("Lead deleted");
      setTarget(null);
      if (data.leads.length === 1 && page > 1) setParam("page", String(page - 1), true);
      else refetch();
    } catch (e) {
      toast.error(getErrorMessage(e));
      setTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportLeadsCsv({ search: urlSearch, status, sort });
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Leads</h1>
          <p className="muted">{data ? `${data.pagination.total} total` : "Loading…"}</p>
        </div>
        <Button variant="light" onClick={handleExport} loading={exporting} icon={<Download size={18} />}>
          Export CSV
        </Button>
      </header>

      <div className="toolbar">
        <label className="search-box">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name, email, phone or company"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            aria-label="Search leads"
          />
        </label>
        <select className="input select sort-select" value={sort} onChange={(e) => setParam("sort", e.target.value)} aria-label="Sort leads">
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="filter-pills" role="group" aria-label="Filter by status">
        {["All", ...STATUSES].map((s) => (
          <button key={s} className="pill" aria-pressed={status === s} onClick={() => setParam("status", s)}>
            {s}
          </button>
        ))}
      </div>

      {error ? (
        <p className="form-error" role="alert">{error}</p>
      ) : !data ? (
        <PageLoader />
      ) : data.leads.length === 0 ? (
        <div className="empty">
          <Inbox size={36} />
          <h3>No leads found</h3>
          <p>{urlSearch || status !== "All" ? "Try a different search or filter." : "Requests from the website form will show up here."}</p>
        </div>
      ) : (
        <div style={{ opacity: loading ? 0.55 : 1, transition: "opacity .2s" }}>
          <LeadsTable leads={data.leads} busyId={busyId} onStatusChange={handleStatusChange} onDelete={setTarget} />
        </div>
      )}

      {data && <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={(p) => setParam("page", String(p), true)} />}

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete lead"
        message="Are you sure you want to delete this lead?"
        cancelLabel="Cancel"
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setTarget(null)}
      />
    </>
  );
}
