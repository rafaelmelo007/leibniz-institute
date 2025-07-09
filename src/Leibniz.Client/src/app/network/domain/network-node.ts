export interface NetworkNode {
  id: number;
  label: string;
  x: number;
  y: number;
  fixed: boolean;
  shape?: NetworkNodeShape;
  color?: any;
  font?: any;
  widthConstraint?: any;
}

export type NetworkNodeShape =
  | 'box'
  | 'circle'
  | 'ellipse'
  | 'database'
  | 'text'
  | 'diamond'
  | 'dot'
  | 'star'
  | 'triangle'
  | 'triangleDown'
  | 'hexagon'
  | 'square'
  | 'icon'
  | 'image';
