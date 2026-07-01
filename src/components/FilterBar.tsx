interface Props {
  search: string;
  activeTags: Set<string>;
  visible: number;
  onClear: () => void;
}

export default function FilterBar({ search, activeTags, visible, onClear }: Props) {
  const chips: string[] = [];
  if (search.trim()) chips.push(`“${search.trim()}”`);
  activeTags.forEach((t) => chips.push("#" + t));
  if (!chips.length) return null;

  return (
    <div id="filterbar" className="filterbar">
      <b>{visible}</b> shown — {chips.join(", ")}
      <button className="clear" aria-label="clear filters" onClick={onClear}>✕</button>
    </div>
  );
}
