import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { Author } from '../domain/author';
import { EntityType } from '../../relationships/domain/entity-type';
import utils from '../../common/services/utils';

@Injectable({
  providedIn: 'root',
})
export class AuthorsService {
  constructor(private http: HttpClient) {}

  loadAuthors(
    index: number,
    limit: number,
    type: EntityType,
    id: number,
    primary: boolean
  ): Observable<ResultSet<Author>> {
    const result = this.http
      .get<ResultSet<Author>>(
        `${
          appSettings.baseUrl
        }/authors/search-authors?Index=${index}&Limit=${limit}&Type=${utils.toTypeId(
          type
        )}&Id=${id}&Primary=${primary}`
      )
      .pipe(map((res) => res));
    return result;
  }

  listAuthors(
    index: number,
    limit: number,
    query?: string
  ): Observable<ResultSet<Author>> {
    const result = this.http
      .get<ResultSet<Author>>(
        `${
          appSettings.baseUrl
        }/authors/list-authors?Index=${index}&Limit=${limit}&query=${
          query !== undefined ? query : ''
        }`
      )
      .pipe(map((res) => res));
    return result;
  }

  getAuthor(authorId: number): Observable<Author> {
    const result = this.http
      .get<{ author: Author }>(
        `${appSettings.baseUrl}/authors/get-author?AuthorId=${authorId}`
      )
      .pipe(map((res) => res.author));
    return result;
  }

  addAuthor(author: Author): Observable<number> {
    const result = this.http
      .post<{ authorId: number }>(
        `${appSettings.baseUrl}/authors/create-author`,
        author
      )
      .pipe(map((res) => res.authorId));
    return result;
  }

  updateAuthor(author: Author): Observable<number> {
    const result = this.http
      .put<number>(`${appSettings.baseUrl}/authors/update-author`, author)
      .pipe(map((res) => res));
    return result;
  }

  deleteAuthor(authorId: number): Observable<number> {
    const result = this.http
      .delete<number>(
        `${appSettings.baseUrl}/authors/remove-author?AuthorId=${authorId}`
      )
      .pipe(map((res) => res));
    return result;
  }
}
