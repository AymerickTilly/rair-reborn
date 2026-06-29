// types/Product.ts
export type Product = {
  productId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: {
    size: string;
    stockAmount: number;
  }[];
  imageUrl: string;
  onSale?: boolean;
  salePrice?: number;
};
