import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../environments/environment';
import { map, Observable } from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { Author } from '../domain/author';

@Injectable({
  providedIn: 'root',
})
export class AuthorsService {
  constructor(private http: HttpClient) {}

  loadAuthors(index: number, limit: number): Observable<ResultSet<Author>> {
    const result = this.http
      .get<ResultSet<Author>>(
        `${appSettings.baseUrl}/authors/get-authors?Index=${index}&Limit=${limit}`
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
      .post<number>(`${appSettings.baseUrl}/authors/create-author`, author)
      .pipe(map((res) => res));
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
