# Replenishment workflow — user journey & system rules

This document describes the **end-to-end user journey** and **behavioural rules** implemented in the **Gap Scan prototype** (`prototype/gap-scan/`) from assumed application entry through **Close Gap**. It reflects the current HTML/JS prototype, not a live SAP backend.

---

## 1. Authentication & entry (assumed)

| Aspect | Rule / note |
|--------|-------------|
| **Login** | **Not implemented** in the prototype. In a full product, assume standard enterprise authentication (e.g. SAP IdP / corporate SSO) before the user reaches this app. |
| **Landing** | User opens the Replenishment App shell: header (back, app title, search, profile placeholders), **Documents List** (left), **detail** area (right), footer with store context and actions. |

---

## 2. Documents list (master)

| Step | User action | System behaviour |
|------|-------------|------------------|
| 2.1 | View list | Shows **Create New** plus work orders (e.g. `WO00000012`, and after save, `WO00000013`). |
| 2.2 | Search by ID | Filters documents by ID or **Create New** label text. |
| 2.3 | Select a document | Highlights selection; right pane loads the corresponding **detail** view. List badge (muted) shows **Replenish Articles**, **Close gap**, or **Task Complete** according to phase — not the raw WO state label. |
| 2.4 | Refresh / filter (docs) | Prototype shows toast only (no real refresh/filter). |

---

## 3. Create New (gap index)

**Purpose:** Review gap lines, see stock signals, select articles to start a replenishment task.

### 3.1 Summary

- **Number of Articles**
- **Articles with no stock**
- **+12 Hours Gaps**

### 3.2 Article list (per line)

| Element | Rule |
|---------|------|
| **Doc ID & time** | Shown in first column. |
| **Product name** | Main label. |
| **GTIN** | Shown under the name (article number line removed from this screen). |
| **SOH** | **Stock on hand** derived from mock location data (prefers `S001` quantity when present in the line’s location string). |
| **SOH = 0** | Also shows **SOO: 200** (example) and **Created at:** `DD/MM/YYYY` (from mock data). |
| **Location / hyperlink** | **Removed** from this screen (no “view” link here). |
| **Selection** | Checkbox per selectable row; error rows may be non-selectable. |
| **Search** | Filters by name, article id, or GTIN. |

### 3.3 Footer actions

| Action | Rule |
|--------|------|
| **Select All** | Toggles all visible checkboxes. |
| **Save** | Requires **at least one** selected article. Creates **`WO00000013`** (In Progress), inserts it in the documents list, switches detail to that work order. If `WO00000013` already exists, shows a message instead of duplicating. |

---

## 4. Work order in progress — gap replenishment (`WO00000013`)

**Purpose:** Work the gap list: view stock detail, remove stock from shelf, or record exceptions when stock is missing or unusable.

### 4.1 Layout

- **Detail title:** **Replenish Articles** (not the WO id).
- **Summary (Info):** WO id, **Number of Articles** (= lines on task), **Progress**; right column **#Articles Replenished** and **Exceptions** (live counts). No +30 min line.
- **Header row:** `Article` | `Location:SOH` | (actions column).
- **Per line:** Product name, GTIN under name, middle column lists **location : SOH** lines (mock).
- **View** opens **Articles Details** modal (article number, GTIN, stock on hand lines with **best-before** per line, stock on order block).

### 4.2 Progress

- **Progress %** = completed lines ÷ total lines × 100.
- A line counts as **completed** if any of:
  - **Removed** (saved via Remove Article flow), or
  - **Exception** (saved via BIN → Article Not Found), or
  - *(Legacy data only:)* replenished + code on a line — modal workflow for replenished/code is not used from the list in the current UX.

### 4.3 Remove Article (tap row — not View)

| Field | Rule |
|-------|------|
| Scan / Enter location | Required. |
| Scan GTIN | Required; **not** auto-filled — user must scan. |
| Enter quantity | Required. |
| Exp/Best before | Required, format **DD/MM** (auto-formatting while typing). |
| **Save** (primary) | Marks line **Removed**: green **Removed**, row **greyed out**, **no View**, **not clickable**, sorted to **bottom**. |
| **Cancel** | Closes without change. |
| **BIN** (footer, red icon) | Opens **Article Not Found** (row key preserved). |

### 4.4 Article Not Found (after BIN)

| Step | Rule |
|------|------|
| **Reason** (required) | One of: **Stock not found**, **Damaged Stock**, **Exp Stock**. |
| **Scan / Enter Location** | Shown only for **Damaged Stock** and **Exp Stock**; required when shown. |
| **Save** | Sets line to **Exception**: status **Exception** in **red**, row **greyed out**, **no View**, **not clickable**, sorted to **bottom**. Stores reason (+ location when applicable). |
| **Cancel** | Closes without marking the line. |

