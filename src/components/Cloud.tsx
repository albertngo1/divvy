import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { Idea } from "../types";
import { createCloud, type CloudHandle, type CloudPeer, type DimPredicate } from "../cloud";

interface Props {
  ideas: Idea[];
  dim: DimPredicate;
  votes: Record<string, number>;
  seen: Set<string>;
  paused?: boolean; // freeze the render loop while the PRD panel is open
  onHover: (d: Idea | null, y?: number) => void;
  onSelect: (d: Idea) => void;
  onReady: () => void;
  onCursor?: (worldX: number, worldY: number) => void;
  onView?: (x: number, y: number, k: number) => void;
}

// imperative surface for pushing peer cursors in without re-rendering React on every move
export interface CloudApi {
  setPeer: (p: CloudPeer) => void;
  removePeer: (id: string) => void;
}

const Cloud = forwardRef<CloudApi, Props>(function Cloud(
  { ideas, dim, votes, seen, paused, onHover, onSelect, onReady, onCursor, onView },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<CloudHandle | null>(null);

  useImperativeHandle(ref, () => ({
    setPeer: (p) => handleRef.current?.setPeer(p),
    removePeer: (id) => handleRef.current?.removePeer(id),
  }), []);

  // (re)build the d3 cloud whenever the idea set changes
  useEffect(() => {
    if (!ideas.length || !canvasRef.current) return;
    const handle = createCloud(canvasRef.current, ideas, { onHover, onSelect, onReady, onCursor, onView });
    handleRef.current = handle;
    handle.setDim(dim);
    handle.setVotes(votes);
    handle.setSeen(seen);
    return () => handle.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas]);

  // re-apply dimming when the filter predicate changes
  useEffect(() => { handleRef.current?.setDim(dim); }, [dim]);

  // recolor from "heat" (score + votes) whenever counts change
  useEffect(() => { handleRef.current?.setVotes(votes); }, [votes]);

  // update the "unseen" pips as you open bubbles
  useEffect(() => { handleRef.current?.setSeen(seen); }, [seen]);

  // Pause the ambient wobble ONLY during the panel's open/close slide (so it doesn't
  // compete with the animation), then resume — the cloud keeps living while the panel
  // sits open. Both transitions (open and close) trigger the brief pause; skip the
  // initial mount so we don't freeze the cloud at startup.
  const prevPaused = useRef(paused);
  useEffect(() => {
    if (prevPaused.current === paused) return; // no real toggle (first render)
    prevPaused.current = paused;
    handleRef.current?.setPaused(true);
    const id = window.setTimeout(() => handleRef.current?.setPaused(false), 380);
    return () => clearTimeout(id);
  }, [paused]);

  return <canvas id="cloud" ref={canvasRef} aria-label="idea cloud" />;
});

export default Cloud;
