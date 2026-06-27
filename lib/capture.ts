import type { Channel, Item, Snapshot, Target } from "./types";

const pricePattern = /(?<!\d)(\d{1,3}(?:,\d{3})+|\d{5,9})\s*원?/g;

export async function captureTarget(item: Item, channel: Channel, target: Target): Promise<Omit<Snapshot, "id">> {
  const url = target.target_url;
  if (!url) {
    return demoSnapshot(item.id, channel.id, "URL 미등록");
  }

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
      },
      cache: "no-store"
    });
    const html = await response.text();
    const prices = extractPrices(html);
    return {
      item_id: item.id,
      channel_id: channel.id,
      captured_at: new Date().toISOString(),
      observed_price: prices.length ? Math.min(...prices) : null,
      observed_title: `${channel.name} ${item.item_name}`,
      observed_url: url,
      screenshot_url: null,
      status: prices.length ? "ok" : "no_price",
      error: prices.length ? null : "가격 후보를 찾지 못했습니다."
    };
  } catch (error) {
    return {
      item_id: item.id,
      channel_id: channel.id,
      captured_at: new Date().toISOString(),
      observed_price: null,
      observed_title: `${channel.name} ${item.item_name}`,
      observed_url: url,
      screenshot_url: null,
      status: "error",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function extractPrices(text: string) {
  const prices: number[] = [];
  for (const match of text.matchAll(pricePattern)) {
    const value = Number(match[1].replaceAll(",", ""));
    if (value >= 10_000 && value <= 20_000_000) prices.push(value);
  }
  return prices;
}

function demoSnapshot(itemId: string, channelId: string, error: string): Omit<Snapshot, "id"> {
  return {
    item_id: itemId,
    channel_id: channelId,
    captured_at: new Date().toISOString(),
    observed_price: null,
    observed_title: null,
    observed_url: null,
    screenshot_url: null,
    status: "pending",
    error
  };
}
