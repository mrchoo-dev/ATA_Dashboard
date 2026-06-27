import type { Item, Recommendation } from "./types";

export function makeRecommendations(items: Item[]): Recommendation[] {
  const active = items.filter((item) => item.active);
  const byCategory = new Map<string, Item[]>();
  active.forEach((item) => {
    byCategory.set(item.category_id, [...(byCategory.get(item.category_id) ?? []), item]);
  });

  const results: Recommendation[] = [];
  byCategory.forEach((categoryItems, categoryId) => {
    const lgs = categoryItems.filter((item) => item.brand === "LG");
    const samsungs = categoryItems.filter((item) => item.brand === "삼성");
    lgs.forEach((lg) => {
      const scored = samsungs
        .map((samsung) => {
          const capacityGap =
            lg.capacity_kg && samsung.capacity_kg ? Math.abs(lg.capacity_kg - samsung.capacity_kg) : 3;
          const tierScore = lg.price_tier && lg.price_tier === samsung.price_tier ? 30 : 10;
          const priceGap =
            lg.ata_price && samsung.ata_price
              ? Math.abs(lg.ata_price - samsung.ata_price) / Math.max(lg.ata_price, samsung.ata_price)
              : 0.2;
          const score = Math.max(35, 95 - capacityGap * 8 - priceGap * 50 + tierScore);
          return { samsung, score: Math.min(98, Math.round(score)) };
        })
        .sort((a, b) => b.score - a.score);

      const best = scored[0];
      if (!best) return;
      results.push({
        id: `rec-${lg.id}-${best.samsung.id}`,
        category: categoryId,
        lg_item_name: lg.item_name,
        samsung_item_name: best.samsung.item_name,
        confidence: best.score,
        reason: "용량, 가격대, ATA 기준가 차이를 기준으로 대표 비교 후보를 산정했습니다."
      });
    });
  });

  return results.slice(0, 6);
}
