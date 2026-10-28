import { motion } from "framer-motion";
import { useLang } from "../../hooks/useLang";

// each line is a list of [token type, text]
const CODE = [
  [["cm", "// Your idea becomes real software with MTEC"]],
  [["kw", "import"], ["pl", " { MTEC } "], ["kw", "from"], ["st", ' "@mtec/software"'], ["pl", ";"]],
  [],
  [["kw", "const"], ["pl", " client = { name: "], ["st", '"You"'], ["pl", ", goal: "], ["st", '"Launch my product"'], ["pl", " };"]],
  [],
  [["kw", "const"], ["pl", " project = "], ["kw", "await"], ["pl", " MTEC."], ["fn", "start"], ["pl", "(client);"]],
  [],
  [["kw", "await"], ["pl", " project."], ["fn", "design"], ["pl", "(["], ["st", '"UI/UX"'], ["pl", ", "], ["st", '"Web"'], ["pl", ", "], ["st", '"Mobile"'], ["pl", "]);"]],
  [["kw", "await"], ["pl", " project."], ["fn", "build"], ["pl", "({ sprints: "], ["st", '"weekly"'], ["pl", " });"]],
  [["kw", "await"], ["pl", " project."], ["fn", "launch"], ["pl", "();"]],
  [],
  [["pl", "console."], ["fn", "log"], ["pl", "(project.status);"]],
  [["cm", '// → "Live, supported and growing 🚀"']],
];

const TERMINAL = [
  ["cmd", "$ mtec deliver --client you"],
  ["ok", "✓ Free discovery call and clear estimate"],
  ["ok", "✓ Weekly demos while we build"],
  ["ok", "✓ Tested release and launch support"],
  ["end", "🚀 Your product is live!"],
];

const list = (delay) => ({
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: delay } },
});
const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function CodeWindow() {
  const { t } = useLang();

  return (
    <div className="code-stage" dir="ltr">
      <div className="code-window">
        <div className="window-bar">
          <span className="dot d1" /><span className="dot d2" /><span className="dot d3" />
          <span className="window-title">project.js — MTEC Software</span>
        </div>
        <motion.pre className="code-body" variants={list(0.6)} initial="hidden" animate="show" aria-label="Sample code">
          {CODE.map((tokens, i) => (
            <motion.code key={i} className="code-line" variants={item}>
              <span className="ln">{i + 1}</span>
              {tokens.map(([type, text], j) => (
                <span key={j} className={`tk-${type}`}>{text}</span>
              ))}
            </motion.code>
          ))}
        </motion.pre>
      </div>

      <div className="terminal" aria-label={t("hero.terminalTitle")}>
        <div className="window-bar">
          <span className="dot d1" /><span className="dot d2" /><span className="dot d3" />
          <span className="window-title">Terminal</span>
        </div>
        <motion.div className="term-body" variants={list(2.2)} initial="hidden" animate="show">
          {TERMINAL.map(([type, text], i) => (
            <motion.div key={i} className={`term-${type}`} variants={item}>
              {text}
              {i === TERMINAL.length - 1 && <span className="caret" />}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
