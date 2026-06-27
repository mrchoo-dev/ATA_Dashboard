"use client";

import { useMemo, useState } from "react";
import type { Channel, DashboardData, Item, Snapshot } from "@/lib/types";
import { formatDateTime, formatWon } from "@/lib/format";

type Props = {
  initialData: DashboardData;
};

type BrandMap = Record<string, { item: Item; latest: Snapshot | null } | null>;

export default function Dashboard({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [categoryId, setCategoryId] = useState(initialData.categories[0]?.id ?? "");
  const [channelFilter, setChannelFilter] = useState("all");
  const [draftOpen, setDraftOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeCategory = data.categories.find((category) => category.id === categoryId);
  const filteredChannels = data.channels.filter(
    (channel) => channelFilter === "all" || channel.id === channelFilter
  );
  const categoryItems = data.items.filter((item) => item.category_id === categoryId);
  const latestByItemChannel = useMemo(() => makeLatestMap(data.snapshots), [data.snapshots]);
  const rows = filteredChannels.map((channel) => ({
    channel,
    brands: makeBrandMap(categoryItems, channel, latestByItemChannel)
  }));
  const priced = rows.flatMap((row) =>
    Object.values(row.brands)
      .filter(Boolean)
      .map((entry) => entry?.latest?.observed_price)
      .filter((value): value is number => typeof value === "number")
  );
  const latestCapture = [...data.snapshots].sort((a, b) => b.captured_at.localeCompare(a.captured_at))[0];

  async function refresh() {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    setData(await response.json());
  }

  async function addItem(formData: FormData) {
    setSaving(true);
    const targets = data.channels.map((channel) => ({
      channel_id: channel.id,
      target_url: String(formData.get(`url-${channel.id}`) || ""),
      search_keyword: String(formData.get(`keyword-${channel.id}`) || "")
    }));
    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        category_id: categoryId,
        brand: formData.get("brand"),
        item_name: formData.get("item_name"),
        display_name: formData.get("display_name"),
        capacity_kg: formData.get("capacity_kg"),
        price_tier: formData.get("price_tier"),
        ata_price: formData.get("ata_price"),
        targets
      })
    });
    setSaving(false);
    if (!response.ok) {
      const error = await response.json();
      alert(error.error ?? "저장 실패");
      return;
    }
    setDraftOpen(false);
    await refresh();
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">ATA Channel Monitor</p>
          <h1>{activeCategory?.name ?? "카테고리"} 대표모델 비교</h1>
          <p className="subtitle">LG와 삼성 대표 item name을 쿠팡, G마켓, 하이마트 기준으로 비교합니다.</p>
        </div>
        <div className="hero-actions">
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)}>
            <option value="all">전체 채널</option>
            {data.channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
          <button onClick={() => setDraftOpen(true)}>item name 추가</button>
        </div>
      </header>

      <section className="stats">
        <Metric label="관리 item name" value={`${categoryItems.length}개`} />
        <Metric label="관리 채널" value={`${data.channels.length}개`} />
        <Metric label="최저 관측가" value={priced.length ? formatWon(Math.min(...priced)) : "-"} />
        <Metric label="최근 조회" value={formatDateTime(latestCapture?.captured_at)} />
      </section>

      {data.source === "demo" && (
        <section className="notice">
          Supabase 환경변수가 없어 샘플 데이터로 표시 중입니다. 배포 후 DB를 연결하면 팀 공유 데이터로 전환됩니다.
        </section>
      )}

      <section className="grid">
        <section className="panel wide">
          <div className="panel-head">
            <h2>채널별 LG vs 삼성</h2>
            <span>{activeCategory?.description}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>채널</th>
                  <th>LG item name</th>
                  <th>LG 최저가</th>
                  <th>LG ATA 차이</th>
                  <th>삼성 item name</th>
                  <th>삼성 최저가</th>
                  <th>삼성 ATA 차이</th>
                  <th>조회시각</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ channel, brands }) => (
                  <tr key={channel.id}>
                    <td className="channel">{channel.name}</td>
                    <BrandCells entry={brands.LG} />
                    <BrandCells entry={brands["삼성"]} />
                    <td>{formatDateTime(bestTime([brands.LG?.latest, brands["삼성"]?.latest]))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head stacked">
            <h2>AI 추천 후보</h2>
            <span>현재는 용량/가격대/ATA 기준 룰 기반입니다.</span>
          </div>
          <div className="recommendations">
            {data.recommendations.map((recommendation) => (
              <article key={recommendation.id}>
                <div>
                  <strong>{recommendation.lg_item_name}</strong>
                  <span>vs</span>
                  <strong>{recommendation.samsung_item_name}</strong>
                </div>
                <p>{recommendation.reason}</p>
                <meter min="0" max="100" value={recommendation.confidence} />
                <small>추천 신뢰도 {recommendation.confidence}%</small>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>가격 추이</h2>
          <span>최근 500개 스냅샷 기준</span>
        </div>
        <Trend snapshots={data.snapshots} items={categoryItems} />
      </section>

      {draftOpen && (
        <div className="modal-backdrop">
          <form className="modal" action={addItem}>
            <div className="panel-head">
              <h2>item name 추가</h2>
              <button type="button" className="ghost" onClick={() => setDraftOpen(false)}>
                닫기
              </button>
            </div>
            <div className="form-grid">
              <label>
                브랜드
                <select name="brand" required>
                  <option>LG</option>
                  <option>삼성</option>
                </select>
              </label>
              <label>
                item name
                <input name="item_name" placeholder="예: WL21..." required />
              </label>
              <label>
                표시명
                <input name="display_name" placeholder="예: LG 워시콤보 대표모델" />
              </label>
              <label>
                용량 kg
                <input name="capacity_kg" type="number" placeholder="25" />
              </label>
              <label>
                가격대
                <select name="price_tier">
                  <option value="premium">premium</option>
                  <option value="mainstream">mainstream</option>
                  <option value="entry">entry</option>
                </select>
              </label>
              <label>
                ATA 기준가
                <input name="ata_price" type="number" placeholder="2780000" />
              </label>
            </div>
            <div className="channel-inputs">
              {data.channels.map((channel) => (
                <div key={channel.id}>
                  <strong>{channel.name}</strong>
                  <input name={`url-${channel.id}`} placeholder={`${channel.name} URL`} />
                  <input name={`keyword-${channel.id}`} placeholder={`${channel.name} 검색어`} />
                </div>
              ))}
            </div>
            <button disabled={saving}>{saving ? "저장 중" : "저장"}</button>
          </form>
        </div>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function BrandCells({ entry }: { entry: { item: Item; latest: Snapshot | null } | null }) {
  if (!entry) {
    return (
      <>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </>
    );
  }
  const diff =
    typeof entry.latest?.observed_price === "number" && typeof entry.item.ata_price === "number"
      ? entry.latest.observed_price - entry.item.ata_price
      : null;
  return (
    <>
      <td>
        <strong>{entry.item.item_name}</strong>
        <small>{entry.item.display_name}</small>
      </td>
      <td className="money">{formatWon(entry.latest?.observed_price)}</td>
      <td className={diff !== null && diff <= 0 ? "good money" : "bad money"}>{formatWon(diff)}</td>
    </>
  );
}

function Trend({ snapshots, items }: { snapshots: Snapshot[]; items: Item[] }) {
  const points = snapshots
    .filter((snapshot) => snapshot.observed_price)
    .slice()
    .sort((a, b) => a.captured_at.localeCompare(b.captured_at));
  const max = Math.max(...points.map((point) => point.observed_price ?? 0), 1);
  const itemById = new Map(items.map((item) => [item.id, item]));

  if (!points.length) return <div className="empty">아직 가격 이력이 없습니다.</div>;

  return (
    <div className="trend">
      {points.map((point) => {
        const item = itemById.get(point.item_id);
        const width = `${Math.max(6, ((point.observed_price ?? 0) / max) * 100)}%`;
        return (
          <div className="bar-row" key={point.id}>
            <span>{item?.item_name ?? point.item_id}</span>
            <div>
              <i style={{ width }} />
            </div>
            <strong>{formatWon(point.observed_price)}</strong>
            <em>{formatDateTime(point.captured_at)}</em>
          </div>
        );
      })}
    </div>
  );
}

function makeLatestMap(snapshots: Snapshot[]) {
  const map = new Map<string, Snapshot>();
  snapshots.forEach((snapshot) => {
    const key = `${snapshot.item_id}:${snapshot.channel_id}`;
    const existing = map.get(key);
    if (!existing || snapshot.captured_at > existing.captured_at) map.set(key, snapshot);
  });
  return map;
}

function makeBrandMap(
  items: Item[],
  channel: Channel,
  latestByItemChannel: Map<string, Snapshot>
): BrandMap {
  const result: BrandMap = { LG: null, "삼성": null };
  items.forEach((item) => {
    const latest = latestByItemChannel.get(`${item.id}:${channel.id}`) ?? null;
    if (!result[item.brand] || latest?.captured_at > (result[item.brand]?.latest?.captured_at ?? "")) {
      result[item.brand] = { item, latest };
    }
  });
  return result;
}

function bestTime(snapshots: Array<Snapshot | null | undefined>) {
  return snapshots
    .filter((snapshot): snapshot is Snapshot => Boolean(snapshot))
    .sort((a, b) => b.captured_at.localeCompare(a.captured_at))[0]?.captured_at;
}
