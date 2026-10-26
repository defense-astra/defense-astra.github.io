# 2026-10-16 V6 작업 완료

- 상태: completed. 전체 V6 적용 및 후속 진행에 대한 사용자 승인에 따라 구현·공개·검증 완료.
- [x] 10월 공식 이슈 4건을 출처·발표일·확인일과 함께 추가하고 9월/전체 기간 조회 유지.
- [x] 개선 의견 탭, 제목/유형/내용/관련 정보, 미리보기와 한 번에 복사, 실패 시 수동 복사 안내 구현.
- [x] 같은 탭에서 이동·새로고침 후 의견 초안 유지. 메일 전송 기능은 추가하지 않음.
- [x] PC 지도 높이를 화면 높이에 맞추고 양옆 목록에 내부 스크롤 적용. 상세 검색·프리셋 기능 유지.
- [x] 공개 사이트 검사에서 발견한 관련 화면 링크 캡처 시점 오류 수정 및 재배포.
- [x] 빌드·33개 테스트·린트·데이터 검증 및 배포 화면 확인.
- [x] V6 기본 연결, V6/V5/V4 버전 목록, V5/V4 공개 산출물 보존.
- 미완료: 없음. 실제 모바일 기기 및 전체 3D/GLB 재검증은 수행하지 않은 검증 범위로 기록.

# 2026-10-16 Defense Astra 주소 이전

- 상태: completed. 사용자 승인에 따라 defense-astra 조직을 생성하고 기존 저장소의 main/gh-pages 및 변경 이력을 가져왔다.
- 목표: https://defense-astra.github.io/ (최신 v5, v4/v3 보관). 기존 개인 저장소는 유지한다.
- 계획: 공개 파일의 /defense-trends-web/ 접두사를 /로 변경하고, 재빌드 기본 경로 및 README 링크를 새 조직에 맞춘다. 데이터·기능 구조는 유지한다.
- 공개 브랜치: f351069431471822b9207dc491b2817c2dab3744. Pages: gh-pages 루트, HTTPS.
- 검증: node scripts/build-public-release.mjs 성공(v5/v4/v3), npm test 28개 통과, npm run lint 통과. 실제 Chrome에서 루트→v5 이동, 독일 8x8→Boxer 1건, Boxer 상세, 버전 목록 및 새 GitHub 링크 확인.
- 한계: 주소 이전 범위의 검증이며, 3D 전체 기능·외부 이미지/지도 서비스의 전수 재검증은 수행하지 않았다.

# v5 공개 검증 완료

- 공개 URL: https://qkfhvnfrl-ux.github.io/defense-trends-web/versions/v5/
- Pages 실행 36731676575 성공, 산출물 850ccbc4fac7d1dc4f1d6b41dcf560184f86d256.
- 실제 Chrome: OSM 타일 배경 정상, 사례 마커 12개, Stryker 사례 팝업 및 확대 타일 확인. API KEY REQUIRED 대체 이미지 없음.
- 기존 v4/v3 공개 산출물은 변경하지 않음. 3D WebGL 환경 제약은 지도 수정과 별도.

# 2026-09-30 API 키 없는 지도 복구

- 상태: completed. 사용자 1번 선택으로 키 없는 지도 교체 승인.
- 계획: EquipmentMap 타일 URL과 attribution 변경, v5 경로 생성, v4/v3 보관. 데이터·마커·Leaflet 유지.
- 위험: 외부 타일 서비스 제공 상태. OSM 표준 URL 및 attribution 정책 준수, 일괄 다운로드 없음.
- 검증: build/test/lint, 실제 배포 지도 배경 및 마커 확인.

# 2026-09-11 GitHub 버전 관리와 v4 공개 전환

- 상태: completed. GitHub 소스 저장 및 v4 공개 배포 성공.
- 변경: 공개 버전 빌드 스크립트, 릴리스 메타데이터, GitHub 버전 안내, 운영 기록.
- 범위: 최신 v4 공개, v2/v3 복구 링크, GitHub 소스 저장. 기존 개인 검토 공간 유지.
- 검증: 공개 빌드 및 버전 경로 검사, GitHub 소스 SHA 확인, Pages 완료 및 HTTP 해시 비교.

# 2026-09-10 v4 기능 확장

- 상태: completed. 5개 구현·검증 및 비공개 v4 게시 완료.
- 범위: 3D 패널, 비교/이력/연표/인쇄 컴포넌트, 검증된 기존 자료, 스타일 및 버전 기록.
- 기존 공개 v3와 비공개 보관본 유지. v4를 새 경로로 관리.
- 위험: 사진 파생형 혼동, 자료 확인일과 사건일 혼동, 한글 PDF 출력, 3D 화면 캡처.
- 검증: 단계별 타입 검사, 비교/이력/연표 검증, 최종 build/test/lint. 화면 직접 확인은 사용자.
- [x] 1. 실사진 ↔ 3D 대응 보기
- [x] 2. 파생형 나란히 비교
- [x] 3. 자료 변경 이력
- [x] 4. 개발·시험·계약·배치 연표
- [x] 5. 장비 요약 PDF 저장

# 2026-09-10 v3 공개 반영

- 상태: completed — 공개 배포 성공, HTTP 및 파일 해시 검증 완료.
- 사용자 요청으로 v3를 승인된 공개 버전으로 게시한다. 기존 비공개 비교 공간의 접근 권한은 유지한다.
- 공개 경로: /defense-trends-web/versions/v3/. 기존 루트 주소는 해당 버전으로 연결한다.
- 검증: 배포용 base 경로 빌드, Pages 완료 상태, 공개 HTML/JS/데이터 해시 확인.

# 2026-09-09 비공개 버전 검토 및 자료 최신화

- 상태: completed — 비공개 게시 완료, v3 사용자 확인 대기.
- 사용자 승인 범위: 버전별 URL, 본인 전용, 최근 3개 보관과 복구, 사용자가 확인 후 기준 버전 반영.
- 전장적응지표의 임의 점수/장식 제거, 3D 임무장비 정보창 및 가독성 개선.
- 장비/기술/사례의 공식 출처를 재조회하고 확인된 내용만 갱신. 확인일을 일괄 최신화하지 않는다.
- 변경 파일: 3D 패널, App, 스타일, 자료 JSON, 버전 빌드/보관 스크립트, 운영 기록.
- 위험: 과거 버전 경로/데이터 섞임, 공개 호스트 잔존, 자료의 발표·예정·운용 혼동.
- 검증: build, test, lint, 스키마 및 버전 경로/스냅샷 검사, 소유자 전용 배포 완료 상태 확인. 브라우저 확인은 사용자 수행.

# 2026-09-09 사이트 배포 및 차량 3D 외형

- 상태: completed — 구현·로컬 검증 및 GitHub Pages 배포 성공.
- 요청: 검색 개선안을 실제 사이트에 배포하고, 공개 사진을 참고한 차량별 3D 외형과 임무장비를 설명에 추가한다.
- 범위: 기존 15종, 확인 가능한 임무형의 시각적 구성, 사진 근거와 추정 범위 표시, 회전/시점/구성 표시 및 GLB 저장.
- 변경: 차량 형상 생성 모듈, 3D 패널, 사진 근거 데이터, 기존 화면 연결, Three.js 의존성 및 작업 기록.
- 영향: 장비 설명에 새 3D 섹션을 추가하며 검색/필터/출처/부품 정보는 유지한다.
- 검증: 빌드/기존 테스트/모델 구조 및 GLB 검증/린트, 배포 작업 성공과 공개 HTML·JS·데이터 조회.
- 형상은 사진을 참고한 시각화이며 실측 CAD나 사진측량 복원으로 표시하지 않는다.

