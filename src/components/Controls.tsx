interface Props {
  search: string;
  onSearch: (v: string) => void;
  onRandom: () => void;
  onToday: () => void;
}

export default function Controls({ search, onSearch, onRandom, onToday }: Props) {
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
      <button id="today-btn" className="today-btn" title="today's handful — a place to start" onClick={onToday}>
        <span className="today-glyph">✦</span><span className="btn-label"> Today</span>
      </button>
      <button id="random-btn" className="random-btn" title="open a random idea" onClick={onRandom}>
        🎲<span className="btn-label"> Random</span>
      </button>
    </div>
  );
}
