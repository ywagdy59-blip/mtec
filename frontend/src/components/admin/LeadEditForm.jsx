import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { BUDGETS, PHONE_REGEX, SERVICES, STATUSES } from "../../utils/constants";

// editable fields from the brief: name, phone, company, service, budget, message, status
export default function LeadEditForm({ lead, onSave, onCancel, saving }) {
  const [values, setValues] = useState({
    name: lead.name,
    phone: lead.phone,
    company: lead.company || "",
    service: lead.service,
    budget: lead.budget || "",
    message: lead.message,
    status: lead.status,
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = (event) => {
    event.preventDefault();
    const found = {};
    if (values.name.trim().length < 2) found.name = "Name must be at least 2 characters";
    if (!PHONE_REGEX.test(values.phone.trim())) found.phone = "Enter a valid phone number";
    if (!values.message.trim()) found.message = "Message is required";
    setErrors(found);
    if (Object.keys(found).length) return;

    onSave({
      ...values,
      name: values.name.trim(),
      phone: values.phone.trim(),
      company: values.company.trim(),
      message: values.message.trim(),
    });
  };

  return (
    <form className="form-grid" onSubmit={submit} noValidate>
      <div className="two-col">
        <Input label="Full Name" required value={values.name} onChange={set("name")} error={errors.name} />
        <Input label="Phone" required value={values.phone} onChange={set("phone")} error={errors.phone} dir="ltr" />
      </div>
      <div className="two-col">
        <Input label="Company" value={values.company} onChange={set("company")} />
        <Input label="Email" value={lead.email} disabled hint="Email can't be changed" dir="ltr" readOnly />
      </div>
      <div className="two-col">
        <Input as="select" label="Service" value={values.service} onChange={set("service")}>
          {SERVICES.map((s) => <option key={s.value} value={s.value}>{s.value}</option>)}
        </Input>
        <Input as="select" label="Budget" value={values.budget} onChange={set("budget")}>
          <option value="">Not provided</option>
          {BUDGETS.map((b) => <option key={b.value} value={b.value}>{b.value}</option>)}
        </Input>
      </div>
      <Input as="select" label="Status" value={values.status} onChange={set("status")}>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </Input>
      <Input as="textarea" label="Message" required rows={5} value={values.message} onChange={set("message")} error={errors.message} />

      <div className="row end">
        <Button variant="light" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>Save changes</Button>
      </div>
    </form>
  );
}
