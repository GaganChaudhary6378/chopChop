import assert from "node:assert/strict";
import test from "node:test";
import { decodeWatchPath, encodeWatchPath, formatTime, isValidSegment, validateSegments } from "../src/lib/core.js";

test("formats timestamps", () => {
  assert.equal(formatTime(65.8), "1:05");
  assert.equal(formatTime(3661), "1:01:01");
});

test("validates segment bounds and overlaps", () => {
  assert.equal(isValidSegment([30, 130], 600), true);
  assert.equal(isValidSegment([130, 30], 600), false);
  assert.equal(validateSegments([[30, 130], [120, 180]], 600), "Segments cannot overlap.");
  assert.equal(validateSegments([[30, 130], [180, 240]], 600), null);
});

test("round-trips a versioned share payload and rejects malformed input", () => {
  const encoded = encodeWatchPath("dQw4w9WgXcQ", [[30, 130]]);
  assert.deepEqual(decodeWatchPath(`#chophop=${encoded}`).path, { v: 1, videoId: "dQw4w9WgXcQ", segments: [[30, 130]] });
  assert.equal(decodeWatchPath("#chophop=not-base64").error, "This shared watch path is invalid.");
});
