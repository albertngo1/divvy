import { useEffect, useRef } from "react";
import type { Idea } from "../types";
import { createCloud, type CloudHandle, type DimPredicate } from "../cloud";

interface Props {
  ideas: Idea[];
  dim: DimPredicate;
  votes: Record<string, number>;
  onHover: (d: Idea | null, y?: number) => void;
  onSelect: (d: Idea) => void;
  onReady: () => void;
}

export default function Cloud({ ideas, dim, votes, onHover, onSelect, onReady }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const handleRef = useRef<CloudHandle | null>(null);

  // (re)build the d3 cloud whenever the idea set changes
  useEffect(() => {
    if (!ideas.length || !svgRef.current) return;
    const handle = createCloud(svgRef.current, ideas, { onHover, onSelect, onReady });
    handleRef.current = handle;
    handle.setDim(dim);
    handle.setVotes(votes);
    return () => handle.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas]);

  // re-apply dimming when the filter predicate changes
  useEffect(() => { handleRef.current?.setDim(dim); }, [dim]);

  // recolor from "heat" (score + votes) whenever counts change
  useEffect(() => { handleRef.current?.setVotes(votes); }, [votes]);

  return <svg id="cloud" ref={svgRef} aria-label="idea cloud" />;
}
