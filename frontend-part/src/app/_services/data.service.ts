import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  setObject(obj: any, key: string): void {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  getObject(key: string): any {
    return localStorage.getItem(key);
  }

  getDictObject(key: string): any {
    try {
      return JSON.parse(this.getObject(key));
    } catch {
      return null;
    }
  }

  clearObject(key: string): void {
    localStorage.setItem(key, '');
  }

  removeObject(key: string): void {
    // console.info('dataService removing value for key: ', key)
    localStorage.removeItem(key);
  }
  
}
