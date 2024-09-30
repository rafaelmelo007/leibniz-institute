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
import { LinksService } from './links.service';
import { Link } from '../domain/link';
import { ErrorHandlerService } from '../../common/services/error-handler.service';
import { MessagesService } from '../../common/services/messages.service';

@Injectable({
  providedIn: 'root',
})
export class LinksStore {
  constructor(
    private linksService: LinksService,
    private errorHandlerService: ErrorHandlerService,
    private messagesService: MessagesService
  ) {}

  private linksSubject = new BehaviorSubject<ResultSet<Link> | null>(null);
  links$: Observable<ResultSet<Link> | null> = this.linksSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  loadLinks(index: number, limit: number): void {
    this.loadingSubject.next(true);
    this.linksService
      .loadLinks(index, limit)
      .pipe(
        tap((links) => this.linksSubject.next(links)),
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  getLink(linkId: number): Observable<Link | null> {
    this.loadingSubject.next(true);
    const result = this.linksService.getLink(linkId).pipe(
      catchError((err) => {
        this.errorHandlerService.onError(err);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
    return result;
  }

  addLink(link: Link): void {
    this.linksService
      .addLink(link)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.messagesService.success(
          `Link ${link.name} was added successfully.`,
          'Link added'
        );
      });
  }

  updateLink(link: Link): void {
    this.linksService
      .updateLink(link)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.messagesService.success(
          `Link ${link.name} was updated successfully.`,
          'Link updated'
        );
      });
  }

  deleteLink(linkId: number) {
    this.linksService
      .deleteLink(linkId)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe(() => {
        this.messagesService.success(
          `Link was deleted successfully.`,
          'Link deleted'
        );
      });
  }
}
