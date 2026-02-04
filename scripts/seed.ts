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

const DEMO_ORG_NAME = "Librería Papelito";
const SHOULD_RESET = process.env.SEED_RESET !== "false";

const demoUsers = [
  {
    email: "owner@demo.com",
    password: "demo1234",
    fullName: "María González",
    role: "owner",
    phone: "+54 11 4123-4567",
    timezone: "America/Argentina/Buenos_Aires",
    language: "es"
  },
  {
    email: "manager@demo.com",
    password: "demo1234",
    fullName: "Carlos Ruiz",
    role: "manager",
    phone: "+54 11 4555-9080",
    timezone: "America/Argentina/Buenos_Aires",
    language: "es"
  },
  {
    email: "employee@demo.com",
    password: "demo1234",
    fullName: "Ana López",
    role: "employee",
    phone: null,
    timezone: "America/Argentina/Buenos_Aires",
    language: "es"
  }
];

const categories = [
  { name: "Útiles Escolares", color: "#3B82F6" },
  { name: "Librería", color: "#10B981" },
  { name: "Arte y Manualidades", color: "#F59E0B" },
  { name: "Oficina", color: "#6366F1" },
  { name: "Tecnología", color: "#EF4444" },
  { name: "Papelería", color: "#14B8A6" }
];

const productImages = [
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1501159599894-155982264a55?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1500336624523-d727130c3328?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1481887328591-3e2773c8a4d2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1498079022511-d15614cb1c02?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?auto=format&fit=crop&w=800&q=80"
];