# 2026-09-09 장비 검색 정확도 개선

## 완료 작업

- 상태 전이: new_task -> interviewing -> planned -> executing -> verifying -> completed
- 사용자 요청: GitHub의 세계 장비 검색 웹앱 개선.
- 범위: 현재 검색의 연속 문구 일치 제약을 개선하고 한글 장비명 검색을 보강한다.
- 목표:
  - `독일 8x8`처럼 서로 다른 필드의 검색어를 함께 찾는다.
  - 한글 별칭, 이름 띄어쓰기, 하이픈, 전각 문자, `8×8` 표기를 처리한다.
  - 기존 상세 필터, 정렬, 검색 URL, 후보 목록과 내보내기 흐름을 유지한다.
- 수정 파일:
  - `src/search.ts`, `src/search.test.ts`: 검색 함수와 실제 장비 데이터 기반 회귀 검증.
  - `src/App.tsx`: 검색 함수 연결 및 입력 예시 갱신.
  - `public/data/equipment.json`: 기존 `aliases` 배열의 한글 검색 별칭 보강.
  - 운영 문서: 범위, 결정, 검증 결과 기록.
- 영향 범위: 장비 자유 검색 및 검색 결과를 사용하는 기존 화면/내보내기.
- 리스크: 검색 정규화에 따른 과도한 일치; 전체 검색어 충족 및 불일치 사례로 확인한다.
- 검증 계획: build, 기존/추가 단위 테스트, lint, 데이터 스키마/참조 검증.
- 검증 결과:
  - 프로덕션 build 통과.
  - 단위 테스트 3개 파일 / 23개 테스트 통과.
  - lint 통과.
  - node --import tsx scripts/validate-data.mjs 통과.
  - 수정 전 0건이던 독일 8x8, 스트라이커, T90M, Leopard2A7 검색 결과 복구.
  - 브라우저 E2E 및 공개 사이트 배포는 이번 작업에 포함하지 않음.

# 2026-06-20 구형 라우트 canonical 정리

## 진행 중 작업

- 없음

## 완료 작업

### 2026-06-20 구형 라우트 canonical 정리

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 숨겨진 이전 메뉴 URL을 현재 메뉴 구조에 맞는 공식 URL로 정리한다.
  - 기존 공유 링크 호환성은 유지한다.
- 결과:
  - `/compare`를 `/`로 canonical 처리
  - `/development`, `/technologies`, `/cases`를 `/insights`로 canonical 처리
  - `/compare?data=needs-review` query string 보존 검증 추가
  - routeChecks에 최종 경로 검증 추가
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - 권한 상승 후 `npm run quality` 통과

# TASKS

## 진행 중 작업

- 없음

## 완료 작업

### 2026-06-20 필터 배지 개별 해제

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 적용 중인 필터 중 하나만 빠르게 해제할 수 있게 한다.
  - 프리셋/공유 링크 기반 검색에서 select를 다시 찾는 반복 작업을 줄인다.
- 결과:
  - 활성 필터 배지를 버튼으로 변경
  - 계열, 분류, 임무, 국가, 상태, 성숙도, 신뢰도, 사례, 데이터 상태, 정렬, 검색어 조건별 개별 해제 지원
  - 배지 클릭 시 필터 상태와 URL query가 함께 갱신
  - E2E/디자인 검증에 배지 클릭 후 조건 해제, 전체 목록 복원, URL 파라미터 제거 검증 추가
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - 권한 상승 후 `npm run quality` 통과

### 2026-06-20 적용 필터 배지 표시

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 현재 장비 목록에 어떤 검색 조건이 적용됐는지 즉시 볼 수 있게 한다.
  - 프리셋/공유 링크로 진입했을 때 조건 의미를 다시 추적하지 않게 한다.
- 결과:
  - 적용 필터 라벨 생성 로직 추가
  - 검색 패널의 활성 필터 영역에 조건 배지 표시
  - 계열, 분류, 임무, 국가, 상태, 성숙도, 신뢰도, 사례, 데이터 상태, 정렬, 검색어 라벨 지원
  - E2E/디자인 검증에 프리셋 적용 후 필터 배지 표시 검증 추가
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - 권한 상승 후 `npm run quality` 통과

### 2026-06-20 선택 장비 요약 복사 추가

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 선택한 장비 하나의 핵심 정보를 메신저/회의록에 바로 공유할 수 있게 한다.
  - 전체 검색 결과 내보내기와 단일 장비 공유 작업을 분리해 반복 작업을 줄인다.
- 결과:
  - 선택 장비 패널에 `요약 복사` 버튼 추가
  - 장비 요약 텍스트 생성 함수 추가
  - 복사 성공/실패 상태 메시지 추가
  - 선택 장비 작업 버튼을 `요약 복사`, `상세 페이지 열기` 2개로 정리
  - E2E/디자인 검증에 선택 장비 빠른 작업 버튼 2개와 컨트롤 크기 검증 추가
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - 권한 상승 후 `npm run quality` 통과

### 2026-06-20 중복 상단 메뉴 축소

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 보는 상단 메뉴에서 같은 검색 화면으로 이어지는 중복 진입점을 제거한다.
  - 기존 공유 링크와 상세 라우트는 유지해 호환성을 보존한다.
- 결과:
  - `전체 장비` 상단 메뉴 제거
  - 상단 메뉴를 `장비 검색`, `전장 인사이트`, `출처` 3개로 단순화
  - `/equipment`와 `/equipment/:id`에서는 `장비 검색` 메뉴가 활성화되도록 정리
  - E2E/디자인 검증에 메뉴 3개와 `전체 장비` 미노출 조건 추가
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - 권한 상승 후 `npm run quality` 통과

### 2026-06-20 팀 작업 큐 추가

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 첫 화면에서 오늘 먼저 점검할 장비/출처 범위를 바로 볼 수 있게 한다.
  - 검색 프리셋과 출처 인덱스를 작업 큐에서 직접 연결해 반복 클릭을 줄인다.
- 결과:
  - `보강 필요 장비`, `출처 재확인`, `실전 사례 장비`, `계열 비교 후보` 큐 4개 추가
  - 장비 큐 클릭 시 기존 프리셋을 재사용해 검색 조건 즉시 적용
  - 출처 재확인 큐 클릭 시 `/sources?freshness=stale`로 이동
  - 출처 페이지가 `freshness` query를 초기 필터로 읽도록 개선
  - E2E/디자인 검증에 작업 큐 버튼 수, 출처 재확인 경로, 빈 상태 검증 추가
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - 권한 상승 후 `npm run quality` 통과

### 2026-06-19 팀용 장비 검색 프리셋 추가

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 장비 검색 화면에서 자주 쓰는 검색 조건을 한 번에 적용할 수 있게 한다.
  - 3D 기능을 다시 늘리지 않고, 현재 우선순위인 장비 검색/공유 흐름을 강화한다.
- 결과:
  - `보강 필요`, `실전 사례`, `고신뢰 출처`, `계열 많은 장비` 프리셋 4개 추가
  - 프리셋 클릭 시 기존 필터/정렬/URL 동기화 로직 재사용
  - 모바일에서 프리셋 버튼이 한 열로 정렬되도록 반응형 스타일 추가
  - E2E/디자인 검증에 프리셋 버튼 수, 결과 축소, URL 동기화 검증 추가
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - 권한 상승 후 `npm run quality` 통과

