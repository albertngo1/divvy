import { useEffect } from "react";
import type { Idea } from "../types";
import type { DailyPick, DailyKind } from "../daily";

const KIND_LABEL: Record<DailyKind, string> = { fresh: "Fresh", hot: "Hot", wild: "Wildcard" };

interface Props {
  open: boolean;
  picks: DailyPick[];
  lastScan: string;
  onOpenIdea: (d: Idea) => void;
  onClose: () => void;
}

// "Today" spotlight — a humane entry point into the cloud. Shows a small, finite handful so
// arriving doesn't mean facing ~1400 dots at once. Opens once a day automatically; reopenable
// from the ✦ Today button.
export default function Daily({ open, picks, lastScan, onOpenIdea, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!picks.length) return null;

  return (
    <div className={"daily-overlay" + (open ? " open" : "")} onClick={onClose} aria-hidden={!open}>
      <div className="daily-card" role="dialog" aria-label="Today's picks" onClick={(e) => e.stopPropagation()}>
        <button className="about-close" aria-label="close" onClick={onClose}>✕</button>
        <div className="about-eyebrow">Today · {lastScan}</div>
        <h2 className="daily-title">Start here</h2>
        <p className="daily-lead">
          The cloud has thousands of ideas and grows every few hours. Here are five to look at
          today — a couple fresh off the scanner, a couple running hot, and one wildcard.
        </p>
        <ul className="daily-list">
          {picks.map(({ idea, kind }) => (
            <li key={idea.slug}>
              <button className="daily-row" onClick={() => { onOpenIdea(idea); onClose(); }} title={idea.title}>
                <span className={"daily-chip k-" + kind}>{KIND_LABEL[kind]}</span>
                <span className="daily-body">
                  <span className="daily-name">{idea.title}</span>
                  <span className="daily-hook">{idea.hook}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="daily-foot">
          <button className="daily-explore" onClick={onClose}>Explore the full cloud →</button>
          <span className="daily-note">refreshes daily</span>
        </div>
      </div>
    </div>
  );
}
