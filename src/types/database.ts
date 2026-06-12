export type UserRole = "user" | "premium" | "admin";
export type InquiryStatus =
  | "new"
  | "contacted"
  | "negotiation"
  | "deposit_made"
  | "collect_full_amount"
  | "prep_for_event"
  | "archived";
export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";
export type MusicCategory = "dj_mix" | "original" | "remix";
export type LandingTemplate = "booking" | "partnership";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  preferred_contact: string | null;
  event_type: string;
  event_date: string | null;
  event_location: string | null;
  budget_range: string | null;
  message: string | null;
  status: InquiryStatus;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  visitor_ip: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: Record<string, string | null>;
  subtotal_cents: number;
  total_cents: number;
  status: OrderStatus;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_slug: string;
  product_name: string;
  price_cents: number;
  quantity: number;
  size: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  category: string;
  tags: string[];
  author: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  venue: string | null;
  event_date: string | null;
  category: string;
  description: string | null;
  cover_image: string | null;
  gallery_images: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface MusicEntry {
  id: string;
  title: string;
  category: MusicCategory;
  embed_url: string | null;
  platform: string;
  external_url: string | null;
  featured: boolean;
  sort_order: number;
  published: boolean;
  created_at: string;
}

export interface LandingPage {
  id: string;
  slug: string;
  template: LandingTemplate;
  headline: string;
  subheadline: string | null;
  bullet_points: string[];
  testimonial_quote: string | null;
  testimonial_author: string | null;
  cta_text: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}
