import { useState } from "react";
import { publicPath } from "../publicPath";
import "./TigonSeating.css";

const concepts = [
  { title: "4인 착좌 · 인체 모델", note: "실내 사진에 4명의 인체 모델을 배치한 형상 비교안입니다. 무릎·발 위치와 통로의 관계를 살펴봅니다." },
  { title: "4인 착좌 · 마네킹", note: "회색 마네킹으로 자세와 좌석 점유 공간을 비교한 합성안입니다. 인체 크기는 검증된 백분위 모델이 아닙니다." },
  { title: "마주보기 · 치수 가정", note: "SRP 가정점, 무릎 간격, 측 간격, 천장 높이를 표기한 개념도입니다. 표시 치수는 사용자 가정값입니다." },
  { title: "착좌 치수 · 비교안 A", note: "4인 마네킹과 주요 치수 가정을 함께 표시한 검토안입니다. 화살표는 실제 설계 기준점을 확정한 것이 아닙니다." },
  { title: "착좌 공간 · 비교안 B", note: "자세와 치수 표기 위치를 달리한 공간 검토안입니다. 비교안 간 사람 크기·투영 차이를 실제 치수 변화로 해석하지 마세요." },
];

export function TigonSeating() {
  const [selected, setSelected] = useState(0);
  const item = concepts[selected];
  const src = publicPath(`tigon-seating/concept-${selected + 1}.webp`);
  return <section className="tigon-gallery" aria-labelledby="tigon-title">
    <div className="tigon-heading"><div><p className="eyebrow">TIGON · SEATING STUDY</p><h2 id="tigon-title">타이곤 내부 착좌 검토</h2><p>기존에 제작한 사진·인체 모델 합성안 5종을 모았습니다.</p></div><span className="tigon-count">{selected + 1} / {concepts.length}</span></div>
    <p className="tigon-notice">사진 기반 합성 개념도입니다. 이미지의 SRP·간격·높이는 사용자 가정값이며, 실측 제원이나 인체공학 적합성 검증 결과가 아닙니다.</p>
    <div className="tigon-layout"><div className="tigon-viewer"><a href={src} target="_blank" rel="noopener noreferrer" aria-label={`${item.title} 크게 보기`}><img src={src} alt={`TIGON 내부 ${item.title} 합성 개념도`} /></a><div className="tigon-caption"><div><h3>{item.title}</h3><p>{item.note}</p></div><a href={src} target="_blank" rel="noopener noreferrer">크게 보기 ↗</a></div></div>
    <div className="tigon-options" role="group" aria-label="착좌 비교 이미지 선택">{concepts.map((c, i) => <button key={c.title} type="button" aria-pressed={selected === i} onClick={() => setSelected(i)}><img src={publicPath(`tigon-seating/concept-${i + 1}.webp`)} alt="" /><span><small>검토안 {String(i + 1).padStart(2, "0")}</small><strong>{c.title}</strong></span></button>)}</div></div>
    <p className="tigon-credit">기존 제작 이미지 재수록 · 원사진 표기: 국방일보·국방사진연구소 · 인체 모델 및 치수 표기는 AI 합성/검토 가정. 서로 다른 합성안의 축척은 일치한다고 보장하지 않습니다.</p>
  </section>;
}
