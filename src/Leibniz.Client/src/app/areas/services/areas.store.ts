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
import { AreasService } from './areas.service';
import { Area } from '../domain/area';
import { ErrorHandlerService } from '../../common/services/error-handler.service';
import { MessagesService } from '../../common/services/messages.service';

@Injectable({
  providedIn: 'root',
})
export class AreasStore {
  constructor(
    private areasService: AreasService,
    private errorHandlerService: ErrorHandlerService,
    private messagesService: MessagesService
  ) {}

  private areasSubject = new BehaviorSubject<ResultSet<Area> | null>(null);
  areas$: Observable<ResultSet<Area> | null> = this.areasSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  loadAreas(index: number, limit: number): void {
    this.loadingSubject.next(true);
    this.areasService
      .loadAreas(index, limit)
      .pipe(
        tap((areas) => this.areasSubject.next(areas)),
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  getArea(areaId: number): Observable<Area | null> {
    this.loadingSubject.next(true);
    const result = this.areasService.getArea(areaId).pipe(
      catchError((err) => {
        this.errorHandlerService.onError(err);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
    return result;
  }

  addArea(area: Area): void {
    this.areasService
      .addArea(area)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.messagesService.success(
          `Area ${area.name} was added successfully.`,
          'Area added'
        );
      });
  }

  updateArea(area: Area): void {
    this.areasService
      .updateArea(area)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.messagesService.success(
          `Area ${area.name} was updated successfully.`,
          'Area updated'
        );
      });
  }

  deleteArea(areaId: number) {
    this.areasService
      .deleteArea(areaId)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.messagesService.success(
          `Area was deleted successfully.`,
          'Area deleted'
        );
      });
  }
}
