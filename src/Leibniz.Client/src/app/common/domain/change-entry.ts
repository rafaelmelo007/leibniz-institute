export interface ChangeEntry<T> {
  entity?: T | null;
  entityId?: number | null;
  type: 'added' | 'updated' | 'deleted';
}
