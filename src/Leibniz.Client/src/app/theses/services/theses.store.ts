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
import { ChangedEntity } from '../../common/domain/changed-entity';
import { AuthService } from '../../user/services/auth.service';
import { appSettings } from '../../../environments/environment';
import { ChangeTrackerService } from '../../common/services/change-tracker.service';
import { EntityType } from '../../relationships/domain/entity-type';

@Injectable({
  providedIn: 'root',
})
export class ThesesStore {
  constructor(
    private thesesService: ThesesService,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService,
    private messagesService: MessagesService,
    private changeTrackerService: ChangeTrackerService
  ) {
    this.changes$ = this.changeTrackerService.asObservable<Thesis>();
  }

  private primaryThesesSubject = new BehaviorSubject<ResultSet<Thesis> | null>(
    null
  );
  primaryTheses$: Observable<ResultSet<Thesis> | null> =
    this.primaryThesesSubject.asObservable();

  private secondaryThesesSubject =
    new BehaviorSubject<ResultSet<Thesis> | null>(null);
  secondaryTheses$: Observable<ResultSet<Thesis> | null> =
    this.secondaryThesesSubject.asObservable();

  private thesesSubject = new BehaviorSubject<ResultSet<Thesis> | null>(null);
  theses$: Observable<ResultSet<Thesis> | null> =
    this.thesesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  changes$: Observable<ChangedEntity<Thesis> | null>;

  private _query = '';

  get query(): string {
    return this._query;
  }

  set query(value: string) {
    this._query = value;
  }

  loadTheses(
    index: number,
    limit: number,
    type: EntityType,
    id: number,
    primary: boolean
  ): void {
    const queryStringToken = this.authService.getQueryStringToken();
    this.loadingSubject.next(true);
    this.thesesService
      .loadTheses(index, limit, type, id, primary)
      .pipe(
        tap((res) => {
          res.data.forEach((thesis) => {
            if (thesis.imageFileName == null) return;

            thesis.imageFileName = `${appSettings.baseUrl}/images/get-image?ImageFileName=${thesis.imageFileName}~${queryStringToken}`;
          });
          if (primary) {
            return this.primaryThesesSubject.next(res);
          }
          return this.secondaryThesesSubject.next(res);
        }),
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  listTheses(index: number, limit: number): void {
    const queryStringToken = this.authService.getQueryStringToken();
    this.loadingSubject.next(true);
    this.thesesService
      .listTheses(index, limit, this.query)
      .pipe(
        tap((res) => {
          res.data.forEach((thesis) => {
            if (thesis.imageFileName == null) return;

            thesis.imageFileName = `${appSettings.baseUrl}/images/get-image?ImageFileName=${thesis.imageFileName}~${queryStringToken}`;
          });
          return this.thesesSubject.next(res);
        }),
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
      .subscribe((thesisId) => {
        this.changeTrackerService.notify('thesis', thesisId, 'added', thesis);
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
        this.changeTrackerService.notify(
          'thesis',
          thesis.thesisId,
          'updated',
          thesis
        );
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
        this.changeTrackerService.notify('thesis', thesisId, 'deleted');
        this.messagesService.success(
          `Thesis was deleted successfully.`,
          'Thesis deleted'
        );
      });
  }
}
