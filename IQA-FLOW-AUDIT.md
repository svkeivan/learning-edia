# IQA Section — Flow Audit & Improvement Notes

_Initial audit written after reviewing all IQA pages, the data layer, and mock data._
_Last updated: March 2026 — reflects all changes implemented to date._

---

## 1. How the IQA System Works Today

### Data Model

```
IqaCategory
  ├── id, name, riskLevel (Low / Medium / High)
  ├── recheckPercent        — % of a category's submissions that must be IQA checked
  └── rechecksPerReviewer   — fallback max queue size per reviewer (set in code; not exposed in UI)

IqaTutor
  ├── id, name, email
  ├── categoryId            — links to the risk category this person belongs to
  ├── role                  — 'assessor' | 'reviewer' | 'both'
  └── maxQueue?             — per-person queue override; falls back to category rechecksPerReviewer

IqaCheck                    ← one record per submission going through IQA
  ├── id, submissionId
  ├── assessorId            — the assessor who originally graded the submission
  ├── assignedTo?           — the reviewer assigned to IQA this check
  ├── status                — Pending | Approved | Rejected
  ├── outcomeType?          — approved | recheck-assessor | return-module
  └── reviewerName?, reviewedAt?, feedback?

IqaFeedbackRecord           ← written when a check is rejected; read on People > Assessors tab
  ├── id, assessorId
  ├── studentName, assessmentTitle
  ├── outcomeType, feedback, reviewerName, reviewedAt
  └── read (bool)

Skipped submissions          ← Set<submissionId> in sessionStorage
```

### Student Enrollments

Each student is mapped to a real course package in `studentEnrollments` (mock-data.ts).
`getStudentPackage(email)` returns the package name, used on Review Queue cards, the Assign page, and the All tab.

---

### Full User Flow

#### Step 1 — Setup: Categories (`/iqa/categories`)

