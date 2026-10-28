import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { PageLoader } from "../../components/ui/Spinner";
import { Stars } from "../../components/public/Testimonials";
import { createReview, deleteReview, getReviews, idOf } from "../../services/courseService";
import { getErrorMessage } from "../../utils/format";

const EMPTY = { name: "", role: "", rating: "5", text: "" };

export default function Reviews() {
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState("");
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => getReviews().then(setReviews).catch((e) => setError(getErrorMessage(e)));
  useEffect(() => {
    load();
  }, []);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const found = {};
    if (values.name.trim().length < 2) found.name = "Name is required";
    if (!values.text.trim()) found.text = "Review text is required";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await createReview({
        name: values.name.trim(),
        role: values.role.trim(),
        rating: Number(values.rating),
        text: values.text.trim(),
      });
      toast.success("Review added");
      setValues(EMPTY);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteReview(idOf(target));
      toast.success("Review deleted");
      setTarget(null);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Reviews</h1>
          <p className="muted">What you add here shows on the website.</p>
        </div>
      </header>

      <section className="panel">
        <h2>Add a review</h2>
        <form className="form-grid" onSubmit={submit} noValidate>
          <div className="two-col">
            <Input label="Client name" required value={values.name} onChange={set("name")} error={errors.name} />
            <Input label="Role / company" value={values.role} onChange={set("role")} />
          </div>
          <Input as="select" label="Rating" value={values.rating} onChange={set("rating")} className="narrow">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
          </Input>
          <Input as="textarea" label="Review" required rows={3} value={values.text} onChange={set("text")} error={errors.text} />
          <div className="row end"><Button type="submit" loading={saving}>Add review</Button></div>
        </form>
      </section>

      {error ? (
        <p className="form-error" role="alert">{error}</p>
      ) : !reviews ? (
        <PageLoader />
      ) : reviews.length === 0 ? (
        <div className="empty"><h3>No reviews yet</h3><p>Sample reviews are shown on the website until you add yours.</p></div>
      ) : (
        <div className="review-admin-list">
          {reviews.map((r) => (
            <div className="panel" key={idOf(r)}>
              <div className="panel-head">
                <div><strong>{r.name}</strong> <span className="muted">{r.role}</span></div>
                <button className="btn btn-danger-soft btn-sm btn-icon" onClick={() => setTarget(r)} aria-label={`Delete review by ${r.name}`}><Trash2 size={16} /></button>
              </div>
              <Stars value={r.rating} />
              <p style={{ marginTop: ".5rem" }}>{r.text ?? r.comment}</p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete review"
        message="Are you sure you want to delete this review?"
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setTarget(null)}
      />
    </>
  );
}
