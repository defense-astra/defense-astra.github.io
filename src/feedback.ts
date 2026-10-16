export const feedbackCategories = ["기능 개선", "오류 신고", "자료 수정", "기타"] as const;
export type FeedbackDraft = {
  title: string;
  category: typeof feedbackCategories[number];
  detail: string;
  equipmentId: string;
  relatedUrl: string;
};

const storageKey = "defense-astra-feedback-v1";
export const emptyFeedbackDraft: FeedbackDraft = {
  title: "", category: "기능 개선", detail: "", equipmentId: "", relatedUrl: ""
};

export function loadFeedbackDraft(): FeedbackDraft {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(storageKey) || "null");
    if (!saved || typeof saved !== "object") return { ...emptyFeedbackDraft };
    return {
      title: typeof saved.title === "string" ? saved.title : "",
      category: feedbackCategories.includes(saved.category) ? saved.category : "기능 개선",
      detail: typeof saved.detail === "string" ? saved.detail : "",
      equipmentId: typeof saved.equipmentId === "string" ? saved.equipmentId : "",
      relatedUrl: typeof saved.relatedUrl === "string" ? saved.relatedUrl : ""
    };
  } catch {
    return { ...emptyFeedbackDraft };
  }
}

export function saveFeedbackDraft(draft: FeedbackDraft) {
  try { window.sessionStorage.setItem(storageKey, JSON.stringify(draft)); } catch { /* In-memory draft remains available. */ }
}

export function formatFeedback(draft: FeedbackDraft, context: { version: string; writtenAt: string; equipmentName?: string }) {
  return [
    `[Defense Astra 개선 의견] ${draft.title.trim() || "제목 미입력"}`,
    `유형: ${draft.category}`,
    `웹앱 버전: ${context.version}`,
    `작성일: ${context.writtenAt} (한국 시간)`,
    ...(context.equipmentName ? [`관련 장비: ${context.equipmentName}`] : []),
    ...(draft.relatedUrl.trim() ? [`관련 화면: ${draft.relatedUrl.trim()}`] : []),
    "", "[의견 내용]", draft.detail.trim() || "내용을 입력해 주세요."
  ].join("\n");
}
