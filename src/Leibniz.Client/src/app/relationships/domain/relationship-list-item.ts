import { EntityType } from "./entity-type";

export interface RelationshipListItem {
  typeId: number;
  type: EntityType;
  id: number;
  label: string;
  isPrimary: boolean;
}
