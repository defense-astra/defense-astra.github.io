import { publicPath } from "../publicPath";
import "./SightlineWorkspace.css";

const studioUrl = publicPath("sightline-app/index.html?v=20261110-pdf-specs");

export function SightlineWorkspace() {
  return (
    <section className="sightline-workspace" aria-labelledby="sightline-title">
      <div className="sightline-heading">
        <div>
          <p className="eyebrow">8×8 VEHICLE LAB</p>
          <h2 id="sightline-title">시야각·길이 검토</h2>
          <p>차량 사진에 축척을 설정해 각도·길이·지상고를 측정하고, 공개 차량 제원을 기준으로 비교하고 측정 결과를 PDF로 저장합니다.</p>
        </div>
        <a className="sightline-open" href={studioUrl} target="_blank" rel="noopener noreferrer">크게 열기 ↗</a>
      </div>
      <p className="sightline-note">사진 기반 추정값입니다. 실제 시야각·공인 제원과 구분해 사용하세요. 기존 앱의 기록은 프로젝트 JSON으로 가져올 수 있습니다.</p>
      <iframe className="sightline-frame" src={studioUrl} title="8×8 차량 비교 및 시야각·길이 검토 스튜디오" />
    </section>
  );
}
