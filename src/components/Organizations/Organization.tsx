// Organization interface for all organization-related components
export interface Organization {
  id: string;
  name: string;
  type: string;
  industry: string;
  employees: number;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'prospect';
} 