// project.js — Lógica de index.html: crear/editar proyecto y aceptar el contrato.
import { loadProject, saveProject, resetDemo, clearProject } from "./storage.js";
import { normalizeProject, sameId } from "./score.js";
import { esc, renderNav } from "./ui.js";

renderNav("Project");

const DEFAULT_RULES = [
  "Each member reaches a contribution score of at least 60.",
  "Internal deadline: drafts are due 3 days before the final due date.",
  "If you can't finish a task, tell the team at least 24 hours before.",
  "Members below the minimum receive reminders; level 4 is shown in the final report.",
];

const $ = (id) => document.getElementById(id);
let project = normalizeProject(loadProject());

fillForm();
renderContract();

$("load-demo").addEventListener("click", () => {
  project = normalizeProject(resetDemo());
  fillForm();
  renderContract();
  showMessage(`Demo team loaded: ${project.members.map((m) => esc(m.name)).join(", ")}.`);
});

$("start-over").addEventListener("click", () => {
  clearProject();
  project = null;
  fillForm();
  renderContract();
  showMessage("Everything was cleared. Start a new project below.", "warn");
});

$("project-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const members = parseMembers($("p-members").value);
  if (members.length < 2) {
    showMessage("Add at least 2 team members, one per line: Name, email", "warn");
    return;
  }

  const minScore = Math.max(0, Math.min(100, Number($("p-min").value) || 0));
  const rules = $("p-rules").value.split("\n").map((r) => r.trim()).filter(Boolean);
  const old = project || normalizeProject({});

  // Si cambian las reglas o el mínimo, todos deben aceptar de nuevo.
  const contractChanged =
    old.contract.minScore !== minScore ||
    JSON.stringify(old.contract.rules) !== JSON.stringify(rules);

  const memberIds = members.map((m) => String(m.id));
  project = normalizeProject({
    ...old,
    id: old.id || "p" + Date.now(),
    name: $("p-name").value.trim(),
    course: $("p-course").value.trim(),
    docUrl: $("p-doc").value.trim(),
    dueDate: $("p-due").value,
    members,
    contract: {
      minScore,
      rules,
      acceptedBy: contractChanged
        ? []
        : old.contract.acceptedBy.filter((id) => memberIds.includes(String(id))),
    },
  });

  saveProject(project);
  renderContract();
  showMessage(contractChanged
    ? "Project saved. The contract changed, so every member needs to accept it (section 2)."
    : "Project saved.");
});

// "Ana, ana@usf.edu" -> { id, name, email }. Mantiene el id si el email ya existía.
function parseMembers(text) {
  const existing = project ? project.members : [];
  return text.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [name, email = ""] = line.split(",").map((s) => s.trim());
      const prev = existing.find((m) =>
        (email && String(m.email).toLowerCase() === email.toLowerCase()) || m.name === name);
      return { id: prev ? prev.id : "m" + Date.now().toString(36) + i, name, email };
    });
}

function fillForm() {
  const p = project;
  $("p-name").value = p ? p.name || "" : "";
  $("p-course").value = p ? p.course || "" : "";
  $("p-doc").value = p ? p.docUrl || "" : "";
  $("p-due").value = p ? p.dueDate || "" : "";
  $("p-members").value = p ? p.members.map((m) => `${m.name}, ${m.email || ""}`).join("\n") : "";
  $("p-min").value = p ? p.contract.minScore : 60;
  $("p-rules").value = (p && p.contract.rules.length ? p.contract.rules : DEFAULT_RULES).join("\n");
}

function renderContract() {
  const el = $("contract");
  if (!project || project.members.length === 0) {
    el.innerHTML = `<p class="fs-muted">Save the project first (or load the demo team) to accept the contract.</p>`;
    return;
  }
  const accepted = project.contract.acceptedBy;
  const isAccepted = (m) => accepted.some((id) => sameId(id, m.id));
  const count = project.members.filter(isAccepted).length;
  const total = project.members.length;

  el.innerHTML = `
    <p class="fs-muted">Each member reads the rules and accepts them. Contribution tracking is only valid once everyone has accepted.</p>
    <ol class="fs-rules">
      <li>Minimum contribution score: ${project.contract.minScore}</li>
      ${project.contract.rules.map((r) => `<li>${esc(r)}</li>`).join("")}
    </ol>
    <div>
      ${project.members.map((m) => `
        <div class="fs-accept-row">
          <span>${esc(m.name)} ${m.email ? `<span class="fs-muted">(${esc(m.email)})</span>` : ""}</span>
          ${isAccepted(m)
            ? `<span class="fs-badge ok">✓ Accepted</span>`
            : `<button type="button" class="fs-btn fs-btn-sm" data-accept="${esc(m.id)}">Accept contract</button>`}
        </div>`).join("")}
    </div>
    <p class="fs-contract-status">
      ${count === total
        ? `<b>All ${total} members accepted.</b> Tracking is active. <a href="tasks.html">Go to Tasks →</a>`
        : `${count} of ${total} members accepted. Tracking starts when everyone accepts.`}
    </p>`;

  el.querySelectorAll("[data-accept]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const member = project.members.find((m) => sameId(m.id, btn.dataset.accept));
      if (member && !isAccepted(member)) project.contract.acceptedBy.push(member.id);
      saveProject(project);
      renderContract();
    }));
}

function showMessage(html, type = "ok") {
  $("message").innerHTML = `<div class="fs-banner ${type}">${html}</div>`;
}
