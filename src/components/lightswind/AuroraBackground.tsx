import { motion } from "framer-motion";

/**
 * Compact aurora background:
 * - contained to parent (absolute inset-0)
 * - masked so glow lives in the top half
 * - smaller blobs, slower motion
 */
export default function AuroraBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{
        // keep glow mostly in the upper portion of the section
        WebkitMaskImage:
          "radial-gradient(120% 70% at 50% 0%, #000 55%, transparent 78%)",
        maskImage:
          "radial-gradient(120% 70% at 50% 0%, #000 55%, transparent 78%)",
      }}
    >
      <motion.div
        className="absolute -top-16 -left-10"
        style={{
          height: "28vmax",
          width: "38vmax",
          borderRadius: "9999px",
          filter: "blur(42px)",
          background:
            "radial-gradient(closest-side, rgba(79,70,229,0.45), transparent 60%)",
        }}
        animate={{ y: [0, 18, 0], x: [0, 8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[18%] -right-10"
        style={{
          height: "24vmax",
          width: "34vmax",
          borderRadius: "9999px",
          filter: "blur(42px)",
          background:
            "radial-gradient(closest-side, rgba(6,182,212,0.35), transparent 60%)",
        }}
        animate={{ y: [0, -14, 0], x: [0, -6, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-[30%]"
        style={{
          height: "26vmax",
          width: "34vmax",
          borderRadius: "9999px",
          filter: "blur(42px)",
          background:
            "radial-gradient(closest-side, rgba(34,197,94,0.28), transparent 60%)",
        }}
        animate={{ y: [0, 12, 0], x: [0, 5, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.15), transparent 50%)",
        }}
      />
    </div>
  );
}