### 2026-06-19 출처 필터 결과 내보내기 추가

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 `/sources`에서 필터링한 출처 목록을 회의/점검 요청에 바로 붙일 수 있게 한다.
  - 필터 결과를 CSV로 저장해 별도 표 작업에 사용할 수 있게 한다.
- 결과:
  - `출처 요약 복사` 버튼 추가
  - `출처 CSV 다운로드` 버튼 추가
  - CSV 파일명 `source-index-results.csv` 고정
  - 현재 필터 결과 기준으로 요약/CSV 생성
  - E2E/디자인 검증에 출처 내보내기 버튼과 CSV 파일명 검증 추가
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - 권한 상승 후 `npm run quality` 통과

### 2026-06-19 출처 인덱스 필터/확인 상태 추가

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 출처 목록에서 특정 기관/유형/확인 상태를 빠르게 찾을 수 있게 한다.
  - 소실 가능성이 있는 오래된 출처를 정적 UI에서 먼저 식별할 수 있게 한다.
- 기준:
  - `checkedAt` 기준 180일 초과: 재확인 필요
  - 180일 이내: 최근 확인
- 결과:
  - `/sources`에 출처 검색 입력 추가
  - 출처 유형 필터 추가
  - 확인 상태 필터 추가
  - 최근 확인/재확인 필요/현재 표시 건수 요약 추가
  - 출처 카드에 확인 상태 표시 추가
  - E2E/디자인 검증에 출처 필터 동작 추가
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - 권한 상승 후 `npm run quality` 통과

### 2026-06-19 데이터 보강 필요 필터 추가

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 장비 목록에서 데이터 보강이 필요한 항목만 빠르게 추출할 수 있게 한다.
  - 보강 대상 링크를 URL로 공유할 수 있게 한다.
- 기준:
  - 출처 신뢰도 68 미만
  - 공개 출처 2건 미만
  - 계열 데이터 없음
- 결과:
  - `데이터 상태` 필터 추가
  - `검증 양호`, `보강 필요` 검색 지원
  - 장비 행별 데이터 상태 배지 추가
  - 결과 요약 복사와 CSV에 데이터 상태/보강 사유 포함
  - E2E/디자인 검증에 배지 수, 필터 수, 보강 필요 결과 3건, URL 파라미터 검증 추가
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - 권한 상승 후 `npm run quality` 통과

### 2026-06-19 불필요한 3D/구형 코드 제거

- 상태 전이: new_task → planned → executing → verifying → completed
- 목표:
  - 현재 검색 중심 버전에 필요 없는 3D 런타임과 구형 화면 코드를 제거
  - 팀원에게 필요한 기능만 남기고 유지보수 표면 축소
- 결과:
  - `@react-three/drei`, `@react-three/fiber`, `three`, `pngjs` 의존성 제거
  - 미사용 `DevelopmentLensPage` 삭제
  - 미사용 `TrendPanel` 삭제
  - 3D 캔버스/핫스팟 조작 CSS 제거
  - 삭제된 개발 렌즈 페이지 전용 CSS 제거
- 검증:
  - `npm run quality` 통과

### 2026-06-19 검색 결과 내보내기 추가

- 상태 전이: new_task → planned → executing → verifying → completed
- 목표:
  - 필터된 장비 목록을 회의록, 메신저, 보고서 초안에 바로 활용 가능하게 개선
  - 팀원이 검색 조건뿐 아니라 결과 목록 자체도 쉽게 공유하도록 지원
- 결과:
  - `결과 요약 복사` 버튼 추가
  - `CSV 다운로드` 버튼 추가
  - CSV에 장비명, 분류, 국가, 원산국, 제조사, 운용 상태, 임무 태그, 계열 수, 출처 신뢰도, 상세 ID 포함
  - E2E 검증에서 CSV 다운로드 파일명 확인
- 검증:
  - `npm run quality` 통과

### 2026-06-19 검색 조건 공유 링크 추가

- 상태 전이: new_task → planned → executing → verifying → completed
- 목표:
  - 팀원이 같은 검색 조건을 URL로 공유하고 다시 열 수 있게 개선
  - 검색 조건이 새로고침 또는 링크 전달 후에도 유지되게 개선
- 결과:
  - 검색 필터 상태를 URL query string과 동기화
  - 장비 검색 화면 진입 시 URL query에서 필터/검색어/선택 장비 복원
  - 검색 패널에 `검색 링크 복사` 버튼 추가
  - E2E 검증에서 URL 파라미터 생성과 reload 복원 확인
- 검증:
  - `npm run quality` 통과

### 2026-06-19 팀원용 장비 검색 필터 고도화

- 상태 전이: new_task → planned → executing → verifying → completed
- 목표:
  - 팀원이 꼭 필요한 장비를 빠르게 좁힐 수 있도록 검색 패널을 강화
  - 불필요한 3D 중심 탐색 대신 장비 유형, 임무, 국가, 상태 중심 검색을 우선
- 결과:
  - 임무/파생형 필터 추가
  - 국가 필터 추가
  - 운용 상태 필터 추가
  - 계열 성숙도 필터 추가
  - 필터 초기화 버튼 및 적용 조건 수 표시
  - 검색 결과 행에 역할 태그와 계열 수 표시
  - 렌더/디자인 검증 스크립트가 새 필터 동작을 확인하도록 갱신
- 검증:
  - `npm run quality` 통과

### 2026-06-19 장비 검색 카탈로그 중심 UI 개편

- 상태 전이: new_task → interviewing → planned → executing → verifying → completed
- 사용자 답변:
  - 목적은 장비 검색용
  - 전 세계 장비를 모두 검색 가능하게 확장하는 것이 목표
  - 3D는 추후 추가 예정이며 현재는 단순화
- 결과:
  - 첫 화면을 장비 검색 중심으로 재구성
  - 메뉴를 `장비 검색 / 전체 장비 / 전장 인사이트 / 출처`로 단순화
  - `Compare` 메뉴를 검색 화면으로 흡수
  - `Technologies`, `Cases`, `Development` 화면을 `전장 인사이트`로 통합
  - 3D 캔버스를 제거하고 GLB 추후 연동 슬롯과 부품 스펙 버튼으로 축소
  - 렌더링/디자인/개발 서버 검증 기준을 새 목표에 맞게 갱신
- 검증:
  - `npm run quality` 통과

## 상태 머신

사용 가능한 상태:

- new_task
- interviewing
- planned
- executing
- verifying
- completed
- needs_human
- failed_with_evidence
- retry_with_revision

## 진행 중 작업

- 없음

## 완료 작업

### 2026-06-19 문서 기반 운영 체계 도입

- 상태 전이: new_task → planned → executing → verifying → completed
- 요청: 프로젝트 루트에 운영 문서 6개를 갖추고 AGENTS.md의 harness-based development loop를 기본 개발 방식으로 적용
- 결과:
  - `AGENTS.md` 생성
  - `PROJECT_STATE.md` 생성
  - `TASKS.md` 생성
  - `DECISIONS.md` 생성
  - `EVIDENCE.md` 생성
  - `CHANGELOG.md` 업데이트
- 범위 제외:
  - 앱 코드 수정 없음
  - `ax-development-journey.html` 변경 없음

## 보류 작업

- GitHub Actions 기반 자동 Pages 배포 복구
- 실제 GLB 모델 추가
- README/CHANGELOG 한글 인코딩 정리

