// tasks.js — Lógica de tasks.html: agregar, completar, reasignar y borrar tareas.
import { loadProject, saveProject } from "./storage.js";
import { normalizeProject, sameId } from "./score.js";
import { esc, formatDate, todayISO, renderNav, noProjectMessage, newId, toast } from "./ui.js";

renderNav("Tasks");

const app = document.getElementById("app");
const project = normalizeProject(loadProject());

if (!project || project.members.length === 0) {
  noProjectMessage(app);
} else {
  init();
}

function init() {
  const form = document.getElementById("task-form");
  const titleInput = document.getElementById("task-title");
  const assigneeSelect = document.getElementById("task-assignee");
  const dueInput = document.getElementById("task-due");

  assigneeSelect.innerHTML = memberOptions(project.members[0].id);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    if (!title) return;
    project.tasks.push({
      id: newId("t"),
      title,
      assigneeId: assigneeSelect.value,
      dueDate: dueInput.value,
      done: false,
    });
    saveProject(project);
    titleInput.value = "";
    dueInput.value = "";
    render();
    toast(`Task added: <b>${esc(title)}</b>`);
  });

  // Delegación de eventos: un solo listener para toda la lista.
  const list = document.getElementById("task-list");
  list.addEventListener("change", onListChange);
  list.addEventListener("click", onListClick);

  render();
}

function memberOptions(selectedId) {
  return project.members
    .map((m) =>
      `<option value="${esc(m.id)}" ${sameId(m.id, selectedId) ? "selected" : ""}>${esc(m.name)}</option>`)
    .join("");
}

function render() {
  const list = document.getElementById("task-list");
  const summary = document.getElementById("task-summary");
  const tasks = project.tasks;
  const done = tasks.filter((t) => t.done).length;
  summary.textContent = `${done} of ${tasks.length} done`;

  if (tasks.length === 0) {
    list.innerHTML = `<p class="fs-muted">No tasks yet. Add the first one above.</p>`;
    return;
  }

  // Pendientes primero, luego por fecha.
  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return String(a.dueDate || "9999").localeCompare(String(b.dueDate || "9999"));
  });

  const today = todayISO();
  list.innerHTML = `
    <table class="fs-table">
      <thead>
        <tr><th>Done</th><th>Task</th><th>Assigned to</th><th>Due</th><th></th></tr>
      </thead>
      <tbody>
        ${sorted.map((t) => {
          const overdue = !t.done && t.dueDate && t.dueDate < today;
          return `
          <tr data-id="${esc(t.id)}" class="${t.done ? "done" : ""}">
            <td><input type="checkbox" class="task-done" ${t.done ? "checked" : ""} aria-label="Mark as done" /></td>
            <td class="task-title">${esc(t.title)} ${overdue ? '<span class="fs-badge below">Overdue</span>' : ""}</td>
            <td><select class="fs-select task-assignee">${memberOptions(t.assigneeId)}</select></td>
            <td><input type="date" class="fs-input task-date" value="${esc(t.dueDate || "")}" /></td>
            <td><button type="button" class="fs-btn-danger-text task-delete" aria-label="Delete task">Delete</button></td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>`;
}

function findTask(target) {
  const row = target.closest("[data-id]");
  if (!row) return null;
  return project.tasks.find((t) => String(t.id) === row.dataset.id) || null;
}

function onListChange(e) {
  const task = findTask(e.target);
  if (!task) return;
  if (e.target.matches(".task-done")) {
    task.done = e.target.checked;
    if (task.done) toast(`Nice! <b>${esc(task.title)}</b> is done.`);
  }
  if (e.target.matches(".task-assignee")) task.assigneeId = e.target.value;
  if (e.target.matches(".task-date")) task.dueDate = e.target.value;
  saveProject(project);
  render();
}

function onListClick(e) {
  if (!e.target.matches(".task-delete")) return;
  const task = findTask(e.target);
  if (!task) return;
  project.tasks = project.tasks.filter((t) => t !== task);
  saveProject(project);
  render();
  toast(`Deleted: ${esc(task.title)}`);
}
