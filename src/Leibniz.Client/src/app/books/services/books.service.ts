import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../environments/environment';
import { map, Observable } from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { Book } from '../domain/book';
import { BookListItem } from '../domain/book-list-item';

@Injectable({
  providedIn: 'root',
})
export class BooksService {
  constructor(private http: HttpClient) {}

  loadBooks(index: number, limit: number): Observable<ResultSet<BookListItem>> {
    const result = this.http
      .get<ResultSet<BookListItem>>(
        `${appSettings.baseUrl}/books/get-books?Index=${index}&Limit=${limit}`
      )
      .pipe(map((res) => res));
    return result;
  }

  getBook(bookId: number): Observable<Book> {
    const result = this.http
      .get<{ book: Book }>(
        `${appSettings.baseUrl}/books/get-book?BookId=${bookId}`
      )
      .pipe(map((res) => res.book));
    return result;
  }

  addBook(book: Book): Observable<number> {
    const result = this.http
      .post<number>(`${appSettings.baseUrl}/books/create-book`, book)
      .pipe(map((res) => res));
    return result;
  }

  updateBook(book: Book): Observable<number> {
    const result = this.http
      .put<number>(`${appSettings.baseUrl}/books/update-book`, book)
      .pipe(map((res) => res));
    return result;
  }

  deleteBook(bookId: number): Observable<number> {
    const result = this.http
      .delete<number>(
        `${appSettings.baseUrl}/books/remove-book?BookId=${bookId}`
      )
      .pipe(map((res) => res));
    return result;
  }
}