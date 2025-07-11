export interface Node {
  nodeId: number;
  name: string;
  chartData: string;
  parentNodeId?: number | null;
}