## 실패 작업

- 없음

## 2026-06-19 검색 결과 핵심 지표 스트립 추가

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 검색 결과 목록만 보고도 장비별 운용국, 계열/파생형, 전장 사례, 공개 출처 규모를 빠르게 비교할 수 있게 한다.
  - 데이터 구조 변경 없이 기존 `equipment`, `variants`, `battlefieldCaseIds`, `sources` 데이터를 재사용한다.
- 결과:
  - 장비 검색 결과 행마다 핵심 지표 스트립을 추가했다.
  - 지표 항목은 `운용국`, `계열`, `전장 사례`, `출처` 4개로 고정했다.
  - 렌더/디자인 검증에 지표 스트립과 셀 개수 검증을 추가했다.
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - sandbox 내부 `npm run quality`는 Vitest/Vite 설정 로드 권한 문제로 실패
  - 권한 상승 후 `npm run quality` 통과
## 2026-06-19 3D 준비 영역 제거 및 공개 장치 스펙 패널 전환

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 화면에 남아 있던 3D/GLB 준비 UI를 제거한다.
  - 동일 영역을 팀 검색 업무에 필요한 공개 장치/부품 스펙 패널로 전환한다.
- 결과:
  - `ModelViewer` 제거
  - `ComponentSpecPanel` 추가
  - 검색 상세와 장비 상세에서 장치/부품 공개 스펙 패널 표시
  - Battlefield Lens와 이미지 대체 문구에서 3D/GLB 전제 문구 제거
  - 렌더/디자인/개발 서버 검증 기준을 `.component-spec-panel`로 갱신
- 검증:
  - `npm run quality` 통과
## 2026-06-19 검색 결과 출처 신뢰도 즉시 표시

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 검색 결과에서 장비 데이터의 근거 수준을 바로 판단할 수 있게 한다.
  - 검색 결과 공유물에도 출처 신뢰도와 확인일이 남도록 한다.
- 결과:
  - 장비 검색 행에 출처 신뢰도 배지 추가
  - 장비 검색 행에 공개 출처 수와 최근 확인일 표시
  - 선택 장비 요약 패널에 출처 신뢰도, 최근 확인일, 공개 출처 수 추가
  - 결과 요약 복사와 CSV 다운로드에 출처 등급, 최근 확인일, 출처 수 포함
  - E2E/디자인 검증에 신뢰도 배지와 확인일 라인 검증 추가
- 검증:
  - `npm run quality` 통과
## 2026-06-19 출처 신뢰도 필터 추가

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 검증 우선순위가 높은 장비를 빠르게 찾도록 출처 신뢰도 기준 필터를 제공한다.
  - 신뢰도 필터도 검색 링크 공유와 새로고침 복원 대상에 포함한다.
- 결과:
  - 장비 검색 필터에 `출처 신뢰도` 선택 상자 추가
  - `High`, `Medium`, `Low` 등급별 장비 검색 지원
  - URL query string에 `confidence` 파라미터 추가
  - E2E/디자인 검증에서 필터 5개, Low 신뢰도 결과 1건, URL 동기화 확인
- 검증:
  - `npm run quality` 통과
## 2026-06-19 전장 사례 유무 필터 추가

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 실제 전장 사례가 있는 장비만 빠르게 좁혀 볼 수 있게 한다.
  - 반대로 사례가 없는 장비를 데이터 보강 대상으로 식별할 수 있게 한다.
- 결과:
  - 장비 검색 필터에 `전장 사례` 선택 상자 추가
  - `사례 있음`, `사례 없음` 기준 검색 지원
  - URL query string에 `cases` 파라미터 추가
  - 결과 요약 복사와 CSV 다운로드에 전장 사례 수 포함
  - E2E/디자인 검증에서 필터 6개, 사례 있음 결과 7건, URL 동기화 확인
- 검증:
  - `npm run quality` 통과
## 2026-06-19 검색 결과 정렬 기준 추가

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 필터링된 장비 결과의 검토 우선순위를 빠르게 정할 수 있게 한다.
  - 정렬 기준도 검색 링크 공유와 새로고침 복원 대상에 포함한다.
- 결과:
  - 검색 패널에 `정렬 기준` 선택 상자 추가
  - 기본순, 출처 신뢰도 높은순, 전장 사례 많은순, 계열 많은순, 최근 확인일순 지원
  - URL query string에 `sort` 파라미터 추가
  - 결과 요약 복사와 CSV 다운로드가 정렬된 순서를 그대로 사용
  - E2E/디자인 검증에서 필터/정렬 select 7개, 전장 사례 많은순 첫 결과 Boxer, URL 동기화 확인
- 검증:
  - `npm run quality` 통과
# 2026-06-20 팀 후보 목록 추가

## 진행 중 작업

- 없음

## 완료 작업

### 2026-06-20 팀 후보 목록 추가

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀원이 검색 중 후보 장비를 몇 개만 골라 회의용으로 비교/공유할 수 있게 한다.
  - 별도 비교 페이지를 되살리지 않고 검색 중심 화면 안에서 처리한다.
- 결과:
  - 선택 장비 패널에 `후보 추가/후보 제외` 버튼 추가
  - `팀 후보 목록` 패널 추가
  - 후보 열기, 후보 제거, 후보 전체 비우기 추가
  - 후보 요약 복사 기능 추가
  - 후보 목록은 최대 6개 유지
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - 권한 상승 후 `npm run quality` 통과
# 2026-06-20 후보 목록 공유 URL 지원

## 진행 중 작업

- 없음

## 완료 작업

### 2026-06-20 후보 목록 공유 URL 지원

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀 후보 목록을 새로고침과 링크 공유 후에도 복원되게 한다.
  - 기존 검색 공유 URL 구조를 유지하면서 후보 목록만 추가한다.
- 결과:
  - `shortlist` query string 추가
  - 후보 추가 시 URL 동기화
  - 후보 제거/비우기 시 URL query 제거
  - 공유 URL 직접 진입 시 후보 목록 복원
  - e2e/design 검증에 URL 동기화와 복원 조건 추가
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - 권한 상승 후 `npm run quality` 통과
# 2026-06-20 후보 링크 복사 액션 추가

## 진행 중 작업

- 없음

## 완료 작업

### 2026-06-20 후보 링크 복사 액션 추가

- 상태 전이: new_task -> planned -> executing -> verifying -> completed
- 목표:
  - 팀 후보 목록 패널 안에서 직접 공유 링크를 복사할 수 있게 한다.
  - 기존 검색 링크 복사 버튼을 찾는 반복 작업을 줄인다.
- 결과:
  - `후보 링크 복사` 버튼 추가
  - 후보 action 버튼을 2개에서 3개로 확장
  - 후보가 없으면 후보 action 전체 비활성화 유지
  - 후보 링크 복사 성공/실패 상태 메시지 추가
  - e2e/design 검증에 후보 링크 복사 버튼 수와 action 활성화 수 추가
- 검증:
  - `npm run typecheck` 통과
  - `npm run lint` 통과
  - 권한 상승 후 `npm run quality` 통과

## 2026-10-16 · 발표 배포

