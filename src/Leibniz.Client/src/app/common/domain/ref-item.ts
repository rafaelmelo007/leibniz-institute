import { EntityType } from '../../relationships/components/domain/entity-type';

export interface RefItem {
  type: EntityType;
  id: number;
  name?: string;
}
