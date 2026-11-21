// =====================================================================
// data.js
// Datos de ejemplo para la demo. Equipo de 4 personas:
// Ana, Sofía y Diego aportan bien; Matías casi no aporta y debe
// quedar "below minimum" (bajo el mínimo).
// Devolvemos un objeto NUEVO cada vez para no modificar el original.
// =====================================================================

export function createDemoProject() {
  // Miembros del equipo (los ids se usan en todo el resto del modelo)
  const members = [
    { id: "m1", name: "Ana", email: "ana@usf.edu" },
    { id: "m2", name: "Sofía", email: "sofia@usf.edu" },
    { id: "m3", name: "Diego", email: "diego@usf.edu" },
    { id: "m4", name: "Matías", email: "matias@usf.edu" }
  ];

  return {
    id: "demo-project",
    name: "Biosensor Design Report",
    course: "Intro to Biomedical Engineering",
    docUrl: "https://docs.google.com/document/d/DEMO-DOCUMENT-ID/edit",
    dueDate: "2026-12-10",

    // Contrato de equipo: todos lo aceptaron (consentimiento)
    contract: {
      minScore: 60,
      rules: [
        "Each member reaches a contribution score of at least 60.",
        "Internal deadline: drafts are due 3 days before the final due date.",
        "If you can't finish a task, tell the team at least 24 hours before.",
        "Members below the minimum receive reminders; level 4 is shown in the final report."
      ],
      acceptedBy: ["m1", "m2", "m3", "m4"]
    },

    members,

    // Tareas: Ana 3 hechas, Sofía 3, Diego 2, Matías 0 (tiene 2 pendientes)
    tasks: [
      { id: "t1", title: "Write introduction", assigneeId: "m1", dueDate: "2026-11-20", done: true },
      { id: "t2", title: "Find 5 research papers", assigneeId: "m1", dueDate: "2026-11-18", done: true },
      { id: "t3", title: "Design sensor diagram", assigneeId: "m1", dueDate: "2026-11-25", done: true },
      { id: "t4", title: "Write methods section", assigneeId: "m2", dueDate: "2026-11-24", done: true },
      { id: "t5", title: "Create results tables", assigneeId: "m2", dueDate: "2026-11-26", done: true },
      { id: "t6", title: "Format references (APA)", assigneeId: "m2", dueDate: "2026-11-28", done: true },
      { id: "t7", title: "Build budget estimate", assigneeId: "m3", dueDate: "2026-11-27", done: true },
      { id: "t8", title: "Write discussion", assigneeId: "m3", dueDate: "2026-12-01", done: true },
      { id: "t9", title: "Write conclusion", assigneeId: "m4", dueDate: "2026-11-22", done: false },
      { id: "t10", title: "Prepare presentation slides", assigneeId: "m4", dueDate: "2026-12-03", done: false },
      { id: "t11", title: "Final proofreading", assigneeId: "m1", dueDate: "2026-12-06", done: false }
    ],

    // Ediciones en el documento de Google Docs (Matías casi no edita)
    edits: [
      { memberId: "m1", count: 42 },
      { memberId: "m2", count: 35 },
      { memberId: "m3", count: 28 },
      { memberId: "m4", count: 5 }
    ],

    // Evaluación entre pares (1 a 5). Cada uno evalúa a los otros 3.
    peerRatings: [
      // Ana recibe
      { fromId: "m2", toId: "m1", rating: 5 },
      { fromId: "m3", toId: "m1", rating: 5 },
      { fromId: "m4", toId: "m1", rating: 4 },
      // Sofía recibe
      { fromId: "m1", toId: "m2", rating: 5 },
      { fromId: "m3", toId: "m2", rating: 4 },
      { fromId: "m4", toId: "m2", rating: 4 },
      // Diego recibe
      { fromId: "m1", toId: "m3", rating: 4 },
      { fromId: "m2", toId: "m3", rating: 4 },
      { fromId: "m4", toId: "m3", rating: 5 },
      // Matías recibe (ratings bajos)
      { fromId: "m1", toId: "m4", rating: 2 },
      { fromId: "m2", toId: "m4", rating: 1 },
      { fromId: "m3", toId: "m4", rating: 2 }
    ],

    // Matías ya recibió un recordatorio amable (nivel 1)
    reminders: [
      { memberId: "m4", level: 1, date: "2026-11-18" }
    ]
  };
}
