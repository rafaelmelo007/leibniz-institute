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
import { AuthService } from '../../account/services/auth.service';
import { appSettings } from '../../../environments/environment';
import { ChangeTrackerService } from '../../common/services/change-tracker.service';
import { EntityType } from '../../relationships/components/domain/entity-type';

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

  loadPosts(index: number, limit: number): void {
    var queryStringToken = this.authService.getQueryStringToken();
    this.loadingSubject.next(true);
    this.postsService
      .loadPosts(index, limit, this.query)
      .pipe(
        tap((res) => {
          res.data.forEach((post) => {
            post.refs?.forEach((element) => {
              const type = <any>element.type;
              element.type = this.toEntityType(type);
            });

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

  toEntityType(type: number): EntityType {
    switch (type) {
      case 1:
        return 'post';
      case 2:
        return 'link';
      case 3:
        return 'area';
      case 4:
        return 'author';
      case 5:
        return 'book';
      case 6:
        return 'period';
      case 7:
        return 'thesis';
      case 8:
        return 'topic';
      case 9:
        return 'unknown';
    }
    return 'unknown';
  }
}
