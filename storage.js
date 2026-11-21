// storage.js — Única puerta de entrada a localStorage.
// ⚠️ Usa este archivo SOLO si el tuyo no exporta loadProject y saveProject.
import { demoProject } from "./data.js";

const KEY = "fairshare-project";

export function loadProject() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Could not read project", e);
    return null;
  }
}

export function saveProject(project) {
  try {
    localStorage.setItem(KEY, JSON.stringify(project));
  } catch (e) {
    console.error("Could not save project", e);
  }
}

export function resetDemo() {
  const copy = JSON.parse(JSON.stringify(demoProject));
  saveProject(copy);
  return copy;
}

export function clearProject() {
  localStorage.removeItem(KEY);
}
