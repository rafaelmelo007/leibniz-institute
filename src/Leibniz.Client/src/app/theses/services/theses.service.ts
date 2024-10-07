import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { Thesis } from '../domain/thesis';

@Injectable({
  providedIn: 'root',
})
export class ThesesService {
  constructor(private http: HttpClient) {}

  loadTheses(index: number, limit: number): Observable<ResultSet<Thesis>> {
    const result = this.http
      .get<ResultSet<Thesis>>(
        `${appSettings.baseUrl}/theses/get-theses?Index=${index}&Limit=${limit}`
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
      .post<number>(`${appSettings.baseUrl}/theses/create-thesis`, thesis)
      .pipe(map((res) => res));
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
