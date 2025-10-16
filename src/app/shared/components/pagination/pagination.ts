import { Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  totalPages = input.required<number>();
  currentPage = input.required<number>();

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }
}
