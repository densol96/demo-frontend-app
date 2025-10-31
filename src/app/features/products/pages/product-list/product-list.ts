import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../services/product-service';
import { combineLatest, finalize, map, startWith } from 'rxjs';
import { ProductCard } from '../../components/product-card/product-card';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { toSignal } from '@angular/core/rxjs-interop';
import { SortControl } from '../../../../shared/components/sort-control/sort-control';
import { SortOrder } from '../../../../shared/models/sort-order';
import { SortBy } from '../../models/product';
import { AuthDirective } from '../../../../shared/directives/auth-directive';
import { AuthService } from '../../../auth/services/auth.service';
import { Store } from '@ngrx/store';
import {
  selectProducts,
  selectProductsAreLoading,
  selectProductsError,
} from '../../store/products.selector';
import { FIELDS, RESULTS_PER_PAGE, SORT_BY, SORT_ORDER } from '../../constants';
import { loadProducts } from '../../store/products.actions';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-product-list',
  imports: [
    ProductCard,
    Pagination,
    SortControl,
    RouterLink,
    RouterOutlet,
    AuthDirective,
    AsyncPipe,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  readonly fields = FIELDS;

  allProducts$ = this.store.select(selectProducts);
  loading$ = this.store.select(selectProductsAreLoading);
  error$ = this.store.select(selectProductsError);

  sortBy$ = this.route.queryParamMap.pipe(
    map((params) => (params.get('sortBy') as SortBy) || SORT_BY),
    startWith(SORT_BY as SortBy)
  );

  sortOrder$ = this.route.queryParamMap.pipe(
    map((params) => (params.get('sortOrder') as SortOrder) || SORT_ORDER),
    startWith(SORT_ORDER as SortOrder)
  );

  page$ = this.route.queryParamMap.pipe(
    map((params) => Number(params.get('page')) || 1),
    startWith(1)
  );

  totalPages$ = this.allProducts$.pipe(
    map((products) => Math.max(1, Math.ceil(products.length / RESULTS_PER_PAGE))),
    startWith(1)
  );

  productsPerPage$ = combineLatest([
    this.allProducts$,
    this.sortBy$,
    this.sortOrder$,
    this.page$,
  ]).pipe(
    map(([products, sortBy, sortOrder, page]) => {
      const startFrom = (page - 1) * RESULTS_PER_PAGE;
      const sorted = [...products].sort((a, b) => {
        return sortOrder === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
      });
      return sorted.slice(startFrom, startFrom + RESULTS_PER_PAGE);
    })
  );

  constructor() {}

  ngOnInit() {
    this.loadProducts(false);
  }

  loadProducts(force: boolean) {
    this.store.dispatch(loadProducts(force));
  }
}
