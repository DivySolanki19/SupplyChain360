import { inventory, suppliers } from "./data.js";
import {
  validItem,
  analyse,
  supplierScore,
  inventorySummary,
} from "./domain.js";
import {
  money,
  number,
  escapeHTML as e,
  stat,
  bars,
  bindCharts,
  readStore,
  saveStore,
  announce,
  download,
  openEditor,
} from "./common.js";
const KEY = "supplychain360.inventory.v1";
let loaded;
try {
  loaded = readStore(KEY, inventory, validItem);
} catch {
  loaded = {
    data: structuredClone(inventory),
    warning:
      "Browser storage is unavailable. Changes will last for this session only.",
  };
}
let items = loaded.data;
const filters = {
  search: "",
  category: "All categories",
  status: "All statuses",
};
document.querySelector("#app").innerHTML =
  `<section class="hero" id="overview"><div><div class="eyebrow">Supply chain workspace</div><h1>Keep your next move in stock.</h1><p>Inventory visibility, supplier confidence and a clearer demand signal.</p></div><div class="actions"><button id="export">↓ Export CSV</button><button id="add" class="primary">+ Add item</button></div></section><section class="toolbar" aria-label="Inventory filters"><label>Find an item<input id="search" type="search" placeholder="Search name or SKU"></label><label>Category<select id="category"><option>All categories</option><option>Electronics</option><option>Components</option><option>Packaging</option></select></label><label>Stock status<select id="stock-status"><option>All statuses</option><option>Healthy</option><option>Reorder</option><option>Out of stock</option></select></label></section><div id="results"></div>`;
const supplierFor = (item) => suppliers.find((s) => s.id === item.supplier);
const visible = () =>
  items.filter(
    (x) =>
      (x.name + " " + x.id)
        .toLowerCase()
        .includes(filters.search.toLowerCase()) &&
      (filters.category === "All categories" ||
        x.category === filters.category) &&
      (filters.status === "All statuses" ||
        analyse(x, supplierFor(x)).status === filters.status),
  );
