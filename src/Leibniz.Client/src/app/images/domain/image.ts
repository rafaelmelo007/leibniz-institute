import { EntityType } from '../../relationships/domain/entity-type';

export interface ImageRecord {
  imageId: number;
  imageFileName: string;
  entityTypeId: number;
  entityType: EntityType;
  entityId: number;
}
