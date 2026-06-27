export type Brand = "LG" | "삼성";

export type ChannelCode = "coupang" | "gmarket" | "himart" | "naver" | "danawa";

export type Category = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
};

export type Channel = {
  id: string;
  code: ChannelCode;
  name: string;
  sort_order: number;
  active: boolean;
};

export type Item = {
  id: string;
  category_id: string;
  brand: Brand;
  item_name: string;
  display_name: string;
  capacity_kg: number | null;
  price_tier: string | null;
  ata_price: number | null;
  active: boolean;
};

export type Target = {
  id: string;
  item_id: string;
  channel_id: string;
  target_url: string | null;
  search_keyword: string | null;
  active: boolean;
};

export type Snapshot = {
  id: string;
  item_id: string;
  channel_id: string;
  captured_at: string;
  observed_price: number | null;
  observed_title: string | null;
  observed_url: string | null;
  screenshot_url: string | null;
  status: string;
  error: string | null;
};

export type DashboardData = {
  categories: Category[];
  channels: Channel[];
  items: Item[];
  targets: Target[];
  snapshots: Snapshot[];
  recommendations: Recommendation[];
  source: "supabase" | "demo";
};

export type Recommendation = {
  id: string;
  category: string;
  lg_item_name: string;
  samsung_item_name: string;
  reason: string;
  confidence: number;
};
