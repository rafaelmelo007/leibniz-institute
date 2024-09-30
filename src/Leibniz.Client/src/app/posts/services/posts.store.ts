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

@Injectable({
  providedIn: 'root',
})
export class PostsStore {
  constructor(
    private postsService: PostsService,
    private errorHandlerService: ErrorHandlerService,
    private messagesService: MessagesService
  ) {}

  private postsSubject = new BehaviorSubject<ResultSet<Post> | null>(null);
  posts$: Observable<ResultSet<Post> | null> = this.postsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  loadPosts(index: number, limit: number, query: string = ''): void {
    this.loadingSubject.next(true);
    this.postsService
      .loadPosts(index, limit, query)
      .pipe(
        tap((posts) => this.postsSubject.next(posts)),
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
      .subscribe(() => {
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
        this.messagesService.success(
          `Post was deleted successfully.`,
          'Post deleted'
        );
      });
  }
}
