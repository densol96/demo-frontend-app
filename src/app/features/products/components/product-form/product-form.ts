import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormError } from '../../../../shared/components/form-error/form-error';
import { Router } from '@angular/router';
import { ProductUpsert } from '../../models/product';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, FormError],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  private router = inject(Router);

  form = new FormGroup({
    name: new FormControl<string>('', [Validators.required, Validators.minLength(5)]),
    description: new FormControl<string>('', [Validators.minLength(10)]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    stock: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  title = input.required<string>();
  existingProduct = input<ProductUpsert>();

  submitForm = output<ProductUpsert>();
  cancel = output<void>();

  constructor() {
    effect(() => {
      const product = this.existingProduct();
      if (product) {
        this.form.patchValue(product);
      }
    });
  }

  submit() {
    if (this.form.valid) this.submitForm.emit(this.form.value as ProductUpsert);
  }

  onCancel() {
    this.cancel.emit();
  }

  get f() {
    return this.form.controls;
  }
}
