import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { LoginCredentials } from '../domain/login-credentials';
import { UserToken } from '../domain/user-token';
import { appSettings } from '../../../environments/environment';
import { Me } from '../domain/me';
import { User } from '../domain/user';
import { CookieService } from 'ngx-cookie-service';
import { ResetPasswordRequest } from '../domain/reset-password-request';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient, private cookieService: CookieService) {}

  signIn(credentials: LoginCredentials): Observable<UserToken> {
    const result = this.http
      .post<UserToken>(`${appSettings.baseUrl}/users/sign-in`, credentials)
      .pipe(map((res) => res));
    return result;
  }

  forgotPassword(email: string): Observable<boolean> {
    const result = this.http
      .post<{ success: boolean }>(
        `${appSettings.baseUrl}/users/forgot-password`,
        { email }
      )
      .pipe(map((res) => res.success));
    return result;
  }

  resetPassword(request: ResetPasswordRequest): Observable<boolean> {
    const result = this.http
      .put<{ success: boolean }>(
        `${appSettings.baseUrl}/users/forgot-password`,
        request
      )
      .pipe(map((res) => res.success));
    return result;
  }

  register(user: User): Observable<UserToken> {
    const result = this.http
      .post<UserToken>(`${appSettings.baseUrl}/users/register`, user)
      .pipe(map((res) => res));
    return result;
  }

  me(): Observable<Me> {
    if (typeof this.cookieService === 'undefined') {
      return of({
        isLogged: false,
        userId: 0,
        email: '',
        queryStringToken: '',
      });
    }
    const result = this.http
      .get<Me>(`${appSettings.baseUrl}/users/me`)
      .pipe(map((res) => res));
    return result;
  }
}
