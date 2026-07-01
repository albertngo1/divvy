export default function ColorKey() {
  return (
    <div id="legend" className="legend" aria-label="color scale">
      <span className="legend-cap">color = score</span>
      <span className="score-bar" title="low → high" />
    </div>
  );
}
