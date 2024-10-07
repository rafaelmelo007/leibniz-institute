import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { RelationshipListItem } from '../components/domain/relationship-list-item';
import { EntityType } from '../components/domain/entity-type';
import { ChangeTrackerService } from '../../common/services/change-tracker.service';

@Injectable({
  providedIn: 'root',
})
export class RelationshipsService {
  constructor(
    private http: HttpClient,
    private changeTrackerService: ChangeTrackerService
  ) {}

  loadRelationships(
    type: EntityType,
    id: number
  ): Observable<ResultSet<RelationshipListItem>> {
    const result = this.http
      .get<ResultSet<RelationshipListItem>>(
        `${
          appSettings.baseUrl
        }/relationships/get-relationships?Type=${this.toTypeId(type)}&Id=${id}`
      )
      .pipe(
        map((res) => {
          res.data.forEach((item) => {
            item.type = this.toEntityType(item.typeId);
          });
          return res;
        })
      );
    return result;
  }

  lookupEntities(
    type: EntityType,
    query: string
  ): Observable<ResultSet<RelationshipListItem>> {
    const result = this.http
      .get<ResultSet<RelationshipListItem>>(
        `${
          appSettings.baseUrl
        }/relationships/lookup-entities?Type=${this.toTypeId(
          type
        )}&Query=${query}`
      )
      .pipe(
        map((res) => {
          res.data.forEach((item) => {
            item.type = this.toEntityType(item.typeId);
          });
          return res;
        })
      );
    return result;
  }

  saveRelationships(
    type: EntityType,
    id: number,
    items: RelationshipListItem[]
  ): void {
    this.http
      .post<{ affected: number }>(
        `${
          appSettings.baseUrl
        }/relationships/save-relationships?Type=${this.toTypeId(
          type
        )}&Id=${id}`,
        items
      )
      .subscribe();
  }

  moveTo(fromType: EntityType, id: number, toType: EntityType): void {
    this.http
      .put<{ type: EntityType; id: number }>(
        `${appSettings.baseUrl}/relationships/move-to`,
        {
          fromType: this.toTypeId(fromType),
          id: id,
          toType: this.toTypeId(toType),
        }
      )
      .subscribe((res) => {
        this.changeTrackerService.notify(fromType, id, 'deleted');
        this.changeTrackerService.notify(res.type, res.id, 'added');
      });
  }

  toTypeId(type: string) {
    switch (type) {
      case 'post':
        return 1;
      case 'link':
        return 2;
      case 'area':
        return 3;
      case 'author':
        return 4;
      case 'book':
        return 5;
      case 'period':
        return 6;
      case 'thesis':
        return 7;
      case 'topic':
        return 8;
      case 'unknown':
        return 9;
    }
    return 9;
  }

  toEntityType(type: number): EntityType {
    switch (type) {
      case 1:
        return 'post';
      case 2:
        return 'link';
      case 3:
        return 'area';
      case 4:
        return 'author';
      case 5:
        return 'book';
      case 6:
        return 'period';
      case 7:
        return 'thesis';
      case 8:
        return 'topic';
      case 9:
        return 'unknown';
    }
    return 'unknown';
  }
}
