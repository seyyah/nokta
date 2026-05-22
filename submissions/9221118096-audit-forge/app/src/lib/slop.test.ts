// Runnable with Node 24 native type-stripping:
//   node --test --experimental-strip-types src/lib/slop.test.ts
// Acts as the deterministic TEST gate for forge cycles that touch slop logic.
import { test } from "node:test";
import assert from "node:assert/strict";
import { slopTier, slopLabel } from "./slop.ts";

test("slopTier buckets by threshold", () => {
  assert.equal(slopTier(12), "grounded");
  assert.equal(slopTier(39), "grounded");
  assert.equal(slopTier(40), "mixed");
  assert.equal(slopTier(69), "mixed");
  assert.equal(slopTier(70), "slop");
  assert.equal(slopTier(97), "slop");
});

test("slopTier clamps out-of-range input", () => {
  assert.equal(slopTier(-10), "grounded");
  assert.equal(slopTier(250), "slop");
});

test("slopLabel matches tier", () => {
  assert.equal(slopLabel(12), "GROUNDED");
  assert.equal(slopLabel(55), "MIXED");
  assert.equal(slopLabel(90), "PURE SLOP");
});
