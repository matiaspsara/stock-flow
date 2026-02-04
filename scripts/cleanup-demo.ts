import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables. Check .env.local");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function run() {
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id")
    .eq("name", "Librería Papelito");

  const orgIds = orgs?.map((o) => o.id) ?? [];

  if (orgIds.length > 0) {
    await supabase.from("notifications").delete().in("organization_id", orgIds);
    await supabase.from("inventory_movements").delete().in("organization_id", orgIds);
    await supabase.from("sale_items").delete().in("sale_id", (await supabase.from("sales").select("id").in("organization_id", orgIds)).data?.map((s) => s.id) ?? []);
    await supabase.from("sales").delete().in("organization_id", orgIds);
    await supabase.from("purchase_items").delete().in("purchase_id", (await supabase.from("purchases").select("id").in("organization_id", orgIds)).data?.map((p) => p.id) ?? []);
    await supabase.from("purchases").delete().in("organization_id", orgIds);
    await supabase.from("suppliers").delete().in("organization_id", orgIds);
    await supabase.from("products").delete().in("organization_id", orgIds);
    await supabase.from("categories").delete().in("organization_id", orgIds);
    await supabase.from("organization_settings").delete().in("organization_id", orgIds);
    await supabase.from("user_roles").delete().in("organization_id", orgIds);
    await supabase.from("users").delete().in("organization_id", orgIds);
    await supabase.from("organizations").delete().in("id", orgIds);
  }

  const demoEmails = ["owner@demo.com", "manager@demo.com", "employee@demo.com"];
  for (const email of demoEmails) {
    const { data: users } = await supabase.auth.admin.listUsers({ perPage: 200 });
    const match = users.users.find((u) => u.email === email);
    if (match) {
      await supabase.auth.admin.deleteUser(match.id);
    }
  }

  console.log("Cleanup completed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
