import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppError } from '../domain/app-error';
import { Router } from '@angular/router';
import { MessagesService } from './messages.service';
import { CookieService } from 'ngx-cookie-service';
import {
  QUERY_STRING_TOKEN,
  USER_TOKEN,
} from '../../account/services/auth.service';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  errorsSubject = new BehaviorSubject<AppError[]>([]);
  errors$: Observable<AppError[]> = this.errorsSubject
    .asObservable()
    .pipe(filter((messages) => messages && messages.length > 0));

  constructor(
    private router: Router,
    private messagesService: MessagesService,
    private cookieService: CookieService
  ) {}

  onError(err: any) {
    const title = err.statusText || err.error?.title || 'Unknown Error';
    const message = err.message || err.error?.detail || 'An error occurred';
    console.error(
      JSON.stringify(err),
      'token',
      this.cookieService.get(USER_TOKEN)
    );
    this.errorsSubject.next([{ title, message, isTokenExpired: false }]);

    if (this.cookieService.check(USER_TOKEN)) {
      this.cookieService.delete(USER_TOKEN);
    }

    if (this.cookieService.check(QUERY_STRING_TOKEN)) {
      this.cookieService.delete(QUERY_STRING_TOKEN);
    }

    if (err.status === 0) {
      this.messagesService.warn(
        'Your token has expired. Please sign in again.',
        'Token expired'
      );
      this.router.navigate(['/pages/account/login']);
    }

    return throwError(() => err);
  }
}
