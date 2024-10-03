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

@Injectable({
  providedIn: 'root',
})
export class AuthorsStore {
  constructor(
    private authorsService: AuthorsService,
    private errorHandlerService: ErrorHandlerService,
    private messagesService: MessagesService
  ) {}

  private authorsSubject = new BehaviorSubject<ResultSet<Author> | null>(null);
  authors$: Observable<ResultSet<Author> | null> =
    this.authorsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private changesSubject = new BehaviorSubject<ChangedEntity<Author> | null>(
    null
  );
  changes$: Observable<ChangedEntity<Author> | null> =
    this.changesSubject.asObservable();

  loadAuthors(index: number, limit: number): void {
    this.loadingSubject.next(true);
    this.authorsService
      .loadAuthors(index, limit)
      .pipe(
        tap((authors) => this.authorsSubject.next(authors)),
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
      .subscribe(() => {
        this.changesSubject.next({ changeType: 'added', data: author });
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
        this.changesSubject.next({ changeType: 'updated', data: author });
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
        this.changesSubject.next({ changeType: 'deleted', id: authorId });
        this.messagesService.success(
          `Author was deleted successfully.`,
          'Author deleted'
        );
      });
  }
}
