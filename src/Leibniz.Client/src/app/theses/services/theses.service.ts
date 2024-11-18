import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { Thesis } from '../domain/thesis';
import { EntityType } from '../../relationships/domain/entity-type';
import utils from '../../common/services/utils';

@Injectable({
  providedIn: 'root',
})
export class ThesesService {
  constructor(private http: HttpClient) {}

  loadTheses(
    index: number,
    limit: number,
    type: EntityType,
    id: number,
    primary: boolean
  ): Observable<ResultSet<Thesis>> {
    const result = this.http
      .get<ResultSet<Thesis>>(
        `${
          appSettings.baseUrl
        }/theses/search-theses?Index=${index}&Limit=${limit}&Type=${utils.toTypeId(
          type
        )}&Id=${id}&Primary=${primary}`
      )
      .pipe(map((res) => res));
    return result;
  }

  listTheses(
    index: number,
    limit: number,
    query?: string
  ): Observable<ResultSet<Thesis>> {
    const result = this.http
      .get<ResultSet<Thesis>>(
        `${
          appSettings.baseUrl
        }/theses/list-theses?Index=${index}&Limit=${limit}&query=${
          !query ? '' : query
        }`
      )
      .pipe(map((res) => res));
    return result;
  }

  getThesis(thesisId: number): Observable<Thesis> {
    const result = this.http
      .get<{ thesis: Thesis }>(
        `${appSettings.baseUrl}/theses/get-thesis?ThesisId=${thesisId}`
      )
      .pipe(map((res) => res.thesis));
    return result;
  }

  addThesis(thesis: Thesis): Observable<number> {
    const result = this.http
      .post<{ thesisId: number }>(
        `${appSettings.baseUrl}/theses/create-thesis`,
        thesis
      )
      .pipe(map((res) => res.thesisId));
    return result;
  }

  updateThesis(thesis: Thesis): Observable<number> {
    const result = this.http
      .put<number>(`${appSettings.baseUrl}/theses/update-thesis`, thesis)
      .pipe(map((res) => res));
    return result;
  }

  deleteThesis(thesisId: number): Observable<number> {
    const result = this.http
      .delete<number>(
        `${appSettings.baseUrl}/theses/remove-thesis?ThesisId=${thesisId}`
      )
      .pipe(map((res) => res));
    return result;
  }
}
