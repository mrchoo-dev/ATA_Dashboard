import type { DashboardData } from "./types";

const now = new Date();
const iso = (daysAgo: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const demoData: DashboardData = {
  source: "demo",
  categories: [
    {
      id: "cat-washcombo",
      name: "워시콤보",
      description: "LG/삼성 대표 콤보 모델 채널별 ATA 비교",
      sort_order: 1
    }
  ],
  channels: [
    { id: "ch-coupang", code: "coupang", name: "쿠팡", sort_order: 1, active: true },
    { id: "ch-gmarket", code: "gmarket", name: "G마켓", sort_order: 2, active: true },
    { id: "ch-himart", code: "himart", name: "하이마트", sort_order: 3, active: true }
  ],
  items: [
    {
      id: "item-lg-premium",
      category_id: "cat-washcombo",
      brand: "LG",
      item_name: "WL21...",
      display_name: "LG 워시콤보 대표",
      capacity_kg: 25,
      price_tier: "premium",
      ata_price: 2780000,
      active: true
    },
    {
      id: "item-ss-premium",
      category_id: "cat-washcombo",
      brand: "삼성",
      item_name: "WD25...",
      display_name: "삼성 워시콤보 대표",
      capacity_kg: 25,
      price_tier: "premium",
      ata_price: 2190000,
      active: true
    }
  ],
  targets: [
    {
      id: "target-lg-coupang",
      item_id: "item-lg-premium",
      channel_id: "ch-coupang",
      target_url: null,
      search_keyword: "LG 워시콤보 WL21",
      active: true
    },
    {
      id: "target-ss-coupang",
      item_id: "item-ss-premium",
      channel_id: "ch-coupang",
      target_url: null,
      search_keyword: "삼성 워시콤보 WD25",
      active: true
    }
  ],
  snapshots: [
    {
      id: "snap-1",
      item_id: "item-lg-premium",
      channel_id: "ch-coupang",
      captured_at: iso(2),
      observed_price: 2830000,
      observed_title: "LG 워시콤보 대표 샘플",
      observed_url: null,
      screenshot_url: null,
      status: "demo",
      error: null
    },
    {
      id: "snap-2",
      item_id: "item-lg-premium",
      channel_id: "ch-coupang",
      captured_at: iso(1),
      observed_price: 2765000,
      observed_title: "LG 워시콤보 대표 샘플",
      observed_url: null,
      screenshot_url: null,
      status: "demo",
      error: null
    },
    {
      id: "snap-3",
      item_id: "item-ss-premium",
      channel_id: "ch-coupang",
      captured_at: iso(2),
      observed_price: 2210000,
      observed_title: "삼성 워시콤보 대표 샘플",
      observed_url: null,
      screenshot_url: null,
      status: "demo",
      error: null
    },
    {
      id: "snap-4",
      item_id: "item-ss-premium",
      channel_id: "ch-coupang",
      captured_at: iso(1),
      observed_price: 2160000,
      observed_title: "삼성 워시콤보 대표 샘플",
      observed_url: null,
      screenshot_url: null,
      status: "demo",
      error: null
    }
  ],
  recommendations: [
    {
      id: "rec-1",
      category: "워시콤보",
      lg_item_name: "WL21...",
      samsung_item_name: "WD25...",
      reason: "동일 카테고리, 유사 용량, 프리미엄 가격대로 대표모델 비교군에 적합",
      confidence: 82
    }
  ]
};
