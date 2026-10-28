import { motion } from "framer-motion";
import { useLang } from "../../hooks/useLang";

const TECH = ["React", "Node.js", "MongoDB", "Express", "Flutter", "Laravel", "MySQL", "Figma", "AWS", "Docker"];

export default function About() {
  const { t } = useLang();
  const steps = t("about.steps");

  return (
    <section className="section section-alt" id="about">
      <div className="container about-grid">
        <div>
          <h2>{t("about.title")}</h2>
          <p className="about-p">{t("about.p1")}</p>
          <p className="about-p">{t("about.p2")}</p>

          <h3 className="mini-title">{t("about.techTitle")}</h3>
          <ul className="chips" dir="ltr">
            {TECH.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>

        <div className="process">
          <h3 className="mini-title">{t("about.processTitle")}</h3>
          <ol className="steps">
            {steps.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
              >
                <span className="step-no">{i + 1}</span>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.text}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
