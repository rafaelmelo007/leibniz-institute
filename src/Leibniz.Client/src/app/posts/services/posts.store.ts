import { Injectable } from '@angular/core';
import { PostsService } from './posts.service';
import {
  BehaviorSubject,
  catchError,
  finalize,
  Observable,
  of,
  tap,
} from 'rxjs';
import { Post } from '../domain/post';
import { ResultSet } from '../../common/domain/result-set';
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
export class PostsStore {
  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService,
    private messagesService: MessagesService,
    private changeTrackerService: ChangeTrackerService
  ) {
    this.changes$ = this.changeTrackerService.asObservable<Post>();
  }

  private postsSubject = new BehaviorSubject<ResultSet<Post> | null>(null);
  posts$: Observable<ResultSet<Post> | null> = this.postsSubject.asObservable();

  private primaryPostsSubject = new BehaviorSubject<ResultSet<Post> | null>(
    null
  );
  primaryPosts$: Observable<ResultSet<Post> | null> =
    this.primaryPostsSubject.asObservable();

  private secondaryPostsSubject = new BehaviorSubject<ResultSet<Post> | null>(
    null
  );
  secondaryPosts$: Observable<ResultSet<Post> | null> =
    this.secondaryPostsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  changes$: Observable<ChangedEntity<Post> | null>;

  private _query = '';

  get query(): string {
    return this._query;
  }

  set query(value: string) {
    this._query = value;
  }

  loadPosts(
    index: number,
    limit: number,
    type: EntityType,
    id: number,
    primary: boolean,
    filterType?: EntityType,
    filterId?: number
  ): void {
    const queryStringToken = this.authService.getQueryStringToken();
    this.loadingSubject.next(true);
    this.postsService
      .loadPosts(index, limit, type, id, primary, filterType, filterId)
      .pipe(
        tap((res) => {
          res.data.forEach((post) => {
            if (post.imageFileName == null) return;

            post.imageFileName = `${appSettings.baseUrl}/images/get-image?ImageFileName=${post.imageFileName}~${queryStringToken}`;
          });
          if (primary) {
            return this.primaryPostsSubject.next(res);
          }

          return this.secondaryPostsSubject.next(res);
        }),
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  listPosts(index: number, limit: number): void {
    const queryStringToken = this.authService.getQueryStringToken();
    this.loadingSubject.next(true);
    this.postsService
      .listPosts(index, limit, this.query)
      .pipe(
        tap((res) => {
          res.data.forEach((post) => {
            if (post.imageFileName == null) return;

            post.imageFileName = `${appSettings.baseUrl}/images/get-image?ImageFileName=${post.imageFileName}~${queryStringToken}`;
          });
          return this.postsSubject.next(res);
        }),
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  getPost(postId: number): Observable<Post | null> {
    this.loadingSubject.next(true);
    const result = this.postsService.getPost(postId).pipe(
      catchError((err) => {
        this.errorHandlerService.onError(err);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
    return result;
  }

  addManyPosts(type: EntityType, id: number, content: string): void {
    this.postsService
      .addManyPosts(type, id, content)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe((postIds: number[]) => {
        this.messagesService.success(
          `Added ${postIds.length} post(s) successfully.`,
          'Posts added'
        );
      });
  }

  addPost(post: Post): void {
    this.postsService
      .addPost(post)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe((postId) => {
        this.changeTrackerService.notify('post', postId, 'added', post);
        this.messagesService.success(
          `Post ${post.title} [${post.author}] was added successfully.`,
          'Post added'
        );
      });
  }

  updatePost(post: Post): void {
    this.postsService
      .updatePost(post)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.changeTrackerService.notify('post', post.postId, 'updated', post);
        this.messagesService.success(
          `Post ${post.title} [${post.author}] was updated successfully.`,
          'Post updated'
        );
      });
  }

  deletePost(postId: number) {
    this.postsService
      .deletePost(postId)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.changeTrackerService.notify('post', postId, 'deleted');
        this.messagesService.success(
          `Post was deleted successfully.`,
          'Post deleted'
        );
      });
  }
}
