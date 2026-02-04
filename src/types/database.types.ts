export type AppRole = "owner" | "manager" | "employee";
export type PaymentMethod = "cash" | "card" | "transfer" | "credit";
export type PaymentStatus = "paid" | "pending" | "partial";
export type InventoryMovementType = "purchase" | "sale" | "adjustment" | "return";
export type NotificationType = "low_stock" | "out_of_stock" | "system";

export interface Organization {
  id: string;
  name: string;
  address?: string | null;
  tax_id?: string | null;
  phone?: string | null;
  email?: string | null;
  currency: string;
  timezone: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  timezone?: string | null;
  language?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  organization_id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Category {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  sku: string;
  barcode?: string | null;
  category_id?: string | null;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  min_stock_threshold: number;
  unit: string;
  image_url?: string | null;
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  organization_id: string;
  name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  tax_id?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Purchase {
  id: string;
  organization_id: string;
  purchase_number: string;
  supplier_id?: string | null;
  total_amount: number;
  payment_status: PaymentStatus;
  amount_paid?: number | null;
  invoice_number?: string | null;
  received_date?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  organization_id: string;
  sale_number: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  notes?: string | null;
  sold_by?: string | null;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface InventoryMovement {
  id: string;
  organization_id: string;
  product_id: string;
  movement_type: InventoryMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  unit_cost?: number | null;
  reference_id?: string | null;
  notes?: string | null;
  performed_by?: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  organization_id: string;
  user_id?: string | null;
  type: NotificationType;
  title: string;
  message?: string | null;
  reference_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface OrganizationSettings {
  id: string;
  organization_id: string;
  store_name: string;
  store_address?: string | null;
  tax_id?: string | null;
  phone?: string | null;
  email?: string | null;
  logo_url?: string | null;
  receipt_header?: string | null;
  receipt_footer?: string | null;
  receipt_from_email?: string | null;
  receipt_email_footer?: string | null;
  auto_send_receipt?: boolean | null;
  cc_owner_on_receipt?: boolean | null;
  auto_print_receipt?: boolean | null;
  auto_show_receipt_modal?: boolean | null;
  notify_low_stock?: boolean | null;
  notify_out_of_stock?: boolean | null;
  notify_large_sale?: boolean | null;
  large_sale_threshold?: number | null;
  notify_purchase_created?: boolean | null;
  notify_email_low_stock?: boolean | null;
  notify_email_large_sale?: boolean | null;
  default_tax_rate: number;
  currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}
