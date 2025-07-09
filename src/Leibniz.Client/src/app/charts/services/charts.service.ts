import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { Chart } from '../domain/chart';

@Injectable({
  providedIn: 'root',
})
export class ChartsService {
  constructor(private http: HttpClient) {}

  loadCharts(
    index: number,
    limit: number,
    query?: string
  ): Observable<ResultSet<Chart>> {
    const result = this.http
      .get<ResultSet<Chart>>(
        `${
          appSettings.baseUrl
        }/charts/list-charts?Index=${index}&Limit=${limit}&query=${
          !query ? '' : query
        }`
      )
      .pipe(map((res) => res));
    return result;
  }

  getChart(chartId: number): Observable<Chart> {
    const result = this.http
      .get<{ chart: Chart }>(
        `${appSettings.baseUrl}/charts/get-chart?ChartId=${chartId}`
      )
      .pipe(map((res) => res.chart));
    return result;
  }

  addChart(chart: Chart): Observable<number> {
    const result = this.http
      .post<{ chartId: number }>(
        `${appSettings.baseUrl}/charts/create-chart`,
        chart
      )
      .pipe(map((res) => res.chartId));
    return result;
  }

  updateChart(chart: Chart): Observable<number> {
    const result = this.http
      .put<number>(`${appSettings.baseUrl}/charts/update-chart`, chart)
      .pipe(map((res) => res));
    return result;
  }

  deleteChart(chartId: number): Observable<number> {
    const result = this.http
      .delete<number>(
        `${appSettings.baseUrl}/charts/remove-chart?ChartId=${chartId}`
      )
      .pipe(map((res) => res));
    return result;
  }
}
