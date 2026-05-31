import type { OrderStatus } from '@prisma/client';

/** A line item in the client-side (Zustand) cart. */
export interface CartLine {
  menuItemId: string;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  quantity: number;
  notes?: string;
}

/** Serializable menu item shape sent to the client (Decimal -> number). */
export interface MenuItemDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  ingredients?: string | null;
  price: number;
  image?: string | null;
  categoryId: string;
  categoryName?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  ratingAverage: number;
  ratingCount: number;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  itemCount?: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  message?: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
