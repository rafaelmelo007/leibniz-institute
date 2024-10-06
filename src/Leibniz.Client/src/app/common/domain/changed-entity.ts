import { ChangeType } from './change-type';
import { RefItem } from './ref-item';

export interface ChangedEntity<T> {
  ref: RefItem;
  data?: T | null;
  changeType: ChangeType;
}
