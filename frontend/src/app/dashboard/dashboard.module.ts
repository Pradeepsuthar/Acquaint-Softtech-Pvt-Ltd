import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { HomeComponent } from './containers/home/home.component';
import { AccountSettingsComponent } from './containers/account-settings/account-settings.component';
import { ProductLayoutComponent } from './products/product-layout.component';


@NgModule({
  declarations: [
    HomeComponent,
    AccountSettingsComponent,
    ProductLayoutComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