- 목표: GPT 인증 없는 32장·30분 HTML, 실제 캡처·허용 미디어·개념 애니메이션, 대본·출처·오프라인 묶음.
- 변경: `presentations/ai-curiosity/**`, 공개 빌드의 해당 폴더 복사, 프로젝트 기록.
- 영향: 발표 경로만 추가하며 기존 장비 기능은 변경하지 않음.
- 위험: 회사망, WebGL, file URL 정책, 외부 iframe 및 미디어 재생.
- 검증: 로컬 링크·자산·시간 합계·JS 구문, Pages 공개 응답, 실제 브라우저 조작·전체 장표 캡처.
- 승인 근거: 사용자의 최종 지시에서 GitHub 업로드·공개 정적 배포까지 명시적으로 요청.
- 상태 전이: new_task → planned → executing → verifying.

### 발표 브라우저 검수 결과 · 2026-10-16

공개 Pages에서 32장 렌더링, 두 영상 재생, 댐핑 정지/재생, REA 6단계, CAN 단계, 발표자 동기화, 시연 복귀, 모바일 크기 뷰포트 확인. 이미지 사전 로딩과 REA 버튼 간격 보완. 네이티브 전체화면·file://는 검수 브라우저 제약을 명시하고 발표 모드·파일 의존성을 분리 검증. 회사 PC·실물 휴대폰과 실차/연구 재현 실험은 미확인. 상태: verifying → completed (배포된 HTML 기능 범위). 배포 파일의 `verification.txt`에 세부 범위를 유지한다.


## 발표 V2 · executing (2026-10-18)
- 사용자 승인: 전체 고도화, REA·게임 애니메이션, 문구 적용, 버전 및 롤백.
- 상세 계획: PRESENTATION_V2_PLAN.md
- 상태: new_task → planned → executing

### 발표 V2 완료
executing → verifying → completed. 장표40개·애니메이션·대본·미디어 검수, V1 보존, V1→V2 로컬 롤백명령, 공개 버전 경로200 확인.

## 발표 V3 배포 마무리 · 2026-10-18
- 승인: 현재 완성된 V3를 배포하고 V2를 보존한다. 추가 기능은 만들지 않는다.
- 상태 전이: new_task → planned → executing → verifying.
- 계획: V3 검수 문서·미디어 기록을 현재 파일에 맞추고, 브라우저와 공개 경로를 확인한 뒤 배포 결과를 기록한다.
- 완료: 회귀 150개, 자산·출처·장표 수 검사, V2 63파일 보존, 글꼴 한글 누락 0자 확인, 발표 직전 체크리스트 수정.
- 진행: 실제 브라우저 조작·재생 검수, 기본 버전·버전 목록 반영, 공개 배포 확인.
- 한계: 실물 포인터·발표 PC·회사망·file:// 실행은 현장 확인 대상.

### 발표 V3 배포 완료 · 2026-10-18
- 상태 전이: verifying → completed (배포 및 아래 확인 범위).
- 완료: Pages 실행 39098645774 성공, 공통 주소 V3 이동·37장 표시, 버전 목록 V3/V2/V1.
- 실제 브라우저: PageDown 1→2/PageUp 2→1, REA 다음 1→2/이전 2→1/화면 버튼 다음 1→2, Beat Saber·Waymo 12초 영상 재생 확인.
- 한계: 37장 전체·REA 24단계 전체·모바일·발표자 동기화·전체화면은 이번에 전수 재검증하지 않았으며 실물 포인터·발표 PC·회사망·file://는 미확인.
- V2 공개 원격 Git tree SHA 1753852773f034713b25c20ddca21e354419f21a 불변 확인. 실제 브라우저에서 V2 첫 화면과 총 40장 표시 확인.

## 발표 V4 시각화 개선 · 2026-10-18
- 사용자 승인: 기존 장표의 차량·뇌를 실제 자료를 참고해 정교하게 개선.
- 완료: 영상·공식 참고 자료 확인, 새 렌더러 두 개, 신호 연결·배치·출처·대본 갱신.
- 진행: 글꼴·150개 조작 회귀·공개 브라우저 검수와 배포.

### 발표 V4 배포 검수 통과 · 2026-10-18
상태: verifying. V4 공개 경로 검수 통과, 기본 주소 전환 진행.
- 17번장표의 실제화면, 포인터재생·일시정지·초기화·다음장표·복귀 확인. Pages39107770197 성공. V1/V2/V3 git tree 불변.
- JS구문·150개조작회귀·37장/1800초자산빌드·한글누락0 검사통과.

### 발표 V4 완료 · 2026-10-18
상태: verifying → completed (배포 및 명시한 검증 범위).
- 기본 발표 주소에서 V4/17번으로 이동 확인. 버전 목록 V4/V3/V2/V1 확인.
- 원본 V1/V2/V3 원격 tree 보존. 37장·1800초 및 기존조작유지.
- source main82c0ffd61e634fbe19e21932a2a0fa18e0ae5bbd, 공개기본전환 gh-pages74820020b64635869dbe3fb5ec3c0b9c0da4b720.
- 최종기록용 글꼴 문구를 추가 반영했으며 글꼴148160바이트·한글누락0.
- JS구문, 조작회귀150개, 장표자산빌드, 신규렌더API, 공개17장화면·재생/정지/초기화·인접장표이동 통과.
- 실제 CAD·신경데이터·차량동역학 검증은 포함하지 않음. 모바일·실물포인터·발표PC는 현장확인범위.

## 발표 V7 재제작 · 2026-10-20
- 상태: planned → executing. 사용자 현재 7개 수정 지시를 구현 승인으로 적용.
- 목표: 기존 발표를 V7로 복사, 색상 통일, 장표 전환 모션, 수동 페이지 이동, 9~11장 수정, FlyWire 연구 소개 1장, 뇌 활동 개념 시각화 개선.
- 범위: presentations/ai-curiosity/versions/v7 및 발표 진입점·버전 목록. 기존 V6와 세계장비 웹앱 기능 보존.
- 파일: app.js, index.html, slides.js/json, sources.js/json, 스타일, brain-renderer.js/damping.js, 대본/안내.
- 리스크: 단계 이동 회귀, 애니메이션 cleanup, 작은 화면 조작, 출처와 개념 시각화 구분.
- 검증: JS 구문, 데이터·자산 참조 검사, 번호 이동/단계 이동/영상 재생과 대표 장표 화면 확인.
- 지속 지침: 발표 시간·분량 상한 없음. 최근 사례는 추가 요청마다 갱신하며 두 가지/세 가지 같은 고정 개수 제목을 사용하지 않음.

## 발표 V7 재제작 검증 · 2026-10-20
- 상태: executing → verifying. 소스 및 대표 브라우저 동작 검증 완료, GitHub 공개 반영 진행.
- 39장, slides.js/json 일치, 고유 ID·출처·미디어 참조 검사 통과. node --check 전체 JS 통과. node scripts/build-presentation.mjs V7 성공.
- Nature 원논문과 FlyWire 공식 설명 교차 확인: 2024 FAFB 139,255 뉴런, 약 5,450만 시냅스. 반응 예측 사례 별도 논문 명시.
- Chrome 로컬 검수: 9장 세 사례와 부제 제거, 10장 이미지 단독, 11장 제목 단독, 12장 연구 소개 배치 확인.
- 직접 입력+이동 버튼 및 Enter: 10/18/14/27장 이동 확인. REA 1↔2 단계 유지. 주행 영상 duration=10, paused=false, time 진행 확인. 댐퍼 시간 3.00→3.78 및 정지·개념 표기 확인.
- 모바일 390×844 / 844×390 iframe 조작부 표시, 세로 화면에서 12장 입력 이동 확인. 실물 휴대폰/발표 PC/실물 포인터는 미시험.
- 신경 렌더러: native Canvas 시간별 변화, seek/reset 결정성, start/pause/destroy 검사 통과. 실제 신경 활동/실차 제어 검증이 아님.
- V6 git diff 없음. 세계장비 웹앱 코드는 수정하지 않음.

