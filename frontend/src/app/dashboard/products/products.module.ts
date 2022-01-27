import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { AddProductComponent } from './containers/add-product/add-product.component';
import { UpdateProductComponent } from './containers/update-product/update-product.component';
import { ProductDetailsComponent } from './containers/product-details/product-details.component';
import { ProductsListComponent } from './containers/products-list/products-list.component';


@NgModule({
  declarations: [
    AddProductComponent,
    UpdateProductComponent,
    ProductDetailsComponent,
    ProductsListComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule
  ]
})
export class ProductsModule { }
