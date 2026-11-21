// dashboard.js — Aporte por miembro, recordatorios y simulación de ediciones.
import { loadProject, saveProject } from "./storage.js";
import { normalizeProject, calculateScores, sameId, STATUS_LABELS } from "./score.js";
import { getReminderLevel, sendReminder, REMINDER_LEVELS } from "./reminders.js";
import { esc, renderNav, noProjectMessage, toast } from "./ui.js";

renderNav("Dashboard");

const app = document.getElementById("app");
const project = normalizeProject(loadProject());

if (!project || project.members.length === 0) {
  noProjectMessage(app);
} else {
  document.getElementById("member-cards").addEventListener("click", onCardClick);
  document.getElementById("import-btn").addEventListener("click", importEdits);
  render();
}

function render() {
  const scores = calculateScores(project);
  const min = project.contract.minScore;
  renderBanner();
  renderStats(scores, min);
  renderCards(scores, min);
}

function renderBanner() {
  const total = project.members.length;
  const accepted = project.members.filter((m) =>
    project.contract.acceptedBy.some((id) => sameId(id, m.id))).length;
  const el = document.getElementById("contract-banner");
  el.innerHTML = accepted === total
    ? `<div class="fs-banner ok">All ${total} members accepted the team contract. Tracking is active.</div>`
    : `<div class="fs-banner warn">${accepted} of ${total} members accepted the contract. Scores are a preview until everyone accepts on the <a href="index.html">Project</a> page.</div>`;
}

function renderStats(scores, min) {
  const avg = scores.length
    ? Math.round(scores.reduce((s, r) => s + r.finalScore, 0) / scores.length)
    : 0;
  const done = project.tasks.filter((t) => t.done).length;
  const below = scores.filter((r) => r.status === "below").length;
  document.getElementById("team-stats").innerHTML = `
    <div class="fs-stat"><div class="fs-stat-value">${avg}</div><div class="fs-stat-label">Team average score</div></div>
    <div class="fs-stat"><div class="fs-stat-value">${done}/${project.tasks.length}</div><div class="fs-stat-label">Tasks completed</div></div>
    <div class="fs-stat"><div class="fs-stat-value ${below ? "fs-text-below" : ""}">${below}</div><div class="fs-stat-label">Members below the minimum (${min})</div></div>`;
}

function bar(label, detail, value) {
  return `
    <div class="fs-bar">
      <div class="fs-bar-label"><span>${label}</span><span>${detail}</span></div>
      <div class="fs-bar-track"><div class="fs-bar-fill" style="width:${value}%"></div></div>
    </div>`;
}

function renderCards(scores, min) {
  const el = document.getElementById("member-cards");
  el.innerHTML = scores.map((r) => {
    const level = getReminderLevel(project, r.memberId);
    const dots = [1, 2, 3, 4].map((n) => `<span class="fs-dot ${n <= level ? "on" : ""}"></span>`).join("");
    const needsReminder = r.status !== "ok";
    return `
      <article class="fs-member ${r.status}" data-id="${esc(r.memberId)}">
        <div class="fs-member-head">
          <h3>${esc(r.name)}</h3>
          <span class="fs-badge ${r.status}">${STATUS_LABELS[r.status]}</span>
        </div>
        <div class="fs-score">${r.finalScore}<span>/100</span></div>
        <div class="fs-meter" title="Minimum: ${min}">
          <div class="fs-meter-fill ${r.status}" style="width:${r.finalScore}%"></div>
          <div class="fs-meter-min" style="left:${Math.min(100, min)}%"></div>
        </div>
        ${bar("Doc edits (50%)", `${r.edits} edits · ${r.editScore}`, r.editScore)}
        ${bar("Tasks (30%)", `${r.tasksDone}/${r.tasksAssigned} done · ${r.taskScore}`, r.taskScore)}
        ${bar("Peer rating (20%)", r.ratingsReceived ? `${r.avgRating.toFixed(1)}/5 · ${r.peerScore}` : "no ratings yet", r.peerScore)}
        <div class="fs-reminders">
          <span class="fs-muted">Reminders</span>
          <span class="fs-reminder-dots" title="${level ? REMINDER_LEVELS[level] : "None sent"}">${dots}</span>
          <span class="fs-muted">${level ? REMINDER_LEVELS[level] : "none"}</span>
        </div>
        <div class="fs-member-actions">
          <button type="button" class="fs-btn fs-btn-outline fs-btn-sm action-edit">+1 doc edit</button>
          ${needsReminder
            ? `<button type="button" class="fs-btn fs-btn-sm action-remind" ${level >= 4 ? "disabled" : ""}>${level >= 4 ? "Max level reached" : "Send reminder"}</button>`
            : ""}
        </div>
      </article>`;
  }).join("");
}

function onCardClick(e) {
  const card = e.target.closest("[data-id]");
  if (!card) return;
  const memberId = card.dataset.id;
  const member = project.members.find((m) => sameId(m.id, memberId));

  if (e.target.matches(".action-edit")) {
    // Simula actividad en el documento (para la demo).
    const entry = project.edits.find((x) => sameId(x.memberId, memberId));
    if (entry) entry.count = (Number(entry.count) || 0) + 1;
    else project.edits.push({ memberId: member.id, count: 1 });
    saveProject(project);
    render();
  }

  if (e.target.matches(".action-remind")) {
    const result = sendReminder(project, member.id);
    saveProject(project);
    render();
    const mailto = result.email
      ? `<br><a href="mailto:${esc(result.email)}?subject=${encodeURIComponent("FairShare reminder")}&body=${encodeURIComponent(result.message)}">Open as email</a>`
      : "";
    toast(`<b>Level ${result.level} · ${REMINDER_LEVELS[result.level]}</b><br>${esc(result.message)}${mailto}`, 8000);
  }
}

function importEdits() {
  const text = document.getElementById("import-json").value.trim();
  let rows;
  try {
    rows = JSON.parse(text);
    if (!Array.isArray(rows)) throw new Error("Not a list");
  } catch {
    toast("That doesn't look like valid JSON. Expected a list like [{\"email\":..., \"count\":...}].");
    return;
  }
  let matched = 0;
  rows.forEach((row) => {
    const email = String(row.email || "").toLowerCase().trim();
    const member = project.members.find((m) => String(m.email || "").toLowerCase().trim() === email);
    if (!member) return;
    const entry = project.edits.find((x) => sameId(x.memberId, member.id));
    if (entry) entry.count = Number(row.count) || 0;
    else project.edits.push({ memberId: member.id, count: Number(row.count) || 0 });
    matched++;
  });
  saveProject(project);
  render();
  toast(`Imported edits for ${matched} of ${rows.length} entries.`);
}
