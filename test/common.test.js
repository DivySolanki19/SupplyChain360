import test from "node:test";
import assert from "node:assert/strict";
test("CSV preserves signed numeric values but protects formula-like text", () => {
  assert.equal(csv([[-25, "-25", "=1+1"]]), '\uFEFF"-25","\'-25","\'=1+1"');
});
import { csv, escapeHTML, readStore, saveStore } from "../public/common.js";
test("CSV escapes quotes, commas, newlines and spreadsheet formulas", () => {
  assert.equal(
    csv([["a,b", '"quoted"', "line\nbreak", "=CMD()", null]]),
    '\uFEFF"a,b","""quoted""","line\nbreak","\'=CMD()",""',
  );
  assert.ok(csv([["  +1", "@SUM(1)", "-2"]]).includes("'  +1"));
});
test("HTML escapes untrusted content", () =>
  assert.equal(
    escapeHTML('<img onerror="x">'),
    "&lt;img onerror=&quot;x&quot;&gt;",
  ));
test("Storage rejects corrupt data and duplicate IDs", () => {
  for (const raw of ["invalid", "{}", '[{"id":1},{"id":1}]']) {
    const result = readStore("x", [{ id: 2 }], () => true, {
      getItem: () => raw,
    });
    assert.deepEqual(result.data, [{ id: 2 }]);
    assert.ok(result.warning);
  }
});
test("Storage handles denied access and quota failures", () => {
  assert.ok(
    readStore("x", [], () => true, {
      getItem() {
        throw Error();
      },
    }).warning,
  );
  assert.equal(
    saveStore("x", [], {
      setItem() {
        throw Error();
      },
    }),
    false,
  );
});
test("Storage returns saved records and clones defaults", () => {
  assert.deepEqual(
    readStore("x", [], () => true, { getItem: () => '[{"id":"a"}]' }).data,
    [{ id: "a" }],
  );
  const seed = [{ id: "x" }];
  const result = readStore("x", seed, () => true, { getItem: () => null });
  result.data[0].id = "y";
  assert.equal(seed[0].id, "x");
});
