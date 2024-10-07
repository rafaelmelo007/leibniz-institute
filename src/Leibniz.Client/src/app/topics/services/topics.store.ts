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

  private topicsSubject = new BehaviorSubject<ResultSet<Topic> | null>(null);
  topics$: Observable<ResultSet<Topic> | null> =
    this.topicsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  changes$: Observable<ChangedEntity<Topic> | null>;

  loadTopics(index: number, limit: number): void {
    var queryStringToken = this.authService.getQueryStringToken();
    this.loadingSubject.next(true);
    this.topicsService
      .loadTopics(index, limit)
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
