import { Component, OnInit } from '@angular/core';
import { ApiRequestService } from 'src/app/_services/api-request.service';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {

  products: any = [];

  constructor(private _apiReqService: ApiRequestService) { }

  ngOnInit(): void {
    this.getProductsList();
  }

  getProductsList() {
    this._apiReqService.getAllProducts().subscribe(
      res => {
        console.log(res);
        this.products = res.data;
      }
    );
  }

}
