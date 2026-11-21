// score.js — Fórmula de aporte de FairShare.
// Funciones puras: no leen ni guardan nada, solo calculan.

// Compara ids aunque uno sea número y otro texto ("1" vs 1).
export function sameId(a, b) {
  return String(a) === String(b);
}

// Rellena los campos que falten para que ninguna página se rompa
// si el proyecto viene incompleto (por ejemplo, recién creado en index.html).
export function normalizeProject(project) {
  if (!project) return null;
  project.members = project.members || [];
  project.tasks = project.tasks || [];
  project.edits = project.edits || [];
  project.peerRatings = project.peerRatings || [];
  project.reminders = project.reminders || [];
  project.contract = project.contract || {};
  project.contract.rules = project.contract.rules || [];
  project.contract.acceptedBy = project.contract.acceptedBy || [];
  if (project.contract.minScore === undefined || project.contract.minScore === "") {
    project.contract.minScore = 60;
  }
  project.contract.minScore = Number(project.contract.minScore);

  // Cada tarea necesita un id para poder editarla o borrarla.
  project.tasks.forEach((task, i) => {
    if (task.id === undefined || task.id === null) task.id = "t" + (i + 1);
  });
  return project;
}

// "ok" | "at-risk" | "below"
export function getStatus(score, minScore) {
  if (score < minScore) return "below";
  if (score < minScore + 10) return "at-risk";
  return "ok";
}

export const STATUS_LABELS = {
  ok: "On track",
  "at-risk": "At risk",
  below: "Below minimum",
};

// Componente relativo al promedio del equipo, con tope de 100.
function shareOfAverage(value, total, n) {
  if (total <= 0 || n === 0) return 0; // evita división por cero
  return Math.min(100, (100 * value) / (total / n));
}

// Devuelve una fila por miembro con sus 3 componentes, el puntaje final y el estado.
export function calculateScores(project) {
  const p = normalizeProject(project);
  if (!p || p.members.length === 0) return [];

  const n = p.members.length;
  const minScore = p.contract.minScore;

  const editsOf = (id) =>
    p.edits
      .filter((e) => sameId(e.memberId, id))
      .reduce((sum, e) => sum + (Number(e.count) || 0), 0);

  const doneTasksOf = (id) =>
    p.tasks.filter((t) => t.done && sameId(t.assigneeId, id)).length;

  const totalEdits = p.members.reduce((sum, m) => sum + editsOf(m.id), 0);
  const totalDone = p.members.reduce((sum, m) => sum + doneTasksOf(m.id), 0);

  return p.members.map((m) => {
    const edits = editsOf(m.id);
    const tasksDone = doneTasksOf(m.id);
    const received = p.peerRatings.filter(
      (r) => sameId(r.toId, m.id) && !sameId(r.fromId, m.id)
    );
    const avgRating = received.length
      ? received.reduce((sum, r) => sum + Number(r.rating), 0) / received.length
      : 0;

    const editScore = shareOfAverage(edits, totalEdits, n);
    const taskScore = shareOfAverage(tasksDone, totalDone, n);
    const peerScore = (avgRating / 5) * 100;
    const finalScore = Math.round(0.5 * editScore + 0.3 * taskScore + 0.2 * peerScore);

    return {
      memberId: m.id,
      name: m.name,
      email: m.email,
      edits,
      tasksDone,
      tasksAssigned: p.tasks.filter((t) => sameId(t.assigneeId, m.id)).length,
      ratingsReceived: received.length,
      avgRating,
      editScore: Math.round(editScore),
      taskScore: Math.round(taskScore),
      peerScore: Math.round(peerScore),
      finalScore,
      status: getStatus(finalScore, minScore),
    };
  });
}