function persist(message) {
  let ok = false;
  try {
    ok = saveStore(KEY, items);
  } catch {}
  announce(
    message +
      (ok
        ? " Saved in this browser."
        : " Storage unavailable: changes are temporary. Export a CSV before closing."),
  );
  render();
}
function render() {
  const rows = visible(),
    s = inventorySummary(rows),
    alerts = rows.filter(
      (x) => analyse(x, supplierFor(x)).status !== "Healthy",
    );
  document.querySelector("#results").innerHTML =
    `<section class="stats" aria-label="Filtered inventory indicators">${stat("Inventory value", money(s.value), "On-hand units × unit cost")}${stat("Units on hand", number(s.units), rows.length + " SKUs in current view")}${stat("Reorder alerts", String(s.alerts), "Includes out-of-stock items")}${stat("Next 30-day demand", number(s.monthly), "Weighted forecast · units")}</section><div class="grid"><section class="panel"><div class="panel-head"><div><h2>Demand outlook</h2><span class="muted">Units across the current inventory view</span></div><span class="badge">30-day periods</span></div>${bars(["Period −3", "Period −2", "Period −1", "Next 30d"], [{ name: "Demand units", values: [0, 1, 2].map((i) => rows.reduce((sum, x) => sum + x.demand[i], 0)).concat(s.monthly) }])}<p class="subtext">Forecast = 20% oldest + 30% middle + 50% latest demand. No seasonality or uncertainty model.</p></section><section class="panel"><div class="panel-head"><div><h2>Action queue</h2><span class="muted">On-hand stock at or below reorder point</span></div><span class="badge high">${alerts.length} alerts</span></div>${
      alerts.length
        ? alerts
            .slice(0, 4)
            .map((x) => {
              const a = analyse(x, supplierFor(x));
              return `<div class="forecast-row"><span>${e(x.name)}<small class="muted" style="display:block">${a.status} · ${x.onOrder} incoming</small></span><button class="link" data-edit="${e(x.id)}">Review ${a.suggested} units</button></div>`;
            })
            .join("")
        : '<p class="empty">No reorder alerts in this view.</p>'
    }<p class="subtext">Suggested quantity targets lead-time demand + safety stock + 30 days, less on-hand and incoming units. Incoming stock may not arrive before a shortage.</p></section></div><section class="panel" id="inventory"><div class="panel-head"><div><h2>Inventory register</h2><span class="muted">${rows.length} items · Local browser workspace</span></div></div><div class="table-wrap"><table><caption class="muted">Edit stock levels, incoming orders, suppliers and demand history</caption><thead><tr><th>Item / supplier</th><th class="number">On hand</th><th class="number">Incoming</th><th class="number">30d forecast</th><th class="number">Cover</th><th class="number">Reorder point</th><th>Status</th><th>Manage</th></tr></thead><tbody>${
      rows
        .map((x) => {
          const a = analyse(x, supplierFor(x));
          return `<tr><td><strong>${e(x.name)}</strong><small>${e(x.id)} · ${e(supplierFor(x).name)}</small></td><td class="number">${number(x.stock)}</td><td class="number">${number(x.onOrder)}</td><td class="number">${number(a.monthly)}</td><td class="number">${a.cover === null ? "No demand" : number(a.cover) + "d"}</td><td class="number">${number(a.reorder)}</td><td><span class="badge ${a.status === "Healthy" ? "low" : a.status === "Reorder" ? "medium" : "high"}">${a.status}</span></td><td><button class="link" data-edit="${e(x.id)}" aria-label="Edit ${e(x.name)}">Edit</button> <button class="link danger" data-delete="${e(x.id)}" aria-label="Delete ${e(x.name)}">Delete</button></td></tr>`;
        })
        .join("") ||
      '<tr><td colspan="8" class="empty">No items match these filters. Try another search or add an item.</td></tr>'
    }</tbody></table></div></section><section class="panel" id="suppliers"><div class="panel-head"><div><h2>Supplier scorecard</h2><span class="muted">Synthetic trailing 12 months · All suppliers; unaffected by inventory filters</span></div></div><div class="table-wrap"><table><thead><tr><th>Supplier</th><th class="number">Deliveries</th><th class="number">On-time delivery</th><th class="number">Accepted units</th><th class="number">Lead time</th><th class="number">Score / 100</th></tr></thead><tbody>${suppliers
      .map((x) => {
        const a = supplierScore(x);
        return `<tr><td><strong>${e(x.name)}</strong><small>${x.region}</small></td><td class="number">${x.deliveries}</td><td class="number">${number(a.onTime)}%</td><td class="number">${number(a.quality)}%</td><td class="number">${x.leadDays} days</td><td class="number"><strong>${number(a.score)}</strong></td></tr>`;
      })
      .join(
        "",
      )}</tbody></table></div><details><summary>Scoring and inventory assumptions</summary><p>Supplier score = 60% on-time delivery rate + 40% accepted-unit rate. Inventory cover uses forecast ÷ 30 days; reorder point = ceiling(daily demand × supplier lead days + safety stock). All days are calendar days. This demo does not submit purchase orders or track individual shipments.</p></details></section><div class="actions"><button id="reset">Restore demo inventory</button></div>`;
  bindCharts();
  document
    .querySelectorAll("[data-edit]")
    .forEach((b) => (b.onclick = () => edit(b.dataset.edit)));
  document.querySelectorAll("[data-delete]").forEach(
    (b) =>
      (b.onclick = () => {
        const item = items.find((x) => x.id === b.dataset.delete);
        if (confirm("Delete " + item.name + " from this browser?")) {
          items = items.filter((x) => x.id !== item.id);
          persist("Item deleted.");
        }
      }),
  );
  document.querySelector("#reset").onclick = () => {
    if (confirm("Replace your inventory edits with the original demo data?")) {
      items = structuredClone(inventory);
      persist("Demo inventory restored.");
    }
  };
}
function edit(id) {
  const existing = items.find((x) => x.id === id),
    x = existing || {
      id: "SKU-" + crypto.randomUUID().slice(0, 8),
      name: "",
      category: "Components",
      supplier: "s1",
      stock: 0,
      onOrder: 0,
      cost: 0,
      safety: 0,
      demand: [0, 0, 0],
    };
  const numeric = (name, label, value, step = "1") =>
    `<label>${label}<input name="${name}" type="number" min="0" max="1000000" step="${step}" required value="${value}"></label>`;
  openEditor(
    `<h2 id="editor-title">${existing ? "Edit inventory item" : "Add inventory item"}</h2><form><div class="form-grid"><label class="span-all">Item name<input name="name" maxlength="100" required value="${e(x.name)}"></label><label>Category<select name="category">${["Components", "Electronics", "Packaging"].map((s) => `<option ${s === x.category ? "selected" : ""}>${s}</option>`).join("")}</select></label><label>Supplier<select name="supplier">${suppliers.map((s) => `<option value="${s.id}" ${s.id === x.supplier ? "selected" : ""}>${s.name}</option>`).join("")}</select></label>${numeric("stock", "On-hand units", x.stock)}${numeric("onOrder", "Incoming units", x.onOrder)}${numeric("cost", "Unit cost (GBP)", x.cost, ".01")}${numeric("safety", "Safety stock (units)", x.safety)}${x.demand.map((v, i) => numeric("d" + i, "Demand period −" + (3 - i) + " (units)", v)).join("")}</div><p class="form-error" role="alert"></p><div class="actions"><button type="button" data-cancel>Cancel</button><button class="primary" type="submit">Save item</button></div></form>`,
    (form) => {
      const next = {
        id: x.id,
        name: form.name.trim(),
        category: form.category,
        supplier: form.supplier,
        stock: Number(form.stock),
        onOrder: Number(form.onOrder),
        cost: Number(form.cost),
        safety: Number(form.safety),
        demand: [0, 1, 2].map((i) => Number(form["d" + i])),
      };
      if (!validItem(next))
        throw Error("Enter a name and valid non-negative quantities.");
      items = existing
        ? items.map((item) => (item.id === id ? next : item))
        : [...items, next];
      persist("Inventory updated.");
    },
  );
}
document.querySelector("#add").onclick = () => edit();
document.querySelector("#search").oninput = (event) => {
  filters.search = event.target.value;
  render();
};
document.querySelector("#category").onchange = (event) => {
  filters.category = event.target.value;
  render();
};
document.querySelector("#stock-status").onchange = (event) => {
  filters.status = event.target.value;
  render();
};
document.querySelector("#export").onclick = () => {
  download("supplychain360-inventory.csv", [
    [
      "SKU",
      "Name",
      "Category",
      "Supplier",
      "On hand",
      "Incoming",
      "Unit cost GBP",
      "Safety stock",
      "Demand -3",
      "Demand -2",
      "Demand -1",
      "Forecast 30d",
      "Reorder point",
      "Suggested order",
      "Status",
    ],
    ...visible().map((x) => {
      const a = analyse(x, supplierFor(x));
      return [
        x.id,
        x.name,
        x.category,
        supplierFor(x).name,
        x.stock,
        x.onOrder,
        x.cost,
        x.safety,
        ...x.demand,
        a.monthly,
        a.reorder,
        a.suggested,
        a.status,
      ];
    }),
  ]);
  announce("Exported the current inventory view.");
};
render();
if (loaded.warning) announce(loaded.warning);