### 4.5 Close task (footer)

| Condition | Behaviour |
|-----------|-----------|
| **Progress ≠ 100%** | Modal **Error** — title **Error**, message **Task not finished**, button **Close**. Does **not** complete the work order. |
| **Progress = 100%** | Does **not** call legacy “finalize complete” in the prototype. Transitions the same work order into the **Close Gap** step: detail shows **`{WO id} — Close Gap`** and merchandising-style scan UI (see §5). |

---

## 5. Close Gap (post–100% close)

**Purpose:** Move product from storage to the sales floor and record how the shelf was filled.

### 5.1 Screen

- Title: **Close Gap** only (no WO id in title).
- **Summary:** **Gaps closed: X OF Y** (saved scans OF required removed lines); **Filled in full** and **Limited stock** counts with **%** of total task articles.
- User **only scans GTIN** in the scan field (confirm with **Enter**).
- **Eligible GTINs only:** A scan is accepted only if that GTIN was **removed** in the replenishment step via **Remove Article → Save** (line has `removed` + `removedMeta`, including entered quantity). **Exception-only** lines (BIN path) are **not** scannable here.
- **Invalid GTIN (not part of this task):** Popup **ERROR SCREEN** — message **Article not for this task** — button **Close**.
- **Duplicate scan** (required count for that GTIN already saved in Close Gap): Toast **Already scanned for this task** (no row added).
- **Task complete:** When every required removed line has a matching Close Gap row (by GTIN; supports multiple lines with the same GTIN), popup **TASK COMPLETE** — button **Close**.
- **Footer Close (main):** If the user taps **Close** before all required removed articles have been scanned and saved on this screen, popup **ERROR** — **Task not finished** — button **Close**. When all are done, **Close** completes the work order (prototype: clears Close Gap state and runs the same completion path as before).

### 5.2 Popup — Close Gap

| Element | Rule |
|---------|------|
| **Title** | Close Gap |
| **Article :** | Resolved article **name** from the gap replenishment lines by GTIN; if unknown, shows scanned GTIN. |
| **Close Gap :** | Fixed example: **Aisle 1 \| Shelf 1** |
| **Selection** | **Filled in full** or **Limited stock** (radio). |
| **Cancel** | Closes popup; returns focus to scan field. |
| **Save** | Requires a selection. Appends a table row (see §5.3). |

### 5.3 Table row (after Save)

| Column | Prototype value |
|--------|-----------------|
| **Article:** | Article display name |
| **Quantity:** | **100** (fixed prototype default) |
| **From:** | **Location** the user **scanned or entered** on **Remove Article** for that GTIN (same work order). If there is no matching removed line (e.g. prototype fallback), **Storage**. |
| **To :** | **Aisle 1 \| Shelf 1** |
| **Status:** | **Filled in full** or **Limited stock** (as selected) |

---

## 6. Completed work order detail (`WO00000012`, `WO00000013` after final Close)

- **Title:** **Task Complete**. Document list badge: **Task Complete** (not “All closed”).
- **Summary (2×2):** **Total articles**, **LOE** (creation → completed; prototype uses timestamps or `loeDisplay`); **Gaps filled** (count of Close Gap saves); **Exceptions** (count of exception lines).
- Same table columns as Close Gap; **exception** articles are listed with status **Exception** (red), **Quantity** and **From** (and **To**) shown as **—**.
- **No actions**: no GTIN scan, no footer task buttons.
- **`closeGapRows`** stores gap-fill rows; exception rows are merged from **`replenishment.lines`** when rendering the completed table.

---

## 7. Global UI rules

| Topic | Rule |
|-------|------|
| **Escape** | Closes the topmost open modal (order: Task complete → Close Gap scan error → Task-not-finished error → Article Not Found → Remove Article → Fill/Close Gap → others). |
| **Backdrop click** | Closes the corresponding modal where implemented. |
| **Toasts** | Short feedback for validation and prototype actions. |
| **Filters (articles)** | Modal for scanner/division/department/BMC exists; applying filter shows a toast — list filtering is prototype-level. |

---

## 8. Out of scope in this prototype

- Real **login**, roles, and authorisation.
- Persistence to SAP or any server; all state is **in-memory** until refresh.
- Real scanning hardware integration (fields accept keyboard input as scan simulation).

---

*Last aligned with prototype: `prototype/gap-scan/app.js`, `index.html`, `styles.css`.*
