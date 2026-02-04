import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";

// Load .env.local file
try {
  const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
  envFile.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
} catch (error) {
  console.warn("Could not load .env.local file:", error);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables. Check .env.local");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const demoUsers = [
  {
    email: "owner@demo.com",
    password: "demo1234",
    fullName: "María González",
    role: "owner"
  },
  {
    email: "manager@demo.com",
    password: "demo1234",
    fullName: "Carlos Ruiz",
    role: "manager"
  },
  {
    email: "employee@demo.com",
    password: "demo1234",
    fullName: "Ana López",
    role: "employee"
  }
];

const categories = [
  { name: "Útiles Escolares", color: "#3B82F6" },
  { name: "Librería", color: "#10B981" },
  { name: "Arte y Manualidades", color: "#F59E0B" },
  { name: "Oficina", color: "#6366F1" },
  { name: "Tecnología", color: "#EF4444" }
];

const products = [
  { name: "Cuaderno Gloria Tapa Dura x48 hojas", sku: "CUA-001", price: 1500, cost: 900 },
  { name: "Lapicera BIC Cristal Azul", sku: "LAP-001", price: 450, cost: 220 },
  { name: "Resma Papel A4 Author 75g x500 hojas", sku: "PAP-001", price: 8900, cost: 6000 },
  { name: "Set Temperas Ezco x12 colores", sku: "ART-001", price: 3200, cost: 1900 },
  { name: "Calculadora Casio FX-82", sku: "TEC-001", price: 15600, cost: 11000 },
  { name: "Mochila Escolar Samsonite", sku: "MOCH-001", price: 28000, cost: 21000 },
  { name: "Cartuchera Doble Cierre", sku: "CAR-001", price: 6500, cost: 4200 },
  { name: "Resaltador Stabilo Boss", sku: "RES-001", price: 1800, cost: 1100 },
  { name: "Regla 30cm Transparente", sku: "REG-001", price: 700, cost: 350 },
  { name: "Compás Escolar Metálico", sku: "COM-001", price: 4200, cost: 2600 },
  { name: "Carpeta 3 anillos A4", sku: "CAR-002", price: 5200, cost: 3400 },
  { name: "Block de dibujo A4 x20", sku: "ART-002", price: 2400, cost: 1500 },
  { name: "Marcadores Sharpie x4", sku: "ART-003", price: 4800, cost: 3000 },
  { name: "Pegamento Voligoma 30g", sku: "PEG-001", price: 1200, cost: 700 },
  { name: "Tijera Escolar Punta Redonda", sku: "TIJ-001", price: 2100, cost: 1300 },
  { name: "Agenda 2026 Diaria", sku: "AGE-001", price: 9800, cost: 6200 },
  { name: "Abrochadora Metalica", sku: "OFI-001", price: 7300, cost: 4800 },
  { name: "Grapas 26/6 x1000", sku: "OFI-002", price: 1300, cost: 800 },
  { name: "Memoria USB 32GB", sku: "TEC-002", price: 14000, cost: 9800 },
  { name: "Mouse Inalámbrico", sku: "TEC-003", price: 18500, cost: 12800 },
  { name: "Calculadora Científica MX-570", sku: "TEC-004", price: 21000, cost: 15000 },
  { name: "Lápiz Negro Faber", sku: "LAP-002", price: 350, cost: 160 },
  { name: "Goma Milán", sku: "GOM-001", price: 500, cost: 220 },
  { name: "Sacapuntas Doble", sku: "SAC-001", price: 900, cost: 430 },
  { name: "Cuaderno Rivadavia x84", sku: "CUA-002", price: 2200, cost: 1400 }
];