Admin defines risk tiers (e.g. Low Risk = 10%, Medium = 25%, High = 50%).
Each category sets the `recheckPercent` (what fraction of that category's submissions need IQA).

- **Add Category** button opens a modal with Name, Recheck %, and Risk Level.
- **Edit** button per row allows updating those same fields.
- **Delete** button per row removes the category (with a confirmation dialog warning if assessors are assigned). Deletions are soft-deleted — stored in `sessionStorage` so a page refresh restores the base data.

> The **Rechecks / Reviewer** (default queue size) field was removed from the Create and Edit modals — it is an internal fallback value, not something admins need to set per category. Per-reviewer queue limits are managed in People → Reviewers → Max Queue.

Empty state: if no categories exist, the table body shows an actionable CTA to add the first category.

#### Step 2 — Setup: People & Roles (`/iqa/people`)

Admin adds and manages people. Each person has a **role**:

| Role | Assessors tab | Reviewers tab | Can grade | Can be assigned IQA |
|---|---|---|---|---|
| `assessor` | ✓ | — | ✓ | — |
| `reviewer` | — | ✓ | — | ✓ |
| `both` | ✓ | ✓ | ✓ | ✓ |

- **Assessors tab**: shows role badge, category selector, and recheck % for that category. Also shows an **IQA Feedback** column — an amber unread badge appears when a reviewer has sent feedback after rejecting that assessor's work. Clicking expands an inline panel with all feedback records.
- **Reviewers tab**: shows role badge, category, and an editable **Max Queue** input (overrides the category fallback).
- **Add Person modal**: includes a Role dropdown. Defaults to the tab you opened it from.

#### Step 3 — Queue Management: Assign for Recheck (`/iqa/assign`) — Admin only

Admin decides which graded submissions enter the IQA queue. **Defaults to the "Not in Queue" tab** on load.

| Tab | What it shows | Actions available |
|---|---|---|
| **All** | Every graded submission + current IQA status | Read-only + pagination |
| **In Queue** | Submissions with an active `IqaCheck` record | Assign reviewer, Unassign (with confirm), IQA History modal |
| **Not in Queue** | Graded, not-excluded, not-queued submissions | **Add to Queue** (auto-assign only) · **Exclude** · multi-select bulk ops |

**Filters**: Student name search · Assessor · Category · **Course Package / Trade** · Exam · Status (queue tab only).

**Reviewer Workload panel**: Collapsible. Click the panel header to expand/collapse. When a Category filter is active, only reviewers in that category are shown.

**IQA Coverage section**: Below the workload panel — one progress bar per category showing how many required rechecks have been completed vs. the target for this period.

**Reviewer dropdowns** (inline assign, bulk assign, modal assign) only show people with `role !== 'assessor'`.

**Auto-assign** picks the reviewer with the most remaining capacity in the **same category** as the assessor first. Falls back to any eligible reviewer if no same-category reviewer has capacity.

**Not in Queue tab**: Only "Add to Queue" (auto-assign) and "Exclude" actions are available per row — no manual reviewer selection at the row level.

**Exclude** (formerly "Skip" in not-queue context): marks a submission as excluded from IQA queueing. These show as "Excluded" in the All tab and can be restored with "Restore all".

**Skip** (in queue context, via Review Queue card or IQA History modal): removes the `IqaCheck` record AND marks as excluded.

**Bulk Exclude** and **Bulk Unassign** both require confirmation via a dialog before executing.

**IQA History modal** (bulk action on In Queue): shows prior IQA history per student and cohort coverage per exam. Each row has inline **Assign** (reviewer dropdown) and **Skip** actions.

**Column sorting**: click any column header (Student, Course Package, Assessment, Result, Graded By) to sort asc/desc.

**Empty states**: No-queue empty state links to Not in Queue; Not-in-queue empty state confirms all eligible items are handled.

#### Step 4 — Review: Review Queue (`/iqa/review-queue`) — Reviewer only

IQA reviewer sees pending reviews as a **2-column card grid** (Pending tab is default).

Each card shows: student name, assessment title, trade badge, module, **Pass/Fail badge** (no percentage), course package, graded by, assigned reviewer, PDF count.

Actions per card: **Review →** (opens detail page) | **Skip** (removes from queue and excludes).

**Pending tab empty state**: links directly to the Assign for Recheck page so the reviewer can ask an admin to queue more items.

**All tab** shows a paginated table of all IQA checks — Student, Assessment, Package, Result, Graded By, IQA Status, Submitted. Each row is **clickable** and navigates to the review detail page.

#### Step 5 — Review: Detail Page (`/iqa/review-queue/[id]`) — Reviewer only

Two-column layout:
- **Left**: student's submitted PDF(s) or Q&A answers
- **Right**: assessor's evaluation form (criteria checklist, evidence notes, overall comments — mocked)

Header shows: assessment title + module, status badge, student name + email + submitted date (no time taken), graded by, assigned reviewer, category.

**IQA History banner**: If the student has been IQA reviewed before (other submissions), a blue info banner appears in the header showing how many prior reviews exist, which assessments were reviewed, and whether the current reviewer has reviewed this student's work before.

**Assessor's Decision** section: Pass / Fail badge only (no score percentage).

Three outcome buttons when Pending:

| Button | `outcomeType` | What it does |
|---|---|---|
| **Approve** (green) | `approved` | Confirms assessor grading is correct |
| **Fail — Recheck by Assessor** (amber) | `recheck-assessor` | Assessor must re-evaluate; writes feedback record to assessor's inbox |
| **Fail — Return to Module** (red) | `return-module` | Student revisits module before retaking; writes feedback record to assessor's inbox |

Feedback text is required for both Fail outcomes. On submit, a success banner appears with a "Back to Queue" link.

---

## 2. Issues Resolved

All 10 issues identified in the original audit have been fixed.

| # | Issue | Resolution |
|---|---|---|
| 2.1 | People tabs showed the same list | Added `role: 'assessor' \| 'reviewer' \| 'both'` to `IqaTutor`; each tab now filters correctly |
| 2.2 | `IqaCheck.tutorId` ambiguous name | Renamed to `assessorId` throughout data model and all pages |
| 2.3 | "Skip" label used for two different actions | Not-in-Queue action renamed to **"Exclude"**; toast and badges updated accordingly |
| 2.4 | Auto-assign ignored category | `autoAssignReviewer` now prefers same-category reviewers first, falls back to any |
| 2.5 | `activeRows` was dead code in modal | Removed |
| 2.6 | Reject outcome had no downstream effect | `IqaFeedbackRecord` store added; rejection writes a feedback record; People > Assessors tab shows unread badge and expandable inbox |
| 2.7 | Course package was hash-derived mock | `studentEnrollments[]` added to mock-data.ts; `getStudentPackage(email)` used on all pages |
| 2.8 | Assign page defaulted to read-only All tab | Default tab changed to `'not-queue'` |
| 2.9 | No Trade filter on Assign page | Trade filter dropdown added (Gas Engineering / Electrical / Plumbing) |
| 2.10 | Workload panel not context-aware | Panel now filters to the active category when a category filter is set |

---

## 3. UX & UI Improvements — Status

### Implemented ✓

| # | Improvement |
|---|---|
| 1 | Role field on people — Assessors / Reviewers tabs now correctly filtered |
| 2 | Assign page defaults to Not in Queue |
| 3 | Trade shown under Course Package column (combined column) |
| 4 | Confirmation dialog for bulk Exclude and bulk Unassign |
| 5 | Auto-assign matches category |
| 6 | IQA coverage progress bars per category on Assign page |
| 7 | IQA history context banner on Review Detail page |
| 9 | Reviewer dropdowns show only people with reviewer or both role |
| 10 | Not-in-Queue action renamed Exclude; Manual button removed (auto-assign only) |
| 11 | Tab counts reflect actual role counts |
| 12 | Delete (with confirm dialog) added to Categories; not added to People (managed elsewhere) |
| 13 | Reviewer workload panel is collapsible |
| 15 | Review Queue All tab rows link to detail page |
| 16 | Empty states with actionable CTAs (Pending → Assign page; Queue empty → Not in Queue tab) |
| 17 | Column sorting on Assign page table (Student, Course Package, Assessment, Result, Graded By) |
| 18 | Student name / email search on Assign page |

### Still Pending

| # | Improvement | Reason |
|---|---|---|
| 8 | Auto-redirect from Review Detail after action | Currently requires manual "Back to Queue" click |
| 19 | Recheck target vs. actual progress per category | Coverage bars added per category; a full breakdown table (target vs. achieved vs. in-progress) is still pending |

---

## 4. Known Limitations (Mock Data)

| Area | Limitation |
|---|---|
| Assessor evaluation form | Criteria, evidence notes, and comments are procedurally generated from submission ID; not real assessor input |
| Course packages | `studentEnrollments` is hardcoded mock data; in production this would come from the LMS enrolment API |
| Feedback notifications | `IqaFeedbackRecord` is stored in `sessionStorage` only; clears on tab close. In production this would persist to a database and trigger email/in-app notifications |
| Student "Return to Module" | Outcome is recorded in `IqaCheck.outcomeType` but the student portal has no way to see it yet |
| Submission status | Graded submissions keep their original Pass/Fail status even after a "Fail — Recheck" decision; in production the submission would revert to "Grading" |
| Category deletions | `removeIqaCategory` writes to `sessionStorage` only; base categories reappear on session clear |

---

## 5. CSS / Styling

The app uses **Tailwind CSS only** — no dark mode.

The original `globals.css` contained CSS custom properties (`--background`, `--foreground`) with a `@media (prefers-color-scheme: dark)` block inherited from the Next.js starter template. This caused text colours to break on systems with dark mode enabled because `body { color: var(--foreground) }` overrode Tailwind utilities.

This was fixed by removing all theme variables and the dark mode media query. `globals.css` now sets a plain static body background (`#f9fafb`) and text colour (`#111827`) with no system-preference overrides.

---

_End of document._
