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
import { ChartsService } from './charts.service';
import { Chart } from '../domain/chart';
import { ErrorHandlerService } from '../../common/services/error-handler.service';
import { MessagesService } from '../../common/services/messages.service';
import { ChangedEntity } from '../../common/domain/changed-entity';
import { ChangeTrackerService } from '../../common/services/change-tracker.service';

@Injectable({
  providedIn: 'root',
})
export class ChartsStore {
  constructor(
    private chartsService: ChartsService,
    private errorHandlerService: ErrorHandlerService,
    private messagesService: MessagesService,
    private changeTrackerService: ChangeTrackerService
  ) {
    this.changes$ = this.changeTrackerService.asObservable<Chart>();
  }

  private chartsSubject = new BehaviorSubject<ResultSet<Chart> | null>(null);
  charts$: Observable<ResultSet<Chart> | null> =
    this.chartsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  changes$: Observable<ChangedEntity<Chart> | null>;

  private _query = '';

  get query(): string {
    return this._query;
  }

  set query(value: string) {
    this._query = value;
  }

  loadPeriods(index: number, limit: number): void {
    this.loadingSubject.next(true);
    this.chartsService
      .loadCharts(index, limit, this.query)
      .pipe(
        tap((res) => {
          return this.chartsSubject.next(res);
        }),
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  getChart(chartId: number): Observable<Chart | null> {
    this.loadingSubject.next(true);
    const result = this.chartsService.getChart(chartId).pipe(
      catchError((err) => {
        this.errorHandlerService.onError(err);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
    return result;
  }

  addChart(chart: Chart): void {
    this.chartsService
      .addChart(chart)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe((chartId) => {
        this.changeTrackerService.notify('chart', chartId, 'added', chart);
        this.messagesService.success(
          `Chart ${chart.name} was added successfully.`,
          'Chart added'
        );
      });
  }

  updateChart(chart: Chart): void {
    this.chartsService
      .updateChart(chart)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.changeTrackerService.notify(
          'period',
          chart.chartId,
          'updated',
          chart
        );
        this.messagesService.success(
          `Chart ${chart.name} was updated successfully.`,
          'Chart updated'
        );
      });
  }

  deleteChart(chartId: number) {
    this.chartsService
      .deleteChart(chartId)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.changeTrackerService.notify('chart', chartId, 'deleted');
        this.messagesService.success(
          `Chart was deleted successfully.`,
          'Chart deleted'
        );
      });
  }
}
