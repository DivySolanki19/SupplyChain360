import test from "node:test";
import assert from "node:assert/strict";
import { inventory, suppliers } from "../public/data.js";
import {
  validItem,
  demandForecast,
  analyse,
  supplierScore,
  inventorySummary,
} from "../public/domain.js";
test("All seed inventory passes schema validation", () => {
  assert.equal(inventory.length, 12);
  assert.ok(inventory.every(validItem));
});
test("Weighted demand gives recent observations more weight", () => {
  assert.equal(demandForecast([100, 200, 300]), 230);
  assert.equal(demandForecast([0, 0, 0]), 0);
  assert.throws(() => demandForecast([1, 2]));
  assert.throws(() => demandForecast([1, 2, NaN]));
});
test("Reorder threshold and incoming units determine suggested order", () => {
  const item = {
    ...inventory[0],
    demand: [300, 300, 300],
    stock: 100,
    onOrder: 150,
    safety: 20,
  };
  const a = analyse(item, { leadDays: 8 });
  assert.equal(a.reorder, 100);
  assert.equal(a.status, "Reorder");
  assert.equal(a.suggested, 150);
  assert.equal(a.cover, 10);
  assert.equal(
    analyse({ ...item, stock: 101 }, { leadDays: 8 }).status,
    "Healthy",
  );
  assert.equal(
    analyse({ ...item, stock: 0 }, { leadDays: 8 }).status,
    "Out of stock",
  );
});
test("Zero demand and excess incoming supply are safe", () => {
  const a = analyse(
    { ...inventory[0], demand: [0, 0, 0], onOrder: 100000 },
    { leadDays: 8 },
  );
  assert.equal(a.cover, null);
  assert.equal(a.suggested, 0);
});
test("Supplier score uses rates not raw counts", () => {
  assert.deepEqual(
    supplierScore({ deliveries: 100, onTime: 80, units: 1000, rejected: 50 }),
    { onTime: 80, quality: 95, score: 86 },
  );
});
test("Schema rejects invalid inventory mutations", () => {
  for (const patch of [
    { stock: -1 },
    { stock: 1.5 },
    { supplier: "missing" },
    { name: " " },
    { cost: Infinity },
    { demand: [1, 2] },
    { demand: [1, 2, -1] },
  ])
    assert.equal(validItem({ ...inventory[0], ...patch }), false);
});
test("Portfolio summary reconciles inventory valuation", () => {
  const s = inventorySummary(inventory);
  assert.equal(
    s.value,
    inventory.reduce((sum, x) => sum + x.stock * x.cost, 0),
  );
  assert.ok(s.alerts > 0);
  assert.deepEqual(inventorySummary([]), {
    value: 0,
    units: 0,
    alerts: 0,
    monthly: 0,
  });
});
