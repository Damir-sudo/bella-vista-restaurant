import type { OrderStatus } from '@prisma/client';

export const SITE = {
  name: 'Bella Vista',
  tagline: 'Authentic Italian, crafted with love',
  description:
    'Bella Vista is a premium Italian restaurant serving hand-made pasta, wood-fired pizza and seasonal specialities. Order online for delivery or pickup.',
  phone: '+1 (555) 014-2200',
  email: 'ciao@bellavista.test',
  address: '120 Via Roma, New York, NY 10012',
  hours: [
    { day: 'Monday – Thursday', time: '12:00 – 22:00' },
    { day: 'Friday – Saturday', time: '12:00 – 23:30' },
    { day: 'Sunday', time: '12:00 – 21:00' },
  ],
} as const;

export const MAIN_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export const ACCOUNT_NAV = [
  { label: 'Profile', href: '/account' },
  { label: 'Orders', href: '/account/orders' },
  { label: 'Addresses', href: '/account/addresses' },
  { label: 'Reviews', href: '/account/reviews' },
] as const;

export const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Menu Items', href: '/admin/menu' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Analytics', href: '/admin/analytics' },
] as const;

/** Pricing config used by the checkout/order service. */
export const TAX_RATE = 0.0825;
export const DELIVERY_FEE = 4.99;
export const FREE_DELIVERY_THRESHOLD = 60;

/** Ordered lifecycle used for the tracking timeline and admin transitions. */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'COMPLETED',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
