export interface Product {
  id: string;
  name: string;
  price: number;
  offerPrice?: number;
  description?: string;
  imagePath: string;
  category: string;
}
