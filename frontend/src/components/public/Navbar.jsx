import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "../ui/Logo";
import Button from "../ui/Button";
import LangSwitch from "../ui/LangSwitch";
import { useLang } from "../../hooks/useLang";

const LINKS = [
  ["home", "#home"],
  ["services", "#services"],
  ["courses", "#courses"],
  ["about", "#about"],
  ["why", "#why"],
  ["reviews", "#reviews"],
  ["contact", "#contact"],
];

export default function Navbar() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-row">
        <Logo light />

        <nav className="nav-links" aria-label="Main">
          {LINKS.map(([key, href]) => (
            <a key={key} href={`/${href}`} className="nav-link">{t(`nav.${key}`)}</a>
          ))}
        </nav>

        <div className="nav-tools">
          <LangSwitch />
          <Button href="/#contact" size="sm" className="hide-sm">{t("nav.getStarted")}</Button>
          <button
            className="nav-burger"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="nav-drawer"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="container drawer-inner">
              {LINKS.map(([key, href]) => (
                <a key={key} href={`/${href}`} className="nav-link" onClick={() => setOpen(false)}>
                  {t(`nav.${key}`)}
                </a>
              ))}
              <Button href="/#contact" block onClick={() => setOpen(false)}>{t("nav.getStarted")}</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
