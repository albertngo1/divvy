export interface Idea {
  slug: string;
  title: string;
  hook: string;
  tags: string[];
  score: number;
  source: string;
  created: string;
}

export interface IdeasFile {
  lastScan: string;
  ideas: Idea[];
}

// a node in the force simulation = an Idea plus layout fields
export interface Node extends Idea {
  r: number;
  _baseR?: number; // score-based radius before vote-driven growth
  _ph: number;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  _rx?: number;
  _ry?: number;
  _hue?: number;
  _p?: number; // heat rank fraction 0..1 (drives glow intensity)
  galaxy?: string;
  // canvas render caches
  _hv?: number;                 // hover animation 0..1 (eased)
  _lines?: string[];            // wrapped title lines (recomputed when r changes)
  _fs?: number;                 // font size for the wrapped title
  _grad?: CanvasGradient;       // cached body gradient
  _gradKey?: string;            // invalidation key (hue|radius) for _grad
}
