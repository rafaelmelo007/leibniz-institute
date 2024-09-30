export interface ResultSet<T> {
  index: number;
  limit: number;
  count: number;
  data: T[];
}
