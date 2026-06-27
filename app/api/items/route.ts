import { NextRequest, NextResponse } from "next/server";
import { hasSupabase, supabaseInsert } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!hasSupabase) {
    return NextResponse.json(
      { error: "Supabase 환경변수가 없어 demo mode에서는 저장할 수 없습니다." },
      { status: 400 }
    );
  }

  const payload = await request.json();
  const itemPayload = {
    category_id: payload.category_id,
    brand: payload.brand,
    item_name: payload.item_name,
    display_name: payload.display_name || payload.item_name,
    capacity_kg: payload.capacity_kg ? Number(payload.capacity_kg) : null,
    price_tier: payload.price_tier || null,
    ata_price: payload.ata_price ? Number(payload.ata_price) : null,
    active: true
  };

  try {
    const [item] = await supabaseInsert<{ id: string }>("items", itemPayload);

    const targets = Array.isArray(payload.targets) ? payload.targets : [];
    if (targets.length) {
      await supabaseInsert(
        "item_channel_targets",
        targets.map((target: { channel_id: string; target_url?: string; search_keyword?: string }) => ({
          item_id: item.id,
          channel_id: target.channel_id,
          target_url: target.target_url || null,
          search_keyword: target.search_keyword || itemPayload.item_name,
          active: true
        }))
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
