interface Props {
  search: string;
  onSearch: (v: string) => void;
  onRandom: () => void;
}

export default function Controls({ search, onSearch, onRandom }: Props) {
  return (
    <div id="controls" className="controls">
      <div className="search-wrap">
        <span className="search-icon">⌕</span>
        <input
          id="search" className="search" type="search" autoComplete="off"
          placeholder="Search ideas, hooks, tags…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <button id="random-btn" className="random-btn" title="open a random idea" onClick={onRandom}>
        🎲<span className="btn-label"> Random</span>
      </button>
    </div>
  );
}
