export interface User {
  id?: string;
  fullName: string;
  userName: string;
  mobileNumber: string;
  cart?: CartItem[];
  purchases?: Purchase[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

export interface Purchase {
  orderId: string;
  items: PurchaseItem[];
  totalAmount: number;
  purchaseDate: Date;
  shippingAddress?: string;
  paymentMethod?: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}
