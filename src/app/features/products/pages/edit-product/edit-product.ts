import { Component, computed, effect, inject, signal } from '@angular/core';
import { ProductForm } from '../../components/product-form/product-form';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product-service';
import { ProductUpsert } from '../../models/product';
import { Modal } from '../../../../shared/components/modal/modal';
import { combineLatest, debounceTime, filter, map, switchMap, take, tap, timer } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectProductById, selectProductsAreLoading } from '../../store/products.selector';
import { AsyncPipe } from '@angular/common';
import { editProduct } from '../../store/products.actions';

@Component({
  selector: 'app-edit-product',
  imports: [ProductForm, Modal, AsyncPipe],
  templateUrl: 'edit-product.html',
  styleUrl: 'edit-product.scss',
})
export class EditProduct {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(Store);

  product$ = combineLatest([
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    this.store.select(selectProductsAreLoading).pipe(filter((isLoading) => isLoading === false)),
  ]).pipe(
    switchMap(([id, _]) => this.store.select(selectProductById(id))),
    tap((product) => {
      if (!product) timer(3000).subscribe(() => this.router.navigate(['/products']));
    })
  );

  submit(editedProduct: ProductUpsert) {
    this.product$.pipe(take(1)).subscribe((product) => {
      if (!product) return;
      this.store.dispatch(
        editProduct({
          changes: editedProduct,
          oldProduct: product,
        })
      );
    });
  }

  close() {
    this.router.navigate(['../']);
  }
}
