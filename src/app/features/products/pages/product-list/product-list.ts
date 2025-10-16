import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../services/product-service';
import { finalize, map } from 'rxjs';
import { ProductCard } from '../../components/product-card/product-card';
import { ActivatedRoute, Router } from '@angular/router';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { toSignal } from '@angular/core/rxjs-interop';
import { SortControl } from '../../../../shared/components/sort-control/sort-control';
import { SortOrder } from '../../../../shared/models/sort-order';
import { SortBy } from '../../models/product';

const RESULTS_PER_PAGE = 12;
const SORT_BY = 'price';
const SORT_ORDER = 'desc';
const FIELDS = ['price', 'stock'];

@Component({
  selector: 'app-product-list',
  imports: [ProductCard, Pagination, SortControl],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  private allProducts = this.productService.products;
  loading = signal(false);
  error = signal<string | null>(null);

  readonly fields = FIELDS;
  sortBy = toSignal(
    this.route.queryParamMap.pipe(map((params) => (params.get('sortBy') as SortBy) || SORT_BY)),
    {
      initialValue: SORT_BY,
    }
  );
  sortOrder = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => (params.get('sortOrder') as SortOrder) || SORT_ORDER)
    ),
    { initialValue: SORT_ORDER }
  );

  totalPages = computed(() => Math.ceil(this.allProducts().length / RESULTS_PER_PAGE));
  page = toSignal(this.route.queryParamMap.pipe(map((params) => Number(params.get('page')) || 1)), {
    initialValue: 1,
  });

  productsPerPage = computed(() => {
    const startFrom = (this.page() - 1) * RESULTS_PER_PAGE;
    return this.allProducts()
      .sort((a, b) => {
        const sortBy = this.sortBy();
        return this.sortOrder() === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
      })
      .slice(startFrom, startFrom + RESULTS_PER_PAGE);
  });

  constructor() {
    this.loadProducts();
    this.reactToProductsDeletion();
  }

  private reactToProductsDeletion() {
    effect(() => {
      const page = this.page();
      const totalPages = this.totalPages();

      if (totalPages < page && page > 1) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { page: page - 1 },
          queryParamsHandling: 'merge',
        });
      }
    });
  }

  loadProducts(force = false) {
    this.loading.set(true);
    this.error.set(null);
    this.productService
      .loadProducts(force)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        error: (err) => this.error.set('Product list is currently unavailable. Try again later!'),
      });
  }
}
