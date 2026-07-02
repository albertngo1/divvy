import { useState } from "react";

interface Props {
  onZoom: (factor: number) => void;
  onPan: (dx: number, dy: number) => void;
  onReset: () => void;
}

// Rows for the keyboard/mouse legend
const LEGEND: [string, string][] = [
  ["Scroll / pinch", "zoom in & out"],
  ["Drag", "pan around"],
  ["W A S D / arrows", "pan around"],
  ["Click a bubble", "open its write-up"],
  ["Esc", "close panel · clear filters"],
  ["◍ Divvy logo", "what is this?"],
];

const PAN = 160; // screen px per nudge

export default function ViewControls({ onZoom, onPan, onReset }: Props) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="viewctl" aria-label="view controls">
      {helpOpen && (
        <div className="vc-legend" role="dialog" aria-label="controls">
          <div className="vc-legend-head">Controls</div>
          {LEGEND.map(([k, v]) => (
            <div className="vc-legend-row" key={k}>
              <kbd>{k}</kbd><span>{v}</span>
            </div>
          ))}
        </div>
      )}

      <div className="vc-pad" aria-label="pan">
        <button className="vc-btn vc-up" title="pan up" onClick={() => onPan(0, PAN)}>▲</button>
        <button className="vc-btn vc-left" title="pan left" onClick={() => onPan(PAN, 0)}>◀</button>
        <button className="vc-btn vc-right" title="pan right" onClick={() => onPan(-PAN, 0)}>▶</button>
        <button className="vc-btn vc-down" title="pan down" onClick={() => onPan(0, -PAN)}>▼</button>
        <button className="vc-btn vc-fit" title="fit to screen" onClick={onReset}>⤢</button>
      </div>

      <div className="vc-zoom">
        <button className="vc-btn" title="zoom in" onClick={() => onZoom(1.4)}>＋</button>
        <button className="vc-btn" title="zoom out" onClick={() => onZoom(1 / 1.4)}>－</button>
        <button
          className={"vc-btn vc-help" + (helpOpen ? " on" : "")}
          title="controls" aria-pressed={helpOpen}
          onClick={() => setHelpOpen((o) => !o)}
        >?</button>
      </div>
    </div>
  );
}
