import { useState } from "react";
import review from "../content/september-review.json";
import octoberReview from "../content/october-review.json";

const allEvents = [...octoberReview.events, ...review.events].sort((a, b) => b.date.localeCompare(a.date));
const periods = ["2026-10", "2026-09", "전체"];

export function LatestUpdates() {
  const [filter, setFilter] = useState("전체");
  const [period, setPeriod] = useState("2026-10");
  const periodEvents = allEvents.filter(item => period === "전체" || item.date.startsWith(period));
  const kinds = ["전체", ...new Set(periodEvents.map(item => item.kind))];
  const events = periodEvents.filter(item => filter === "전체" || item.kind === filter);
  return <section className="latest-updates" aria-labelledby="updates-heading">
    <div className="updates-heading"><div><p className="eyebrow">자료 업데이트</p><h2 id="updates-heading">최근에 무엇이 바뀌었나요?</h2></div><span>최신 이슈 확인 {octoberReview.checkedAt}</span></div>
    <p className="updates-scope">{octoberReview.scope}. 각 카드의 발표일과 출처 확인일을 구분합니다. 검토 관점은 공개 자료에 대한 해석입니다.</p>
    <div className="update-filters update-periods" aria-label="발표 월 필터">{periods.map(value => <button key={value} type="button" aria-pressed={period === value} onClick={() => { setPeriod(value); setFilter("전체"); }}>{value === "전체" ? "전체 기간" : value.replace("2026-", "2026년 ") + "월"}</button>)}</div>
    <div className="update-filters" aria-label="발표 단계 필터">{kinds.map(kind => <button key={kind} type="button" aria-pressed={filter === kind} onClick={() => setFilter(kind)}>{kind}</button>)}</div>
    <p className="updates-count" role="status">이슈 {events.length}건</p>
    <div className="update-cards">{events.map(item => <article key={item.id} className="update-card">
      <div className="update-meta"><time dateTime={item.date}>{item.date}</time><span>{item.kind}</span></div>
      <h3>{item.title}</h3><p>{item.summary}</p><p className="update-meaning">{item.meaning}</p><p className="update-limit">{item.limit}</p>
      <a href={item.source.url} target="_blank" rel="noreferrer">{item.source.publisher} · 발표 원문 ↗</a>
      <small>출처 확인 {item.source.checkedAt}</small>
    </article>)}</div>
    <details className="review-coverage"><summary>기존 장비 15종 검토 이력 · {review.checkedAt} 기준</summary>
      <p>10월에는 관련 이슈와 연표를 추가했습니다. 아래 장비 제원·검토 기록의 확인일을 일괄 변경하지 않았습니다.</p>
      <div className="review-table-wrap"><table><thead><tr><th>장비</th><th>검토 결과</th><th>확인 범위</th></tr></thead><tbody>{review.audits.map(a => <tr key={a.equipmentId}><th>{a.name}</th><td>{a.status}</td><td>{a.note}</td></tr>)}</tbody></table></div>
    </details>
  </section>;
}

export function EquipmentReview({ equipmentId }: { equipmentId: string }) {
  const audit = review.audits.find(a => a.equipmentId === equipmentId);
  if (!audit) return null;
  return <aside className="equipment-review"><strong>{audit.status} · {audit.checkedAt} 검토</strong><p>{audit.note}</p></aside>;
}