## 발표 V7 공개 완료 · 2026-10-20
- 상태: verifying → completed (명시한 검증 범위). 사용자 요청 7개 구현 및 기존 GitHub 발표 주소의 V7 연결 완료.
- 소스 commit: 38c4559fdda0bb33f6c3b44e4f796cdf2766f141
- 공개 commit: 2e6e056f93d70d5e6524a39068b155a13f7020a9
- 공개 주소: https://defense-astra.github.io/presentations/ai-curiosity/versions/v7/
- 실제 Chrome에서 공통 발표 주소→V7 자동 이동, V7·39장 표시 및 번호 입력 컨트롤 확인.
- 새 연구 장표 12장, 댐퍼 장표 18장. 기존 V6 및 세계장비 웹앱 버전 경로 보존.


## V7 추가 조정 · 2026-10-20
- 상태: planned → executing. 사용자 추가 수정 지시를 구현·기존 공개 주소 반영 승인으로 적용.
- 현재: V7 39장 공개 완료, 번호 이동과 기존 단계 시연 검증 완료.
- 목표: 장표 전환 440ms→600ms, REA 질문 및 Thales 대응 사례 2장 추가, 뇌 신호를 국소 영역별로 동기화.
- 범위: V7 app.js·v7-theme.css·slides/sources·brain-renderer·대본/안내, 발표 버전 메타데이터.
- 검증: 공식 발표와 실험·제품 설명 교차 확인, 구문/데이터/자산 빌드, 신규 장표 배치·페이지 이동·국소 활성 화면 확인.
- 리스크: 장표 추가 후 번호 불일치, 긴 전환 중 빠른 이동 잔상, 자체 실험 수치의 과장. 전환 정리 로직 유지, 숫자 동기화, 실험 조건 표기.
- 분량 상한을 두지 않음. Thales 사례는 AI 역공학 대응 사례이며 REA에 직접 대응했다는 인과를 주장하지 않음.


## V7 추가 조정 검증 · 2026-10-20
- 상태: executing → verifying. 41장, 32장 질문·33장 Thales 사례 추가. 전환 등장 600ms/퇴장440ms.
- 영역별 공통 밝기: 1초 유지·0.35초 인접 영역 전환, 무작위 독립 반짝임 제거.
- Thales 공식 출시·실험·제품 설명 교차 확인. 161KB/의도적 취약점10개, 자체 실험8→0개이며 취약점 제거 아님을 명시.
- slides/sources JS·JSON 미러, 고유 ID·미디어·출처·대본 검사, node --check 및 build-presentation 통과. 글꼴 한글 누락0.
- Chrome 실제 화면: 32/33장 배치, 번호 입력 Enter, 연속 다음·이전 및 잔상 요소0 확인. 18장 재생·정지 및 국소 발광 확인.
- 렌더러 네이티브 Canvas: 시간별3프레임, seek/reset 결정성·start/pause/destroy 확인. 실측 신경 활동/실차 제어 검증 아님.
- V6 및 세계장비 웹앱 변경 없음. 발표 PC·실물 포인터는 현장 확인 대상. 공개 반영 진행.


## V7 추가 조정 공개 완료 · 2026-10-20
- 상태: verifying → completed (명시한 검증 범위).
- 41장 공개, 전환0.6초, 32장 REA 질문·33장 Thales 대응, 국소 영역별 뇌 활성 반영.
- 소스 commit: 27ebec54eb7ab01a9de76d188541cf81b0447ac9
- 공개 commit: c9142683b8585bb479a41c6b6b3c29d8aaadaee5
- GitHub Pages 실행39360962249 성공. Chrome 공개 주소에서41장과33장 실제 내용·번호 이동 확인.
- 공개 주소: https://defense-astra.github.io/presentations/ai-curiosity/versions/v7/


## 발표 V8 제작 · 2026-10-20
- 상태: planned → executing. 사용자 현재 V8 제작·계속 진행 지시를 구현 및 기존 GitHub 공개 경로 반영 승인으로 적용.
- 원본: V7 41장, source main 153713e, 공개 gh-pages c914268. V8 미저장 상태에서 재개.
- 목표: 한쪽의 연결된 국소 영역에 연속 파장을 표현하고 SolidCraft 기본 모델링·도면 해석·사진 기반 개념 목업 장표 추가.
- 수정 범위: versions/v8, 발표 버전 목록/진입점, 작업 기록. V7 및 장비 웹앱 보존.
- 리스크: 새 장표 번호/출처 동기화, 국소 발광의 분산/점멸 재발, 사진에서 정밀 CAD 복원으로 과장되는 표현.
- 검증: 공식 저장소와 문서 2차 대조, 구문/데이터/자산 빌드, 브라우저 장표·이동·연속 파장 확인, GitHub Pages 공개 상태.


## 발표 V9 나비에–스토크스 · 2026-10-20
- 상태: new_task → planned → executing. 사용자 V9 추가 지시 및 기존 공개 발표 업데이트 맥락을 승인으로 적용.
- 현재: 원격 main d46728f의 V8 44장, GitHub Pages gh-pages 2d84155.
- 목표: AI의 나비에–스토크스 특이점 증명 제안, 나선형 유동 개념 애니메이션, 설계 업무 시사점 3장 추가.
- 파일: versions/v9의 slides/sources/app/index/style/renderer/대본, 발표 버전 목록과 진입점, 작업 기록. 기존 구조 유지.
- 연구: OpenAI 2026-09-08 원문·원논문과 Clay 09-11 성명 및 10-06 비판논문 교차 검토. 무한 개 해가 아니라 유한시간 속도 발산. 매끄러운 외력 조건과 검증 논의 명시.
- 리스크: 연구성과 확정 과장, 회전만으로 특이점 발생 오해, 장표 추가 후 조작과 번호 불일치.
- 검증: 자료 2차 검증, JS·자료 미러·미디어 빌드, 애니메이션 재생/정지/초기화, 기존 조작 및 신규 장표 화면 검사.


## 발표 V9 검증 · 2026-10-20
V9 검증 · 2026-10-20
상태: executing → verifying
47장, 기존44장(사례 목록 S09 갱신 외) 보존, NS01~NS03 추가.
검증: 모든 JS node --check, slides/sources JS·JSON 동일, 고유ID47개, 미디어·출처·대본 참조 검사, 한글글리프 누락0, 기존 미디어 바이트 보존 통과.
node scripts/build-presentation.mjs 통과: V9,47장,2325초(발표 시간 상한 아님).
Chrome: 신규10~12장 및9장 목록 확인, 번호 입력 이동, 나선 자동재생·정지·초기화 확인. 390x844와844x390 iframe 화면 확인(실물 휴대폰 시험 아님).
독립 코드 검토로 반복12초 후 진행 막대 고정 문제를 발견해 누적시간%12로 수정.
원논문·공식 발표와 Clay 성명·독립 비판논문을 대조. 검증 논의 상태 명시.
한계: 과학 계산 엔진/CFD 해석이 아닌 개념 애니메이션. 기존 모든 영상·실물 포인터·발표 PC 전수 시험은 수행하지 않음.
- 기존 GitHub 발표 주소의 V9 공개 반영 진행.


