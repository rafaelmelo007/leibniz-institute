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
import { TopicsService } from './topics.service';
import { Topic } from '../domain/topic';
import { ErrorHandlerService } from '../../common/services/error-handler.service';
import { MessagesService } from '../../common/services/messages.service';
import { ChangedEntity } from '../../common/domain/changed-entity';
import { AuthService } from '../../account/services/auth.service';
import { appSettings } from '../../../environments/environment';
import { ChangeTrackerService } from '../../common/services/change-tracker.service';
import { EntityType } from '../../relationships/domain/entity-type';

@Injectable({
  providedIn: 'root',
})
export class TopicsStore {
  constructor(
    private topicsService: TopicsService,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService,
    private messagesService: MessagesService,
    private changeTrackerService: ChangeTrackerService
  ) {
    this.changes$ = this.changeTrackerService.asObservable<Topic>();
  }

  private primaryTopicsSubject = new BehaviorSubject<ResultSet<Topic> | null>(null);
  primaryTopics$: Observable<ResultSet<Topic> | null> =
    this.primaryTopicsSubject.asObservable();

    private secondaryTopicsSubject = new BehaviorSubject<ResultSet<Topic> | null>(null);
    secondaryTopics$: Observable<ResultSet<Topic> | null> =
      this.secondaryTopicsSubject.asObservable();
  
    private topicsSubject = new BehaviorSubject<ResultSet<Topic> | null>(null);
  topics$: Observable<ResultSet<Topic> | null> =
    this.topicsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  changes$: Observable<ChangedEntity<Topic> | null>;

  private _query = '';

  get query(): string {
    return this._query;
  }

  set query(value: string) {
    this._query = value;
  }

  loadTopics(
    index: number,
    limit: number,
    type: EntityType,
    id: number,
    primary: boolean,
    filterType?: EntityType,
    filterId?: number
  ): void {
    this.loadingSubject.next(true);
    this.topicsService
      .loadTopics(index, limit, type, id, primary, filterType, filterId)
      .pipe(
        tap((res) => {
          if (primary) {
            return this.primaryTopicsSubject.next(res);
          }

          return this.secondaryTopicsSubject.next(res);
        }),
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  listTopics(index: number, limit: number): void {
    var queryStringToken = this.authService.getQueryStringToken();
    this.loadingSubject.next(true);
    this.topicsService
      .listTopics(index, limit, this._query)
      .pipe(
        tap((res) => {
          res.data.forEach((topic) => {
            if (topic.imageFileName == null) return;

            topic.imageFileName = `${appSettings.baseUrl}/images/get-image?ImageFileName=${topic.imageFileName}~${queryStringToken}`;
          });
          return this.topicsSubject.next(res);
        }),
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  getTopic(topicId: number): Observable<Topic | null> {
    this.loadingSubject.next(true);
    const result = this.topicsService.getTopic(topicId).pipe(
      catchError((err) => {
        this.errorHandlerService.onError(err);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
    return result;
  }

  addTopic(topic: Topic): void {
    this.topicsService
      .addTopic(topic)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe((topicId) => {
        this.changeTrackerService.notify('topic', topicId, 'added', topic);
        this.messagesService.success(
          `Topic ${topic.name} was added successfully.`,
          'Topic added'
        );
      });
  }

  updateTopic(topic: Topic): void {
    this.topicsService
      .updateTopic(topic)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.changeTrackerService.notify(
          'topic',
          topic.topicId,
          'updated',
          topic
        );
        this.messagesService.success(
          `Topic ${topic.name} was updated successfully.`,
          'Topic updated'
        );
      });
  }

  deleteTopic(topicId: number) {
    this.topicsService
      .deleteTopic(topicId)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.changeTrackerService.notify('topic', topicId, 'deleted');
        this.messagesService.success(
          `Topic was deleted successfully.`,
          'Topic deleted'
        );
      });
  }
}
