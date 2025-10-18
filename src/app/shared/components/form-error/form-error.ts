import { Component, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';

type ErrMsg = Record<string, string | ((params: any) => string)>;

const DEFAULT_VALIDATION_MESSAGES: ErrMsg = {
  required: 'This field is required.',
  email: 'Please enter a valid email address.',
  min: (params) => `The value must be greater than or equal to ${params.min}.`,
  max: (params) => `The value must be less than or equal to ${params.max}.`,
  minlength: (params) =>
    `Minimum length is ${params.requiredLength} characters (currently ${params.actualLength}).`,
  maxlength: (params) =>
    `Maximum length is ${params.requiredLength} characters (currently ${params.actualLength}).`,
  pattern: 'The entered value does not match the required pattern.',
  nullValidator: 'Invalid value.',
};

@Component({
  selector: 'app-form-error',
  imports: [],
  templateUrl: './form-error.html',
  styleUrl: './form-error.scss',
})
export class FormError {
  fc = input.required<FormControl>();
  userErrorMessages = input<ErrMsg, ErrMsg>(DEFAULT_VALIDATION_MESSAGES, {
    transform: (userInput) => ({ ...DEFAULT_VALIDATION_MESSAGES, ...userInput }),
  });

  get activeErrors(): string[] {
    const control = this.fc();
    const activeErrors = control.errors;

    if (!activeErrors) return [];

    const msgs = this.userErrorMessages();
    return Object.entries(activeErrors).map(([key, value]) => {
      const msg = msgs[key];
      return typeof msg === 'function' ? msg(value) : msg ?? 'Invalid value';
    });
  }
}
