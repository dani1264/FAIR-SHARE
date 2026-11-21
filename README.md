# FairShare

**Measure real contribution in student group projects, not hours.**

FairShare is a web platform where student teams agree on a team contract, split tasks, see each member's contribution score, send escalating reminders and generate a fair contribution report for the instructor.

🔗 **Live demo:** _add your GitHub Pages link here_

## The problem
In almost every group project, one or two students do most of the work. The ones who work have no evidence, feel uncomfortable calling teammates out, and the professor can't see what happens inside the team.

## Features
| Page | What it does |
|---|---|
| **Project** | Create the project, add members and agree on a team contract. Tracking only starts once every member accepts. |
| **Tasks** | Assign tasks with an owner and a due date; overdue tasks are flagged. |
| **Dashboard** | Each member's contribution score, with escalating reminders for anyone below the minimum. |
| **Report** | Anonymous peer evaluation (1–5) and a printable contribution report for the instructor. |

## How the score works
Each member is compared with their fair share of the team's work (the team average), capped at 100:

- **50%** document edits
- **30%** completed tasks
- **20%** anonymous peer rating

70+ = *on track* · 60–69 = *at risk* · below the contract minimum = reminders + flagged in the report.

## Try it
1. Open the live demo (or run `index.html` with VS Code's **Live Server** extension).
2. Click **Load demo team**.
3. Go to **Dashboard**: Matías is below the minimum. Send him reminders.
4. Mark one of his tasks as done in **Tasks** and watch his score change.
5. Rate teammates and print the report in **Report**.

> The current version uses demo data stored in the browser (`localStorage`). Reminders are shown in the app and can be opened as an email.

## Built with
HTML, CSS and vanilla JavaScript (ES modules), hosted on GitHub Pages. Built with help from Claude.

## Project structure
```
index.html        Project + team contract
tasks.html        Tasks
dashboard.html    Contribution dashboard + reminders
report.html       Peer evaluation + report
app-pages.css     Styles
*.js              Logic (score.js holds the formula)
```

## What's next
- Live integrations with Google Docs, Microsoft Word and Canva
- Instructor panel to follow several teams
- Canvas LMS integration
- Teams choose their own score weights in the contract
