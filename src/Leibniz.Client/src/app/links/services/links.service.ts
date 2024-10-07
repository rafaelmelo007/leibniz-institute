import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { Link } from '../domain/link';

@Injectable({
  providedIn: 'root',
})
export class LinksService {
  constructor(private http: HttpClient) {}

  loadLinks(index: number, limit: number): Observable<ResultSet<Link>> {
    const result = this.http
      .get<ResultSet<Link>>(
        `${appSettings.baseUrl}/links/get-links?Index=${index}&Limit=${limit}`
      )
      .pipe(map((res) => res));
    return result;
  }

  getLink(linkId: number): Observable<Link> {
    const result = this.http
      .get<{ link: Link }>(
        `${appSettings.baseUrl}/links/get-link?LinkId=${linkId}`
      )
      .pipe(map((res) => res.link));
    return result;
  }

  addLink(link: Link): Observable<number> {
    const result = this.http
      .post<number>(`${appSettings.baseUrl}/links/create-link`, link)
      .pipe(map((res) => res));
    return result;
  }

  updateLink(link: Link): Observable<number> {
    const result = this.http
      .put<number>(`${appSettings.baseUrl}/links/update-link`, link)
      .pipe(map((res) => res));
    return result;
  }

  deleteLink(linkId: number): Observable<number> {
    const result = this.http
      .delete<number>(
        `${appSettings.baseUrl}/links/remove-link?LinkId=${linkId}`
      )
      .pipe(map((res) => res));
    return result;
  }
}
