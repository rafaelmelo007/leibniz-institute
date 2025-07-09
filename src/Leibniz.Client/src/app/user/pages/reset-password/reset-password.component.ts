import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FieldValidationErrorsComponent } from '../../../common/components/field-validation-errors/field-validation-errors.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UserStore } from '../../services/user.store';
import { ResetPasswordRequest } from '../../domain/reset-password-request';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule, FieldValidationErrorsComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordPage {
  resetForm = new FormGroup({
    changePasswordToken: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required]),
    confirmNewPassword: new FormControl('', [Validators.required]),
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userStore: UserStore
  ) {
    this.route.queryParams.subscribe((params) => {
      const changePasswordToken = params['changePasswordToken'];
      this.resetForm.patchValue({ changePasswordToken });
    });
  }

  resetPassword(): void {
    const request = this.resetForm.value as ResetPasswordRequest;
    this.userStore.resetPassword(request);
  }

  back(): void {
    this.router.navigate(['/pages/account/login']);
  }
}
