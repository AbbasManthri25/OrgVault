import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizationFormComponent } from './organization-form';
import { FormioModule } from '@formio/angular';
import { ORGANIZATION_FORM } from './organization-form-data';

describe('OrganizationFormComponent', () => {
  let component: OrganizationFormComponent;
  let fixture: ComponentFixture<OrganizationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrganizationFormComponent],
      imports: [FormioModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form loaded', () => {
    expect(component.form).toEqual(ORGANIZATION_FORM);
  });

  it('should not be submitted initially', () => {
    expect(component.submitted).toBeFalse();
  });

  it('should set submitted to true on submit', () => {
    const mockEvent = {
      data: { fullName: 'Test User', email: 'test@example.com' },
      state: 'submitted'
    };
    component.onSubmit(mockEvent);
    expect(component.submitted).toBeTrue();
  });

  it('should reset form on startAgain', () => {
    component.submitted = true;
    component.startAgain();
    expect(component.submitted).toBeFalse();
  });
});