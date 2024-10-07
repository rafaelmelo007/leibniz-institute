import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { FieldValidationErrorsComponent } from '../../../common/components/field-validation-errors/field-validation-errors.component';
import { AccountStore } from '../../services/account.store';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FieldValidationErrorsComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginPage implements OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  constructor(private router: Router, private accountStore: AccountStore) {
    const me$ = accountStore.me$;
    me$.pipe(takeUntil(this.destroyed$)).subscribe((res) => {
      if (!res) return;

      this.router.navigate(['/pages/posts']);
    });
    accountStore.tryRetrieveUser();
  }

  signIn() {
    this.loginForm.markAllAsTouched();
    if (!this.loginForm.valid) return;

    const formValues = this.loginForm.value;
    this.accountStore.signIn(formValues.email!, formValues.password!);
  }

  register() {
    this.router.navigate(['/pages/account/register']);
  }

  forgotPassword() {
    this.router.navigate(['/pages/account/forgot-password']);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
