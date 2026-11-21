// ui.js — Ayudas visuales compartidas por Tasks, Dashboard y Report.
import { resetDemo } from "./storage.js";

// Evita que un nombre con "<" o comillas rompa el HTML.
export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

// "2026-12-10" -> "12/10/2026" (sin usar new Date para no correr un día por zona horaria).
export function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  if (!d) return esc(iso);
  return `${m}/${d}/${y}`;
}

// Fecha de hoy en formato YYYY-MM-DD (hora local).
export function todayISO() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Dibuja la barra de navegación dentro de <header id="fs-nav">.
export function renderNav(active) {
  const el = document.getElementById("fs-nav");
  if (!el) return;
  const links = [
    ["index.html", "Project"],
    ["tasks.html", "Tasks"],
    ["dashboard.html", "Dashboard"],
    ["report.html", "Report"],
  ];
  el.innerHTML = `
    <a class="fs-brand" href="index.html">FairShare</a>
    <nav>${links
      .map(([href, label]) =>
        `<a href="${href}" class="${label === active ? "active" : ""}">${label}</a>`)
      .join("")}</nav>`;
}

// Notificación flotante abajo a la derecha.
export function toast(html, ms = 5000) {
  let box = document.getElementById("fs-toast");
  if (!box) {
    box = document.createElement("div");
    box.id = "fs-toast";
    document.body.appendChild(box);
  }
  const t = document.createElement("div");
  t.className = "fs-toast";
  t.innerHTML = html;
  box.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

// Mensaje cuando todavía no hay proyecto guardado.
// Incluye un botón para cargar la demo directamente desde esta página.
export function noProjectMessage(container) {
  container.innerHTML = `
    <div class="fs-card fs-empty">
      <h2>No project yet</h2>
      <p class="fs-muted">Create a project on the Project page, or load the demo team right here.</p>
      <button type="button" class="fs-btn" id="fs-load-demo">Load demo team</button>
      <a class="fs-btn fs-btn-outline" href="index.html">Go to Project</a>
    </div>`;
  document.getElementById("fs-load-demo").addEventListener("click", () => {
    resetDemo();
    location.reload();
  });
}

export function newId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