## 발표 V9 공개 완료 · 2026-10-20
- 상태: verifying → completed. 47장, 신규 나비에–스토크스 10~12장.
- 소스: e6725d34c87ac52f01caba71f8dc40aafe978579. 공개: dc058f6a6382096e8b7a7680454b11029db78776.
- Pages 실행 39440420195 success. 공개 V9/10에서 새 내용·47장·조건·검증 상태를 직접 확인.
- 공개 주소: https://defense-astra.github.io/presentations/ai-curiosity/versions/v9/#10
- 나선 회전·중심 유입·축방향 유출·코어 수축과 재생/정지/초기화/시간 조절 구현. 설명용 애니메이션으로 CFD 결과와 구분.
- 기존 V8 및 이전 발표 tree 보존. 세계장비 웹앱 변경 없음.
- 검증 범위: 구문·자료·글꼴·미디어 참조, 신규 장표 및 번호 이동, 화면 크기별 표시. 실물 발표 PC/포인터와 모든 기존 영상의 전수 검사는 별도.


## V9 12번 AI 증명 과정 설명 · 2026-10-21
- 상태: new_task → planned → executing. 사용자의 12번 장표 교체 지시를 구현·기존 공개 주소 반영 승인으로 적용.
- 목표: 기존 난점과 AI의 접근을 3행 비교로 간략화. 병렬 탐색, 소용돌이·진동 보정, 증명·형식화를 설명.
- 수정: V9 app.js, navier.css, slides JSON/JS, 대본, 글꼴·미디어 명세, 검증 기록.
- 영향: NS03(12번)만 교체. 47장 구성과 기존 애니메이션·조작 유지.
- 리스크: AI만 가능하다는 과장, 해의 개수와 속도 발산 혼동, Lean 검사와 수학계 확정 평가 혼동. 공식 발표·원논문을 대조하고 검증 논의 각주 유지.
- 검증: 자료 미러·한글 글리프·JS 구문·발표 빌드, 12번 브라우저 배치와 인접 이동, 공개 배포 확인.


## V9 12번 설명 교체 검증 · 2026-10-21
- 상태: executing → verifying. 기존 난점과 AI 접근의 3행 비교로 변경.
- 공식 발표 How we found the proof와 원논문 §1–2를 재대조하고 별도 검토자 확인. 약 1만 에이전트의 병렬 탐색·성과 공유, 수축 소용돌이와 진동 보정, 해석적 증명·Lean 형식화를 구분. 특정 외력 조건과 검증 논의 표기 유지.
- node --check app.js 및 slides.js, node scripts/build-presentation.mjs 통과: V9 47장, 2325초, 참조 자산 모두 존재. JSON/JS·대본 미러 일치, 한글 글리프 누락0.
- origin/main 비교: NS03만 자료 변경, 나머지46장·나선 렌더러 보존.
- Chrome 로컬 화면: 12번 전체3행과 각주/쪽수 가독성, 11→12 이전·다음 이동 확인. 정적 문구 교체로 기존 애니메이션 전수 재시험은 수행하지 않음.


## V9 12번 공개 완료 · 2026-10-21
- 상태: verifying → completed. 기존 난점과 AI의 접근을 탐색·구성·증명 3행 비교로 반영. 대본·자료·글꼴 동기화 완료.
- 소스 edc34c5e3d9b2dbffaa724c5d94114eb7e5c4dc2, 공개 8c95af49743d95c10c93b7124e38565403ebef8e. Pages 실행39500967832 success.
- 실제 공개 주소 https://defense-astra.github.io/presentations/ai-curiosity/versions/v9/#12 에서 제목,3행,검증 각주,12/47 확인.
- 화면 증거: presentations/ai-curiosity/qa/v9-slide12-20261021.jpg. 기존46장·나선 렌더러·세계장비 웹앱 보존.


## V9 Lean 설명 추가 · 2026-10-21
- 상태: new_task → planned → executing. 사용자 요청에 따라 12번 Lean 제목 아래 쉬운 정의를 추가하고 발표 대본을 동기화.
- 범위: V9 app.js와 slides·speaker 자료, 작업 기록. 47장과 기존 레이아웃 유지.
- 근거: Lean 공식 소개와 Theorem Proving in Lean 4 Introduction 두 문서 대조. 증명 단계 검사 도구로 설명.
- 검증 계획: JS·자료 일치·글꼴 확인 후 발표 빌드, 공개12번 화면 확인.


## V9 Lean 설명 추가 완료 · 2026-10-21
- 상태: executing → verifying → completed. 12번 Lean 제목 아래 “Lean(린): 증명의 논리 단계를 컴퓨터로 검사하는 도구” 추가, 발표 대본 동기화.
- Lean 공식 소개와 공식 교재의 정의를 대조하고 독립 문구 검토 완료. JS 구문·47장 자료 미러·한글 글꼴·발표 빌드 통과. Chrome 로컬 배치 및 공개 문구 확인.
- 공개 commit66dc571bd2cdcc3a915629398c7ef56fa471590e, Pages 실행39503525272 success. https://defense-astra.github.io/presentations/ai-curiosity/versions/v9/#12
- 화면 증거: presentations/ai-curiosity/qa/v9-slide12-20261021.jpg. 변경된 문구와 대본 이외의 장표/기능은 보존.


## 공개 화면의 저장소·버전 탐색 제거 · 2026-10-22
- 상태: new_task → planned → executing. 사용자의 삭제·수정 지시를 이 범위의 구현 및 공개 반영 승인으로 적용.
- 목표: 웹앱 V6와 발표 V9에서 사용자 GitHub 저장소 및 이전 버전으로 이어지는 UI 제거.
- 범위: 공개/일반 빌드의 버전 배너와 진입점, 발표 V9 도구모음·발표 진입점·버전 선택 생성기, 공개 gh-pages HTML.
- 목록 주소는 현재 버전으로 이동. 기존 버전 파일과 Git 이력은 보존. 발표의 제3자 연구 출처는 유지.
- 위험: 깊은 경로에서 배너가 재등장하거나 재빌드 시 복원되는 문제. 생성 코드와 배포 HTML을 함께 수정.
- 검증: JS 구문·발표 빌드·웹앱 빌드, 생성물 전체 링크 검사, 배포 상태 및 원격 파일 재검증.


## 공개 화면 탐색 링크 정리 검증 · 2026-10-22
- 상태: executing → verifying. 웹앱 V6의 24개 경로에서 버전 목록 제거, 발표 V9 도구모음의 버전 기록 제거.
- 목록 주소는 현행 웹앱/발표로 리다이렉트. 사용자 저장소 링크 제거. 일반·공개 빌드 및 발표 버전 전환 생성기에 동일 정책 반영.
- 검증: npm run build, node scripts/build-public-release.mjs, node scripts/build-presentation.mjs 통과. 47장/2325초 및 참조 자산 존재. 수정 JS node --check, git diff --check 통과.
- 링크 검사: 일반 빌드 27개, 공개 빌드 33개, 배포 후보 33개 HTML에서 버전 탐색 문구와 사용자 GitHub 링크 부재 확인. 과거 버전·발표 장표 데이터·런타임 JS 미변경 확인.
- 기존 번들 크기 경고만 발생. 브라우저 화면 배치·실물 발표 기기 재검증은 수행하지 않음.
- 기존 gh-pages로 공개 반영 진행.


