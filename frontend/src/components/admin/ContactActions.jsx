import { Mail, MessageCircle, Phone } from "lucide-react";
import { mailLink, telLink, whatsappLink } from "../../utils/phone";

// Call opens the dialer, WhatsApp opens wa.me, Email opens the default mail app
export default function ContactActions({ lead }) {
  return (
    <div className="contact-actions">
      <a className="btn btn-primary" href={telLink(lead.phone)}>
        <Phone size={18} /> Call
      </a>
      <a
        className="btn btn-success"
        href={whatsappLink(lead.phone, `Hello ${lead.name}, this is MTEC Software about your project request.`)}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={18} /> WhatsApp
      </a>
      <a className="btn btn-dark" href={mailLink(lead.email, "Your project request | MTEC Software")}>
        <Mail size={18} /> Email
      </a>
    </div>
  );
}
