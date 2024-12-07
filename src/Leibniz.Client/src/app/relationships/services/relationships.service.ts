import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { RelationshipListItem } from '../domain/relationship-list-item';
import { EntityType } from '../domain/entity-type';
import { ChangeTrackerService } from '../../common/services/change-tracker.service';
import utils from '../../common/services/utils';

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
    id: number,
    addType?: EntityType,
    addId?: number
  ): Observable<ResultSet<RelationshipListItem>> {
    const result = this.http
      .get<ResultSet<RelationshipListItem>>(
        `${
          appSettings.baseUrl
        }/relationships/get-relationships?Type=${utils.toTypeId(
          type
        )}&Id=${id}${
          addType != undefined ? '&AddType=' + utils.toTypeId(addType) : ''
        }${addId != undefined ? '&AddId=' + addId : ''}`
      )
      .pipe(map((res) => res));
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
        }/relationships/lookup-entities?Type=${utils.toTypeId(
          type
        )}&Query=${query}`
      )
      .pipe(map((res) => res));
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
        }/relationships/save-relationships?Type=${utils.toTypeId(
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
          fromType: utils.toTypeId(fromType),
          id: id,
          toType: utils.toTypeId(toType),
        }
      )
      .subscribe((res) => {
        this.changeTrackerService.notify(fromType, id, 'deleted');
        this.changeTrackerService.notify(res.type, res.id, 'added');
      });
  }
}
