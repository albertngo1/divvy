import { forwardRef, useImperativeHandle, useRef } from "react";

// Parallax starfield behind the cloud. Three depth layers shift at different rates when you
// pan (near stars move most) so it reads as flying through space. Driven by the cloud's
// pan transform via setView(); uses background-position on a repeating tile → seamless/infinite.
export interface StarfieldApi { setView: (x: number, y: number, k: number) => void; }

const LAYERS = [
  { cls: "far", f: 0.03 },
  { cls: "mid", f: 0.08 },
  { cls: "near", f: 0.16 },
];

const Starfield = forwardRef<StarfieldApi>(function Starfield(_props, ref) {
  const els = useRef<(HTMLDivElement | null)[]>([]);
  useImperativeHandle(ref, () => ({
    setView(x, y) {
      for (let i = 0; i < LAYERS.length; i++) {
        const el = els.current[i];
        if (el) el.style.backgroundPosition = `${(x * LAYERS[i].f).toFixed(1)}px ${(y * LAYERS[i].f).toFixed(1)}px`;
      }
    },
  }), []);

  return (
    <div className="starfield" aria-hidden="true">
      {LAYERS.map((l, i) => (
        <div key={l.cls} ref={(el) => { els.current[i] = el; }} className={"star-layer " + l.cls} />
      ))}
      <div className="star-vignette" />
    </div>
  );
});

export default Starfield;
