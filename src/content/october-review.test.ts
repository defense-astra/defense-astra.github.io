import { describe, expect, it } from "vitest";
import review from "./october-review.json";
import equipment from "../../public/data/equipment.json";

describe("October update evidence", () => {
  it("links valid equipment and dated, distinct official sources without future event dates", () => {
    const ids = new Set(equipment.map(item => item.id));
    expect(new Set(review.events.map(event => event.id)).size).toBe(review.events.length);
    for (const event of review.events) {
      expect(event.date).toMatch(/^2026-10-\d{2}$/);
      expect(event.date <= review.checkedAt).toBe(true);
      expect(event.source.checkedAt).toBe(review.checkedAt);
      expect(event.equipmentIds.every(id => ids.has(id))).toBe(true);
      const url = new URL(event.source.url);
      expect(url.protocol).toBe("https:");
      expect(["knds.com", "www.gdls.com"]).toContain(url.hostname);
      expect(event.limit.length).toBeGreaterThan(20);
    }
  });
});
