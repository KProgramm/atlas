import { describe, it, expect } from "vitest";

import {
  intervalForStage,
  nextReviewStage,
  nextMasteryScore,
  PASS_THRESHOLD,
  FAIL_THRESHOLD,
  RECENCY_WEIGHT,
} from "@/services/mastery";

describe("intervalForStage()", () => {
  it("returns the schedule's day count for each in-range stage", () => {
    expect(intervalForStage(0)).toBe(1);
    expect(intervalForStage(1)).toBe(3);
    expect(intervalForStage(2)).toBe(7);
    expect(intervalForStage(3)).toBe(14);
    expect(intervalForStage(4)).toBe(30);
    expect(intervalForStage(5)).toBe(60);
  });

  it("clamps to the last interval for stages beyond the schedule", () => {
    expect(intervalForStage(6)).toBe(60);
    expect(intervalForStage(100)).toBe(60);
  });

  it("clamps negative stages to the first interval", () => {
    expect(intervalForStage(-1)).toBe(1);
  });
});

describe("nextReviewStage()", () => {
  it("advances a stage on a passing score", () => {
    expect(nextReviewStage(0, PASS_THRESHOLD)).toBe(1);
    expect(nextReviewStage(2, 95)).toBe(3);
  });

  it("does not advance past the top of the interval schedule", () => {
    expect(nextReviewStage(5, 100)).toBe(5);
  });

  it("pulls back a stage on a failing score", () => {
    expect(nextReviewStage(3, FAIL_THRESHOLD - 1)).toBe(2);
    expect(nextReviewStage(3, 0)).toBe(2);
  });

  it("does not go below stage 0", () => {
    expect(nextReviewStage(0, 0)).toBe(0);
  });

  it("holds steady on a middling score", () => {
    const middling = (FAIL_THRESHOLD + PASS_THRESHOLD) / 2;
    expect(nextReviewStage(2, middling)).toBe(2);
  });

  it("treats the exact threshold boundaries correctly", () => {
    // >= PASS_THRESHOLD passes, < FAIL_THRESHOLD fails -- boundaries
    // themselves land in "hold steady" / "pass", never accidentally flip.
    expect(nextReviewStage(1, FAIL_THRESHOLD)).toBe(1);
    expect(nextReviewStage(1, PASS_THRESHOLD)).toBe(2);
  });
});

describe("nextMasteryScore()", () => {
  it("sets the score directly on the first review", () => {
    expect(nextMasteryScore(0, 0, 82)).toBe(82);
  });

  it("weights subsequent reviews as an exponential moving average", () => {
    const result = nextMasteryScore(50, 1, 90);
    expect(result).toBeCloseTo(50 * (1 - RECENCY_WEIGHT) + 90 * RECENCY_WEIGHT);
  });

  it("pulls the average down after a weak session", () => {
    const result = nextMasteryScore(90, 3, 20);
    expect(result).toBeLessThan(90);
    expect(result).toBeGreaterThan(20);
  });
});
