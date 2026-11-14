import { bounded, validText } from "./common.js";
import { suppliers } from "./data.js";
export function validItem(x) {
  return (
    x &&
    validText(x.id, 50) &&
    validText(x.name, 100) &&
    ["Electronics", "Components", "Packaging"].includes(x.category) &&
    suppliers.some((s) => s.id === x.supplier) &&
    ["stock", "onOrder", "safety"].every(
      (k) => bounded(x[k], 0, 1000000) && Number.isInteger(x[k]),
    ) &&
    bounded(x.cost, 0, 1000000) &&
    Array.isArray(x.demand) &&
    x.demand.length === 3 &&
    x.demand.every((n) => bounded(n, 0, 1000000) && Number.isInteger(n))
  );
}
export function demandForecast(history) {
  if (
    !Array.isArray(history) ||
    history.length !== 3 ||
    history.some((x) => !Number.isFinite(x) || x < 0)
  )
    throw Error("Three non-negative demand observations are required");
  return Math.round(history[0] * 0.2 + history[1] * 0.3 + history[2] * 0.5);
}
export function analyse(item, supplier) {
  const monthly = demandForecast(item.demand),
    daily = monthly / 30,
    reorder = Math.ceil(daily * supplier.leadDays + item.safety);
  return {
    monthly,
    daily,
    reorder,
    cover: daily ? item.stock / daily : null,
    value: item.stock * item.cost,
    status:
      item.stock === 0
        ? "Out of stock"
        : item.stock <= reorder
          ? "Reorder"
          : "Healthy",
    suggested: Math.max(
      0,
      Math.ceil(reorder + monthly - item.stock - item.onOrder),
    ),
  };
}
export function supplierScore(s) {
  const onTime = s.deliveries ? (s.onTime / s.deliveries) * 100 : 0,
    quality = s.units ? ((s.units - s.rejected) / s.units) * 100 : 0;
  return { onTime, quality, score: onTime * 0.6 + quality * 0.4 };
}
export function inventorySummary(items) {
  return items.reduce(
    (a, item) => {
      const m = analyse(
        item,
        suppliers.find((s) => s.id === item.supplier),
      );
      a.value += m.value;
      a.units += item.stock;
      a.alerts += m.status === "Healthy" ? 0 : 1;
      a.monthly += m.monthly;
      return a;
    },
    { value: 0, units: 0, alerts: 0, monthly: 0 },
  );
}
