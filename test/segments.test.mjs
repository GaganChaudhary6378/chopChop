import assert from "node:assert/strict";
import test from "node:test";
import { formatTime, isValidSegment } from "../src/lib/segments.js";

test("formats timestamps as minutes and seconds", () => {
  assert.equal(formatTime(0), "0:00");
  assert.equal(formatTime(65.8), "1:05");
});

test("accepts only bounded forward segments", () => {
  assert.equal(isValidSegment([30, 130], 600), true);
  assert.equal(isValidSegment([130, 30], 600), false);
  assert.equal(isValidSegment([-1, 30], 600), false);
  assert.equal(isValidSegment([30, 601], 600), false);
});
