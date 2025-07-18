import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChangedEntity } from '../domain/changed-entity';
import { EntityType } from '../../relationships/domain/entity-type';
import { ChangeType } from '../domain/change-type';

@Injectable({
  providedIn: 'root',
})
export class ChangeTrackerService {
  private changesSubject = new BehaviorSubject<ChangedEntity<any> | null>(null); // eslint-disable-line
  changes$: Observable<ChangedEntity<any> | null> = // eslint-disable-line
    this.changesSubject.asObservable();

  notify(
    entityType: EntityType,
    entityId: number,
    changeType: ChangeType,
    data?: any // eslint-disable-line
  ): void {
    this.changesSubject.next({
      ref: { type: entityType, id: entityId },
      changeType: changeType,
      data: data,
    });
  }

  asObservable<T>(): Observable<ChangedEntity<T> | null> {
    return this.changesSubject.asObservable();
  }
}
