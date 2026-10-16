import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { feedbackCategories, formatFeedback } from "../feedback";
import type { FeedbackDraft } from "../feedback";
import type { Equipment } from "../types";
import release from "../../releases.json";

type Props = {
  draft: FeedbackDraft;
  onChange: (draft: FeedbackDraft) => void;
  equipment: Equipment[];
};

export function FeedbackPage({ draft, onChange, equipment }: Props) {
  const [status, setStatus] = useState("");
  const [manualCopy, setManualCopy] = useState(false);
  const [copying, setCopying] = useState(false);
  const [writtenAt] = useState(() => new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date()));
  const preview = useRef<HTMLTextAreaElement>(null);
  const equipmentName = equipment.find(item => item.id === draft.equipmentId)?.name;
  const text = formatFeedback(draft, { version: release.current, writtenAt, equipmentName });
  const ready = Boolean(draft.title.trim() && draft.detail.trim());

  function update<K extends keyof FeedbackDraft>(key: K, value: FeedbackDraft[K]) {
    onChange({ ...draft, [key]: value });
    setStatus("");
    setManualCopy(false);
  }

  function selectPreview() {
    preview.current?.focus();
    preview.current?.select();
  }

  async function copyOpinion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || copying) return;
    setCopying(true);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      setManualCopy(false);
      setStatus("복사했습니다. 메일 본문에 붙여넣어 주세요. 작성 내용은 그대로 유지됩니다.");
    } catch {
      setManualCopy(true);
      setStatus("자동 복사를 사용할 수 없습니다. 선택된 내용을 Ctrl+C 또는 ⌘C로 복사해 주세요. 휴대폰에서는 길게 눌러 복사할 수 있습니다.");
      selectPreview();
    } finally {
      setCopying(false);
    }
  }

  return <section className="feedback-page" aria-labelledby="feedback-heading">
    <div className="feedback-heading">
      <p className="eyebrow">웹앱 개선 의견</p>
      <h2 id="feedback-heading">의견을 작성하고, 메일에 붙여넣으세요.</h2>
      <p>사용 중 불편한 점이나 필요한 기능을 적어 주세요. ‘의견 복사’를 누르면 제목과 내용을 한 번에 복사합니다.</p>
    </div>
    <div className="feedback-layout">
      <form className="feedback-form" onSubmit={copyOpinion}>
        <label htmlFor="feedback-title">제목 <span>필수</span></label>
        <input id="feedback-title" value={draft.title} onChange={event => update("title", event.target.value)} required maxLength={160} placeholder="예: 장비 비교 화면에 항목 추가" />
        <label htmlFor="feedback-category">의견 유형</label>
        <select id="feedback-category" value={draft.category} onChange={event => update("category", event.target.value as FeedbackDraft["category"])}>
          {feedbackCategories.map(category => <option key={category}>{category}</option>)}
        </select>
        <label htmlFor="feedback-detail">상세 내용 <span>필수</span></label>
        <textarea id="feedback-detail" value={draft.detail} onChange={event => update("detail", event.target.value)} required rows={8} placeholder="어떤 화면에서 무엇이 불편했는지, 어떻게 바뀌면 좋을지 적어 주세요." />
        <div className="feedback-optional">
          <label htmlFor="feedback-equipment">관련 장비 <span>선택</span></label>
          <select id="feedback-equipment" value={draft.equipmentId} onChange={event => update("equipmentId", event.target.value)}>
            <option value="">장비 선택 안 함</option>
            {equipment.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <label htmlFor="feedback-url">관련 화면 링크 <span>선택 · 수정 가능</span></label>
          <input id="feedback-url" type="url" value={draft.relatedUrl} onChange={event => update("relatedUrl", event.target.value)} placeholder="https://…" />
        </div>
        <button className="feedback-copy" type="submit" disabled={!ready || copying}>{copying ? "복사 중…" : "의견 복사"}</button>
        {!ready && <p className="feedback-help">제목과 상세 내용을 입력하면 복사할 수 있습니다.</p>}
        <p className="feedback-status" role="status" aria-live="polite">{status}</p>
        <p className="feedback-help">메일은 직접 보내 주세요. 입력한 의견을 서버로 전송하지 않으며, 같은 탭에서 다른 메뉴를 보고 돌아와도 초안이 유지됩니다.</p>
      </form>
      <aside className="feedback-preview">
        <h3>복사할 내용</h3>
        <p>버전·작성일과 선택한 관련 정보를 함께 넣습니다.</p>
        <textarea ref={preview} aria-label="복사할 의견 미리보기" value={text} readOnly rows={16} />
        {manualCopy && <button type="button" onClick={selectPreview}>복사할 내용 전체 선택</button>}
        <p className="feedback-help">복사한 뒤 메일 본문에 Ctrl+V / ⌘V 또는 ‘붙여넣기’를 사용하세요.</p>
      </aside>
    </div>
  </section>;
}