async function run() {
  const orgId = randomUUID();

  const createdUsers = [] as { id: string; role: string; email: string; fullName: string }[];

  for (const user of demoUsers) {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find((u) => u.email === user.email);

    if (existingUser) {
      console.log(`User ${user.email} already exists, reusing...`);
      createdUsers.push({
        id: existingUser.id,
        role: user.role,
        email: user.email,
        fullName: user.fullName
      });
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.fullName }
      });

      if (error || !data.user) {
        throw new Error(`Failed to create user ${user.email}: ${error?.message}`);
      }

      createdUsers.push({
        id: data.user.id,
        role: user.role,
        email: user.email,
        fullName: user.fullName
      });
    }
  }

  const owner = createdUsers.find((user) => user.role === "owner");
  if (!owner) throw new Error("Owner user not created");

  // Check if organization already exists
  const { data: existingOrg } = await supabase
    .from("organizations")
    .select("id")
    .eq("name", "Librería Papelito")
    .eq("owner_id", owner.id)
    .single();

  let finalOrgId = orgId;
  if (existingOrg) {
    console.log("Organization 'Librería Papelito' already exists, reusing...");
    finalOrgId = existingOrg.id;
  } else {
    const { error: orgError } = await supabase.from("organizations").insert({
      id: orgId,
      name: "Librería Papelito",
      address: "Av. Corrientes 1234, Buenos Aires",
      tax_id: "20-12345678-9",
      phone: "+54 11 4000 0000",
      email: "contacto@papelito.com",
      owner_id: owner.id,
      currency: "ARS",
      timezone: "America/Argentina/Buenos_Aires"
    });

    if (orgError) throw new Error(orgError.message);
  }

  // Check which users already exist in the users table
  const userIds = createdUsers.map((u) => u.id);
  const { data: existingUsersData } = await supabase
    .from("users")
    .select("id")
    .in("id", userIds);

  const existingUserIds = new Set(existingUsersData?.map((u) => u.id) || []);

  // Only insert users that don't already exist
  const usersToInsert = createdUsers.filter((user) => !existingUserIds.has(user.id));

  if (usersToInsert.length > 0) {
    const { error: usersError } = await supabase.from("users").insert(
      usersToInsert.map((user) => ({
        id: user.id,
        organization_id: finalOrgId,
        email: user.email,
        full_name: user.fullName
      }))
    );

    if (usersError) throw new Error(usersError.message);
  } else {
    console.log("All users already exist in users table, skipping insert...");
  }

  // Check which user roles already exist for this organization
  const { data: existingRolesData } = await supabase
    .from("user_roles")
    .select("user_id, organization_id")
    .in("user_id", userIds)
    .eq("organization_id", finalOrgId);

  const existingRoleKeys = new Set(
    existingRolesData?.map((r) => `${r.organization_id}-${r.user_id}`) || []
  );

  // Only insert roles that don't already exist
  const rolesToInsert = createdUsers.filter(
    (user) => !existingRoleKeys.has(`${finalOrgId}-${user.id}`)
  );

  if (rolesToInsert.length > 0) {
    const { error: rolesError } = await supabase.from("user_roles").insert(
      rolesToInsert.map((user) => ({
        organization_id: finalOrgId,
        user_id: user.id,
        role: user.role
      }))
    );

    if (rolesError) throw new Error(rolesError.message);
  } else {
    console.log("All user roles already exist, skipping insert...");
  }

  // Check if settings already exist
  const { data: existingSettings } = await supabase
    .from("organization_settings")
    .select("organization_id")
    .eq("organization_id", finalOrgId)
    .single();

  if (!existingSettings) {
    const { error: settingsError } = await supabase.from("organization_settings").insert({
      organization_id: finalOrgId,
      store_name: "Librería Papelito",
      store_address: "Av. Corrientes 1234, Buenos Aires",
      tax_id: "20-12345678-9",
      phone: "+54 11 4000 0000",
      email: "contacto@papelito.com",
      receipt_header: "Gracias por tu compra",
      receipt_footer: "Cambios dentro de los 30 días",
      default_tax_rate: 21,
      currency: "ARS",
      timezone: "America/Argentina/Buenos_Aires"
    });

    if (settingsError) throw new Error(settingsError.message);
  } else {
    console.log("Organization settings already exist, skipping insert...");
  }

  // Check if categories already exist
  const { data: existingCategories } = await supabase
    .from("categories")
    .select("*")
    .eq("organization_id", finalOrgId);

  let categoryRows;
  if (existingCategories && existingCategories.length > 0) {
    console.log("Categories already exist, reusing...");
    categoryRows = existingCategories;
  } else {
    const { data: newCategoryRows, error: categoryError } = await supabase
      .from("categories")
      .insert(categories.map((category) => ({ ...category, organization_id: finalOrgId })))
      .select();

    if (categoryError || !newCategoryRows) throw new Error(categoryError?.message);
    categoryRows = newCategoryRows;
  }

  const categoryByName = new Map(categoryRows.map((row) => [row.name, row.id]));

  // Check if products already exist
  const { data: existingProducts } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", finalOrgId);

  let productRows;
  if (existingProducts && existingProducts.length > 0) {
    console.log("Products already exist, reusing...");
    productRows = existingProducts;
  } else {
    const { data: newProductRows, error: productError } = await supabase
      .from("products")
      .insert(
        products.map((product, index) => ({
          organization_id: finalOrgId,
          name: product.name,
          sku: product.sku,
          barcode: `779000${index.toString().padStart(6, "0")}`,
          category_id:
            product.sku.startsWith("TEC")
              ? categoryByName.get("Tecnología")
              : product.sku.startsWith("ART")
              ? categoryByName.get("Arte y Manualidades")
              : product.sku.startsWith("OFI")
              ? categoryByName.get("Oficina")
              : categoryByName.get("Útiles Escolares"),
          cost_price: product.cost,
          selling_price: product.price,
          current_stock: 0,
          min_stock_threshold: 5,
          unit: "unit",
          image_url:
            index % 4 === 0
              ? `https://placehold.co/600x600/png?text=${encodeURIComponent(product.name)}`
              : null,
          created_by: owner.id
        }))
      )
      .select();

    if (productError || !newProductRows) throw new Error(productError?.message);
    productRows = newProductRows;
  }

  // Check if supplier already exists
  const { data: existingSuppliers } = await supabase
    .from("suppliers")
    .select("*")
    .eq("organization_id", finalOrgId)
    .eq("name", "Distribuidora Centro")
    .limit(1);

  let supplierRows;
  if (existingSuppliers && existingSuppliers.length > 0) {
    console.log("Supplier already exists, reusing...");
    supplierRows = existingSuppliers;
  } else {
    const { data: newSupplierRows, error: supplierError } = await supabase
      .from("suppliers")
      .insert([
        {
          organization_id: finalOrgId,
          name: "Distribuidora Centro",
          contact_person: "Luciano Pérez",
          email: "ventas@distcentro.com",
          phone: "+54 11 4333 2211",
          address: "Av. San Martín 450, CABA",
          tax_id: "30-98765432-1",
          notes: "Entrega semanal"
        }
      ])
      .select();

    if (supplierError || !newSupplierRows?.[0]) throw new Error(supplierError?.message);
    supplierRows = newSupplierRows;
  }

  // Check if products have stock - if not, create a purchase to add stock
  const { data: productsWithStock } = await supabase
    .from("products")
    .select("id, current_stock")
    .eq("organization_id", finalOrgId)
    .gt("current_stock", 0)
    .limit(1);

  // Only create purchase if products don't have stock
  if (!productsWithStock || productsWithStock.length === 0) {
    console.log("Products have no stock, creating purchase to add stock...");
    
    const { data: purchaseRows, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        organization_id: finalOrgId,
        supplier_id: supplierRows[0].id,
        total_amount: 0,
        payment_status: "paid",
        received_date: new Date().toISOString().slice(0, 10),
        created_by: owner.id
      })
      .select();

    if (purchaseError || !purchaseRows?.[0]) throw new Error(purchaseError?.message);

    const purchaseId = purchaseRows[0].id;

    const purchaseItems = productRows.map((product) => ({
      purchase_id: purchaseId,
      product_id: product.id,
      quantity: Math.floor(Math.random() * 20) + 10,
      unit_cost: product.cost_price,
      subtotal: 0
    }));

    purchaseItems.forEach((item) => {
      item.subtotal = item.quantity * Number(item.unit_cost);
    });

    const totalPurchase = purchaseItems.reduce((sum, item) => sum + item.subtotal, 0);

    const { error: purchaseUpdateError } = await supabase
      .from("purchases")
      .update({ total_amount: totalPurchase })
      .eq("id", purchaseId);

    if (purchaseUpdateError) throw new Error(purchaseUpdateError.message);

    const { error: purchaseItemsError } = await supabase.from("purchase_items").insert(purchaseItems);
    if (purchaseItemsError) throw new Error(purchaseItemsError.message);
    
    console.log("Purchase created and stock added successfully");
    
    // Refresh product data to get updated stock values
    const { data: refreshedProducts, error: refreshError } = await supabase
      .from("products")
      .select("*")
      .eq("organization_id", finalOrgId);
    
    if (refreshError) throw new Error(refreshError.message);
    if (refreshedProducts) {
      productRows = refreshedProducts;
      console.log("Product stock refreshed");
    }
  } else {
    console.log("Products already have stock, skipping purchase creation...");
  }

  // Verify products have stock before creating sales
  const { data: productsWithStockForSales } = await supabase
    .from("products")
    .select("id, name, current_stock")
    .eq("organization_id", finalOrgId)
    .gt("current_stock", 0);

  if (!productsWithStockForSales || productsWithStockForSales.length === 0) {
    console.log("No products with stock available. Skipping sales creation.");
    console.log("Seed completed successfully (without sales)");
    return;
  }

  console.log(`Creating sales for ${productsWithStockForSales.length} products with stock...`);

  // Track remaining stock in-memory so we never oversell across many sales.
  // This avoids relying on the initial `productRows` snapshot, which becomes stale as triggers update stock.
  const remainingStockByProductId = new Map<string, number>(
    productRows.map((p) => [p.id, Number(p.current_stock ?? 0)])
  );

  const salesCount = 110;
  for (let i = 0; i < salesCount; i += 1) {
    const itemsInSale = Math.floor(Math.random() * 5) + 1;
    const saleItems = [] as {
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }[];

    for (let j = 0; j < itemsInSale; j += 1) {
      // Only use products that still have remaining stock (according to our in-memory tracker)
      const availableProducts = productRows.filter(
        (p) => (remainingStockByProductId.get(p.id) ?? 0) > 0
      );
      if (availableProducts.length === 0) break; // No products with stock available

      const product = availableProducts[Math.floor(Math.random() * availableProducts.length)];

      const stockLeft = remainingStockByProductId.get(product.id) ?? 0;
      // Don't sell more than remaining stock
      const maxQuantity = Math.min(stockLeft, 3);
      if (maxQuantity <= 0) continue; // Skip this product if no stock

      const quantity = Math.floor(Math.random() * maxQuantity) + 1;
      saleItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: Number(product.selling_price),
        subtotal: quantity * Number(product.selling_price)
      });

      // Decrement remaining stock so subsequent sales don't oversell this product
      remainingStockByProductId.set(product.id, stockLeft - quantity);
    }
    
    // Skip this sale if no items could be added
    if (saleItems.length === 0) continue;

    const totalAmount = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = Math.random() > 0.85 ? Math.round(totalAmount * 0.1) : 0;
    const finalAmount = totalAmount - discountAmount;

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

    const soldBy = createdUsers[Math.floor(Math.random() * createdUsers.length)];

    const { data: saleRows, error: saleError } = await supabase
      .from("sales")
      .insert({
        organization_id: finalOrgId,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        payment_method: Math.random() > 0.6 ? "card" : "cash",
        payment_status: "paid",
        sold_by: soldBy.id,
        created_at: createdAt.toISOString()
      })
      .select();

    if (saleError || !saleRows?.[0]) throw new Error(saleError?.message);

    const saleId = saleRows[0].id;

    const { error: saleItemsError } = await supabase.from("sale_items").insert(
      saleItems.map((item) => ({
        sale_id: saleId,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal
      }))
    );

    if (saleItemsError) throw new Error(saleItemsError.message);
  }

  const lowStockIds = productRows.slice(0, 3).map((product) => product.id);
  const outOfStockIds = productRows.slice(3, 5).map((product) => product.id);

  if (lowStockIds.length > 0) {
    await supabase.from("products").update({ current_stock: 3 }).in("id", lowStockIds);
  }
  if (outOfStockIds.length > 0) {
    await supabase.from("products").update({ current_stock: 0 }).in("id", outOfStockIds);
  }

  console.log("Seed completed successfully");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
