import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ApiRequestService {

  constructor(private http: HttpService) { }

  // Admin Login
  adminLogin(params: any) {
    let apiURL: string = '/api/login';
    return this.http.postWithoutHeader(apiURL, params)
  }

}
