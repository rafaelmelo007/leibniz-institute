import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  finalize,
  Observable,
  of,
  tap,
} from 'rxjs';
import { ResultSet } from '../../common/domain/result-set';
import { Thesis } from '../domain/thesis';
import { ThesesService } from './theses.service';
import { ErrorHandlerService } from '../../common/services/error-handler.service';
import { MessagesService } from '../../common/services/messages.service';

@Injectable({
  providedIn: 'root',
})
export class ThesesStore {
  constructor(
    private thesesService: ThesesService,
    private errorHandlerService: ErrorHandlerService,
    private messagesService: MessagesService
  ) {}

  private thesesSubject = new BehaviorSubject<ResultSet<Thesis> | null>(null);
  theses$: Observable<ResultSet<Thesis> | null> =
    this.thesesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  loadTheses(index: number, limit: number): void {
    this.loadingSubject.next(true);
    this.thesesService
      .loadTheses(index, limit)
      .pipe(
        tap((theses) => this.thesesSubject.next(theses)),
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  getThesis(thesisId: number): Observable<Thesis | null> {
    this.loadingSubject.next(true);
    const result = this.thesesService.getThesis(thesisId).pipe(
      catchError((err) => {
        this.errorHandlerService.onError(err);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
    return result;
  }

  addThesis(thesis: Thesis): void {
    this.thesesService
      .addThesis(thesis)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.messagesService.success(
          `Thesis ${thesis.name} was added successfully.`,
          'Thesis added'
        );
      });
  }

  updateThesis(thesis: Thesis): void {
    this.thesesService
      .updateThesis(thesis)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.messagesService.success(
          `Thesis ${thesis.name} was updated successfully.`,
          'Thesis updated'
        );
      });
  }

  deleteThesis(thesisId: number) {
    this.thesesService
      .deleteThesis(thesisId)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.messagesService.success(
          `Thesis was deleted successfully.`,
          'Thesis deleted'
        );
      });
  }
}
