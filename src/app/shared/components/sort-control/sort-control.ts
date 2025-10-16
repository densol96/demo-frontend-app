import { Component, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SortOrder } from '../../models/sort-order';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sort-control',
  imports: [TitleCasePipe, FormsModule],
  templateUrl: './sort-control.html',
  styleUrl: './sort-control.scss',
})
export class SortControl {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  fields = input.required<string[]>();

  selectedField = input.required<string>();
  selectedOrder = input.required<SortOrder>();

  onFieldChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.updateQuery({ sortBy: value });
  }

  toggleOrder() {
    const newOrder = this.selectedOrder() === 'asc' ? 'desc' : 'asc';
    this.updateQuery({ sortOrder: newOrder });
  }

  private updateQuery(update: Partial<{ sortBy: string; sortOrder: SortOrder }>) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: update,
      queryParamsHandling: 'merge',
    });
  }
}
