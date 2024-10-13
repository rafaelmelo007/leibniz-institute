import { Injectable } from '@angular/core';
import { BooksService } from './books.service';
import {
  BehaviorSubject,
  catchError,
  finalize,
  Observable,
  of,
  tap,
} from 'rxjs';
import { Book } from '../domain/book';
import { ResultSet } from '../../common/domain/result-set';
import { ErrorHandlerService } from '../../common/services/error-handler.service';
import { BookListItem } from '../domain/book-list-item';
import { AuthService } from '../../account/services/auth.service';
import { appSettings } from '../../../environments/environment';
import { MessagesService } from '../../common/services/messages.service';
import { ChangedEntity } from '../../common/domain/changed-entity';
import { ChangeTrackerService } from '../../common/services/change-tracker.service';

@Injectable({
  providedIn: 'root',
})
export class BooksStore {
  constructor(
    private errorHandlerService: ErrorHandlerService,
    private booksService: BooksService,
    private authService: AuthService,
    private messagesService: MessagesService,
    private changeTrackerService: ChangeTrackerService
  ) {
    this.changes$ = this.changeTrackerService.asObservable<Book>();
  }

  private booksSubject = new BehaviorSubject<ResultSet<BookListItem> | null>(
    null
  );
  books$: Observable<ResultSet<BookListItem> | null> =
    this.booksSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  changes$: Observable<ChangedEntity<Book> | null>;

  private _query = '';

  get query(): string {
    return this._query;
  }

  set query(value: string) {
    this._query = value;
  }

  loadBooks(index: number, limit: number): void {
    var queryStringToken = this.authService.getQueryStringToken();
    this.loadingSubject.next(true);
    this.booksService
      .loadBooks(index, limit, this.query)
      .pipe(
        tap((res) => {
          res.data.forEach((book) => {
            if (book.imageFileName == null) return;

            book.imageFileName = `${appSettings.baseUrl}/images/get-image?ImageFileName=${book.imageFileName}~${queryStringToken}`;
          });
          return this.booksSubject.next(res);
        }),
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  getBook(bookId: number): Observable<Book | null> {
    this.loadingSubject.next(true);
    const result = this.booksService.getBook(bookId).pipe(
      catchError((err) => {
        this.errorHandlerService.onError(err);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
    return result;
  }

  addBook(book: Book): void {
    this.booksService
      .addBook(book)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe((bookId) => {
        this.changeTrackerService.notify('book', bookId, 'added', book);
        this.messagesService.success(
          `Book ${book.title} [${book.author}] was added successfully.`,
          'Book added'
        );
      });
  }

  updateBook(book: Book): void {
    this.booksService
      .updateBook(book)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe((changed) => {
        if (!changed) return;

        this.changeTrackerService.notify('book', book.bookId, 'updated', book);
        this.messagesService.success(
          `Book ${book.title} [${book.author}] was updated successfully.`,
          'Book updated'
        );
      });
  }

  deleteBook(bookId: number) {
    this.booksService
      .deleteBook(bookId)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.changeTrackerService.notify('book', bookId, 'deleted');
        this.messagesService.success(
          `Book was deleted successfully.`,
          'Book deleted'
        );
      });
  }
}
