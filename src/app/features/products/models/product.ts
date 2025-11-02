export type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
};

export type SortBy = Extract<keyof Product, 'price' | 'stock'>;

export type ProductUpsert = Omit<Product, 'id'>;
