export interface ChangedEntity<T> {
  id?: number | null;
  data?: T | null;
  changeType: 'added' | 'updated' | 'deleted';
}
