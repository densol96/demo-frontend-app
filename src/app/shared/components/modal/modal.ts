import { Component, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  close = output<void>();

  closeModal() {
    this.close.emit();
  }
}
