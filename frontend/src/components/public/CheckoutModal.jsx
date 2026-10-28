import { useState } from "react";
import { Banknote, CheckCircle2, CreditCard } from "lucide-react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useLang } from "../../hooks/useLang";
import { guestCheckout, idOf, money, paymentUrl } from "../../services/courseService";
import { EMAIL_REGEX, PHONE_REGEX } from "../../utils/constants";
import { getErrorMessage } from "../../utils/format";

export default function CheckoutModal({ course, onClose }) {
  const { t } = useLang();
  const [values, setValues] = useState({ name: "", email: "", phone: "" });
  const [method, setMethod] = useState("card");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [freeOrder, setFreeOrder] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const found = {};
    if (values.name.trim().length < 2) found.name = t("form.errors.name");
    if (!EMAIL_REGEX.test(values.email.trim())) found.email = t("form.errors.email");
    if (!PHONE_REGEX.test(values.phone.trim())) found.phone = t("form.errors.phone");
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      const res = await guestCheckout({
        courseId: idOf(course),
        method,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      });
      if (res.free) {
        setFreeOrder(true);
        setDone(true);
      } else if (method === "card") {
        const url = paymentUrl(res);
        if (!url) throw new Error("no-url");
        window.location.href = url; // go to the payment page
        return;
      }
      setDone(true);
    } catch (error) {
      setServerError(error.message === "no-url" ? t("checkout.noLink") : getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const footer = done ? (
    <Button onClick={onClose}>{t("checkout.close")}</Button>
  ) : (
    <>
      <Button variant="light" onClick={onClose} disabled={loading}>{t("checkout.cancel")}</Button>
      <Button type="submit" form="checkout-form" loading={loading}>
        {method === "card" ? t("checkout.pay") : t("checkout.confirm")}
      </Button>
    </>
  );

  return (
    <Modal open onClose={loading ? undefined : onClose} title={t("checkout.title")} footer={footer}>
      {done ? (
        <div className="form-done" role="status">
          <CheckCircle2 size={64} color="#12B76A" />
          <h3>{t("checkout.doneTitle")}</h3>
          <p>{t(freeOrder ? "checkout.freeText" : "checkout.doneText")}</p>
        </div>
      ) : (
        <form id="checkout-form" className="form-grid" onSubmit={submit} noValidate dir={document.documentElement.dir}>
          <div className="checkout-summary">
            <strong>{course.title}</strong>
            <span>{t("checkout.total")}: <b>{money(course.price)}</b></span>
          </div>

          {serverError && <div className="form-error" role="alert">{serverError}</div>}

          <Input label={t("form.name")} required autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} />
          <Input label={t("form.email")} required type="email" autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} dir="ltr" />
          <Input label={t("form.phone")} required type="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} error={errors.phone} dir="ltr" />

          <div className="field">
            <label>{t("checkout.method")}</label>
            <div className="pay-options" role="radiogroup" aria-label={t("checkout.method")}>
              <button type="button" role="radio" aria-checked={method === "card"} className="pay-option" onClick={() => setMethod("card")}>
                <CreditCard size={22} />
                <span><b>{t("checkout.card")}</b><small>{t("checkout.cardHint")}</small></span>
              </button>
              <button type="button" role="radio" aria-checked={method === "cash"} className="pay-option" onClick={() => setMethod("cash")}>
                <Banknote size={22} />
                <span><b>{t("checkout.cash")}</b><small>{t("checkout.cashHint")}</small></span>
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
