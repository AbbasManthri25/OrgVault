import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  public i18n = inject(I18nService);

  name = '';
  email = '';
  phone = '';
  password = '';
  confirm = '';
  error = '';
  loading = false;
  showPassword = false;
  showConfirm = false;
  acceptTerms = false;

  nameTouched = false;
  emailTouched = false;
  passwordTouched = false;
  confirmTouched = false;

  constructor(private auth: AuthService, private router: Router) {}

  get passwordChecks() {
    return {
      length:  this.password.length >= 8,
      upper:   /[A-Z]/.test(this.password),
      number:  /[0-9]/.test(this.password),
      special: /[^A-Za-z0-9]/.test(this.password),
    };
  }

  get strength(): number {
    const c = this.passwordChecks;
    return [c.length, c.upper, c.number, c.special].filter(Boolean).length;
  }

  get strengthLabel(): string {
    const labels = ['', 'SIGNUP_PW_WEAK', 'SIGNUP_PW_FAIR', 'SIGNUP_PW_GOOD', 'SIGNUP_PW_STRONG'];
    return this.i18n.t(labels[this.strength] || '');
  }

  get strengthClass(): string {
    return ['', 'weak', 'fair', 'good', 'strong'][this.strength] || '';
  }

  get nameError(): string {
    if (!this.nameTouched) return '';
    if (!this.name.trim()) return 'Full name is required.';
    if (this.name.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
  }

  get emailError(): string {
    if (!this.emailTouched) return '';
    if (!this.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) return 'Enter a valid email address.';
    return '';
  }

  get passwordError(): string {
    if (!this.passwordTouched) return '';
    if (!this.password) return 'Password is required.';
    if (this.password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  }

  get confirmError(): string {
    if (!this.confirmTouched) return '';
    if (!this.confirm) return 'Please confirm your password.';
    if (this.confirm !== this.password) return 'Passwords do not match.';
    return '';
  }

  submit() {
    this.nameTouched = true;
    this.emailTouched = true;
    this.passwordTouched = true;
    this.confirmTouched = true;
    this.error = '';

    if (!this.name.trim() || !this.email.trim() || !this.password || !this.confirm) {
      this.error = 'Please fill in all required fields.';
      return;
    }
    if (this.nameError || this.emailError || this.passwordError || this.confirmError) {
      this.error = this.nameError || this.emailError || this.passwordError || this.confirmError;
      return;
    }
    if (!this.acceptTerms) {
      this.error = 'Please accept the Terms of Service and Privacy Policy to continue.';
      return;
    }

    this.loading = true;
    setTimeout(() => {
      const ok = this.auth.signup(this.name.trim(), this.email.trim(), this.password);
      this.loading = false;
      if (ok) {
        this.router.navigate(['/dashboard']);
      } else {
        this.error = 'This email is already registered. Try signing in instead.';
      }
    }, 600);
  }
}
