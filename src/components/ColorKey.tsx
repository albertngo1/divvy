export default function ColorKey() {
  return (
    <div id="legend" className="legend" aria-label="color scale">
      <span className="legend-cap">color = heat (AI score + votes)</span>
      <span className="score-bar" title="cooler → hotter" />
    </div>
  );
}
