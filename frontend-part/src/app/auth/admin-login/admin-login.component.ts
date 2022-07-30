import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiRequestService } from 'src/app/_services/api-request.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {

  error: any;
  constructor(private _apiReqSevice: ApiRequestService, private router: Router) { }

  ngOnInit(): void {
  }

  signinWithEmail(form: NgForm): void {
    let data = Object.assign({}, form.value);
    console.log("data", data);

    let loginobj = {
      email: data.email,
      password: data.password,
    };

    this._apiReqSevice.adminLogin(loginobj).subscribe(
      (res) => {
        console.log("resData", res);
        if (res.access_token && res.refresh_token) {
          localStorage.setItem('auth_tokens', JSON.stringify(res))
          this.router.navigateByUrl('/dashboard');
        }
      },
      (err) => {
        this.error = err;
      });
  }

}
