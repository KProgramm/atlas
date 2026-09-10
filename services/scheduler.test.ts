import { describe, it, expect, vi, afterEach } from "vitest";

import { isDue } from "@/services/scheduler";

const HOUR = 60 * 60 * 1000;

afterEach(() => {
  vi.useRealTimers();
});

describe("isDue()", () => {
  // Branch 1: status !== "active" -> never due, regardless of nextReviewAt
  describe("inactive status", () => {
    it("returns false when status is not active, even if nextReviewAt is null", () => {
      expect(isDue({ status: "archived", nextReviewAt: null })).toBe(false);
    });

    it("returns false when status is not active, even if nextReviewAt is in the past", () => {
      expect(
        isDue({ status: "archived", nextReviewAt: new Date(Date.now() - HOUR) }),
      ).toBe(false);
    });

    it("returns false for other non-active statuses", () => {
      expect(isDue({ status: "paused", nextReviewAt: null })).toBe(false);
      expect(isDue({ status: "", nextReviewAt: null })).toBe(false);
    });
  });

  // Branch 2: active + nextReviewAt === null -> due immediately (never reviewed)
  describe("null nextReviewAt", () => {
    it("returns true when active and never reviewed", () => {
      expect(isDue({ status: "active", nextReviewAt: null })).toBe(true);
    });
  });

  // Branch 3: active + nextReviewAt set -> due iff nextReviewAt <= now
  describe("past vs future nextReviewAt", () => {
    it("returns true when nextReviewAt is in the past", () => {
      expect(
        isDue({ status: "active", nextReviewAt: new Date(Date.now() - HOUR) }),
      ).toBe(true);
    });

    it("returns false when nextReviewAt is in the future", () => {
      expect(
        isDue({ status: "active", nextReviewAt: new Date(Date.now() + HOUR) }),
      ).toBe(false);
    });

    it("returns true when nextReviewAt is exactly now (<= now)", () => {
      const now = new Date("2026-09-10T12:00:00.000Z");
      vi.useFakeTimers();
      vi.setSystemTime(now);
      expect(
        isDue({ status: "active", nextReviewAt: new Date(now) }),
      ).toBe(true);
    });
  });
});
