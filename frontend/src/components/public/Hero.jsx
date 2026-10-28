import { motion } from "framer-motion";
import { MessageCircle, Rocket } from "lucide-react";
import Button from "../ui/Button";
import CodeWindow from "./CodeWindow";
import { useLang } from "../../hooks/useLang";
import { COMPANY } from "../../utils/constants";

const rise = (delay) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: "easeOut" },
});

export default function Hero() {
  const { t } = useLang();

  return (
    <section className="hero" id="home">
      <div className="container hero-grid">
        <div className="hero-copy">
          <motion.span className="hero-badge" {...rise(0.05)}>
            <i className="pulse" /> {t("hero.badge")}
          </motion.span>

          <motion.h1 {...rise(0.15)}>{t("hero.title")}</motion.h1>
          <motion.p className="hero-text" {...rise(0.3)}>{t("hero.text")}</motion.p>

          <motion.div className="hero-actions" {...rise(0.45)}>
            <Button href="#contact" size="lg" icon={<Rocket size={20} />}>{t("hero.getStarted")}</Button>
            <Button
              href={`https://wa.me/${COMPANY.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              variant="outline"
              size="lg"
              icon={<MessageCircle size={20} />}
            >
              {t("hero.contactUs")}
            </Button>
          </motion.div>

          <motion.dl className="hero-stats" {...rise(0.6)}>
            <div><dt>9+</dt><dd>{t("hero.years")}</dd></div>
            <div><dt>150+</dt><dd>{t("hero.projects")}</dd></div>
            <div><dt>40+</dt><dd>{t("hero.engineers")}</dd></div>
          </motion.dl>
        </div>

        <CodeWindow />
      </div>
    </section>
  );
}