## 공개 반영 완료 · 2026-10-22
- 상태: verifying → completed.
- 소스 수정 e6d09ea3ec7c5f4b8d4560792a243754225d8064, 공개 176e3698629299ae148b3e9f163b469117bb9948.
- GitHub Pages 실행 39709830961 completed/success.
- 공개 HTTP 검사: /versions/v6/, /versions/v6/equipment/boxer/, /versions/, /presentations/ai-curiosity/versions/v9/, /presentations/ai-curiosity/versions/ 모두 HTTP 200. 버전 목록·버전 기록 및 사용자 GitHub 저장소 링크 부재 확인.
- 수정 커밋의 V6·V9 HTML 재조회도 통과. 기존 공개 URL 사용. 브라우저 화면 및 실물 기기 재검증은 수행하지 않음.


## 웹앱 V10 · 2026-10-26
- 상태: new_task → planned → executing. 사용자의 변경사항 적용 지시와 기존 GitHub 공개 배포 선호를 이 범위의 구현·배포 승인으로 적용.
- 현재: 웹앱 V6, 별도 발표자료 V9. React/Vite 기존 구조와 공개 gh-pages 방식 유지.
- 목표: 공개 피탄·손상 사례의 근거/한계·복구 중심 분석, BOXER/STRYKER 구성표, 실제 캡처 기반 변경사항 탭, 차량 내부사진 추가 시연.
- 파일: 신규 V10 컴포넌트·자료·스타일, App 경로 연결, releases.json/버전 패키징, 캡처와 공개 사진 자산.
- 범위: 웹앱 신규 기능만. 기존 검색·지도·3D·의견 기능 및 발표자료 유지. V6 공개본 보존, /versions/v10/ 추가.
- 리스크: 공개 사례의 표본 편향·원인 단정, 서로 다른 국가 사양 혼합, 이미지 라이선스/접근 불량, 경로 새로고침/모바일 회귀.
- 검증: 자료 원문과 2차 대조, 빌드·기존 테스트·데이터 검증·차이 검사, 브라우저 신규기능/기존기능·화면 캡처, 배포 상태와 공개 페이지 확인.


## 웹앱 V10 검증 · 2026-10-26
- 상태: executing → verifying. 신규 피탄·손상/옵션표/내부사진/변경사항 화면 구현.
- 자료: 피탄사례6 + 복구기록1, 위협유형4개 비교, 해석관점6개, 드론동향1. BOXER·STRYKER 각10계열형과11구성 항목. 4차종 내부사진7장.
- 자료 점검: 제조사·군·정부 원문 1차 조사 후 독립 재검토. 상태·기본구성·예시옵션 구분, Stryker 과거운용 근거시점 명시. 사진 메타+실제 이미지 확인, 저작자·라이선스·재압축 표시.
- 통과: npm run build, npm run test(7파일33개), node --import tsx scripts/validate-data.mjs, 수정 TS/TSX ESLint, 배포 스크립트 구문, git diff --check.
- 기존 test의 v6 문자열을 releases.current 검증으로 바꿔 V10 메타데이터와 일치시킴.
- 환경 제약: npm run validate:data의 tsx CLI IPC가 EPERM으로 실패해 동일 스크립트를 node --import tsx로 실행해 통과.
- 전체 npm run lint는 기존 발표자료 JS의 browser globals 설정/기존 변수 경고 등 811건으로 실패. 해당 발표파일 미수정; 변경 파일 lint는 통과.
- 브라우저: IED필터4건, 초기화7건, 분석4유형·6관점; BOXER 관심 선택/복사 대체 textarea, 차종전환 초기화, CSV 파일내용 확인; 내부사진 BOXER2/CV90 2/전체7, 확대닫기; 실제 캡처4장.
- 모바일: 390px iframe 3화면 및 CV90 필터 확인, 옵션 body clientWidth/scrollWidth=375/375. 실물기기 시험은 아님.
- 검증 한계: HTTP preview에서 Clipboard API 미지원으로 수동복사 fallback 확인; HTTPS 공개본에서 복사 재확인 예정. 기존 외부 OSM 타일은 자동화 브라우저에서403으로 표시됨, 지도코드는 미변경.
- 기존 V6 37파일은 gh-pages176e369 원본과 바이트 일치. 발표 V9와 이전 배포파일 유지.


## 웹앱 V10 공개 완료 · 2026-10-26
- 상태: verifying → completed. 신규 4개 탭 및 실제 캡처·내부사진 공개 완료.
- 소스: 793bcefd1183370a412fa818852981606c75ac76. 공개: de9edc67a84afe4a2ac71e71d41eac4d3c19d552. GitHub Pages 실행40287033269 completed/success.
- 공개 URL: https://defense-astra.github.io/versions/v10/changes
- 공개 검증: V10 기본·신규4경로, 캡처4장, 내부사진2장, V6, 발표V9 등13개 URL 모두 HTTP200 및 배포 빌드와 바이트 일치.
- HTTPS 옵션표에서 360° 상황인식 항목 선택 후 관심 구성 복사 성공. 실제 클립보드의 차종·계열형·선택 항목·주의문 확인.
- 공개 변경사항 화면에서 실제 캡처4장과 기능 이동 버튼 확인. 화면 증거 qa/v10-live-changes.jpg, HTTP 검증 qa/v10-public-verification.json.
- 빌드·33개 테스트·자료 검증 통과. 기존 발표자료 전체 lint 문제와 자동화 브라우저 OSM 타일403은 앞선 검증 기록의 범위·한계를 유지함.


## 웹앱 버전 정정 V10 → V7 · 2026-10-26
- 상태: new_task → planned → executing. 사용자의 버전 변경 지시를 구현·기존 공개주소 반영 승인으로 적용.
- 목표: 기능·자료는 그대로 두고 웹앱의 버전과 공개 경로를 V7로 정정. 별도 발표자료 버전은 변경하지 않음.
- 수정: releases.json, App/V10Workspace 표시·내보내기, 이미지 크레딧, 실제 화면 캡처, 버전 별칭 생성 스크립트.
- 위험: 공유된 V10 링크 단절과 캡처 안의 V10 잔존. V10 → V7 경로별 자동이동과 신규 캡처로 해소. 내부 파일·CSS 식별자는 호환성 유지를 위해 유지.
- 검증: 빌드·기존 테스트·변경 파일 검사, 독립 범위 검토, 공개 V7 화면과 기존 V10 경로 이동 확인.


## 웹앱 V7 버전 정정 완료 · 2026-10-26
- 상태: executing → verifying → completed. 기능은 유지하고 정식 버전을 V7로 정정. UI·복사 제목·CSV 파일명·크레딧과 실제 캡처3장 동기화.
- 공개 commit: 89825d46e58102aa97da101c0de87c62b89ec584. GitHub Pages 실행40288728168 completed/success.
- 공개 URL: https://defense-astra.github.io/versions/v7/changes
- 검증: npm run build 및 node scripts/build-public-release.mjs 통과, npm run test 7파일33개 통과, 변경 TS/TSX/스크립트 ESLint 및 git diff --check 통과. 기존 번들 크기 경고 유지.
- 독립 재검토: 별칭28경로×slash/no-slash/index.html 형태 총84건에서 경로·쿼리·해시 보존 확인.
- 공개 브라우저: /versions/v10/changes 접속 후 /versions/v7/changes 자동이동, V7 배너·메뉴·본문·캡처4장 정상 표시 확인. 증거 qa/v7-live-changes.jpg.
- 발표자료와 기존 버전 보관자료는 변경하지 않음. 내부 V10 컴포넌트/CSS/미디어 경로는 식별자로 유지하며, 과거 V10 기록은 정정 이력으로 보존.
