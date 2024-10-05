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
import { ChangedEntity } from '../../common/domain/changed-entity';
import { appSettings } from '../../environments/environment';
import { AuthService } from '../../account/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AreasStore {
  constructor(
    private areasService: AreasService,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService,
    private messagesService: MessagesService
  ) {}

  private areasSubject = new BehaviorSubject<ResultSet<Area> | null>(null);
  areas$: Observable<ResultSet<Area> | null> = this.areasSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private changesSubject = new BehaviorSubject<ChangedEntity<Area> | null>(
    null
  );
  changes$: Observable<ChangedEntity<Area> | null> =
    this.changesSubject.asObservable();

  loadAreas(index: number, limit: number): void {
    var queryStringToken = this.authService.getQueryStringToken();
    this.loadingSubject.next(true);
    this.areasService
      .loadAreas(index, limit)
      .pipe(
        tap((res) => {
          res.data.forEach((area) => {
            if (area.imageFileName == null) return;

            area.imageFileName = `${appSettings.baseUrl}/images/get-image?ImageFileName=${area.imageFileName}~${queryStringToken}`;
          });
          return this.areasSubject.next(res);
        }),
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
        this.changesSubject.next({ changeType: 'added', data: area });
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
        this.changesSubject.next({ changeType: 'updated', data: area });
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
        this.changesSubject.next({ changeType: 'deleted', id: areaId });
        this.messagesService.success(
          `Area was deleted successfully.`,
          'Area deleted'
        );
      });
  }
}
