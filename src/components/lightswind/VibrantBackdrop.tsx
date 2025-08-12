import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import SparkleField from "./SparkleField";

/**
 * Vibrant backdrop
 * - Rotating conic gradient 
 * - Diagonal light beams 
 * - Mouse-follow spotlight
 * - Fully contained to the hero
 */
export default function VibrantBackdrop() {
  const x = useMotionValue(50); // %
  const y = useMotionValue(36);
  const sx = useSpring(x, { stiffness: 160, damping: 20, mass: 0.25 });
  const sy = useSpring(y, { stiffness: 160, damping: 20, mass: 0.25 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      x.set((e.clientX / w) * 100);
      y.set((e.clientY / h) * 100);
    };
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReduced) {
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    }
  }, [x, y]);

  return (
    <motion.div
      className="vb-wrap"
      style={{ ["--x" as any]: sx, ["--y" as any]: sy }}
      aria-hidden="true"
    >
      <div className="vb-gradient" />
      <div className="vb-beams" />
      <SparkleField />
      <div className="vb-spotlight" />
      <div className="vb-glow" />
    </motion.div>
  );
}
