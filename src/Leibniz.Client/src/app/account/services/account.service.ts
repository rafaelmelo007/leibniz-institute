import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { LoginCredentials } from '../domain/login-credentials';
import { UserToken } from '../domain/user-token';
import { appSettings } from '../../environments/environment';
import { Me } from '../domain/me';
import { User } from '../domain/user';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  constructor(private http: HttpClient, private cookieService: CookieService) {}

  signIn(credentials: LoginCredentials): Observable<UserToken> {
    const result = this.http
      .post<UserToken>(`${appSettings.baseUrl}/auth/sign-in`, credentials)
      .pipe(map((res) => res));
    return result;
  }

  register(user: User): Observable<UserToken> {
    const result = this.http
      .post<UserToken>(`${appSettings.baseUrl}/auth/register`, user)
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
      .get<Me>(`${appSettings.baseUrl}/auth/me`)
      .pipe(map((res) => res));
    return result;
  }
}
