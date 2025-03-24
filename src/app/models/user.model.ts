import { Product } from './product.model';

export interface User {
  id?: string;
  fullName: string;
  userName: string;
  mobileNumber: string;
  cart?: Product[];
  purchases?: Purchase[];
}

export interface Purchase {
  orderId: string;
  items: Product[];
  total: number;
  date: string;
  status?: 'pending' | 'shipped' | 'delivered';
}
