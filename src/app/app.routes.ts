import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Organization } from './organization/organization';
import { OrganizationForm } from './organization-form/organization-form';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { authGuard } from './guards/auth.guard';
import { OrganizationDetail } from './organization-detail/organization-detail';
import { CraForm } from './cra-form/cra-form';
import { FormBuilder } from './form-builder/form-builder';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login',    component: Login },
  { path: 'signup',   component: Signup },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'organization', component: Organization, canActivate: [authGuard] },
  { path: 'organization/add', component: OrganizationForm, canActivate: [authGuard] },
  { path: 'organization/:id', component: OrganizationDetail, canActivate: [authGuard] },
  { path: 'cra-form', component: CraForm, canActivate: [authGuard] },
  { path: 'form-builder', component: FormBuilder, canActivate: [authGuard] }
];
