import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { UserService } from './user.service';
import { UserToken } from '../domain/user-token';
import { Router } from '@angular/router';
import { Me } from '../domain/me';
import { User } from '../domain/user';
import { ErrorHandlerService } from '../../common/services/error-handler.service';
import { AuthService } from './auth.service';
import { MessagesService } from '../../common/services/messages.service';
import { ResetPasswordRequest } from '../domain/reset-password-request';

@Injectable({
  providedIn: 'root',
})
export class UserStore implements OnDestroy {
  private destroyed$ = new ReplaySubject<boolean>(1);

  constructor(
    private router: Router,
    private errorHandlerService: ErrorHandlerService,
    private userService: UserService,
    private authService: AuthService,
    private messagesService: MessagesService
  ) {
    this.isLoggedIn$ = this.user$.pipe(map((user) => !!user));
    this.isLoggedOut$ = this.isLoggedIn$.pipe(map((loggedIn) => !loggedIn));

    const errors$ = this.errorHandlerService.errors$;
    errors$.pipe(takeUntil(this.destroyed$)).subscribe((err) => {
      this.messagesService.warn(err[0].message, err[0].title);
    });
  }

  private userSubject = new BehaviorSubject<UserToken | null>(null);
  private userInfoSubject = new BehaviorSubject<Me | null>(null);

  user$: Observable<UserToken | null> = this.userSubject.asObservable();
  me$: Observable<Me | null> = this.userInfoSubject.asObservable();
  isLoggedIn$: Observable<boolean>;
  isLoggedOut$: Observable<boolean>;

  tryRetrieveUser(): void {
    const userToken = this.authService.getToken();
    if (!userToken) return;
    this.userSubject.next(userToken);
    this.user$.pipe(takeUntil(this.destroyed$)).subscribe((res) => {
      if (!res) return;

      this.userService
        .me()
        .pipe(catchError((err) => this.errorHandlerService.onError(err)))
        .subscribe(
          (data) => {
            this.authService.setQueryStringToken(data.queryStringToken);
            this.userInfoSubject.next(data);
          },
          (err) => {
            return this.errorHandlerService.onError(err);
          }
        );
    });
  }

  signIn(email: string, password: string): void {
    this.userService
      .signIn({ email, password })
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe((res) => {
        this.authService.setToken(res);
        this.userSubject.next(res);
        this.router.navigate(['/pages/posts']);
      });
  }

  forgotPassword(email: string): void {
    this.userService
      .forgotPassword(email)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe((success) => {
        if (!success) return;

        this.router.navigate(['/pages/account/login']);
        this.messagesService.success(
          `E-mail sent to ${email} with instructions to reset the password.`,
          'Email sent'
        );
      });
  }

  resetPassword(request: ResetPasswordRequest): void {
    this.userService
      .resetPassword(request)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe((success) => {
        if (success) {
          this.messagesService.success(
            `User password was reset.`,
            'Password sent'
          );
          this.router.navigate(['/pages/account/login']);
        }
      });
  }

  logout() {
    this.userSubject.next(null);
    this.userInfoSubject.next(null);
    this.authService.setToken(null);
    this.authService.setQueryStringToken(null);
    this.router.navigate(['/pages/account/login']);
  }

  register(user: User): void {
    this.userService
      .register(user)
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe((res) => {
        this.authService.setToken(res);
        this.userSubject.next(res);
        this.router.navigate(['/pages/posts']);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
