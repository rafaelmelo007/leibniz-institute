import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FieldValidationErrorsComponent } from '../../../common/components/field-validation-errors/field-validation-errors.component';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../services/user.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, CommonModule, FieldValidationErrorsComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordPage {
  forgotForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor(private router: Router, private userStore: UserStore) {}

  forgotPassword() {
    this.forgotForm.markAllAsTouched();
    if (!this.forgotForm.valid) return;

    const formValues = this.forgotForm.value;
    this.userStore.forgotPassword(formValues.email!);
  }

  back(): void {
    this.router.navigate(['/pages/account/login']);
  }
}
