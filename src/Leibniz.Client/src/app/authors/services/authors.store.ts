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
import { AuthService } from '../../account/services/auth.service';
import { ChangeTrackerService } from '../../common/services/change-tracker.service';

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

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private query?: string;

  changes$: Observable<ChangedEntity<Author> | null>;

  getQuery(): string | undefined {
    return this.query;
  }

  setQuery(query?: string): void {
    this.query = query;
  }

  loadAuthors(index: number, limit: number): void {
    var queryStringToken = this.authService.getQueryStringToken();
    this.loadingSubject.next(true);
    this.authorsService
      .loadAuthors(index, limit, this.query)
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
