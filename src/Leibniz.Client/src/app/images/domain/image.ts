import { EntityType } from '../../relationships/components/domain/entity-type';

export interface ImageRecord {
  imageId: number;
  imageFileName: string;
  entityTypeId: number;
  entityType: EntityType;
  entityId: number;
}
