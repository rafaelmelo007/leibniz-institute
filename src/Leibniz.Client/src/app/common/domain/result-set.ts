import { EntityType } from "../../relationships/domain/entity-type";

export interface ResultSet<T> {
  index: number;
  limit: number;
  count: number;
  query?: string;
  type?: EntityType;
  id?: number;
  filterType?: EntityType;
  filterId?: number;
  data: T[];
}
