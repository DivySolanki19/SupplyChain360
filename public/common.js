export const money = (n) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
export const number = (n) =>
  new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(n);
export const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function csv(rows) {
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => {
            let s = String(value ?? "");
            if (typeof value !== "number" && /^[\s]*[=+@-]/.test(s))
              s = "'" + s;
            return '"' + s.replace(/"/g, '""') + '"';
          })
          .join(","),
      )
      .join("\r\n")
  );
}
export function download(filename, rows) {
  const url = URL.createObjectURL(
    new Blob([csv(rows)], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function announce(message) {
  document.querySelector("#status").textContent = message;
}
export function readStore(
  key,
  fallback,
  validate,
  storage = globalThis.localStorage,
) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return { data: structuredClone(fallback) };
    const data = JSON.parse(raw);
    if (
      !Array.isArray(data) ||
      !data.every(validate) ||
      new Set(data.map((x) => x.id)).size !== data.length
    )
      throw new Error("Invalid saved data");
    return { data };
  } catch {
    return {
      data: structuredClone(fallback),
      warning:
        "Saved data could not be loaded. Demo data is shown; saving will replace the invalid data.",
    };
  }
}
export function saveStore(key, data, storage = globalThis.localStorage) {
  try {
    storage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
export function stat(label, value, note) {
  return `<article class="stat"><div class="label">${escapeHTML(label)}</div><div class="value">${escapeHTML(value)}</div><div class="note">${escapeHTML(note)}</div></article>`;
}
export function bars(labels, series, format = number) {
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  return `<div class="chart" role="group" aria-label="Interactive chart. Select a column for values.">${labels.map((label, i) => `<button class="bar-group" aria-pressed="false" data-detail="${escapeHTML(label + ": " + series.map((s) => s.name + " " + format(s.values[i])).join(" · "))}" aria-label="${escapeHTML(label + ": " + series.map((s) => s.name + " " + format(s.values[i])).join(", "))}">${series.map((s, j) => `<span class="bar ${j ? "secondary" : ""}" style="height:${(Math.max(0, s.values[i]) / max) * 100}%"></span>`).join("")}<span class="bar-label">${escapeHTML(label)}</span></button>`).join("")}</div><div class="legend">${series.map((s, i) => `<span><i class="dot ${i ? "secondary" : ""}"></i>${escapeHTML(s.name)}</span>`).join("")}</div><p class="chart-detail" aria-live="polite">Select a column to inspect values.</p>`;
}
export function bindCharts() {
  document.querySelectorAll(".bar-group").forEach((b) =>
    b.addEventListener("click", () => {
      const host = b.closest(".panel");
      host
        .querySelectorAll(".bar-group")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      host.querySelector(".chart-detail").textContent = b.dataset.detail;
    }),
  );
}
export function openEditor(html, onSubmit) {
  const trigger = document.activeElement;
  const editId = trigger?.dataset?.edit;
  const dialog = document.querySelector("dialog");
  dialog.addEventListener("close", () => {
    const replacement = editId
      ? [...document.querySelectorAll("[data-edit]")].find(button => button.dataset.edit === editId)
      : document.querySelector("#add");
    (trigger?.isConnected ? trigger : replacement || document.querySelector("#add"))?.focus();
  }, { once: true });
  dialog.innerHTML = html;
  const form = dialog.querySelector("form");
  dialog.querySelector("[data-cancel]").onclick = () => dialog.close();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      onSubmit(Object.fromEntries(new FormData(form)));
      dialog.close();
    } catch (error) {
      dialog.querySelector(".form-error").textContent = error.message;
    }
  });
  dialog.showModal();
}
export const validText = (x, max = 120) =>
  typeof x === "string" && x.trim().length > 0 && x.length <= max;
export const bounded = (x, min, max) =>
  typeof x === "number" && Number.isFinite(x) && x >= min && x <= max;
