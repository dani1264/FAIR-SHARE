// report.js — Evaluación entre pares + reporte final para el profesor.
import { loadProject, saveProject } from "./storage.js";
import { normalizeProject, calculateScores, sameId, STATUS_LABELS } from "./score.js";
import { getReminderLevel } from "./reminders.js";
import { esc, formatDate, todayISO, renderNav, noProjectMessage, toast } from "./ui.js";

renderNav("Report");

const app = document.getElementById("app");
const project = normalizeProject(loadProject());

if (!project || project.members.length === 0) {
  noProjectMessage(app);
} else {
  init();
}

function init() {
  const reviewer = document.getElementById("reviewer");
  reviewer.innerHTML =
    `<option value="">Select your name…</option>` +
    project.members.map((m) => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join("");
  reviewer.addEventListener("change", renderPeerList);
  document.getElementById("peer-list").addEventListener("click", onRate);
  document.getElementById("print-btn").addEventListener("click", () => window.print());
  renderPeerList();
  renderReport();
}

// ---------- Evaluación entre pares ----------

function currentRating(fromId, toId) {
  const r = project.peerRatings.find((x) => sameId(x.fromId, fromId) && sameId(x.toId, toId));
  return r ? Number(r.rating) : 0;
}

function renderPeerList() {
  const fromId = document.getElementById("reviewer").value;
  const list = document.getElementById("peer-list");
  if (!fromId) {
    list.innerHTML = `<p class="fs-muted">Choose your name to rate your teammates from 1 (did almost nothing) to 5 (excellent contributor).</p>`;
  } else {
    list.innerHTML = project.members
      .filter((m) => !sameId(m.id, fromId))
      .map((m) => {
        const value = currentRating(fromId, m.id);
        const buttons = [1, 2, 3, 4, 5].map((n) =>
          `<button type="button" data-to="${esc(m.id)}" data-rating="${n}" class="${n === value ? "selected" : ""}" aria-label="Rate ${esc(m.name)} ${n}">${n}</button>`
        ).join("");
        return `<div class="fs-peer-row"><span>${esc(m.name)}</span><div class="fs-rating">${buttons}</div></div>`;
      }).join("");
  }
  renderProgress();
}

function renderProgress() {
  const reviewers = new Set(project.peerRatings.map((r) => String(r.fromId)));
  document.getElementById("peer-progress").textContent =
    `${reviewers.size} of ${project.members.length} members have submitted ratings.`;
}

function onRate(e) {
  const btn = e.target.closest("button[data-rating]");
  if (!btn) return;
  const fromId = document.getElementById("reviewer").value;
  const fromMember = project.members.find((m) => sameId(m.id, fromId));
  const toMember = project.members.find((m) => sameId(m.id, btn.dataset.to));
  if (!fromMember || !toMember) return;
  const rating = Number(btn.dataset.rating);

  const existing = project.peerRatings.find(
    (r) => sameId(r.fromId, fromMember.id) && sameId(r.toId, toMember.id));
  if (existing) existing.rating = rating;
  else project.peerRatings.push({ fromId: fromMember.id, toId: toMember.id, rating });

  saveProject(project);
  renderPeerList();
  renderReport();
  toast(`Saved: ${esc(toMember.name)} → ${rating}/5`, 2500);
}

// ---------- Reporte ----------

function renderReport() {
  const scores = calculateScores(project);
  const min = project.contract.minScore;
  const acceptedNames = project.members
    .filter((m) => project.contract.acceptedBy.some((id) => sameId(id, m.id)))
    .map((m) => esc(m.name));

  const rows = scores.map((r) => {
    const level = getReminderLevel(project, r.memberId);
    return `
      <tr class="${r.status === "below" ? "below-row" : ""}">
        <td><b>${esc(r.name)}</b><br><span class="fs-muted">${esc(r.email || "")}</span></td>
        <td>${r.edits} <span class="fs-muted">(${r.editScore})</span></td>
        <td>${r.tasksDone}/${r.tasksAssigned} <span class="fs-muted">(${r.taskScore})</span></td>
        <td>${r.ratingsReceived ? r.avgRating.toFixed(1) + "/5" : "—"} <span class="fs-muted">(${r.peerScore})</span></td>
        <td><b>${r.finalScore}</b></td>
        <td><span class="fs-badge ${r.status}">${STATUS_LABELS[r.status]}</span></td>
        <td>${level}/4</td>
      </tr>`;
  }).join("");

  const notes = scores
    .filter((r) => r.status === "below")
    .map((r) => {
      const level = getReminderLevel(project, r.memberId);
      return `<li><b>${esc(r.name)}</b> is below the agreed minimum (${r.finalScore} / ${min}). As stated in the team contract, this is reported to the instructor.${level >= 4 ? " This member received all 4 reminders." : level ? ` Reminders sent: ${level} of 4.` : ""}</li>`;
    }).join("");

  const docLink = project.docUrl
    ? `<a href="${esc(project.docUrl)}" target="_blank" rel="noopener">Open document</a>`
    : "—";

  document.getElementById("report").innerHTML = `
    <div class="fs-report-meta">
      <div><span class="fs-muted">Project</span><br><b>${esc(project.name || "Untitled project")}</b></div>
      <div><span class="fs-muted">Course</span><br><b>${esc(project.course || "—")}</b></div>
      <div><span class="fs-muted">Final due date</span><br>${formatDate(project.dueDate)}</div>
      <div><span class="fs-muted">Report generated</span><br>${formatDate(todayISO())}</div>
      <div><span class="fs-muted">Document</span><br>${docLink}</div>
      <div><span class="fs-muted">Minimum score (contract)</span><br>${min}</div>
    </div>

    <h3>Team contract</h3>
    <ol class="fs-rules">${project.contract.rules.map((r) => `<li>${esc(r)}</li>`).join("") || "<li>No rules recorded.</li>"}</ol>
    <p class="fs-muted">Accepted by ${acceptedNames.length} of ${project.members.length} members${acceptedNames.length ? ": " + acceptedNames.join(", ") : ""}.</p>

    <h3>Contribution by member</h3>
    <div class="fs-table-wrap">
      <table class="fs-table">
        <thead>
          <tr><th>Member</th><th>Doc edits</th><th>Tasks</th><th>Peer rating</th><th>Score</th><th>Status</th><th>Reminders</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    ${notes ? `<h3>Notes for the instructor</h3><ul class="fs-notes">${notes}</ul>` : `<p class="fs-banner ok">Every member met the agreed minimum.</p>`}

    <p class="fs-muted fs-small">Score = 50% document edits + 30% completed tasks + 20% anonymous peer rating (numbers in parentheses are each component out of 100). Generated with FairShare.</p>`;
}
