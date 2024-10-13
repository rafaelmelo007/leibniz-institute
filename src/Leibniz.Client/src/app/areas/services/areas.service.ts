import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { Area } from '../domain/area';

@Injectable({
  providedIn: 'root',
})
export class AreasService {
  constructor(private http: HttpClient) {}

  loadAreas(
    index: number,
    limit: number,
    query?: string
  ): Observable<ResultSet<Area>> {
    const result = this.http
      .get<ResultSet<Area>>(
        `${
          appSettings.baseUrl
        }/areas/get-areas?Index=${index}&Limit=${limit}&Query=${
          !query ? '' : query
        }`
      )
      .pipe(map((res) => res));
    return result;
  }

  getArea(areaId: number): Observable<Area> {
    const result = this.http
      .get<{ area: Area }>(
        `${appSettings.baseUrl}/areas/get-area?AreaId=${areaId}`
      )
      .pipe(map((res) => res.area));
    return result;
  }

  addArea(area: Area): Observable<number> {
    const result = this.http
      .post<{ areaId: number }>(
        `${appSettings.baseUrl}/areas/create-area`,
        area
      )
      .pipe(map((res) => res.areaId));
    return result;
  }

  updateArea(area: Area): Observable<number> {
    const result = this.http
      .put<number>(`${appSettings.baseUrl}/areas/update-area`, area)
      .pipe(map((res) => res));
    return result;
  }

  deleteArea(areaId: number): Observable<number> {
    const result = this.http
      .delete<number>(
        `${appSettings.baseUrl}/areas/remove-area?AreaId=${areaId}`
      )
      .pipe(map((res) => res));
    return result;
  }
}
