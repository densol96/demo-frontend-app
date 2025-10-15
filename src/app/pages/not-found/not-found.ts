import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  private router = inject(Router);

  get currentUrl() {
    return this.router.url;
  }

  goBack() {
    this.router.navigateByUrl('/');
  }
}
