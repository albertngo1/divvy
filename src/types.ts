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
  _ph: number;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  _rx?: number;
  _ry?: number;
}
