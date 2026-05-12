import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  public i18n = inject(I18nService);

  email = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;
  rememberMe = true;

  showForgotPw = false;
  resetEmail = '';
  resetLoading = false;
  resetSent = false;
  resetError = '';

  emailTouched = false;
  passwordTouched = false;

  constructor(private auth: AuthService, private router: Router) {}

  get emailError(): string {
    if (!this.emailTouched) return '';
    if (!this.email.trim()) return this.i18n.t('AUTH_EMAIL') + ' is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) return 'Enter a valid email address.';
    return '';
  }

  get passwordError(): string {
    if (!this.passwordTouched) return '';
    if (!this.password) return this.i18n.t('AUTH_PASSWORD') + ' is required.';
    return '';
  }

  toggleForgotPw() {
    this.showForgotPw = !this.showForgotPw;
    if (this.showForgotPw) {
      this.resetEmail = this.email;
      this.resetSent = false;
      this.resetError = '';
    }
  }

  submitReset() {
    if (!this.resetEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.resetEmail)) {
      this.resetError = 'Enter a valid email address.';
      return;
    }
    this.resetLoading = true;
    this.resetError = '';
    setTimeout(() => {
      this.resetLoading = false;
      this.resetSent = true;
    }, 800);
  }

  submit() {
    this.emailTouched = true;
    this.passwordTouched = true;
    this.error = '';

    if (!this.email.trim() || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }
    if (this.emailError) {
      this.error = this.emailError;
      return;
    }

    this.loading = true;
    setTimeout(() => {
      try {
        const ok = this.auth.login(this.email.trim(), this.password, this.rememberMe);
        if (ok) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = 'Invalid email or password. Please try again.';
        }
      } catch {
        this.error = 'Something went wrong. Please try again.';
      } finally {
        this.loading = false;
      }
    }, 600);
  }
}
