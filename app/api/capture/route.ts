import { NextRequest, NextResponse } from "next/server";
import { captureTarget } from "@/lib/capture";
import { hasSupabase, supabaseGet, supabaseInsert } from "@/lib/supabase";
import type { Channel, Item, Target } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const userAgent = request.headers.get("user-agent") ?? "";
  const isVercelCron = userAgent.includes("vercel-cron");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET && !isVercelCron) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!hasSupabase) {
    return NextResponse.json({ error: "Supabase 환경변수가 필요합니다." }, { status: 400 });
  }

  const [items, channels, targets] = await Promise.all([
    supabaseGet<Item>("items", { active: "eq.true" }),
    supabaseGet<Channel>("channels", { active: "eq.true" }),
    supabaseGet<Target>("item_channel_targets", { active: "eq.true" })
  ]);
  const itemById = new Map(items.map((item) => [item.id, item]));
  const channelById = new Map(channels.map((channel) => [channel.id, channel]));

  const snapshots = [];
  for (const target of targets) {
    const item = itemById.get(target.item_id);
    const channel = channelById.get(target.channel_id);
    if (!item || !channel) continue;
    snapshots.push(await captureTarget(item, channel, target));
  }

  if (snapshots.length) {
    await supabaseInsert("price_snapshots", snapshots);
  }

  return NextResponse.json({ captured: snapshots.length, snapshots });
}
