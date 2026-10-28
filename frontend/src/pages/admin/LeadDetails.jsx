import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ContactActions from "../../components/admin/ContactActions";
import StatusPipeline from "../../components/admin/StatusPipeline";
import LeadEditForm from "../../components/admin/LeadEditForm";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { PageLoader } from "../../components/ui/Spinner";
import { deleteLead, getLead, updateLead } from "../../services/leadService";
import { formatDate, formatDateTime, getErrorMessage, toDateInput } from "../../utils/format";

function Detail({ label, children, wide }) {
  return (
    <div className={`detail ${wide ? "wide" : ""}`}>
      <dt>{label}</dt>
      <dd>{children || "-"}</dd>
    </div>
  );
}

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();

  const [lead, setLead] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(search.get("edit") === "1");
  const [saving, setSaving] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getLead(id, controller.signal)
      .then(({ lead: data }) => {
        setLead(data);
        setNotes(data.notes || "");
        setFollowUp(toDateInput(data.followUpDate));
      })
      .catch((e) => e.code !== "ERR_CANCELED" && setError(getErrorMessage(e)));
    return () => controller.abort();
  }, [id]);

  const apply = (updated) => {
    setLead(updated);
    setNotes(updated.notes || "");
    setFollowUp(toDateInput(updated.followUpDate));
  };

  const changeStatus = async (status) => {
    setStatusBusy(true);
    try {
      const res = await updateLead(id, { status });
      apply(res.lead);
      toast.success(`Status changed to ${status}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setStatusBusy(false);
    }
  };

  const saveEdit = async (data) => {
    setSaving(true);
    try {
      const res = await updateLead(id, data);
      apply(res.lead);
      toast.success("Lead updated");
      setEditing(false);
      setSearch({}, { replace: true });
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    setNotesSaving(true);
    try {
      const res = await updateLead(id, {
        notes,
        followUpDate: followUp ? new Date(`${followUp}T09:00:00`).toISOString() : null,
      });
      apply(res.lead);
      toast.success("Notes saved");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setNotesSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteLead(id);
      toast.success("Lead deleted");
      navigate("/admin/leads", { replace: true });
    } catch (e) {
      toast.error(getErrorMessage(e));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (error) {
    return (
      <>
        <p className="form-error" role="alert">{error}</p>
        <Button to="/admin/leads" variant="light">Back to leads</Button>
      </>
    );
  }
  if (!lead) return <PageLoader />;

  return (
    <>
      <Link to="/admin/leads" className="back-link"><ArrowLeft size={18} /> All leads</Link>

      <header className="admin-head">
        <div>
          <h1>{lead.name}</h1>
          <p className="muted">{lead.company || "No company"} · Lead since {formatDate(lead.created_at)}</p>
        </div>
        <div className="row">
          <StatusBadge status={lead.status} />
          {!editing && <Button variant="light" icon={<Pencil size={16} />} onClick={() => setEditing(true)}>Edit</Button>}
          <Button variant="danger-soft" icon={<Trash2 size={16} />} onClick={() => setConfirmDelete(true)}>Delete</Button>
        </div>
      </header>

      <section className="panel">
        <h2>Contact this lead</h2>
        <ContactActions lead={lead} />
      </section>

      <section className="panel">
        <h2>Status</h2>
        <StatusPipeline status={lead.status} onChange={changeStatus} disabled={statusBusy || editing} />
      </section>

      <section className="panel">
        <h2>{editing ? "Edit lead" : "Lead details"}</h2>
        {editing ? (
          <LeadEditForm lead={lead} onSave={saveEdit} onCancel={() => { setEditing(false); setSearch({}, { replace: true }); }} saving={saving} />
        ) : (
          <dl className="detail-grid">
            <Detail label="Full Name">{lead.name}</Detail>
            <Detail label="Email"><a href={`mailto:${lead.email}`}>{lead.email}</a></Detail>
            <Detail label="Phone"><span dir="ltr" className="num">{lead.phone}</span></Detail>
            <Detail label="Company">{lead.company}</Detail>
            <Detail label="Service">{lead.service}</Detail>
            <Detail label="Budget">{lead.budget}</Detail>
            <Detail label="Status"><StatusBadge status={lead.status} /></Detail>
            <Detail label="Created Date">{formatDateTime(lead.created_at)}</Detail>
            <Detail label="Updated Date">{formatDateTime(lead.updated_at)}</Detail>
            <Detail label="Follow-up Date">{lead.followUpDate ? formatDate(lead.followUpDate) : ""}</Detail>
            <Detail label="Message" wide><p className="message">{lead.message}</p></Detail>
          </dl>
        )}
      </section>

      <section className="panel">
        <h2>Internal notes and follow-up</h2>
        <div className="form-grid">
          <Input as="textarea" label="Notes (only your team sees these)" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Input label="Follow-up date" type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="narrow" />
          <div className="row end">
            <Button onClick={saveNotes} loading={notesSaving}>Save notes</Button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete lead"
        message="Are you sure you want to delete this lead?"
        cancelLabel="Cancel"
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
