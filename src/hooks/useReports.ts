"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { DateRange } from "@/hooks/useDateRange";
import type { Sale, SaleItem, Product, Category, User } from "@/types/database.types";

function inRange(date: string, range: DateRange) {
  return date >= range.from && date <= range.to;
}

export function useDashboardMetrics(range: DateRange) {
  return useQuery({
    queryKey: ["report-metrics", range],
    staleTime: 1000 * 30,
    queryFn: async () => {
      const supabase = createClient();
      const { data: sales = [] } = await supabase.from("sales").select("*");
      const { data: products = [] } = await supabase.from("products").select("*");

      const filteredSales = (sales as Sale[]).filter((s) => inRange(s.created_at.slice(0, 10), range));
      const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.final_amount), 0);
      const transactions = filteredSales.length;
      const avgTransaction = transactions ? totalRevenue / transactions : 0;
      const inventoryValue = (products as Product[]).reduce(
        (sum, p) => sum + Number(p.cost_price) * p.current_stock,
        0
      );

      return { totalRevenue, transactions, avgTransaction, inventoryValue };
    }
  });
}

export function useSalesReport(range: DateRange) {
  return useQuery({
    queryKey: ["sales-report", range],
    staleTime: 1000 * 30,
    queryFn: async () => {
      const supabase = createClient();
      const { data: sales = [] } = await supabase.from("sales").select("*");
      const { data: items = [] } = await supabase.from("sale_items").select("*");
      const filteredSales = (sales as Sale[]).filter((s) => inRange(s.created_at.slice(0, 10), range));
      const salesByDay = new Map<string, number>();
      filteredSales.forEach((s) => {
        const day = s.created_at.slice(0, 10);
        salesByDay.set(day, (salesByDay.get(day) ?? 0) + Number(s.final_amount));
      });

      const salesByPayment = new Map<string, number>();
      filteredSales.forEach((s) => {
        salesByPayment.set(s.payment_method, (salesByPayment.get(s.payment_method) ?? 0) + Number(s.final_amount));
      });

      const totalDiscounts = filteredSales.reduce((sum, s) => sum + Number(s.discount_amount), 0);

      return {
        sales: filteredSales,
        items: items as SaleItem[],
        salesByDay: Array.from(salesByDay.entries()).map(([date, value]) => ({ date, value })),
        salesByPayment: Array.from(salesByPayment.entries()).map(([method, value]) => ({ method, value })),
        totalDiscounts
      };
    }
  });
}

export function useProductPerformance(range: DateRange) {
  return useQuery({
    queryKey: ["product-performance", range],
    staleTime: 1000 * 30,
    queryFn: async () => {
      const supabase = createClient();
      const { data: sales = [] } = await supabase.from("sales").select("id, created_at");
      const { data: items = [] } = await supabase.from("sale_items").select("*");
      const { data: products = [] } = await supabase.from("products").select("*");
      const { data: categories = [] } = await supabase.from("categories").select("*");

      const saleIds = new Set(
        (sales as Sale[]).filter((s) => inRange(s.created_at.slice(0, 10), range)).map((s) => s.id)
      );

      const performance = new Map<string, { units: number; revenue: number }>();
      (items as SaleItem[]).forEach((item) => {
        if (!saleIds.has(item.sale_id)) return;
        const current = performance.get(item.product_id) ?? { units: 0, revenue: 0 };
        current.units += item.quantity;
        current.revenue += Number(item.subtotal);
        performance.set(item.product_id, current);
      });

      const productMap = new Map((products as Product[]).map((p) => [p.id, p]));
      const categoryMap = new Map((categories as Category[]).map((c) => [c.id, c]));

      const rows = Array.from(performance.entries()).map(([productId, data]) => {
        const product = productMap.get(productId);
        const cogs = (product ? Number(product.cost_price) : 0) * data.units;
        const profit = data.revenue - cogs;
        const margin = data.revenue ? (profit / data.revenue) * 100 : 0;
        return {
          product: product?.name ?? "-",
          category: product?.category_id ? categoryMap.get(product.category_id)?.name ?? "-" : "-",
          units: data.units,
          revenue: data.revenue,
          cogs,
          profit,
          margin,
          current_stock: product?.current_stock ?? 0
        };
      });

      return rows;
    }
  });
}

export function useEmployeePerformance(range: DateRange) {
  return useQuery({
    queryKey: ["employee-performance", range],
    staleTime: 1000 * 30,
    queryFn: async () => {
      const supabase = createClient();
      const { data: sales = [] } = await supabase.from("sales").select("*");
      const { data: users = [] } = await supabase.from("users").select("*");

      const map = new Map<string, { revenue: number; count: number }>();
      (sales as Sale[]).forEach((sale) => {
        if (!inRange(sale.created_at.slice(0, 10), range)) return;
        if (!sale.sold_by) return;
        const current = map.get(sale.sold_by) ?? { revenue: 0, count: 0 };
        current.revenue += Number(sale.final_amount);
        current.count += 1;
        map.set(sale.sold_by, current);
      });

      const userMap = new Map((users as User[]).map((u) => [u.id, u.full_name ?? u.email]));

      return Array.from(map.entries()).map(([userId, data]) => ({
        user: userMap.get(userId) ?? userId,
        revenue: data.revenue,
        count: data.count,
        avg: data.count ? data.revenue / data.count : 0
      }));
    }
  });
}

export function useInventoryReport(range: DateRange) {
  return useQuery({
    queryKey: ["inventory-report", range],
    staleTime: 1000 * 30,
    queryFn: async () => {
      const supabase = createClient();
      const { data: movements = [] } = await supabase.from("inventory_movements").select("*");
      const filtered = movements.filter((m: any) => inRange(m.created_at.slice(0, 10), range));

      const added = filtered.filter((m: any) => m.quantity > 0).reduce((sum: number, m: any) => sum + m.quantity, 0);
      const removed = filtered.filter((m: any) => m.quantity < 0).reduce((sum: number, m: any) => sum + Math.abs(m.quantity), 0);

      return { added, removed, movements: filtered };
    }
  });
}

export function useFinancialSummary(range: DateRange) {
  return useQuery({
    queryKey: ["financial-summary", range],
    staleTime: 1000 * 30,
    queryFn: async () => {
      const supabase = createClient();
      const { data: sales = [] } = await supabase.from("sales").select("*");
      const { data: items = [] } = await supabase.from("sale_items").select("*");
      const { data: products = [] } = await supabase.from("products").select("*");

      const saleIds = new Set(
        (sales as Sale[]).filter((s) => inRange(s.created_at.slice(0, 10), range)).map((s) => s.id)
      );

      const productMap = new Map((products as Product[]).map((p) => [p.id, p]));

      let revenue = 0;
      let cogs = 0;

      (items as SaleItem[]).forEach((item) => {
        if (!saleIds.has(item.sale_id)) return;
        revenue += Number(item.subtotal);
        const product = productMap.get(item.product_id);
        cogs += (product ? Number(product.cost_price) : 0) * item.quantity;
      });

      const profit = revenue - cogs;
      const margin = revenue ? (profit / revenue) * 100 : 0;
      return { revenue, cogs, profit, margin };
    }
  });
}
