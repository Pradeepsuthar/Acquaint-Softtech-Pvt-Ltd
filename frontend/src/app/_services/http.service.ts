import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class HttpService {

  private baseUrl = environment.baseURL;
  AUTH_TOKEN = 'auth_tokens';

  constructor(private httpClient: HttpClient) {
  }

  get(url: string, params?: any): Observable<any> {
    const data = { ...params, ...(this.getAuthHeader() != {} && { headers: this.getAuthHeader() }) };
    return this.httpClient
      .get(this.baseUrl + url, data).pipe(catchError(this.errorHandler.bind(this)));
  }

  getWithoutHeader(url: string, params?: any): Observable<any> {
    const data = { ...params };
    return this.httpClient
      .get(this.baseUrl + url, data).pipe(catchError(this.errorHandler.bind(this)));
  }

  postWithoutHeader(url: string, params?: any): Observable<any> {
    const data = { ...params };
    return this.httpClient
      .post(this.baseUrl + url, data).pipe(catchError(this.errorHandler.bind(this)));
  }

  post(url: string, params?: any): Observable<any> {
    const data = { ...params, ...(this.getAuthHeader() != {} && { headers: this.getAuthHeader() }) };
    return this.httpClient
      .post(this.baseUrl + url, data).pipe(catchError(this.errorHandler.bind(this)));
  }

  put(url: string, params?: any): Observable<any> {
    const data = { ...params, ...(this.getAuthHeader() != {} && { headers: this.getAuthHeader() }) };
    return this.httpClient
      .post(this.baseUrl + url, data).pipe(catchError(this.errorHandler.bind(this)));
  }

  delete(url: string, params?: any): Observable<any> {
    const data = { ...params, ...(this.getAuthHeader() != {} && { headers: this.getAuthHeader() }) };
    return this.httpClient
      .delete(this.baseUrl + url, data).pipe(catchError(this.errorHandler.bind(this)));
  }

  private errorHandler(response: any) {
    const error = response.error;
    const keys = Object.keys(error);
    const key = keys[0];
    let message = error[key];
    if (response.status === 401) {
      // auth token delete
      // redirect login page
    }
    if (error[key] instanceof Array) {
      message = error[key][0];
    }
    if (key === 'isTrusted') {
      // this will occur when not connected to internet
    } else {
      message = key + ' : ' + message;
    }
    // call snackbar and show error with message
    return throwError({ messages: message, error });
  }

  private getAuthHeader(): { [header: string]: string | string[]; } {
    return {
      Authorization: `Bearer ${localStorage.getItem(this.AUTH_TOKEN)}`
    };
  }

}