// data.js — Equipo de demo. Matías queda bajo el mínimo y Diego "en riesgo".
export const demoProject = {
  id: "demo",
  name: "Biosensor Design Report",
  course: "Intro to Biomedical Engineering",
  docUrl: "https://docs.google.com/document/d/DEMO-DOCUMENT-ID",
  dueDate: "2026-12-10",
  contract: {
    minScore: 60,
    rules: [
      "Each member reaches a contribution score of at least 60.",
      "Internal deadline: drafts are due 3 days before the final due date.",
      "If you can't finish a task, tell the team at least 24 hours before.",
      "Members below the minimum receive reminders; level 4 is shown in the final report.",
    ],
    acceptedBy: [],
  },
  members: [
    { id: "m1", name: "Ana", email: "ana@usf.edu" },
    { id: "m2", name: "Sofía", email: "sofia@usf.edu" },
    { id: "m3", name: "Diego", email: "diego@usf.edu" },
    { id: "m4", name: "Matías", email: "matias@usf.edu" },
  ],
  tasks: [
    { id: "t1", title: "Write the introduction", assigneeId: "m1", dueDate: "2026-11-28", done: true },
    { id: "t2", title: "Literature review (5 sources)", assigneeId: "m1", dueDate: "2026-11-30", done: true },
    { id: "t3", title: "Design the sensor diagram", assigneeId: "m1", dueDate: "2026-12-01", done: true },
    { id: "t4", title: "Methods section", assigneeId: "m2", dueDate: "2026-12-02", done: true },
    { id: "t5", title: "Results tables", assigneeId: "m2", dueDate: "2026-12-03", done: true },
    { id: "t6", title: "Discussion section", assigneeId: "m3", dueDate: "2026-12-04", done: true },
    { id: "t7", title: "Conclusion + references", assigneeId: "m3", dueDate: "2026-12-05", done: false },
    { id: "t8", title: "Budget and materials list", assigneeId: "m4", dueDate: "2026-11-20", done: false },
    { id: "t9", title: "Final formatting", assigneeId: "m4", dueDate: "2026-12-06", done: false },
  ],
  edits: [
    { memberId: "m1", count: 42 },
    { memberId: "m2", count: 35 },
    { memberId: "m3", count: 16 },
    { memberId: "m4", count: 3 },
  ],
  peerRatings: [
    { fromId: "m1", toId: "m2", rating: 5 }, { fromId: "m1", toId: "m3", rating: 4 }, { fromId: "m1", toId: "m4", rating: 1 },
    { fromId: "m2", toId: "m1", rating: 5 }, { fromId: "m2", toId: "m3", rating: 3 }, { fromId: "m2", toId: "m4", rating: 2 },
    { fromId: "m3", toId: "m1", rating: 5 }, { fromId: "m3", toId: "m2", rating: 4 }, { fromId: "m3", toId: "m4", rating: 2 },
    { fromId: "m4", toId: "m1", rating: 4 }, { fromId: "m4", toId: "m2", rating: 4 }, { fromId: "m4", toId: "m3", rating: 4 },
  ],
  reminders: [],
};
