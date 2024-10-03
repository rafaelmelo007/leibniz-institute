import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { AccountsService } from './account.service';
import { UserToken } from '../domain/user-token';
import { Router } from '@angular/router';
import { Me } from '../domain/me';
import { User } from '../domain/user';
import { ErrorHandlerService } from '../../common/services/error-handler.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AccountStore implements OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private router: Router,
    private errorHandlerService: ErrorHandlerService,
    private accountService: AccountsService,
    private authService: AuthService
  ) {
    this.isLoggedIn$ = this.user$.pipe(map((user) => !!user));
    this.isLoggedOut$ = this.isLoggedIn$.pipe(map((loggedIn) => !loggedIn));

    const userToken = authService.getToken();
    if (userToken) {
      this.userSubject.next(userToken);
      this.user$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.accountService
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
  }

  private userSubject = new BehaviorSubject<UserToken | null>(null);
  private userInfoSubject = new BehaviorSubject<Me | null>(null);

  user$: Observable<UserToken | null> = this.userSubject.asObservable();
  me$: Observable<Me | null> = this.userInfoSubject.asObservable();
  isLoggedIn$: Observable<boolean>;
  isLoggedOut$: Observable<boolean>;

  signIn(email?: string, password?: string): void {
    this.accountService
      .signIn({ email, password })
      .pipe(catchError((err) => this.errorHandlerService.onError(err)))
      .subscribe((res) => {
        this.authService.setToken(res);
        this.userSubject.next(res);
        this.router.navigate(['/pages/posts']);
      });
  }

  logout() {
    this.userSubject.next(null);
    this.authService.setToken(null);
    this.authService.setQueryStringToken(null);
    this.router.navigate(['/pages/account/login']);
  }

  register(user: User): void {
    this.accountService
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
