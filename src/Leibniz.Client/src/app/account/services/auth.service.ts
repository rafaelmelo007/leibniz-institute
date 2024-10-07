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

  private expirationDays = 7;
  private currentPath = '/';
  private currentHost = window.location.hostname;

  constructor(private cookieService: CookieService) {}

  getToken(): UserToken | null {
    if (!this.token) {
      if (this.cookieService === undefined) {
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
      this.deleteCookie(USER_TOKEN);
      this.token = null;
      return;
    }
    if (this.cookieService.check(USER_TOKEN)) {
      this.deleteCookie(USER_TOKEN);
      this.token = null;
    }
    this.setCookie(USER_TOKEN, JSON.stringify(userToken));
  }

  private queryStringToken: string | null = null;
  getQueryStringToken(): string | null {
    if (!this.queryStringToken) {
      if (this.cookieService === undefined) {
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
    if (this.cookieService === undefined) {
      return;
    }
    if (queryStringToken == null) {
      this.deleteCookie(QUERY_STRING_TOKEN);
      this.queryStringToken = null;
      return;
    }
    if (this.cookieService.check(QUERY_STRING_TOKEN)) {
      this.deleteCookie(QUERY_STRING_TOKEN);
      this.queryStringToken = null;
    }
    this.setCookie(QUERY_STRING_TOKEN, queryStringToken);
  }

  private deleteCookie(key: string): void {
    this.cookieService.delete(
      key,
      this.currentPath,
      this.currentHost,
      true,
      'Strict'
    );
  }

  private setCookie(key: string, value: string | null): void {
    this.cookieService.set(
      key,
      value ?? '',
      this.expirationDays,
      this.currentPath,
      this.currentHost,
      true,
      'Strict'
    );
  }
}
