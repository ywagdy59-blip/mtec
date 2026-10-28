import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "framer-motion";

export default function CountUp({ value = 0, duration = 1 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduce) {
      node.textContent = String(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => (node.textContent = String(Math.round(latest))),
    });
    return () => controls.stop();
  }, [value, duration, reduce]);

  return <span ref={ref}>0</span>;
}
