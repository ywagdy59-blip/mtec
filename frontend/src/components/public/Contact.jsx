import { Mail, MessageCircle, Phone } from "lucide-react";
import LeadForm from "./LeadForm";
import { useLang } from "../../hooks/useLang";
import { COMPANY } from "../../utils/constants";

export default function Contact({ service, onServiceChange }) {
  const { t } = useLang();

  return (
    <section className="section section-alt" id="contact">
      <div className="container contact-grid">
        <aside className="contact-info">
          <h2>{t("contact.title")}</h2>
          <p>{t("contact.subtitle")}</p>

          <ul className="contact-list" dir="ltr">
            <li><Mail size={20} /><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
            <li><Phone size={20} /><a href={`tel:+${COMPANY.whatsapp}`}>{COMPANY.phone}</a></li>
            <li><MessageCircle size={20} /><a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noreferrer">{t("contact.chat")}</a></li>
          </ul>

          <div className="socials">
            <span>{t("contact.follow")}</span>
            <div>
              {COMPANY.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
              ))}
            </div>
          </div>
        </aside>

        <LeadForm service={service} onServiceChange={onServiceChange} />
      </div>
    </section>
  );
}
