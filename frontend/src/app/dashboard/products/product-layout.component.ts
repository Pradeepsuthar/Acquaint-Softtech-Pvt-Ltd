import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-product-layout',
  template: `
  <router-outlet></router-outlet>
  `,
  styles: [``]
})
export class ProductLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}