// =====================================================================
// score.js
// Fórmula de aporte. No mide TIEMPO, mide APORTE REAL:
//   - ediciones en el documento (50%)
//   - tareas completadas (30%)
//   - evaluación de los compañeros (20%)
// =====================================================================

// Pesos de cada componente (deben sumar 1)
export const WEIGHTS = { edits: 0.5, tasks: 0.3, peers: 0.2 };

// Cuántos puntos sobre el mínimo se consideran "en riesgo"
export const AT_RISK_MARGIN = 10;

// Texto que se muestra en pantalla para cada estado
export const STATUS_LABELS = {
  "ok": "On track",
  "at-risk": "At risk",
  "below": "Below minimum"
};

// Compara el aporte de un miembro con su "parte justa" (total / N).
// Si alguien hizo exactamente su parte justa → 100. Se limita a 100
// para que nadie "compense" a otro haciendo el triple.
function relativeScore(memberValue, total, memberCount) {
  // Evitamos dividir por cero: si nadie aportó nada, vale 0 para todos
  if (total === 0 || memberCount === 0) return 0;
  const fairShare = total / memberCount;
  return Math.min(100, (100 * memberValue) / fairShare);
}

// Decide el estado según el puntaje final y el mínimo del contrato.
// Interpretación: "at-risk" = está sobre el mínimo, pero a menos de 10 puntos.
export function getStatus(finalScore, minScore) {
  if (finalScore < minScore) return "below";
  if (finalScore < minScore + AT_RISK_MARGIN) return "at-risk";
  return "ok";
}

// Calcula el puntaje de TODOS los miembros del proyecto.
// Devuelve una lista: [{ member, edits, tasksDone, editScore, taskScore,
//                         peerScore, finalScore, status }]
export function computeScores(project) {
  const members = project.members;
  const memberCount = members.length;

  // ----- Totales del equipo -----
  const totalEdits = project.edits.reduce((sum, e) => sum + e.count, 0);
  const totalTasksDone = project.tasks.filter((t) => t.done).length;

  return members.map((member) => {
    // ----- Ediciones del miembro -----
    const editEntry = project.edits.find((e) => e.memberId === member.id);
    const edits = editEntry ? editEntry.count : 0;
    const editScore = relativeScore(edits, totalEdits, memberCount);

    // ----- Tareas completadas del miembro -----
    const tasksDone = project.tasks.filter(
      (t) => t.done && t.assigneeId === member.id
    ).length;
    const taskScore = relativeScore(tasksDone, totalTasksDone, memberCount);

    // ----- Evaluación de pares (promedio de ratings recibidos) -----
    const received = project.peerRatings.filter((r) => r.toId === member.id);
    let peerScore = 0; // si nadie lo evaluó todavía, vale 0
    if (received.length > 0) {
      const average =
        received.reduce((sum, r) => sum + r.rating, 0) / received.length;
      peerScore = (average / 5) * 100;
    }

    // ----- Puntaje final ponderado (redondeado) -----
    const finalScore = Math.round(
      WEIGHTS.edits * editScore +
      WEIGHTS.tasks * taskScore +
      WEIGHTS.peers * peerScore
    );

    return {
      member,
      edits,
      tasksDone,
      // Redondeamos los componentes solo para mostrarlos;
      // el finalScore se calculó con los valores exactos.
      editScore: Math.round(editScore),
      taskScore: Math.round(taskScore),
      peerScore: Math.round(peerScore),
      finalScore,
      status: getStatus(finalScore, project.contract.minScore)
    };
  });
}
