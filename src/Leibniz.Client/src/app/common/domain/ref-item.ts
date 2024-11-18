import { EntityType } from '../../relationships/domain/entity-type';

export interface RefItem {
  type: EntityType;
  id: number;
  name?: string;
}