const products = [
  { name: "Cuaderno Gloria Tapa Dura x48", sku: "CUA-001", price: 1800, cost: 1100, category: "Útiles Escolares", unit: "unidad" },
  { name: "Cuaderno Gloria Tapa Blanda x84", sku: "CUA-002", price: 2400, cost: 1500, category: "Útiles Escolares", unit: "unidad" },
  { name: "Cuaderno Rivadavia x84", sku: "CUA-003", price: 2600, cost: 1700, category: "Útiles Escolares", unit: "unidad" },
  { name: "Carpeta Rivadavia A4", sku: "CAR-001", price: 5200, cost: 3400, category: "Útiles Escolares", unit: "unidad" },
  { name: "Carpeta 3 anillos A4", sku: "CAR-002", price: 5600, cost: 3600, category: "Útiles Escolares", unit: "unidad" },
  { name: "Resma Author A4 75g", sku: "PAP-001", price: 9200, cost: 6300, category: "Papelería", unit: "unidad" },
  { name: "Resma Autor A4 80g", sku: "PAP-002", price: 9900, cost: 6900, category: "Papelería", unit: "unidad" },
  { name: "Lapicera BIC Cristal Azul", sku: "LAP-001", price: 450, cost: 220, category: "Útiles Escolares", unit: "unidad" },
  { name: "Lapicera BIC Cristal Negra", sku: "LAP-002", price: 450, cost: 220, category: "Útiles Escolares", unit: "unidad" },
  { name: "Lápiz Negro Faber", sku: "LAP-003", price: 350, cost: 160, category: "Útiles Escolares", unit: "unidad" },
  { name: "Goma Milán", sku: "GOM-001", price: 500, cost: 220, category: "Útiles Escolares", unit: "unidad" },
  { name: "Sacapuntas Doble", sku: "SAC-001", price: 900, cost: 430, category: "Útiles Escolares", unit: "unidad" },
  { name: "Regla 30cm Transparente", sku: "REG-001", price: 700, cost: 350, category: "Útiles Escolares", unit: "unidad" },
  { name: "Escuadra 30cm", sku: "REG-002", price: 1200, cost: 700, category: "Útiles Escolares", unit: "unidad" },
  { name: "Compás Escolar Metálico", sku: "COM-001", price: 4200, cost: 2600, category: "Útiles Escolares", unit: "unidad" },
  { name: "Cartuchera Doble Cierre", sku: "CAR-003", price: 6800, cost: 4300, category: "Útiles Escolares", unit: "unidad" },
  { name: "Mochila Escolar Samsonite", sku: "MOCH-001", price: 32000, cost: 23500, category: "Útiles Escolares", unit: "unidad" },
  { name: "Mochila Escolar Básica", sku: "MOCH-002", price: 18000, cost: 12000, category: "Útiles Escolares", unit: "unidad" },
  { name: "Calculadora Casio FX-82", sku: "TEC-001", price: 17500, cost: 12000, category: "Tecnología", unit: "unidad" },
  { name: "Calculadora Casio MX-570", sku: "TEC-002", price: 23000, cost: 16000, category: "Tecnología", unit: "unidad" },
  { name: "Memoria USB 32GB", sku: "TEC-003", price: 14500, cost: 9800, category: "Tecnología", unit: "unidad" },
  { name: "Mouse Inalámbrico", sku: "TEC-004", price: 19500, cost: 13500, category: "Tecnología", unit: "unidad" },
  { name: "Resaltador Stabilo Boss", sku: "ART-001", price: 1800, cost: 1100, category: "Arte y Manualidades", unit: "unidad" },
  { name: "Set Témperas Ezco x12", sku: "ART-002", price: 3200, cost: 1900, category: "Arte y Manualidades", unit: "unidad" },
  { name: "Acuarelas Pelikan x12", sku: "ART-003", price: 5600, cost: 3600, category: "Arte y Manualidades", unit: "unidad" },
  { name: "Marcadores Sharpie x4", sku: "ART-004", price: 5200, cost: 3400, category: "Arte y Manualidades", unit: "unidad" },
  { name: "Block de dibujo A4 x20", sku: "ART-005", price: 2400, cost: 1500, category: "Arte y Manualidades", unit: "unidad" },
  { name: "Pegamento Voligoma 30g", sku: "PEG-001", price: 1200, cost: 700, category: "Papelería", unit: "unidad" },
  { name: "Tijera Escolar Punta Redonda", sku: "TIJ-001", price: 2100, cost: 1300, category: "Útiles Escolares", unit: "unidad" },
  { name: "Post-it 76x76", sku: "PAP-003", price: 2800, cost: 1900, category: "Papelería", unit: "unidad" },
  { name: "Clips N°3 x100", sku: "OFI-001", price: 900, cost: 450, category: "Oficina", unit: "unidad" },
  { name: "Abrochadora Metálica", sku: "OFI-002", price: 7300, cost: 4800, category: "Oficina", unit: "unidad" },
  { name: "Grapas 26/6 x1000", sku: "OFI-003", price: 1300, cost: 800, category: "Oficina", unit: "unidad" },
  { name: "Agenda 2026 Diaria", sku: "LIB-001", price: 9800, cost: 6200, category: "Librería", unit: "unidad" },
  { name: "Libro de Actas", sku: "LIB-002", price: 12500, cost: 8200, category: "Librería", unit: "unidad" },
  { name: "Cartulina A3 x10", sku: "PAP-004", price: 2100, cost: 1400, category: "Papelería", unit: "unidad" },
  { name: "Set de Reglas Flexibles", sku: "REG-003", price: 1600, cost: 900, category: "Útiles Escolares", unit: "unidad" },
  { name: "Corrector Líquido", sku: "PAP-005", price: 1300, cost: 700, category: "Papelería", unit: "unidad" },
  { name: "Cinta Adhesiva 48mm", sku: "PAP-006", price: 1800, cost: 1000, category: "Papelería", unit: "unidad" }
];

const suppliersSeed = [
  { name: "Distribuidora San Martín", contact: "Lucas Medina", email: "ventas@distsanmartin.com", phone: "+54 11 4333 1200", tax_id: "30-98765432-1", address: "Av. San Martín 450, CABA" },
  { name: "Artículos Escolares López", contact: "Andrea López", email: "info@escolareslopez.com", phone: "+54 11 4455 7788", tax_id: "30-11223344-5", address: "Av. Rivadavia 3320, CABA" },
  { name: "Papelera del Centro", contact: "Martín Gómez", email: "ventas@papeleracentro.com", phone: "+54 11 4233 9900", tax_id: "30-55667788-9", address: "Lavalle 950, CABA" },
  { name: "TecnoOffice Argentina", contact: "Sofía Ríos", email: "contacto@tecnooffice.com", phone: "+54 11 4777 3300", tax_id: "30-22334455-6", address: "Córdoba 1200, CABA" }
];

