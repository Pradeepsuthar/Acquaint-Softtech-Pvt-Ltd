import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddProductComponent } from './containers/add-product/add-product.component';
import { ProductDetailsComponent } from './containers/product-details/product-details.component';
import { ProductsListComponent } from './containers/products-list/products-list.component';
import { UpdateProductComponent } from './containers/update-product/update-product.component';
import { ProductLayoutComponent } from './product-layout.component';

const routes: Routes = [
  {
    path: '',
    component: ProductLayoutComponent,
    children: [
      {
        path: '',
        component: ProductsListComponent
      },
      {
        path: 'add',
        component: AddProductComponent
      },
      {
        path: 'update',
        component: UpdateProductComponent
      },
      {
        path: 'productId=:id',
        component: ProductDetailsComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
