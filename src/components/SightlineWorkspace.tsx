import { publicPath } from "../publicPath";
import "./SightlineWorkspace.css";

const studioUrl = publicPath("sightline-app/index.html");

export function SightlineWorkspace() {
  return (
    <section className="sightline-workspace" aria-labelledby="sightline-title">
      <div className="sightline-heading">
        <div>
          <p className="eyebrow">8×8 VEHICLE LAB</p>
          <h2 id="sightline-title">시야각 검토</h2>
          <p>차량 사진 위에서 기준선과 각도를 표시하고, 두 차량을 나란히 비교합니다.</p>
        </div>
        <a className="sightline-open" href={studioUrl} target="_blank" rel="noopener noreferrer">크게 열기 ↗</a>
      </div>
      <p className="sightline-note">사진 기반 2D 각도 측정값입니다. 실제 조종수·잠망경 시야각과 구분해 사용하세요. 기존 앱의 기록은 프로젝트 JSON으로 가져올 수 있습니다.</p>
      <iframe className="sightline-frame" src={studioUrl} title="8×8 차량 비교 및 시야각 검토 스튜디오" />
    </section>
  );
}
