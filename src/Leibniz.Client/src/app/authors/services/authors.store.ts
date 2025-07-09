import { Injectable } from '@angular/core';
import { AuthorsService } from './authors.service';
import {
  BehaviorSubject,
  catchError,
  finalize,
  Observable,
  of,
  tap,
} from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { Author } from '../domain/author';
import { ErrorHandlerService } from '../../common/services/error-handler.service';
import { MessagesService } from '../../common/services/messages.service';
import { ChangedEntity } from '../../common/domain/changed-entity';
import { appSettings } from '../../../environments/environment';
import { AuthService } from '../../user/services/auth.service';
import { ChangeTrackerService } from '../../common/services/change-tracker.service';
import { EntityType } from '../../relationships/domain/entity-type';

@Injectable({
  providedIn: 'root',
})
export class AuthorsStore {
  constructor(
    private authorsService: AuthorsService,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService,
    private messagesService: MessagesService,
    private changeTrackerService: ChangeTrackerService
  ) {
    this.changes$ = this.changeTrackerService.asObservable<Author>();
  }

  private authorsSubject = new BehaviorSubject<ResultSet<Author> | null>(null);
  authors$: Observable<ResultSet<Author> | null> =
    this.authorsSubject.asObservable();

  private primaryAuthorsSubject = new BehaviorSubject<ResultSet<Author> | null>(
    null
  );
  primaryAuthors$: Observable<ResultSet<Author> | null> =
    this.primaryAuthorsSubject.asObservable();

  private secondaryAuthorsSubject =
    new BehaviorSubject<ResultSet<Author> | null>(null);
  secondaryAuthors$: Observable<ResultSet<Author> | null> =
    this.secondaryAuthorsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  changes$: Observable<ChangedEntity<Author> | null>;

  private _query = '';

  get query(): string {
    return this._query;
  }

  set query(value: string) {
    this._query = value;
  }

  loadAuthors(
    index: number,
    limit: number,
    type: EntityType,
    id: number,
    primary: boolean
  ): void {
    const queryStringToken = this.authService.getQueryStringToken();
    this.loadingSubject.next(true);
    this.authorsService
      .loadAuthors(index, limit, type, id, primary)
      .pipe(
        tap((res) => {
          res.data.forEach((author) => {
            if (author.imageFileName == null) return;

            author.imageFileName = `${appSettings.baseUrl}/images/get-image?ImageFileName=${author.imageFileName}~${queryStringToken}`;
          });
          if (primary) {
            return this.primaryAuthorsSubject.next(res);
          }
          return this.secondaryAuthorsSubject.next(res);
        }),
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  listAuthors(index: number, limit: number): void {
    const queryStringToken = this.authService.getQueryStringToken();
    this.loadingSubject.next(true);
    this.authorsService
      .listAuthors(index, limit, this.query)
      .pipe(
        tap((res) => {
          res.data.forEach((author) => {
            if (author.imageFileName == null) return;

            author.imageFileName = `${appSettings.baseUrl}/images/get-image?ImageFileName=${author.imageFileName}~${queryStringToken}`;
          });
          return this.authorsSubject.next(res);
        }),
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  getAuthor(authorId: number): Observable<Author | null> {
    this.loadingSubject.next(true);
    const result = this.authorsService.getAuthor(authorId).pipe(
      catchError((err) => {
        this.errorHandlerService.onError(err);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
    return result;
  }

  addAuthor(author: Author): void {
    this.authorsService
      .addAuthor(author)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe((authorId) => {
        this.changeTrackerService.notify('author', authorId, 'added', author);
        this.messagesService.success(
          `Author ${author.name} was added successfully.`,
          'Author added'
        );
      });
  }

  updateAuthor(author: Author): void {
    this.authorsService
      .updateAuthor(author)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.changeTrackerService.notify(
          'author',
          author.authorId,
          'updated',
          author
        );
        this.messagesService.success(
          `Author ${author.name} was updated successfully.`,
          'Author updated'
        );
      });
  }

  deleteAuthor(authorId: number) {
    this.authorsService
      .deleteAuthor(authorId)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.changeTrackerService.notify('author', authorId, 'deleted');
        this.messagesService.success(
          `Author was deleted successfully.`,
          'Author deleted'
        );
      });
  }
}
