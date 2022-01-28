import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiRequestService } from '../_services/api-request.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    private _param: any = null;
    constructor(
        private router: Router,
        private apiService: ApiRequestService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const user = this.apiService.userValue;
        console.log("User", user, this.isUserLoggedIn())
        if (user) {
            if(this.isUserLoggedIn()){
                // authorised so return true
                this.router.navigate(['/dashboard']);
                return false;
            }else{
                return true;
            }
        }
        const queryParamsString = new HttpParams({ fromObject: route.queryParams }).toString();
        if (queryParamsString.length === 0) {
            this.router.navigate(['/']);
        } else {
            this.router.navigate(['/'], { queryParams: route.queryParams });
        }
        return false;
    }

    isUserLoggedIn(): boolean {
        const localData = localStorage.getItem('auth_tokens');
        if (localData) {
            const user = JSON.parse(localData);
            if (user && user.access_token && user.refresh_token) {
                return true;
            }
            return false;
        }
        return false;
    }

    getUserEmail(): any {
        const user: any = this.apiService.userValue;
        return user.email;
    }

    getUserName(): any {
        const user: any = this.apiService.userValue;
        return user.name ? user.name : '';
    }

}
