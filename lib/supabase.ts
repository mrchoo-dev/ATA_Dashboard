import { demoData } from "./demo-data";
import { makeRecommendations } from "./recommendations";
import type { DashboardData, Item, Snapshot } from "./types";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabase = Boolean(supabaseUrl && serviceRoleKey);

type QueryValue = string | number | boolean;

function headers(extra?: HeadersInit): HeadersInit {
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
  return {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    "content-type": "application/json",
    ...extra
  };
}

export async function supabaseGet<T>(table: string, query: Record<string, QueryValue> = {}): Promise<T[]> {
  if (!supabaseUrl) throw new Error("SUPABASE_URL is missing");
  const params = new URLSearchParams();
  params.set("select", "*");
  Object.entries(query).forEach(([key, value]) => params.set(key, String(value)));
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${params.toString()}`, {
    headers: headers(),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function supabaseInsert<T>(table: string, payload: unknown): Promise<T[]> {
  if (!supabaseUrl) throw new Error("SUPABASE_URL is missing");
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: headers({ prefer: "return=representation" }),
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!hasSupabase) return demoData;

  const [categories, channels, items, targets, snapshots] = await Promise.all([
    supabaseGet("categories", { order: "sort_order.asc" }),
    supabaseGet("channels", { active: "eq.true", order: "sort_order.asc" }),
    supabaseGet("items", { active: "eq.true", order: "brand.asc" }),
    supabaseGet("item_channel_targets", { active: "eq.true" }),
    supabaseGet("price_snapshots", { order: "captured_at.desc", limit: 500 })
  ]);

  const itemRows = items as Item[];
  return {
    source: "supabase",
    categories: categories as DashboardData["categories"],
    channels: channels as DashboardData["channels"],
    items: itemRows,
    targets: targets as DashboardData["targets"],
    snapshots: snapshots as Snapshot[],
    recommendations: makeRecommendations(itemRows)
  };
}
