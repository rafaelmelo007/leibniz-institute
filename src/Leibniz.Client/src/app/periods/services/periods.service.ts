import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../environments/environment';
import { map, Observable } from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { Period } from '../domain/period';

@Injectable({
  providedIn: 'root',
})
export class PeriodsService {
  constructor(private http: HttpClient) {}

  loadPeriods(index: number, limit: number): Observable<ResultSet<Period>> {
    const result = this.http
      .get<ResultSet<Period>>(
        `${appSettings.baseUrl}/periods/get-periods?Index=${index}&Limit=${limit}`
      )
      .pipe(map((res) => res));
    return result;
  }

  getPeriod(periodId: number): Observable<Period> {
    const result = this.http
      .get<{ period: Period }>(
        `${appSettings.baseUrl}/periods/get-period?PeriodId=${periodId}`
      )
      .pipe(map((res) => res.period));
    return result;
  }

  addPeriod(period: Period): Observable<number> {
    const result = this.http
      .post<number>(`${appSettings.baseUrl}/periods/create-period`, period)
      .pipe(map((res) => res));
    return result;
  }

  updatePeriod(period: Period): Observable<number> {
    const result = this.http
      .put<number>(`${appSettings.baseUrl}/periods/update-period`, period)
      .pipe(map((res) => res));
    return result;
  }

  deletePeriod(periodId: number): Observable<number> {
    const result = this.http
      .delete<number>(
        `${appSettings.baseUrl}/periods/remove-period?PeriodId=${periodId}`
      )
      .pipe(map((res) => res));
    return result;
  }
}
