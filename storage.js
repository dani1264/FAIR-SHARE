// =====================================================================
// storage.js
// ÚNICO archivo que toca localStorage. Las demás páginas usan estas
// funciones y nunca llaman a localStorage directamente.
// Así, si mañana cambiamos a una base de datos, solo editamos este archivo.
// =====================================================================

// Clave con la que guardamos el proyecto en el navegador
const STORAGE_KEY = "fairshare.project";

// Lee el proyecto guardado. Devuelve el objeto o null si no hay nada.
export function loadProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // localStorage solo guarda texto, por eso convertimos de JSON a objeto
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    // Si el JSON está corrupto o el navegador bloquea el storage, no rompemos la app
    console.error("Could not read the project:", error);
    return null;
  }
}

// Guarda el proyecto completo. Devuelve true si funcionó.
export function saveProject(project) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    return true;
  } catch (error) {
    console.error("Could not save the project:", error);
    return false;
  }
}

// Atajo para "leer → modificar → guardar" en un solo paso.
// Ejemplo de uso en otra página:
//   updateProject(p => { p.tasks.push(newTask); });
export function updateProject(changeFn) {
  const project = loadProject();
  if (!project) return null;
  changeFn(project);          // la función recibida modifica el objeto
  saveProject(project);
  return project;
}

// Borra el proyecto (botón "Start over")
export function clearProject() {
  localStorage.removeItem(STORAGE_KEY);
}

// Genera un id único y legible, por ejemplo "task-lq3k9a2f"
// Date.now() en base 36 + 4 caracteres al azar = casi imposible repetir
export function createId(prefix) {
  const random = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${Date.now().toString(36)}${random}`;
}
