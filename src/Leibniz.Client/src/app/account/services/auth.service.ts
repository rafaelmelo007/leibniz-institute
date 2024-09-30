import { Injectable } from '@angular/core';
import { UserToken } from '../domain/user-token';
import { CookieService } from 'ngx-cookie-service';

export const USER_TOKEN = 'user_token';
export const QUERY_STRING_TOKEN = 'query_string_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: UserToken | null = null;

  constructor(private cookieService: CookieService) {}

  getToken(): UserToken | null {
    if (!this.token) {
      if (typeof this.cookieService === 'undefined') {
        return null;
      }

      const userJson = this.cookieService.get(USER_TOKEN);
      if (userJson) {
        this.token = JSON.parse(userJson);
      }
    }
    return this.token;
  }

  setToken(userToken: UserToken | null): void {
    if (typeof this.cookieService === 'undefined') {
      return;
    }
    if (userToken == null) {
      this.cookieService.delete(USER_TOKEN);
      return;
    }
    if (this.cookieService.check(USER_TOKEN)) {
      this.cookieService.delete(USER_TOKEN);
    }
    this.token = null;
    this.cookieService.set(USER_TOKEN, JSON.stringify(userToken));
  }

  private queryStringToken: string | null = null;
  getQueryStringToken(): string | null {
    if (!this.queryStringToken) {
      if (typeof this.cookieService === 'undefined') {
        return null;
      }

      const queryStringToken = this.cookieService.get(QUERY_STRING_TOKEN);
      if (queryStringToken) {
        this.queryStringToken = queryStringToken;
      }
    }
    return this.queryStringToken;
  }

  setQueryStringToken(queryStringToken: string | null): void {
    if (typeof this.cookieService === 'undefined') {
      return;
    }
    if (queryStringToken == null) {
      this.cookieService.delete(QUERY_STRING_TOKEN);
      return;
    }
    if (this.cookieService.check(QUERY_STRING_TOKEN)) {
      this.cookieService.delete(QUERY_STRING_TOKEN);
    }
    this.queryStringToken = null;
    this.cookieService.set(QUERY_STRING_TOKEN, queryStringToken);
  }
}
