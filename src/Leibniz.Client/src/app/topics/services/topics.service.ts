import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { Topic } from '../domain/topic';
import { EntityType } from '../../relationships/domain/entity-type';
import utils from '../../common/services/utils';

@Injectable({
  providedIn: 'root',
})
export class TopicsService {
  constructor(private http: HttpClient) {}

  loadTopics(
    index: number,
    limit: number,
    type: EntityType,
    id: number,
    primary: boolean,
    filterType?: EntityType,
    filterId?: number
  ): Observable<ResultSet<Topic>> {
    let url = `${
      appSettings.baseUrl
    }/topics/search-topics?Index=${index}&Limit=${limit}&Type=${utils.toTypeId(
      type
    )}&Id=${id}&Primary=${primary}`;
    if (filterType != null) {
      url += `&FilterType=${utils.toTypeId(filterType)}&FilterId=${filterId}`;
    }
    const result = this.http.get<ResultSet<Topic>>(url).pipe(map((res) => res));
    return result;
  }

  listTopics(
    index: number,
    limit: number,
    query?: string
  ): Observable<ResultSet<Topic>> {
    const result = this.http
      .get<ResultSet<Topic>>(
        `${
          appSettings.baseUrl
        }/topics/list-topics?Index=${index}&Limit=${limit}&Query=${
          !query ? '' : query
        }`
      )
      .pipe(map((res) => res));
    return result;
  }

  getTopic(topicId: number): Observable<Topic> {
    const result = this.http
      .get<{ topic: Topic }>(
        `${appSettings.baseUrl}/topics/get-topic?TopicId=${topicId}`
      )
      .pipe(map((res) => res.topic));
    return result;
  }

  addTopic(topic: Topic): Observable<number> {
    const result = this.http
      .post<{ topicId: number }>(
        `${appSettings.baseUrl}/topics/create-topic`,
        topic
      )
      .pipe(map((res) => res.topicId));
    return result;
  }

  updateTopic(topic: Topic): Observable<number> {
    const result = this.http
      .put<number>(`${appSettings.baseUrl}/topics/update-topic`, topic)
      .pipe(map((res) => res));
    return result;
  }

  deleteTopic(topicId: number): Observable<number> {
    const result = this.http
      .delete<number>(
        `${appSettings.baseUrl}/topics/remove-topic?TopicId=${topicId}`
      )
      .pipe(map((res) => res));
    return result;
  }
}
