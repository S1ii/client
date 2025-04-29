export type ClientStatus = 'active' | 'inactive';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  address?: string;
  notes?: string;
}

export interface ClientInput {
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  address?: string;
  notes?: string;
}

export interface ClientResponse {
  success: boolean;
  data: Client;
  message?: string;
} 