import { EntityType } from "./entity-type";

export interface Relationship {
  relationshipId: number;
  entityTypeA: EntityType;
  entityIdA: number;
  entityTypeB: EntityType;
  entityIdB: number;
}
