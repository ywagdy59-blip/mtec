import { motion } from "framer-motion";
import { Cpu, LifeBuoy, MessageSquare, Puzzle, Users, Zap } from "lucide-react";
import { useLang } from "../../hooks/useLang";

const ITEMS = [
  { id: "team", icon: Users },
  { id: "fast", icon: Zap },
  { id: "tech", icon: Cpu },
  { id: "support", icon: LifeBuoy },
  { id: "custom", icon: Puzzle },
  { id: "comm", icon: MessageSquare },
];

export default function WhyUs() {
  const { t } = useLang();

  return (
    <section className="section" id="why">
      <div className="container">
        <header className="section-head">
          <h2>{t("why.title")}</h2>
          <p>{t("why.subtitle")}</p>
        </header>

        <div className="card-grid cols-3">
          {ITEMS.map(({ id, icon: Icon }, i) => (
            <motion.div
              key={id}
              className="why-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.4 }}
            >
              <Icon size={24} className="why-icon" />
              <div>
                <h3>{t(`why.items.${id}.title`)}</h3>
                <p>{t(`why.items.${id}.text`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
