import { useEffect, useRef, useState } from "react";
import { publicPath } from "../publicPath";
import options from "../content/v10-options.json";
import historyData from "../content/v10-history.json";
import interiorsData from "../content/v10-interiors.json";
import "./V10Workspace.css";

type Page = "evidence" | "options" | "changes" | "interiors";
type Props = { page: Page; onNavigate: (path: string) => void };
type Source = { id: string; publisher: string; title: string; url: string; publishedAt?: string | null };
type EvidenceCase = { id: string; title: string; platform: string; year: string; dateLabel: string; dateNote: string; recordType: string; threatFamily: string; location: string; threat: string; summary: string; vehicleOutcome: string; crewOutcome: string; recoveryOutcome: string; uncertainty: string; confidence: string; verification: string; sources: string[] };
type History = { checkedAt: string; cases: EvidenceCase[]; sources: Source[]; insights: { title: string; finding: string; type: string; caseIds: string[] }[]; limitations: string[]; threatComparison: { category: string; evidence: string; observation: string; needed: string; sourceIds: string[] }[]; trends: { id: string; title: string; period: string; finding: string; interpretation: string; limitation: string; sourceIds: string[] }[] };
type Interior = { id: string; vehicle: string; variant: string; space: string; title: string; caption: string; date: string; dateNote?: string; author: string; license: string; licenseUrl: string; sourceUrl: string; imageUrl: string; localPath?: string; verification?: string; limitations?: string };
type ImageView = { src: string; title: string; caption: string; sourceUrl?: string; author?: string; license?: string; licenseUrl?: string };
const history = historyData as History;
const interiors = interiorsData as Interior[];

function sourceLinks(ids: string[], sources: Source[]) {
  return <div className="v10-source-list">{ids.map((id) => {
    const source = sources.find((item) => item.id === id);
    return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer" title={source.title}>{source.publisher}{source.publishedAt ? ` · ${source.publishedAt}` : " · 원문"} ↗</a> : null;
  })}</div>;
}