const saleSizeWeights = [
  { label: "small", weight: 0.4, minItems: 1, maxItems: 2 },
  { label: "medium", weight: 0.35, minItems: 3, maxItems: 5 },
  { label: "large", weight: 0.2, minItems: 6, maxItems: 10 },
  { label: "xl", weight: 0.05, minItems: 11, maxItems: 15 }
];

const paymentWeights = [
  { value: "cash", weight: 0.35 },
  { value: "card", weight: 0.30 },
  { value: "card", weight: 0.20 },
  { value: "transfer", weight: 0.10 },
  { value: "credit", weight: 0.05 }
];

function pickWeighted<T extends { weight: number }>(items: T[]) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  const roll = Math.random() * total;
  let acc = 0;
  for (const item of items) {
    acc += item.weight;
    if (roll <= acc) return item;
  }
  return items[items.length - 1];
}

function shuffle<T>(items: T[]) {
  return items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSaleDate() {
  const now = new Date();
  const daysBack = randomBetween(0, 89);
  const date = new Date(now);
  date.setDate(now.getDate() - daysBack);

  const day = date.getDay();
  const weekdayWeight = day === 0 ? 0.4 : day === 6 ? 0.7 : 1;
  if (Math.random() > weekdayWeight) {
    date.setDate(date.getDate() + 1);
  }

  const hourBands = [
    { start: 9, end: 12, weight: 0.5 },
    { start: 13, end: 18, weight: 0.35 },
    { start: 19, end: 21, weight: 0.15 }
  ];
  const band = pickWeighted(hourBands);
  const hour = randomBetween(band.start, band.end);
  const minute = randomBetween(0, 59);

  date.setHours(hour, minute, randomBetween(0, 59), 0);
  return date;
}

async function cleanupOrganization(orgId: string) {
  console.log("Cleaning demo data for organization...");
  const { data: sales = [] } = await supabase.from("sales").select("id").eq("organization_id", orgId);
  const saleIds = sales.map((s) => s.id);
  if (saleIds.length) {
    await supabase.from("sale_items").delete().in("sale_id", saleIds);
  }

  const { data: purchases = [] } = await supabase.from("purchases").select("id").eq("organization_id", orgId);
  const purchaseIds = purchases.map((p) => p.id);
  if (purchaseIds.length) {
    await supabase.from("purchase_items").delete().in("purchase_id", purchaseIds);
  }

  await supabase.from("notifications").delete().eq("organization_id", orgId);
  await supabase.from("inventory_movements").delete().eq("organization_id", orgId);
  await supabase.from("sales").delete().eq("organization_id", orgId);
  await supabase.from("purchases").delete().eq("organization_id", orgId);
  await supabase.from("products").delete().eq("organization_id", orgId);
  await supabase.from("categories").delete().eq("organization_id", orgId);
  await supabase.from("suppliers").delete().eq("organization_id", orgId);
  await supabase.from("organization_settings").delete().eq("organization_id", orgId);
  await supabase.from("user_roles").delete().eq("organization_id", orgId);
  await supabase.from("users").delete().eq("organization_id", orgId);
  await supabase.from("organizations").delete().eq("id", orgId);
}

async function run() {
  console.log(`Seed reset is ${SHOULD_RESET ? "enabled" : "disabled"}.`);
  const orgId = randomUUID();

  const createdUsers = [] as { id: string; role: string; email: string; fullName: string; phone?: string | null; timezone?: string | null; language?: string | null }[];

  const { data: allUsers } = await supabase.auth.admin.listUsers();

  for (const user of demoUsers) {
    const existingUser = allUsers?.users.find((u) => u.email === user.email);

    if (existingUser) {
      console.log(`User ${user.email} already exists, reusing...`);
      createdUsers.push({
        id: existingUser.id,
        role: user.role,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        timezone: user.timezone,
        language: user.language
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
        fullName: user.fullName,
        phone: user.phone,
        timezone: user.timezone,
        language: user.language
      });
    }
  }

  const owner = createdUsers.find((user) => user.role === "owner");
  if (!owner) throw new Error("Owner user not created");

  const { data: existingOrg } = await supabase
    .from("organizations")
    .select("id")
    .eq("name", DEMO_ORG_NAME)
    .eq("owner_id", owner.id)
    .single();

  let finalOrgId = orgId;
  if (existingOrg) {
    if (SHOULD_RESET) {
      await cleanupOrganization(existingOrg.id);
    } else {
      finalOrgId = existingOrg.id;
      console.log("Organization already exists, reuse enabled. Skipping seed.");
      return;
    }
  }

  const { error: orgError } = await supabase.from("organizations").insert({
    id: finalOrgId,
    name: DEMO_ORG_NAME,
    address: "Av. Corrientes 1234, Buenos Aires",
    tax_id: "20-12345678-9",
    phone: "+54 11 4000 0000",
    email: "contacto@papelito.com",
    owner_id: owner.id,
    currency: "ARS",
    timezone: "America/Argentina/Buenos_Aires"
  });

  if (orgError) throw new Error(orgError.message);

  const { error: usersError } = await supabase.from("users").insert(
    createdUsers.map((user) => ({
      id: user.id,
      organization_id: finalOrgId,
      email: user.email,
      full_name: user.fullName,
      phone: user.phone ?? null,
      timezone: user.timezone ?? null,
      language: user.language ?? null
    }))
  );

  if (usersError) throw new Error(usersError.message);

  const { error: rolesError } = await supabase.from("user_roles").insert(
    createdUsers.map((user) => ({
      organization_id: finalOrgId,
      user_id: user.id,
      role: user.role
    }))
  );

  if (rolesError) throw new Error(rolesError.message);

  const { error: settingsError } = await supabase.from("organization_settings").insert({
    organization_id: finalOrgId,
    store_name: DEMO_ORG_NAME,
    store_address: "Av. Corrientes 1234, Buenos Aires",
    tax_id: "20-12345678-9",
    phone: "+54 11 4000 0000",
    email: "contacto@papelito.com",
    receipt_header: "Gracias por tu compra",
    receipt_footer: "Cambios dentro de los 30 días",
    default_tax_rate: 21,
    currency: "ARS",
    timezone: "America/Argentina/Buenos_Aires",
    auto_show_receipt_modal: true,
    auto_print_receipt: false
  });

  if (settingsError) throw new Error(settingsError.message);

  const { data: categoryRows, error: categoryError } = await supabase
    .from("categories")
    .insert(categories.map((category) => ({ ...category, organization_id: finalOrgId })))
    .select();

  if (categoryError || !categoryRows) throw new Error(categoryError?.message);

  const categoryByName = new Map(categoryRows.map((row) => [row.name, row.id]));

  const productRowsPayload = products.map((product, index) => ({
    organization_id: finalOrgId,
    name: product.name,
    sku: product.sku,
    barcode: `779000${index.toString().padStart(6, "0")}`,
    category_id: categoryByName.get(product.category),
    cost_price: product.cost,
    selling_price: product.price,
    current_stock: 0,
    min_stock_threshold: 5,
    unit: product.unit,
    image_url: index % 2 === 0 ? productImages[index % productImages.length] : null,
    created_by: owner.id
  }));

  const { data: productRows, error: productError } = await supabase
    .from("products")
    .insert(productRowsPayload)
    .select();

  if (productError || !productRows) throw new Error(productError?.message);

  const { data: supplierRows, error: supplierError } = await supabase
    .from("suppliers")
    .insert(
      suppliersSeed.map((supplier) => ({
        organization_id: finalOrgId,
        name: supplier.name,
        contact_person: supplier.contact,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        tax_id: supplier.tax_id,
        notes: "Entrega semanal"
      }))
    )
    .select();

  if (supplierError || !supplierRows) throw new Error(supplierError?.message);

  const productsShuffled = shuffle(productRows);
  const outCount = Math.max(1, Math.round(productRows.length * 0.15));
  const lowCount = Math.max(2, Math.round(productRows.length * 0.25));

  const outOfStockSet = new Set(productsShuffled.slice(0, outCount).map((p) => p.id));
  const lowStockSet = new Set(productsShuffled.slice(outCount, outCount + lowCount).map((p) => p.id));

  const targetStock = new Map<string, number>();
  const initialStock = new Map<string, number>();
  const salesNeeded = new Map<string, number>();

  productRows.forEach((product) => {
    if (outOfStockSet.has(product.id)) {
      targetStock.set(product.id, 0);
      const initial = randomBetween(12, 40);
      initialStock.set(product.id, initial);
      salesNeeded.set(product.id, initial);
    } else if (lowStockSet.has(product.id)) {
      const target = randomBetween(1, 5);
      const initial = target + randomBetween(6, 18);
      targetStock.set(product.id, target);
      initialStock.set(product.id, initial);
      salesNeeded.set(product.id, initial - target);
    } else {
      const target = randomBetween(8, 30);
      const initial = target + randomBetween(5, 25);
      targetStock.set(product.id, target);
      initialStock.set(product.id, initial);
      salesNeeded.set(product.id, initial - target);
    }
  });

  const purchaseCount = randomBetween(12, 15);
  const remainingToAllocate = new Map<string, number>(initialStock);
  const purchasesCreated: { id: string; total: number; created_at: string }[] = [];

  for (let i = 0; i < purchaseCount; i += 1) {
    const supplier = pickWeighted([
      { ...supplierRows[0], weight: 0.4 },
      { ...supplierRows[1], weight: 0.25 },
      { ...supplierRows[2], weight: 0.2 },
      { ...supplierRows[3], weight: 0.15 }
    ] as any);

    const date = new Date();
    date.setDate(date.getDate() - randomBetween(0, 59));
    if (date.getMonth() === 0 && date.getDate() > 15) {
      date.setDate(date.getDate() - randomBetween(0, 10));
    }

    const { data: purchaseRows, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        organization_id: finalOrgId,
        supplier_id: supplier.id,
        total_amount: 0,
        payment_status: pickWeighted([
          { value: "paid", weight: 0.5 },
          { value: "pending", weight: 0.3 },
          { value: "partial", weight: 0.2 }
        ] as any).value,
        invoice_number: `FAC-${date.getFullYear()}-${randomBetween(1000, 9999)}`,
        received_date: date.toISOString().slice(0, 10),
        created_by: owner.id,
        created_at: date.toISOString()
      })
      .select();

    if (purchaseError || !purchaseRows?.[0]) throw new Error(purchaseError?.message);

    const purchaseId = purchaseRows[0].id;
    const itemsCount = randomBetween(6, 12);
    const availableProducts = productRows.filter((p) => (remainingToAllocate.get(p.id) ?? 0) > 0);
    if (!availableProducts.length) break;

    const purchaseItems: any[] = [];
    const selectedProducts = shuffle(availableProducts).slice(0, Math.min(itemsCount, availableProducts.length));

    selectedProducts.forEach((product) => {
      const remaining = remainingToAllocate.get(product.id) ?? 0;
      if (remaining <= 0) return;
      const quantity = Math.min(remaining, randomBetween(5, 25));
      remainingToAllocate.set(product.id, remaining - quantity);
      purchaseItems.push({
        purchase_id: purchaseId,
        product_id: product.id,
        quantity,
        unit_cost: product.cost_price,
        subtotal: quantity * Number(product.cost_price)
      });
    });

    if (!purchaseItems.length) continue;

    const total = purchaseItems.reduce((sum, item) => sum + item.subtotal, 0);

    await supabase.from("purchase_items").insert(purchaseItems);
    await supabase.from("purchases").update({ total_amount: total }).eq("id", purchaseId);

    purchasesCreated.push({ id: purchaseId, total, created_at: date.toISOString() });
  }

  const remainingItems = Array.from(remainingToAllocate.entries()).filter(([, value]) => value > 0);
  if (remainingItems.length) {
    const supplier = supplierRows[0];
    const date = new Date();
    date.setDate(date.getDate() - randomBetween(0, 10));
    const { data: purchaseRows, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        organization_id: finalOrgId,
        supplier_id: supplier.id,
        total_amount: 0,
        payment_status: "paid",
        invoice_number: `FAC-${date.getFullYear()}-${randomBetween(1000, 9999)}`,
        received_date: date.toISOString().slice(0, 10),
        created_by: owner.id,
        created_at: date.toISOString()
      })
      .select();

    if (purchaseError || !purchaseRows?.[0]) throw new Error(purchaseError?.message);

    const purchaseId = purchaseRows[0].id;
    const purchaseItems = remainingItems.map(([productId, quantity]) => {
      const product = productRows.find((p) => p.id === productId)!;
      return {
        purchase_id: purchaseId,
        product_id: productId,
        quantity,
        unit_cost: product.cost_price,
        subtotal: quantity * Number(product.cost_price)
      };
    });

    const total = purchaseItems.reduce((sum, item) => sum + item.subtotal, 0);
    await supabase.from("purchase_items").insert(purchaseItems);
    await supabase.from("purchases").update({ total_amount: total }).eq("id", purchaseId);

    purchasesCreated.push({ id: purchaseId, total, created_at: date.toISOString() });
  }

  const { data: refreshedProducts = [] } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", finalOrgId);

  const remainingStockByProductId = new Map<string, number>(
    refreshedProducts.map((p) => [p.id, Number(p.current_stock ?? 0)])
  );

  const salesTargetCount = randomBetween(150, 200);
  const salesCreated: { id: string; total: number; created_at: string }[] = [];

  for (let i = 0; i < salesTargetCount; i += 1) {
    const availableProducts = refreshedProducts.filter((p) => (salesNeeded.get(p.id) ?? 0) > 0);
    if (!availableProducts.length) break;

    const size = pickWeighted(saleSizeWeights);
    const itemsInSale = randomBetween(size.minItems, size.maxItems);

    const saleItems: any[] = [];
    const usedProducts = new Set<string>();

    for (let j = 0; j < itemsInSale; j += 1) {
      const candidates = availableProducts.filter((p) => !usedProducts.has(p.id) && (salesNeeded.get(p.id) ?? 0) > 0);
      if (!candidates.length) break;

      const product = candidates[randomBetween(0, candidates.length - 1)];
      const remainingToSell = salesNeeded.get(product.id) ?? 0;
      const maxQuantity = Math.min(remainingToSell, 6);
      if (maxQuantity <= 0) continue;

      const quantity = randomBetween(1, Math.max(1, Math.min(maxQuantity, 3)));
      saleItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: Number(product.selling_price),
        subtotal: quantity * Number(product.selling_price)
      });

      usedProducts.add(product.id);
      salesNeeded.set(product.id, remainingToSell - quantity);
      remainingStockByProductId.set(product.id, (remainingStockByProductId.get(product.id) ?? 0) - quantity);
    }

    if (!saleItems.length) continue;

    const totalAmount = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
    const hasDiscount = Math.random() < 0.2;
    const discountRate = hasDiscount ? randomBetween(5, 15) / 100 : 0;
    const discountAmount = Math.round(totalAmount * discountRate);
    const finalAmount = totalAmount - discountAmount;

    const createdAt = generateSaleDate();
    const soldBy = pickWeighted([
      { value: createdUsers.find((u) => u.role === "owner")!, weight: 0.5 },
      { value: createdUsers.find((u) => u.role === "manager")!, weight: 0.35 },
      { value: createdUsers.find((u) => u.role === "employee")!, weight: 0.15 }
    ] as any).value;

    const paymentMethod = pickWeighted(paymentWeights).value;

    const customerName = paymentMethod === "credit" ? `Cliente ${randomBetween(1, 120)}` : null;
    const customerEmail = paymentMethod === "credit" ? `cliente${randomBetween(1, 120)}@mail.com` : null;
    const customerPhone = paymentMethod === "credit" ? `+54 11 4${randomBetween(100, 999)}-${randomBetween(1000, 9999)}` : null;

    const { data: saleRows, error: saleError } = await supabase
      .from("sales")
      .insert({
        organization_id: finalOrgId,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        payment_method: paymentMethod,
        payment_status: "paid",
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
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

    salesCreated.push({ id: saleId, total: finalAmount, created_at: createdAt.toISOString() });
  }

  const adjustmentsCount = randomBetween(8, 10);
  for (let i = 0; i < adjustmentsCount; i += 1) {
    const product = refreshedProducts[randomBetween(0, refreshedProducts.length - 1)];
    const currentStock = Math.max(0, remainingStockByProductId.get(product.id) ?? 0);
    const isIncrease = Math.random() > 0.5 || currentStock === 0;
    const quantity = randomBetween(1, 5);
    const newStock = isIncrease ? currentStock + quantity : Math.max(0, currentStock - quantity);
    remainingStockByProductId.set(product.id, newStock);

    await supabase
      .from("products")
      .update({ current_stock: newStock })
      .eq("id", product.id);

    await supabase.from("inventory_movements").insert({
      organization_id: finalOrgId,
      product_id: product.id,
      movement_type: "adjustment",
      quantity: isIncrease ? quantity : -quantity,
      previous_stock: currentStock,
      new_stock: newStock,
      notes: isIncrease ? "Inventario contado" : "Daño/merma",
      performed_by: owner.id
    });
  }

  const { data: finalProducts = [] } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", finalOrgId);

  const lowStockProducts = finalProducts.filter(
    (p: any) => p.current_stock > 0 && p.current_stock <= p.min_stock_threshold
  );
  const outOfStockProducts = finalProducts.filter((p: any) => p.current_stock === 0);

  const notifications: any[] = [];

  lowStockProducts.slice(0, 5).forEach((product: any) => {
    notifications.push({
      organization_id: finalOrgId,
      user_id: owner.id,
      type: "low_stock",
      title: `Stock bajo: ${product.name}`,
      message: `Quedan ${product.current_stock} unidades. Mínimo ${product.min_stock_threshold}.`,
      reference_id: product.id,
      is_read: Math.random() > 0.4
    });
  });

  outOfStockProducts.slice(0, 2).forEach((product: any) => {
    notifications.push({
      organization_id: finalOrgId,
      user_id: owner.id,
      type: "out_of_stock",
      title: `Sin stock: ${product.name}`,
      message: "Producto agotado. Considera reponer.",
      reference_id: product.id,
      is_read: Math.random() > 0.4
    });
  });

  salesCreated
    .filter((sale) => sale.total > 30000)
    .slice(0, 3)
    .forEach((sale) => {
      notifications.push({
        organization_id: finalOrgId,
        user_id: owner.id,
        type: "system",
        title: "Venta destacada",
        message: `Venta superior a $30.000 registrada.`,
        reference_id: sale.id,
        is_read: Math.random() > 0.4
      });
    });

  purchasesCreated.slice(0, 2).forEach((purchase) => {
    notifications.push({
      organization_id: finalOrgId,
      user_id: owner.id,
      type: "system",
      title: "Nueva compra registrada",
      message: `Compra registrada por ${purchase.total.toFixed(0)} ARS.`,
      reference_id: purchase.id,
      is_read: Math.random() > 0.4
    });
  });

  notifications.push({
    organization_id: finalOrgId,
    user_id: owner.id,
    type: "system",
    title: "Bienvenida",
    message: "¡Bienvenida a StockFlow! Este es un entorno de demostración.",
    is_read: false
  });

  if (notifications.length) {
    await supabase.from("notifications").insert(notifications);
  }

  console.log("Seed completed successfully");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
