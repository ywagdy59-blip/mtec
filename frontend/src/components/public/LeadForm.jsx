import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useLang } from "../../hooks/useLang";
import { createLead } from "../../services/leadService";
import { BUDGETS, EMAIL_REGEX, PHONE_REGEX, SERVICES } from "../../utils/constants";
import { getErrorMessage } from "../../utils/format";

const EMPTY = { name: "", email: "", phone: "", company: "", budget: "", message: "", website: "" };

function SuccessCheck() {
  return (
    <svg className="check" viewBox="0 0 120 120" aria-hidden="true">
      <motion.circle cx="60" cy="60" fill="#12B76A" initial={{ r: 0 }} animate={{ r: 54 }} transition={{ type: "spring", stiffness: 240, damping: 15 }} />
      <motion.path
        d="M36 63 l17 17 l32 -37"
        fill="none"
        stroke="#fff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.45 }}
      />
    </svg>
  );
}

export default function LeadForm({ service, onServiceChange }) {
  const { t } = useLang();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const validate = () => {
    const found = {};
    if (values.name.trim().length < 2) found.name = t("form.errors.name");
    if (!EMAIL_REGEX.test(values.email.trim())) found.email = t("form.errors.email");
    if (!values.phone.trim() || !PHONE_REGEX.test(values.phone.trim())) found.phone = t("form.errors.phone");
    if (!service) found.service = t("form.errors.service");
    if (!values.message.trim()) found.message = t("form.errors.message");
    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length) {
      document.getElementById(`lead-${Object.keys(found)[0]}`)?.focus();
      return; // the form is never sent with invalid data
    }

    setLoading(true);
    try {
      await createLead({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        company: values.company.trim(),
        service,
        budget: values.budget,
        message: values.message.trim(),
        website: values.website, // honeypot, stays empty for real visitors
      });
      setDone(true);
      setValues(EMPTY);
      onServiceChange("");
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            className="form-done"
            role="status"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <SuccessCheck />
            <h3>{t("form.successTitle")}</h3>
            <p>{t("form.success1")}</p>
            <p>{t("form.success2")}</p>
            <Button variant="outline-dark" onClick={() => setDone(false)}>{t("form.another")}</Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            noValidate
            className="form-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h3 className="form-title">{t("form.title")}</h3>

            {serverError && <div className="form-error" role="alert">{serverError}</div>}

            <div className="two-col">
              <Input id="lead-name" label={t("form.name")} required autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} placeholder={t("form.namePh")} />
              <Input id="lead-email" label={t("form.email")} required type="email" autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} placeholder={t("form.emailPh")} dir="ltr" />
            </div>

            <div className="two-col">
              <Input id="lead-phone" label={t("form.phone")} required type="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} error={errors.phone} placeholder={t("form.phonePh")} dir="ltr" />
              <Input id="lead-company" label={t("form.company")} autoComplete="organization" value={values.company} onChange={set("company")} placeholder={t("form.companyPh")} />
            </div>

            <div className="two-col">
              <Input id="lead-service" as="select" label={t("form.service")} required value={service} onChange={(e) => onServiceChange(e.target.value)} error={errors.service}>
                <option value="">{t("form.chooseService")}</option>
                {SERVICES.map((s) => (
                  <option key={s.value} value={s.value}>{t(`form.services.${s.key}`)}</option>
                ))}
              </Input>
              <Input id="lead-budget" as="select" label={t("form.budget")} value={values.budget} onChange={set("budget")}>
                <option value="">{t("form.chooseBudget")}</option>
                {BUDGETS.map((b) => (
                  <option key={b.value} value={b.value}>{t(`form.budgets.${b.key}`)}</option>
                ))}
              </Input>
            </div>

            <Input id="lead-message" as="textarea" label={t("form.message")} required rows={5} value={values.message} onChange={set("message")} error={errors.message} placeholder={t("form.messagePh")} />

            {/* honeypot: hidden from people, bots tend to fill it */}
            <div className="hp" aria-hidden="true">
              <label>Website<input type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} /></label>
            </div>

            <Button type="submit" size="lg" block loading={loading} icon={<Send size={18} className="flip" />}>
              {loading ? t("form.sending") : t("form.submit")}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
