// src/components/MagneticCTA.tsx
import React, { useEffect, useMemo, useRef } from "react";

type Props = {
  href?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
};

export default function MagneticCTA({ href, children, className = "", id, style }: Props) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    function onPointerMove(e: PointerEvent) {
      if (reduced) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      const dx = Math.max(-1, Math.min(1, x / (r.width / 2)));
      const dy = Math.max(-1, Math.min(1, y / (r.height / 2)));
      const glowX = ((dx + 1) / 2) * 100;
      const glowY = ((dy + 1) / 2) * 100;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        (el as HTMLElement).style.setProperty("--rx", `${(-dy * 6).toFixed(2)}deg`);
        (el as HTMLElement).style.setProperty("--ry", `${(dx * 8).toFixed(2)}deg`);
        (el as HTMLElement).style.setProperty("--tx", `${(dx * 6).toFixed(2)}px`);
        (el as HTMLElement).style.setProperty("--ty", `${(dy * 6).toFixed(2)}px`);
        (el as HTMLElement).style.setProperty("--gx", `${glowX.toFixed(2)}%`);
        (el as HTMLElement).style.setProperty("--gy", `${glowY.toFixed(2)}%`);
      });
    }

    function onPointerLeave() {
      if (reduced) return;
      (el as HTMLElement).style.setProperty("--rx", `0deg`);
      (el as HTMLElement).style.setProperty("--ry", `0deg`);
      (el as HTMLElement).style.setProperty("--tx", `0px`);
      (el as HTMLElement).style.setProperty("--ty", `0px`);
    }

    function onPointerEnter() {
      if (reduced) return;
      el.classList.add("mcta-pop");
      setTimeout(() => el.classList.remove("mcta-pop"), 220);
    }

    function onClick(e: MouseEvent) {
      // ripple burst
      const r = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "mcta-ripple";
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      el.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    }

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);
    el.addEventListener("pointerenter", onPointerEnter);
    el.addEventListener("click", onClick);

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      el.removeEventListener("pointerenter", onPointerEnter);
      el.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const Tag = (href ? "a" : "button") as any;

  return (
    <>
      <Tag
        ref={ref}
        id={id}
        href={href}
        className={`mcta ${className}`}
        style={style}
      >
        <span className="mcta-bg" aria-hidden="true" />
        <span className="mcta-glow" aria-hidden="true" />
        <span className="mcta-shine" aria-hidden="true" />
        <span className="mcta-label">{children}</span>
      </Tag>

      {/* Scoped styles */}
      <style>{`
        .mcta{
          --accent: var(--color-accent, #4f46e5);
          --rx: 0deg; --ry: 0deg; --tx: 0px; --ty: 0px;
          --gx: 50%; --gy: 50%;
          position: relative;
          display: inline-flex;
          align-items: center; justify-content: center;
          gap: .5rem;
          padding: .85rem 1.2rem;
          border-radius: 9999px;
          font-weight: 800;
          letter-spacing: .35px;
          text-decoration: none;
          background: transparent;
          color: #fff;
          border: 1px solid var(--accent);
          transform: translateZ(0) rotateX(var(--rx)) rotateY(var(--ry)) translate(var(--tx), var(--ty));
          box-shadow: 0 14px 36px -18px color-mix(in srgb, var(--accent) 70%, transparent);
          isolation: isolate;
          overflow: hidden;
          will-change: transform, box-shadow;
          transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
        }
        :root[data-theme="light"] .mcta { color: #fff; }

        .mcta .mcta-label { position: relative; z-index: 3; }

        /* Animated gradient base */
        .mcta-bg{
          position:absolute; inset:0; z-index:1;
          background: linear-gradient(90deg,
            color-mix(in srgb, var(--accent) 85%, #000) 0%,
            #22d3ee 25%,
            #a78bfa 50%,
            #34d399 75%,
            color-mix(in srgb, var(--accent) 85%, #000) 100%);
          background-size: 220% 100%;
          animation: mcta-shift 5.8s linear infinite;
          filter: saturate(1.1);
        }
        @keyframes mcta-shift { to { background-position: 200% 0; } }

        /* Soft glow that tracks cursor (via --gx/--gy) */
        .mcta-glow{
          position:absolute; inset:-20%; z-index:2; pointer-events:none;
          background: radial-gradient(160px 160px at var(--gx) var(--gy),
            rgba(255,255,255,.5), transparent 60%);
          mix-blend-mode: soft-light;
          filter: blur(18px);
          opacity: .55;
          transition: opacity .2s ease;
        }
        .mcta:hover .mcta-glow { opacity: .7; }

        /* Glassy highlight sweep */
        .mcta-shine{
          position:absolute; z-index:3; inset:auto -30% -40% -30%;
          height: 160%; transform: rotate(8deg);
          background: linear-gradient( to right, rgba(255,255,255,.0), rgba(255,255,255,.18), rgba(255,255,255,.0) );
          animation: mcta-shine 2.8s ease-in-out infinite;
          opacity: .75;
        }
        @keyframes mcta-shine {
          0% { transform: translateX(-40%) rotate(8deg); }
          50% { transform: translateX(20%) rotate(8deg); }
          100% { transform: translateX(60%) rotate(8deg); }
        }

        .mcta:hover, .mcta:focus-visible{
          box-shadow: 0 16px 40px -18px color-mix(in srgb, var(--accent) 85%, transparent);
        }
        .mcta:focus-visible{
          outline: 2px solid var(--accent);
          outline-offset: 3px;
        }

        /* Entrance “pop” */
        .mcta-pop{ animation: mcta-pop .22s ease; }
        @keyframes mcta-pop {
          0% { transform: scale(1) }
          50% { transform: scale(1.03) }
          100% { transform: scale(1) }
        }

        /* Click ripple */
        .mcta-ripple{
          position:absolute; z-index:2; width: 12px; height:12px; border-radius:9999px;
          background: rgba(255,255,255,.8); pointer-events:none;
          transform: translate(-50%, -50%); opacity:.8;
          animation: mcta-ripple .6s cubic-bezier(.2,.7,.2,1) forwards;
          mix-blend-mode: overlay;
        }
        @keyframes mcta-ripple {
          to {
            width: 240px; height: 240px; opacity: 0;
          }
        }

        /* Themed border for light mode contrast */
        :root[data-theme="light"] .mcta{
          border-color: color-mix(in srgb, var(--accent) 70%, #fff);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce){
          .mcta{
            transform: none !important;
          }
          .mcta-bg, .mcta-shine{
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
