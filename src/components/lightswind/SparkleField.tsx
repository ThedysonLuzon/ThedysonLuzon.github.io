import { useMemo } from "react";

/**
 * Lightweight sparkle field:
 * - deterministic positions (no SSR/CSR mismatch)
 * - gentle float + twinkle
 * - theme-aware via your CSS tokens
 */
export default function SparkleField() {
  const stars = useMemo(() => {
    const list: { x: number; y: number; s: number; delay: number; float: number }[] = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      // pseudo-random but deterministic positions
      const x = (i * 29) % 100;              // 0..99 %
      const y = 8 + ((i * 53) % 60);         // 8..68 %
      const s = 1.5 + (i % 3);               // size px (≈1.5–3.5)
      const delay = (i * 0.22) % 6.0;        // 0..6s
      const float = 6 + (i % 5);             // 6..10 px float amplitude
      list.push({ x, y, s, delay, float });
    }
    return list;
  }, []);

  return (
    <div className="vb-sparkles" aria-hidden="true">
      {stars.map((st, idx) => (
        <span
          key={idx}
          className="vb-star"
          style={
            {
              left: `calc(${st.x}% - ${st.s / 2}px)`,
              top: `calc(${st.y}% - ${st.s / 2}px)`,
              // custom props for CSS
              ["--s" as any]: `${st.s}px`,
              ["--delay" as any]: `${st.delay}s`,
              ["--float" as any]: `${st.float}px`,
              ["--dur" as any]: `${2.8 + (idx % 6) * 0.4}s`,
              ["--fdur" as any]: `${10 + (idx % 7) * 1.2}s`,
            } as React.CSSProperties
          }
        >
          <span className="vb-core" />
        </span>
      ))}
    </div>
  );
}
