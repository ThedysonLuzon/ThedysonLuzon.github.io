import{j as r}from"./jsx-runtime.D_zvdyIk.js";import{r as d}from"./index.RH_Wq4ov.js";function j({href:m,children:h,className:y="",id:b,style:v}){const p=d.useRef(null),i=d.useMemo(()=>typeof window<"u"&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,[]);d.useEffect(()=>{const e=p.current;if(!e)return;let s=0;function x(n){if(i)return;const t=e.getBoundingClientRect(),a=n.clientX-(t.left+t.width/2),c=n.clientY-(t.top+t.height/2),o=Math.max(-1,Math.min(1,a/(t.width/2))),l=Math.max(-1,Math.min(1,c/(t.height/2))),k=(o+1)/2*100,E=(l+1)/2*100;cancelAnimationFrame(s),s=requestAnimationFrame(()=>{e.style.setProperty("--rx",`${(-l*6).toFixed(2)}deg`),e.style.setProperty("--ry",`${(o*8).toFixed(2)}deg`),e.style.setProperty("--tx",`${(o*6).toFixed(2)}px`),e.style.setProperty("--ty",`${(l*6).toFixed(2)}px`),e.style.setProperty("--gx",`${k.toFixed(2)}%`),e.style.setProperty("--gy",`${E.toFixed(2)}%`)})}function g(){i||(e.style.setProperty("--rx","0deg"),e.style.setProperty("--ry","0deg"),e.style.setProperty("--tx","0px"),e.style.setProperty("--ty","0px"))}function f(){i||(e.classList.add("mcta-pop"),setTimeout(()=>e.classList.remove("mcta-pop"),220))}function u(n){const t=e.getBoundingClientRect(),a=document.createElement("span");a.className="mcta-ripple";const c=n.clientX-t.left,o=n.clientY-t.top;a.style.left=`${c}px`,a.style.top=`${o}px`,e.appendChild(a),a.addEventListener("animationend",()=>a.remove())}return e.addEventListener("pointermove",x),e.addEventListener("pointerleave",g),e.addEventListener("pointerenter",f),e.addEventListener("click",u),()=>{e.removeEventListener("pointermove",x),e.removeEventListener("pointerleave",g),e.removeEventListener("pointerenter",f),e.removeEventListener("click",u),cancelAnimationFrame(s)}},[i]);const w=m?"a":"button";return r.jsxs(r.Fragment,{children:[r.jsxs(w,{ref:p,id:b,href:m,className:`mcta ${y}`,style:v,children:[r.jsx("span",{className:"mcta-bg","aria-hidden":"true"}),r.jsx("span",{className:"mcta-glow","aria-hidden":"true"}),r.jsx("span",{className:"mcta-shine","aria-hidden":"true"}),r.jsx("span",{className:"mcta-label",children:h})]}),r.jsx("style",{children:`
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
      `})]})}export{j as default};
