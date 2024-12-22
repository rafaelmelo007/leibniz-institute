import { EntityType } from "./entity-type";

export interface RelationshipListItem {
  type: EntityType;
  id: number;
  label: string;
  isPrimary: boolean;
}
