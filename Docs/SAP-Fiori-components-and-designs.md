# SAP Fiori: Components and Design

A concise reference for SAP Fiori user experience, UI building blocks, and where to find official guidance.

---

## What is SAP Fiori?

**SAP Fiori** is SAP’s design system and UX approach for enterprise applications: role-based, responsive, consistent across SAP products (S/4HANA, BTP, SuccessFactors, etc.). Implementations typically use **SAPUI5** (or **OpenUI5**) web components and follow the **SAP Fiori design guidelines**.

---

## Design principles

| Principle | Meaning |
|-----------|---------|
| **Role-based** | Tasks and apps match the user’s job, not the backend module structure. |
| **Adaptive** | Layouts work on desktop, tablet, and phone where applicable. |
| **Simple** | One task per screen where possible; progressive disclosure for complexity. |
| **Coherent** | Same patterns, terminology, and visuals across apps. |
| **Delightful** | Clear feedback, meaningful empty states, accessible by default. |

**SAP Horizon** is the current visual theme family (e.g. Morning Horizon, Evening Horizon, Quartz Light/Dark). Older references may mention **Belize**; new apps should target Horizon.

---

## Technology stack (typical)

- **SAPUI5 / OpenUI5** — JavaScript/HTML5 framework; control library is the main “component” set.
- **SAP Fiori elements** — Metadata-driven floorplans (List Report, Object Page, Overview Page, etc.) that generate UI from OData annotations.
- **SAP Build / SAP Build Apps** — Low-code; still aligned with Fiori patterns where applicable.

---

## Core UI patterns (floorplans)

These are **layouts + behaviors**, not single controls:

| Floorplan | Use case |
|-----------|----------|
| **Initial** | Entry / launch / search-first experience. |
| **List report** | Work with many items; filters, table, navigation to details. |
| **Object page** | One business object: header, sections, subsections, inline edit. |
| **Overview page** | Cards and KPIs for at-a-glance monitoring. |
| **Wizard** | Multi-step guided flows with validation. |
| **Analytical list page** | List + chart + drilldown for analytical work. |

Fiori elements implement these with OData V2/V4 and annotations (`UI.LineItem`, `UI.FieldGroup`, `Common.Label`, etc.).

---

## Fundamental controls (SAPUI5)

Grouping is conceptual; see the Demo Kit for the full API.

### Layout and structure

- `sap.m.App`, `sap.m.SplitApp`, `sap.f.FlexibleColumnLayout` — shell and master-detail.
- `sap.m.Page`, `sap.f.DynamicPage` — page chrome, header collapse, content scroll.
- `sap.m.Bar`, `sap.m.Toolbar`, `sap.m.OverflowToolbar` — actions and grouping.
- `sap.ui.layout` — `Grid`, `HorizontalLayout`, `VerticalLayout`, `Splitter`, `CSSGrid`.

### Navigation and chrome

- `sap.m.Shell` — top-level container (often wrapped by FLP).
- `sap.tnt.ToolPage`, `sap.tnt.SideNavigation` — tool layout patterns.
- `sap.m.IconTabBar`, `sap.uxap.ObjectPageLayout` — tabs and object page structure.

### Input and forms

- `sap.m.Input`, `sap.m.TextArea`, `sap.m.DatePicker`, `sap.m.TimePicker`, `sap.m.ComboBox`, `sap.m.MultiComboBox`, `sap.m.Select`, `sap.m.Switch`, `sap.m.CheckBox`, `sap.m.RadioButtonGroup`.
- `sap.m.Label`, `sap.m.Form`, `sap.ui.layout.form` — labels and responsive forms.
- `sap.m.SearchField` — consistent search in bars and lists.

### Data display

- `sap.m.Table`, `sap.m.ColumnListItem`, `sap.ui.table.Table` — grid vs responsive table.
- `sap.m.List`, `sap.m.StandardListItem`, `sap.m.ObjectListItem`, `sap.m.CustomListItem`.
- `sap.m.Text`, `sap.m.Title`, `sap.m.ObjectStatus`, `sap.m.ObjectNumber`, `sap.m.ObjectMarker`.
- `sap.m.FeedListItem`, `sap.m.Timeline` — activity-style content.

### Charts and visualization

- `sap.viz` — charts bound to flat or hierarchical models (often used with analytical cards).

### Feedback and overlays

- `sap.m.Dialog`, `sap.m.Popover`, `sap.m.ActionSheet`, `sap.m.MessageBox`, `sap.m.MessageToast`, `sap.m.MessageStrip`, `sap.m.BusyDialog`, `sap.m.ProgressIndicator`.

### Upload and media

- `sap.m.UploadCollection`, `sap.ui.unified.FileUploader` — file handling patterns.

---

## Design tokens and theming

- Use **CSS variables** and **theming parameters** from the active theme (Horizon) instead of hard-coded colors when possible.
- **Content density** — `sapUiSizeCozy` vs `sapUiSizeCompact` affects control heights and spacing.
- **Icon font** — `SAP-icons` for consistent iconography.

---

## Accessibility and globalization

- Set **language** and **RTL** via SAPUI5 bootstrap and configuration.
- Use **accessible names** (`ariaLabelledBy`, `ariaDescribedBy`, `tooltip`) on interactive controls.
- Prefer **semantic controls** (real buttons, links, headings) over generic `div` clicks.

---

## Official resources

| Resource | URL |
|----------|-----|
| SAP Fiori design guidelines | https://experience.sap.com/fiori-design-web/ |
| SAPUI5 Demo Kit (controls, samples, API) | https://ui5.sap.com/ |
| OpenUI5 Demo Kit | https://openui5.hana.ondemand.com/ |
| SAP Fiori elements (developer topic) | https://help.sap.com/docs/SAP_FIORI_ELEMENTS |

*(URLs are the canonical entry points; SAP may redirect or version paths over time.)*

---

## Quick checklist for new screens

1. Pick the right **floorplan** (list report vs object page vs custom).
2. Align with **Horizon** visuals and **density** used by the launchpad.
3. Use **overflow toolbar** for many actions; keep primary action visible.
4. Provide **loading**, **empty**, and **error** states.
5. Verify **keyboard** and **screen reader** behavior on critical paths.

---

*This document is a high-level summary for planning and onboarding. For control properties, events, and samples, always use the SAPUI5 Demo Kit and the official Fiori design guideline pages.*
