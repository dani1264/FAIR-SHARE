// reminders.js — Recordatorios escalonados (nivel 1 a 4).
import { sameId } from "./score.js";

export const REMINDER_LEVELS = {
  1: "Friendly reminder",
  2: "Direct reminder",
  3: "Team notified",
  4: "Flagged in final report",
};

// Nivel más alto que ha recibido un miembro (0 = ninguno).
export function getReminderLevel(project, memberId) {
  return (project.reminders || [])
    .filter((r) => sameId(r.memberId, memberId))
    .reduce((max, r) => Math.max(max, Number(r.level) || 0), 0);
}

export function reminderMessage(level, name, projectName) {
  const p = projectName ? `"${projectName}"` : "your group project";
  switch (level) {
    case 1:
      return `Hi ${name}! Friendly reminder from your team on ${p}: you have tasks waiting. Could you check in today?`;
    case 2:
      return `${name}, your contribution score on ${p} is below the minimum the team agreed on. Please finish your assigned tasks before the internal deadline.`;
    case 3:
      return `Team notice: ${name} has received 2 reminders and is still below the agreed minimum on ${p}. The team may need to reassign tasks.`;
    default:
      return `Final notice: as agreed in the team contract, ${name}'s low contribution on ${p} will be shown in the final report for the instructor.`;
  }
}

// Sube un nivel (máximo 4) y lo registra en project.reminders.
// Quien llama esta función es responsable de guardar el proyecto.
export function sendReminder(project, memberId) {
  const member = project.members.find((m) => sameId(m.id, memberId));
  const current = getReminderLevel(project, memberId);
  const level = Math.min(4, current + 1);
  if (current < 4) {
    project.reminders.push({ memberId, level, date: new Date().toISOString() });
  }
  return {
    level,
    alreadyMax: current >= 4,
    message: reminderMessage(level, member ? member.name : "teammate", project.name),
    email: member ? member.email : "",
  };
}