function Hero({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <header className="v10-hero"><p className="v10-eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p>{children && <div className="v10-hero-meta">{children}</div>}</header>;
}

function Photo({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return failedSrc === src ? <div className="v10-empty" role="img" aria-label={`${alt} — 이미지 로딩 실패`}>이미지를 불러오지 못했습니다.<br />아래 원문 링크에서 확인해 주세요.</div> : <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailedSrc(src)} />;
}

function ImageDialog({ item, onClose }: { item: ImageView | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (item && !dialog.current?.open) dialog.current?.showModal();
    if (!item && dialog.current?.open) dialog.current?.close();
  }, [item]);
  return <dialog ref={dialog} className="v10-dialog" aria-labelledby="v10-image-title" onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    {item && <><div className="v10-dialog-toolbar"><h2 id="v10-image-title">{item.title}</h2><button className="v10-close" type="button" onClick={() => dialog.current?.close()} aria-label="확대 이미지 닫기">닫기 ×</button></div><Photo src={item.src} alt={item.title} className="v10-dialog-image" /><p>{item.caption}</p><div className="v10-license">{item.author && <span>사진: {item.author}</span>}{item.licenseUrl ? <a href={item.licenseUrl} target="_blank" rel="noreferrer">{item.license}</a> : item.license}{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer">사진 원문 ↗</a>}<a href={item.src} target="_blank" rel="noreferrer">이미지 파일 열기 ↗</a></div></>}
  </dialog>;
}

function EvidencePage() {
  const [threat, setThreat] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [view, setView] = useState("cases");
  const cases = history.cases.filter((item) => (threat === "all" || item.threat === threat) && (platform === "all" || item.platform === platform));
  return <>
    <Hero eyebrow="FIELD EVIDENCE / V10" title="피탄 이후, 무엇이 남았는가." description="공개된 전장 기록을 차량 손상, 탑승자 결과, 회수·복구로 나눠 읽습니다. 관측된 사실과 그로부터 얻은 해석을 구분합니다.">
      <span className="v10-pill v10-pill-solid">공식 기록 중심</span><span className="v10-pill">자료 확인 {history.checkedAt}</span><span className="v10-pill">생존율·피격확률 추정 없음</span>
    </Hero>
    <div className="v10-stats"><div className="v10-stat"><strong>6 + 1</strong><span>피탄 사례 6건 + 복구 기록 1건</span></div><div className="v10-stat"><strong>{new Set(history.cases.map((item) => item.platform)).size}</strong><span>플랫폼 구분</span></div><div className="v10-stat"><strong>3</strong><span>결과 축 · 손상 / 인명 / 복구</span></div><div className="v10-stat"><strong>{history.sources.length}</strong><span>근거 문서</span></div></div>
    <div className="v10-toolbar"><div className="v10-segment" aria-label="피탄 정보 보기"><button type="button" aria-pressed={view === "cases"} onClick={() => setView("cases")}>사례 기록</button><button type="button" aria-pressed={view === "analysis"} onClick={() => setView("analysis")}>종합 분석</button></div><p className="v10-footnote">사례 수는 위험도 순위나 피해 통계가 아닙니다.</p></div>
    {view === "analysis" ? <>
      <div className="v10-section-heading"><div><p className="v10-eyebrow">THREAT COMPARISON</p><h3>위협 유형별로, 어떤 근거가 있는가.</h3></div><span className="v10-pill">수록 자료의 비교 · 위협 빈도나 우열 아님</span></div>
      <div className="v10-table-wrap"><table className="v10-table"><caption className="v10-sr-only">공개 기록 기반 위협 유형별 비교</caption><thead><tr><th scope="col">위협 범주</th><th scope="col">수록 근거</th><th scope="col">관찰·해석</th><th scope="col">추가 확인 필요</th></tr></thead><tbody>{history.threatComparison.map((item) => <tr key={item.category}><th scope="row">{item.category}</th><td>{item.evidence}{sourceLinks(item.sourceIds, history.sources)}</td><td>{item.observation}</td><td>{item.needed}</td></tr>)}</tbody></table></div>
      <div className="v10-section-heading"><div><p className="v10-eyebrow">SYNTHESIS</p><h3>과거 사례를 읽는 여섯 가지 관점</h3></div><span className="v10-pill">공개 기록을 종합한 해석</span></div>
      <div className="v10-analysis-grid">{history.insights.map((insight, index) => <article className="v10-analysis-card" key={insight.title}><span className="v10-card-index">0{index + 1}</span><h3>{insight.title}</h3><p>{insight.finding}</p><span className="v10-pill">{insight.type}</span>{insight.caseIds.length > 0 && <p className="v10-footnote">관련 사례: {insight.caseIds.map((id) => history.cases.find((item) => item.id === id)?.title).filter(Boolean).join(" · ")}</p>}</article>)}</div>
      {history.trends.map((trend) => <article className="v10-note" key={trend.id}><p className="v10-eyebrow">{trend.period} · 개별 사건과 구분한 동향</p><h3>{trend.title}</h3><p>{trend.finding}</p><p>{trend.interpretation}</p><div className="v10-uncertainty"><strong>해석의 범위</strong><p>{trend.limitation}</p></div>{sourceLinks(trend.sourceIds, history.sources)}</article>)}
      <div className="v10-note"><h3>자료를 비교하기 전에 확인할 점</h3><ul>{history.limitations.map((text) => <li key={text}>{text}</li>)}</ul></div>
    </> : <>
      <div className="v10-toolbar"><label className="v10-field">위협·사건 구분<select value={threat} onChange={(event) => setThreat(event.target.value)}><option value="all">전체</option>{[...new Set(history.cases.map((item) => item.threat))].map((value) => <option key={value}>{value}</option>)}</select></label><label className="v10-field">플랫폼<select value={platform} onChange={(event) => setPlatform(event.target.value)}><option value="all">전체</option>{[...new Set(history.cases.map((item) => item.platform))].map((value) => <option key={value}>{value}</option>)}</select></label><span className="v10-pill">{cases.length}건 표시</span><button type="button" className="v10-button" onClick={() => { setThreat("all"); setPlatform("all"); }}>필터 초기화</button></div>
      <div className="v10-grid">{cases.map((item, index) => <article className="v10-card" key={item.id}>
        <div className="v10-card-heading"><span className="v10-card-index">{String(index + 1).padStart(2, "0")}</span><span className={`v10-pill ${item.confidence === "당사국 발표" ? "v10-pill-warn" : ""}`}>{item.confidence} · {item.recordType}</span></div><p className="v10-eyebrow">{item.dateLabel} / {item.location} / {item.platform}</p><h3>{item.title}</h3><span className="v10-pill">{item.threat}</span><p>{item.summary}</p>
        <dl className="v10-outcomes"><div className="v10-outcome"><dt>차량 손상</dt><dd>{item.vehicleOutcome}</dd></div><div className="v10-outcome"><dt>탑승자 결과</dt><dd>{item.crewOutcome}</dd></div><div className="v10-outcome"><dt>회수·복구</dt><dd>{item.recoveryOutcome}</dd></div></dl>
        <div className="v10-uncertainty"><strong>기록의 범위 · {item.confidence}</strong><p>{item.uncertainty}</p><details><summary>자료 확인 과정</summary><p>{item.verification}</p><p>{item.dateNote}</p></details></div>{sourceLinks(item.sources, history.sources)}
      </article>)}</div>{!cases.length && <div className="v10-empty">선택한 조합에 해당하는 사례가 없습니다. 필터를 초기화해 주세요.</div>}
      <p className="v10-footnote">‘미확인’은 ‘피해 없음’이나 ‘복구 불가’를 뜻하지 않습니다. 사례별 공개 범위가 다릅니다.</p>
    </>}
  </>;
}

function OptionsPage() {
  const [vehicleId, setVehicleId] = useState("boxer");
  const [variantId, setVariantId] = useState("boxer-samson");
  const [selected, setSelected] = useState<string[]>([]);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("");
  const [manual, setManual] = useState(false);
  const vehicle = options.vehicles.find((item) => item.id === vehicleId) ?? options.vehicles[0];
  const variant = vehicle.variants.find((item) => item.id === variantId) ?? vehicle.variants[0];
  const rows = vehicle.options.filter((item) => category === "all" || item.category === category);
  const selectedOptions = vehicle.options.filter((item) => selected.includes(item.id));
  const label = (id: string) => options.statusLegend.find((item) => item.id === id)?.label ?? id;
  const selectionText = [`Defense Astra V10 · 관심 구성`, `차종: ${vehicle.name}`, `기준 계열형: ${variant.nameKo} (${variant.name})`, `공개 상태: ${label(variant.status)}`, ...selectedOptions.map((item) => `- ${item.name}: ${label(item.status)}\n  ${item.detail}`), "체크한 항목은 검토용 관심 목록입니다. 동시 탑재·호환성·가격을 보증하지 않습니다.", `자료 확인: ${options.checkedAt}`].join("\n");
  function changeVehicle(id: string) { setVehicleId(id); setVariantId(id === "boxer" ? "boxer-samson" : "stryker-icv"); setSelected([]); setCategory("all"); setStatus(""); setManual(false); }
  function changeVariant(id: string) { setVariantId(id); setSelected([]); setStatus(""); setManual(false); }
  async function copy() { try { await navigator.clipboard.writeText(selectionText); setStatus("관심 구성을 복사했습니다."); setManual(false); } catch { setStatus("아래 내용을 선택해 직접 복사해 주세요."); setManual(true); } }
  function download() { const escape = (value: string) => `"${value.replace(/"/g, '""')}"`; const lines = [["차종", "계열형", "관심 항목", "확인 상태", "내용"], ...selectedOptions.map((item) => [vehicle.name, variant.nameKo, item.name, label(item.status), item.detail])]; const blob = new Blob(["\ufeff" + lines.map((line) => line.map(escape).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `Defense_Astra_V10_${vehicle.id}_interest.csv`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  return <>
    <Hero eyebrow="VEHICLE CONFIGURATOR / V10" title="차종을 고르고, 구성을 비교하세요." description="자동차 옵션표처럼 살펴보는 공개 사양 카탈로그입니다. 계열형을 먼저 고른 뒤, 관련 장비를 관심 목록에 담아 비교합니다."><span className="v10-pill v10-pill-solid">2개 차종 · 20개 계열형</span><span className="v10-pill">제안 / 계약 / 납품 구분</span><span className="v10-pill">자료 확인 {options.checkedAt}</span></Hero>
    <div className="v10-vehicle-choices">{options.vehicles.map((item) => <button key={item.id} type="button" className="v10-choice" aria-pressed={vehicle.id === item.id} onClick={() => changeVehicle(item.id)}><span className="v10-eyebrow">{item.variants.length} VARIANTS</span><strong>{item.name}</strong><span>{item.tagline}</span></button>)}</div>
    <div className="v10-vehicle-intro"><p>{vehicle.summary}</p>{sourceLinks(vehicle.sources, options.sources)}</div>
    <div className="v10-toolbar"><label className="v10-field">01 · 기준 계열형<select value={variant.id} onChange={(event) => changeVariant(event.target.value)}>{vehicle.variants.map((item) => <option key={item.id} value={item.id}>{item.nameKo} · {item.market}</option>)}</select></label><label className="v10-field">02 · 옵션 분야<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">전체 분야</option>{[...new Set(vehicle.options.map((item) => item.category))].map((value) => <option key={value}>{value}</option>)}</select></label></div>
    <article className="v10-card"><div className="v10-card-heading"><div><p className="v10-eyebrow">{variant.name}</p><h3>{vehicle.name} · {variant.nameKo}</h3></div><span className={`v10-pill ${variant.status === "catalogue" ? "v10-pill-warn" : "v10-pill-solid"}`}>{label(variant.status)}</span></div><dl className="v10-outcomes"><div className="v10-outcome"><dt>국가·시장</dt><dd>{variant.market}</dd></div><div className="v10-outcome"><dt>주요 임무</dt><dd>{variant.role}</dd></div><div className="v10-outcome"><dt>기준 구성</dt><dd>{variant.equipment}</dd></div></dl><p className="v10-footnote">{variant.note}</p>{"evidenceDate" in variant && <p className="v10-footnote">구성 근거 시점: {String(variant.evidenceDate)} · {"statusScope" in variant ? String(variant.statusScope) : "국가·사업별 계약 상태 확인 필요"}</p>}{sourceLinks(variant.sources, options.sources)}</article>
    <div className="v10-section-heading"><div><p className="v10-eyebrow">OPTION LIST</p><h3>03 · 관심 사양 선택</h3></div><span className="v10-pill">공개자료로 연결이 확인된 항목만 선택</span></div>
    <div className="v10-table-wrap"><table className="v10-table"><caption className="v10-sr-only">{vehicle.name} {variant.nameKo} 공개 옵션표</caption><thead><tr><th scope="col">관심</th><th scope="col">분야 / 항목</th><th scope="col">공개 확인 상태</th><th scope="col">선택한 계열형과의 관계</th><th scope="col">자료와 조건</th></tr></thead><tbody>{rows.map((item) => { const applies = item.appliesTo.includes(variant.id); return <tr key={item.id} className={applies ? "" : "v10-row-muted"}><td><input type="checkbox" aria-label={`${item.name} 관심 목록에 추가`} checked={selected.includes(item.id)} disabled={!applies || item.selectable === false} onChange={(event) => { setSelected((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id)); setStatus(""); setManual(false); }} /></td><th scope="row"><span className="v10-eyebrow">{item.category} · {item.offeringType}</span>{item.name}</th><td><span className={`v10-pill ${item.status === "catalogue" ? "v10-pill-warn" : ""}`}>{label(item.status)}</span></td><td>{applies ? (item.selectable === false ? "기본·포함 구성 (별도 선택 없음)" : "관련 공개자료 있음") : "이 계열형과의 연결 미확인"}</td><td><p>{item.detail}</p>{sourceLinks(item.sources, options.sources)}</td></tr>; })}</tbody></table></div>
    <div className="v10-selection-bar"><div><strong>관심 항목 {selectedOptions.length}개</strong><p>체크한 항목은 검토용 목록입니다. 실제 동시 탑재 가능성은 별도 확인이 필요합니다.</p></div><div className="v10-inline-actions"><button className="v10-button primary" type="button" onClick={copy}>관심 구성 복사</button><button className="v10-button" type="button" onClick={download} disabled={!selectedOptions.length}>CSV 저장</button><button className="v10-button" type="button" disabled={!selected.length} onClick={() => { setSelected([]); setStatus(""); setManual(false); }}>선택 초기화</button></div></div><p className="v10-copy-status" role="status">{status}</p>{manual && <textarea className="v10-copy-fallback" aria-label="직접 복사할 관심 구성" value={selectionText} readOnly rows={9} onFocus={(event) => event.currentTarget.select()} />}
    <details className="v10-note"><summary>{vehicle.name} 전체 계열형 {vehicle.variants.length}종 비교</summary><div className="v10-table-wrap"><table className="v10-table"><thead><tr><th scope="col">계열형</th><th scope="col">임무·구성</th><th scope="col">국가</th><th scope="col">확인 상태</th><th scope="col">기준으로 보기</th></tr></thead><tbody>{vehicle.variants.map((item) => <tr key={item.id}><th scope="row">{item.nameKo}<small>{item.name}</small></th><td>{item.equipment}</td><td>{item.market}</td><td>{label(item.status)}</td><td><button className="v10-button" type="button" onClick={() => { changeVariant(item.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>선택</button></td></tr>)}</tbody></table></div></details>
    {"historicalNotes" in vehicle && vehicle.historicalNotes?.map((note) => <div key={note.name} className="v10-note"><strong>과거 구성 · {note.name}</strong><p>{note.detail}</p>{sourceLinks(note.sources, options.sources)}</div>)}
    <p className="v10-footnote">{options.scope} 제조사 예시 옵션을 기본 사양으로 해석하지 않습니다. 가격·납기 추정과 자동 호환 판정은 제공하지 않습니다.</p>
  </>;
}

function InteriorsPage({ onOpen }: { onOpen: (image: ImageView) => void }) {
  const [vehicle, setVehicle] = useState("all");
  const photos = interiors.filter((item) => vehicle === "all" || item.vehicle === vehicle);
  const src = (item: Interior) => item.localPath ? publicPath(item.localPath) : item.imageUrl;
  return <><Hero eyebrow="INTERIOR ARCHIVE / OPTIONAL DEMO" title="차량 안쪽까지, 사진으로 확인하세요." description="탑승 공간과 조종실을 차종별로 모았습니다. 사진을 누르면 크게 볼 수 있고, 각 사진의 원문과 사용 조건을 함께 확인할 수 있습니다."><span className="v10-pill v10-pill-solid">{new Set(interiors.map((item) => item.vehicle)).size}개 차종 · {interiors.length}장</span><span className="v10-pill">실제 공개사진</span><span className="v10-pill">파생형·촬영 시점 구분</span></Hero>
    <div className="v10-toolbar"><div className="v10-segment" aria-label="내부사진 차종"><button type="button" aria-pressed={vehicle === "all"} onClick={() => setVehicle("all")}>전체</button>{[...new Set(interiors.map((item) => item.vehicle))].map((name) => <button type="button" key={name} aria-pressed={vehicle === name} onClick={() => setVehicle(name)}>{name}</button>)}</div><span className="v10-pill">{photos.length}장 표시</span></div>
    <div className="v10-gallery">{photos.map((item) => <article className="v10-card v10-photo-card" key={item.id}><button type="button" className="v10-photo-button" aria-label={`${item.vehicle} ${item.title} 확대`} onClick={() => onOpen({ src: src(item), title: `${item.vehicle} · ${item.title}`, caption: `${item.caption} ${item.limitations ?? ""}`, sourceUrl: item.sourceUrl, author: item.author, license: item.license, licenseUrl: item.licenseUrl })}><Photo src={src(item)} alt={`${item.vehicle} ${item.variant} ${item.space}`} className="v10-photo" /><span className="v10-image-hint">확대 보기 ↗</span></button><div className="v10-photo-body"><p className="v10-eyebrow">{item.vehicle} / {item.space}</p><h3>{item.title}</h3><p>{item.caption}</p><p className="v10-footnote">{item.variant} · {item.date}{item.dateNote ? ` · ${item.dateNote}` : ""}</p><div className="v10-license"><span>사진: {item.author}</span><a href={item.licenseUrl} target="_blank" rel="noreferrer">{item.license}</a><a href={item.sourceUrl} target="_blank" rel="noreferrer">원문 ↗</a></div></div></article>)}</div><div className="v10-note"><strong>사진으로 확인할 수 있는 범위</strong><p>촬영된 차량의 공간과 배치를 살펴보는 자료입니다. 사진만으로 실측 치수, 좌석 간격, 방호 성능이나 다른 국가·연식의 동일 구성을 확정할 수 없습니다. 전시·운용·교육 상태가 서로 다를 수 있습니다.</p><p>웹 표시용으로 크기를 줄이고 JPEG를 재압축했습니다. 크롭·내용 변경은 없습니다. <a href={publicPath("media/v10/interiors/CREDITS.txt")} target="_blank" rel="noreferrer">사진별 출처·사용 조건 보기 ↗</a></p></div></>;
}

function ChangesPage({ onNavigate, onOpen }: { onNavigate: Props["onNavigate"]; onOpen: (image: ImageView) => void }) {
  const changes = [
    { id: "evidence", number: "01", title: "피탄·손상 사례와 종합 분석", before: "기존 전장 인사이트는 기술 동향과 사례 요약 중심이었습니다.", after: "피탄 이후의 차량·인명·회수 결과를 분리하고, 원문 근거와 미확인 범위를 함께 봅니다.", route: "/evidence", action: "피탄 분석 열기", caption: "V10 · 공개 사례 기록과 결과 분류" },
    { id: "options", number: "02", title: "BOXER·STRYKER 옵션표", before: "기존에는 장비 상세와 파생형 정보를 각각 확인했습니다.", after: "차종과 기준 계열형을 고르면 관련 옵션, 확인 상태, 관심 구성 목록을 한 화면에서 정리합니다.", route: "/options", action: "차종별 옵션 열기", caption: "V10 · 차종·계열형별 공개 옵션 비교" },
    { id: "interiors", number: "03", title: "차종별 내부사진", before: "외형·3D 중심 화면에서 내부 공간은 별도 자료를 찾아야 했습니다.", after: "차종별 실제 내부사진을 모아 확대해서 보고, 파생형·출처·사용 조건까지 확인합니다.", route: "/interiors", action: "내부사진 시연", caption: "V10 · 실제 내부사진 갤러리", optional: true }
  ];
  const show = (id: string, title: string, caption: string) => onOpen({ src: publicPath(`media/v10/screenshots/${id}.jpg`), title, caption });
  return <><Hero eyebrow="WHAT CHANGED / V10" title="의견이 기능으로 바뀐 순간." description="기존 화면과 새 기능의 실제 캡처를 모았습니다. 발표 중 변경 내용을 보여주고, 바로 해당 화면으로 이동할 수 있습니다."><span className="v10-pill v10-pill-solid">핵심 개선 2건</span><span className="v10-pill">추가 시연 · 내부사진</span><span className="v10-pill">기준 화면: 기존 웹앱 V6</span></Hero>
    <section className="v10-before-after"><div><p className="v10-eyebrow">BEFORE / V6</p><h3>기존 전장 인사이트</h3><p>공식 발표와 기술 동향을 카드로 확인하던 화면입니다. 아래 V10 신규 기능의 비교 기준으로 사용했습니다.</p></div><button className="v10-photo-button" type="button" aria-label="기존 V6 전장 인사이트 캡처 확대" onClick={() => show("before", "기존 V6 · 전장 인사이트", "V10 변경 전 비교 기준 화면. 기존 공식 발표·기술 동향 카드 화면을 실제 캡처했습니다.")}><Photo src={publicPath("media/v10/screenshots/before.jpg")} alt="기존 V6 전장 인사이트 화면 캡처" className="v10-screenshot" /></button></section>
    <div className="v10-change-grid">{changes.map((item) => <article className="v10-change" key={item.id}><div className="v10-change-detail"><div className="v10-card-heading"><span className="v10-card-index">{item.number}</span><span className={`v10-pill ${item.optional ? "v10-pill-warn" : "v10-pill-solid"}`}>{item.optional ? "추가 시연" : "V10 핵심 개선"}</span></div><h3>{item.title}</h3><dl><dt>이전</dt><dd>{item.before}</dd><dt>변경</dt><dd>{item.after}</dd></dl></div><button type="button" className="v10-photo-button" aria-label={`${item.title} 화면 캡처 확대`} onClick={() => show(item.id, item.title, item.caption)}><Photo src={publicPath(`media/v10/screenshots/${item.id}.jpg`)} alt={item.caption} className="v10-screenshot" /></button><div className="v10-change-detail"><p className="v10-footnote">{item.caption} · 실제 화면 캡처</p><button type="button" className="v10-button primary" onClick={() => onNavigate(item.route)}>{item.action} →</button></div></article>)}</div>
    <div className="v10-note"><h3>청중에게 물어볼 세 가지</h3><ol><li>어떤 차종을 다음 옵션표에 추가할까요?</li><li>어떤 피탄·복구 사례가 더 필요할까요?</li><li>내부에서 어떤 공간을 더 보고 싶으신가요?</li></ol></div><div className="v10-demo"><div><p className="v10-eyebrow">발표 진행</p><h3>추가 의견이 없으면, 내부사진으로 이어가세요.</h3><p>“차량 외형뿐 아니라 내부 공간도 차종별로 모아 볼 수 있습니다.”</p></div><div className="v10-inline-actions"><button type="button" className="v10-button" onClick={() => onNavigate("/interiors")}>내부사진 열기</button><button type="button" className="v10-button" onClick={() => onNavigate("/feedback")}>현장 개선 의견 기록</button></div></div>
  </>;
}

function V10Content({ page, onNavigate }: Props) {
  const [image, setImage] = useState<ImageView | null>(null);
  return <section className="v10-workspace" aria-label="V10 연구 및 발표 기능">{page === "evidence" ? <EvidencePage /> : page === "options" ? <OptionsPage /> : page === "interiors" ? <InteriorsPage onOpen={setImage} /> : <ChangesPage onNavigate={onNavigate} onOpen={setImage} />}<ImageDialog item={image} onClose={() => setImage(null)} /></section>;
}

export function V10Workspace(props: Props) {
  return <V10Content key={props.page} {...props} />;
}
