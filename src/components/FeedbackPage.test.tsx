// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FeedbackPage } from "./FeedbackPage";
import { emptyFeedbackDraft, loadFeedbackDraft, saveFeedbackDraft } from "../feedback";

const draft = {
  title: "지도 표시 개선", category: "오류 신고" as const,
  detail: "첫 번째 줄\n두 번째 줄 <내용> & 한글", equipmentId: "", relatedUrl: "https://defense-astra.github.io/versions/v6/"
};
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  window.sessionStorage.clear();
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("feedback writing and copying", () => {
  it("copies Korean multiline content and metadata without clearing the draft", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const onChange = vi.fn();
    await act(async () => root.render(<FeedbackPage draft={draft} onChange={onChange} equipment={[]} />));
    const preview = host.querySelector<HTMLTextAreaElement>("textarea[readonly]")!;
    await act(async () => { host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
    expect(writeText).toHaveBeenCalledWith(preview.value);
    expect(preview.value).toContain(draft.detail);
    expect(preview.value).toContain("웹앱 버전: v6");
    expect(host.querySelector<HTMLTextAreaElement>("#feedback-detail")!.value).toBe(draft.detail);
    expect(host.querySelector('[role="status"]')!.textContent).toContain("복사했습니다");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("selects the exact text for manual copy when clipboard permission is denied", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new DOMException("denied", "NotAllowedError")) } });
    await act(async () => root.render(<FeedbackPage draft={draft} onChange={() => {}} equipment={[]} />));
    await act(async () => { host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
    const preview = host.querySelector<HTMLTextAreaElement>("textarea[readonly]")!;
    expect(document.activeElement).toBe(preview);
    expect(preview.selectionStart).toBe(0);
    expect(preview.selectionEnd).toBe(preview.value.length);
    expect(host.textContent).toContain("복사할 내용 전체 선택");
    expect(host.querySelector('[role="status"]')!.textContent).toContain("자동 복사를 사용할 수 없습니다");
  });

  it("does not copy a whitespace-only opinion", async () => {
    const writeText = vi.fn();
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    await act(async () => root.render(<FeedbackPage draft={{ ...draft, detail: " \n " }} onChange={() => {}} equipment={[]} />));
    expect(host.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
    await act(async () => { host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
    expect(writeText).not.toHaveBeenCalled();
  });

  it("restores a draft after reopening and handles unavailable tab storage", () => {
    saveFeedbackDraft(draft);
    expect(loadFeedbackDraft()).toEqual(draft);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("storage unavailable"); });
    expect(() => saveFeedbackDraft(draft)).not.toThrow();
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("invalid json");
    expect(loadFeedbackDraft()).toEqual(emptyFeedbackDraft);
  });
});
