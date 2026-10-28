import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { PageLoader } from "../../components/ui/Spinner";
import {
  confirmCashOrder,
  getGuestOrders,
  idOf,
  money,
  resendGuestOrderAccess,
} from "../../services/courseService";
import { formatDateTime, getErrorMessage } from "../../utils/format";

export default function GuestOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [target, setTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(null);

  const load = async () => {
    try {
      setError("");
      setOrders(await getGuestOrders());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmPayment = async () => {
    setSaving(true);
    try {
      await confirmCashOrder(idOf(target));
      toast.success("Payment confirmed and access email sent");
      setTarget(null);
      await load();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const resendAccess = async (order) => {
    setResending(idOf(order));
    try {
      await resendGuestOrderAccess(idOf(order));
      toast.success("Course access email sent");
      await load();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setResending(null);
    }
  };

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Guest orders</h1>
          <p className="muted">{orders ? `${orders.length} latest orders` : "Loading..."}</p>
        </div>
        <Button variant="light" onClick={load}>Refresh</Button>
      </header>

      {error ? (
        <p className="form-error" role="alert">{error}</p>
      ) : !orders ? (
        <PageLoader />
      ) : orders.length === 0 ? (
        <div className="empty"><h3>No guest orders yet</h3></div>
      ) : (
        <div className="table-wrap">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Course</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={idOf(order)}>
                  <td data-label="Customer">
                    <strong>{order.name}</strong>
                    <br />
                    <a href={`mailto:${order.email}`}>{order.email}</a>
                    <br />
                    <a href={`tel:${order.phone}`}>{order.phone}</a>
                  </td>
                  <td data-label="Course">{order.course?.title || "-"}</td>
                  <td data-label="Method">{order.method}</td>
                  <td data-label="Amount" className="num">{money(order.amountTotal / 100)}</td>
                  <td data-label="Status">{order.status}</td>
                  <td data-label="Created">{formatDateTime(order.createdAt)}</td>
                  <td data-label="Action">
                    {order.method === "cash" && order.status !== "paid" && (
                      <Button size="sm" onClick={() => setTarget(order)}>Confirm cash</Button>
                    )}
                    {order.status === "paid" && (
                      order.accessEmailSentAt ? (
                        <span className="muted">Access sent</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="light"
                          loading={resending === idOf(order)}
                          onClick={() => resendAccess(order)}
                        >
                          Retry access email
                        </Button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Confirm cash payment"
        message={`Confirm that you received payment from ${target?.name}? A course access email will be sent.`}
        confirmLabel="Confirm payment"
        loading={saving}
        onConfirm={confirmPayment}
        onCancel={() => setTarget(null)}
      />
    </>
  );
}
