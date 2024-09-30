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
import { PeriodsService } from './periods.service';
import { Period } from '../domain/period';
import { ErrorHandlerService } from '../../common/services/error-handler.service';
import { MessagesService } from '../../common/services/messages.service';

@Injectable({
  providedIn: 'root',
})
export class PeriodsStore {
  constructor(
    private periodsService: PeriodsService,
    private errorHandlerService: ErrorHandlerService,
    private messagesService: MessagesService
  ) {}

  private periodsSubject = new BehaviorSubject<ResultSet<Period> | null>(null);
  periods$: Observable<ResultSet<Period> | null> =
    this.periodsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  loadPeriods(index: number, limit: number): void {
    this.loadingSubject.next(true);
    this.periodsService
      .loadPeriods(index, limit)
      .pipe(
        tap((periods) => this.periodsSubject.next(periods)),
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  getPeriod(periodId: number): Observable<Period | null> {
    this.loadingSubject.next(true);
    const result = this.periodsService.getPeriod(periodId).pipe(
      catchError((err) => {
        this.errorHandlerService.onError(err);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
    return result;
  }

  addPeriod(period: Period): void {
    this.periodsService
      .addPeriod(period)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.messagesService.success(
          `Period ${period.name} was added successfully.`,
          'Period added'
        );
      });
  }

  updatePeriod(period: Period): void {
    this.periodsService
      .updatePeriod(period)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.messagesService.success(
          `Period ${period.name} was updated successfully.`,
          'Period updated'
        );
      });
  }

  deletePeriod(periodId: number) {
    this.periodsService
      .deletePeriod(periodId)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.messagesService.success(
          `Period was deleted successfully.`,
          'Period deleted'
        );
      });
  }
}
