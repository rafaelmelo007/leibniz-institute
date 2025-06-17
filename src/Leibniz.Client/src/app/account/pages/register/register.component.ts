import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FieldValidationErrorsComponent } from '../../../common/components/field-validation-errors/field-validation-errors.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountStore } from '../../services/account.store';

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, CommonModule, FieldValidationErrorsComponent],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterPage {
  registerForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    cpf: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    website: new FormControl('', []),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    acceptedTermsAndConditions: new FormControl(false, [
      Validators.requiredTrue,
    ]),
  });

  constructor(public router: Router, private accountStore: AccountStore) {}

  register(): void {
    this.registerForm.markAllAsTouched();
    if (!this.registerForm.valid) return;

    const formValues = this.registerForm.value;
    this.accountStore.register(formValues);
  }
}
