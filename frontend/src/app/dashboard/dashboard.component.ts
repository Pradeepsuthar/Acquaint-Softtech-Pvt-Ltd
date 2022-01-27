import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-dashboard-layout',
    template: `

    <app-header></app-header>

    <div class="container-fluid">
            <div class="row">
                <nav id="sidebarMenu" style="min-height: calc(100vh - 72px);border-right: 1px solid #dedede;" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
                    <app-dashboard-sidebar></app-dashboard-sidebar>
                </nav>
                <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                    <router-outlet></router-outlet>
                </main>
            </div>
    </div>

  `,
    styles: [``]
})
export class DashboardComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

}