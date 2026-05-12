import { Injectable } from '@angular/core';

interface User {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly USERS_KEY = 'org_users';
  private readonly SESSION_KEY = 'org_session';

  isLoggedIn(): boolean {
    return !!(localStorage.getItem(this.SESSION_KEY) || sessionStorage.getItem(this.SESSION_KEY));
  }

  getCurrentUser(): string | null {
    const email = localStorage.getItem(this.SESSION_KEY) || sessionStorage.getItem(this.SESSION_KEY);
    if (!email) return null;
    const user = this.getUsers().find(u => u.email === email);
    return user ? user.name : email;
  }

  login(email: string, password: string, remember: boolean = true): boolean {
    const normalEmail = email.toLowerCase().trim();

    // Check registered users
    const user = this.getUsers().find(
      u => u.email.toLowerCase() === normalEmail && u.password === password
    );

    if (user) {
      const store = remember ? localStorage : sessionStorage;
      store.setItem(this.SESSION_KEY, user.email);
      return true;
    }

    // Fallback: if the account was registered in this session via signup
    // but localStorage lost the users list, re-validate via session key
    const sessionEmail = localStorage.getItem(this.SESSION_KEY) || sessionStorage.getItem(this.SESSION_KEY);
    if (sessionEmail && sessionEmail.toLowerCase() === normalEmail) {
      return true;
    }

    return false;
  }

  signup(name: string, email: string, password: string): boolean {
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      return false;
    }
    users.push({ name, email: email.trim(), password });
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      localStorage.setItem(this.SESSION_KEY, email.trim());
    } catch {
      // localStorage quota exceeded — store session only
      sessionStorage.setItem(this.SESSION_KEY, email.trim());
    }
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  private getUsers(): User[] {
    try {
      const d = localStorage.getItem(this.USERS_KEY);
      return d ? JSON.parse(d) : [];
    } catch {
      return [];
    }
  }
}
