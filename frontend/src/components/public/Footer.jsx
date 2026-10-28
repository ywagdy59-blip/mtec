import { Link } from "react-router-dom";
import Logo from "../ui/Logo";
import { useLang } from "../../hooks/useLang";
import { COMPANY } from "../../utils/constants";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Logo light />
          <p className="footer-about">{t("footer.about")}</p>
        </div>

        <div>
          <h4>{t("footer.links")}</h4>
          <ul>
            {[["services", "#services"], ["about", "#about"], ["why", "#why"], ["contact", "#contact"]].map(([key, href]) => (
              <li key={key}><a href={`/${href}`}>{t(`nav.${key}`)}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>{t("footer.contact")}</h4>
          <ul dir="ltr" className="footer-contact">
            <li><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
            <li><a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noreferrer">{COMPANY.phone}</a></li>
          </ul>
        </div>

        <div>
          <h4>{t("footer.follow")}</h4>
          <ul>
            {COMPANY.socials.map((s) => (
              <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer">{s.label}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {COMPANY.name}. {t("footer.rights")}</span>
        <Link to="/admin/login">{t("footer.team")}</Link>
      </div>
    </footer>
  );
}
