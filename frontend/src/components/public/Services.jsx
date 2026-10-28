import { motion } from "framer-motion";
import { ChevronRight, Code2, Globe, Megaphone, Palette, ShoppingCart, Smartphone } from "lucide-react";
import { useLang } from "../../hooks/useLang";

// "service" is the exact value the API expects
const SERVICES = [
  { id: "web", icon: Globe, service: "Web Development" },
  { id: "mobile", icon: Smartphone, service: "Mobile App" },
  { id: "uiux", icon: Palette, service: "UI/UX Design" },
  { id: "ecommerce", icon: ShoppingCart, service: "E-Commerce" },
  { id: "marketing", icon: Megaphone, service: "Digital Marketing" },
  { id: "custom", icon: Code2, service: "Other" },
];

const grid = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const card = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function Services({ onSelect }) {
  const { t } = useLang();

  return (
    <section className="section" id="services">
      <div className="container">
        <header className="section-head">
          <h2>{t("services.title")}</h2>
          <p>{t("services.subtitle")}</p>
        </header>

        <motion.div
          className="card-grid cols-3"
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {SERVICES.map(({ id, icon: Icon, service }) => (
            <motion.article key={id} className="service-card" variants={card}>
              <span className="icon-tile"><Icon size={26} /></span>
              <h3>{t(`services.items.${id}.title`)}</h3>
              <p>{t(`services.items.${id}.text`)}</p>
              <button type="button" className="link-btn" onClick={() => onSelect(service)}>
                {t("services.request")} <ChevronRight size={18} className="flip" />
              </button>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
