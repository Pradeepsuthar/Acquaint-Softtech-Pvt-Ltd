import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { DashboardSidebarComponent } from './components/dashboard-sidebar/dashboard-sidebar.component';



@NgModule({
  declarations: [
    HeaderComponent,
    DashboardSidebarComponent,
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    FormsModule,
    DashboardSidebarComponent,
    HeaderComponent
  ]
})
export class SharedModule { }
