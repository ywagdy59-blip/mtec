import { motion } from "framer-motion";
import CountUp from "../ui/CountUp";

export default function StatCard({ label, value, tone = "blue", index = 0 }) {
  return (
    <motion.div
      className={`stat-card tone-${tone}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <span className="stat-label">{label}</span>
      <b className="stat-value"><CountUp value={value} /></b>
    </motion.div>
  );
}
