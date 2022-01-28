import { Router } from '@angular/router';
import { User } from '../_models/user';
import { HttpService } from './http.service';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { DataService } from './data.service';
@Injectable({
  providedIn: 'root'
})
export class ApiRequestService {

  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;
  public isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @Output() getLoggedIn: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private http: HttpService,
    private router: Router,
    private _httpClient: HttpClient,
    private dataService: DataService
  ) {
    const user = this.dataService.getDictObject('auth_tokens')
    this.userSubject = new BehaviorSubject<User>(user);
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  // Admin Login
  adminLogin(params: any) {
    let apiURL: string = '/api/login';
    return this.http.postWithoutHeader(apiURL, params);
  }

  getAllProducts() {
    let apiURL: string = '/api/get-all-products';
    return this.http.getWithoutHeader(apiURL);
  }

}
