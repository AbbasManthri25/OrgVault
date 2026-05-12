export type OrganizationStatus = 'Active' | 'Inactive' | 'Pending';

export interface Organization {
  id: number;
  name: string;
  orgType: string;
  contact: string;
  createdOn: string;
  status: OrganizationStatus;
  email?: string;
  website?: string;
  employees?: number;
  address?: string;
}
