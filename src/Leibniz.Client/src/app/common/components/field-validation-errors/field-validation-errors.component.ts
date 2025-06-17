import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
    selector: 'app-field-validation-errors',
    imports: [CommonModule],
    templateUrl: './field-validation-errors.component.html',
    styleUrl: './field-validation-errors.component.css'
})
export class FieldValidationErrorsComponent {
  @Input() control: AbstractControl | null = null;

  // Default error messages
  private errorMessages = {
    required: 'This field is required.',
    email: 'Please enter a valid email address.',
    minlength: 'This field is too short.',
    maxlength: 'This field is too long.',
    // Add other error types as needed
  };

  getErrorMessage(): string {
    if (this.control) {
      if (this.control.dirty || this.control.touched) {
        for (const [key, message] of Object.entries(this.errorMessages)) {
          if (this.control.hasError(key)) {
            return message;
          }
        }
      }
    }
    return '';
  }
}
