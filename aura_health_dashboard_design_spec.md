# Aura Health — Clinical Dashboard Design Specification

> Implementation-ready visual specification based on the supplied dashboard reference. Use this document as the source of truth when translating the reference into React/HTML/CSS. The screenshot is a visual reference, so color values and measurements below are close estimates rather than original source tokens.

## 1. Design direction

- **Product:** Premium clinical operations dashboard for a modern healthcare clinic.
- **Visual style:** Warm editorial healthcare UI; calm, refined, professional, high-trust.
- **Overall feel:** Deep aubergine navigation, warm ivory canvas, blush-tinted surfaces, muted gold accents, and dark espresso calls to action.
- **Avoid:** Neon colors, overly saturated blue, dense enterprise tables, heavy borders, harsh pure-black text, excessive gradients, and generic all-blue medical UI.
- **Density:** Medium. Keep important information visible at a glance with generous spacing and clear hierarchy.
- **Desktop reference:** 1047 × 835 px screenshot. The dashboard uses a full-height left rail and a scrollable main content region.

## 2. Color system

The values below are approximate matches sampled/visually estimated from the reference. Use CSS custom properties so they can be tuned centrally.

| Token | Hex | Usage |
|---|---|---|
| `--color-sidebar` | `#381840` | Main left navigation background |
| `--color-sidebar-deep` | `#200028` | On-duty clinical lead card and deep accent surfaces |
| `--color-sidebar-text` | `#BCA5C2` | Inactive navigation labels and icons |
| `--color-sidebar-active` | `#F0E0C0` | Active Dashboard pill |
| `--color-canvas` | `#FFF8FA` | Main page background, warm off-white |
| `--color-surface` | `#FFFFFF` | Metric cards, consultation card, alert cards |
| `--color-surface-blush` | `#FFF5FA` | Patient row background and soft highlighted surfaces |
| `--color-surface-cream` | `#F0E0C0` | Location selector, status pills, priority panel background |
| `--color-surface-cream-light` | `#F8EEDC` | Soft warm surfaces and badges |
| `--color-text` | `#28152D` | Main headings and primary body text |
| `--color-text-muted` | `#827783` | Supporting text, timestamps, metadata |
| `--color-text-subtle` | `#A59AA5` | Small labels and low-emphasis metadata |
| `--color-action` | `#300D05` | Primary action buttons, dark espresso-brown |
| `--color-action-hover` | `#451A10` | Hover state for primary action |
| `--color-accent-purple` | `#EEDCF3` | Lavender status backgrounds |
| `--color-accent-purple-strong` | `#4A2054` | Secondary dark-purple buttons |
| `--color-accent-peach` | `#F9D8C9` | Warm alert/status backgrounds |
| `--color-accent-orange` | `#E9865D` | Warning status, alert dots, small emphasis |
| `--color-accent-pink` | `#FBE6F5` | Care-index icon background |
| `--color-success` | `#6F7860` | Optimal status and subdued progress indicators |
| `--color-border` | `#F0E9EF` | Very subtle separators, if needed |
| `--color-shadow` | `rgba(47, 20, 45, 0.06)` | Soft card shadows |

### Color usage rules

1. Keep the canvas warm and nearly white; do not use pure gray page backgrounds.
2. Use the aubergine sidebar as the strongest large color block.
3. Reserve espresso brown for primary actions and important labels.
4. Use cream/gold for active navigation, clinic location, and neutral status pills.
5. Use lavender, blush, and peach for category/status differentiation—not as large saturated backgrounds.
6. Avoid visible borders around every card. Prefer subtle shadow and tonal separation.

## 3. Typography

### Recommended font pairing

Load these from Google Fonts or use close system fallbacks:

- **Display / editorial headings:** `DM Serif Display`, with `Georgia`, serif as fallback.
- **UI / body / controls:** `DM Sans`, with `Inter`, `Arial`, sans-serif as fallback.
- **Optional italic emphasis:** Use the italic face of `DM Serif Display` for the clinician name in the greeting.

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

:root {
  --font-ui: "DM Sans", Inter, Arial, sans-serif;
  --font-display: "DM Serif Display", Georgia, serif;
}
```

### Type scale

| Element | Suggested size | Weight / line height | Font |
|---|---:|---|---|
| Greeting headline | `32–36px` desktop | 400 / 1.08 | Display serif |
| Greeting name | `italic` | 400 | Display serif italic |
| Main card title | `19–22px` | 400 / 1.2 | Display serif |
| Metric value | `27–31px` | 400 / 1.0 | Display serif |
| Alert/patient title | `14–16px` | 600 / 1.35 | UI sans |
| Body copy | `12–14px` | 400 / 1.5 | UI sans |
| Sidebar item | `13–14px` | 500 / 1.3 | UI sans |
| Eyebrow / metric label | `9–11px` | 600 / 1.35, uppercase | UI sans |
| Status pill | `10–11px` | 600 / 1.2 | UI sans |
| Tiny metadata | `10–11px` | 400 / 1.4 | UI sans |

### Typography behavior

- Use sentence case for card titles and headings.
- Use uppercase, letter-spaced micro-labels above section titles.
- Main greeting is editorial and large; supporting description remains compact.
- Avoid making every heading bold. The serif typeface and spacing provide hierarchy.
- Use tabular numerals for times, metric values, and patient IDs where available.

## 4. Page structure and layout

### Desktop layout

- App shell: `100vw × 100vh`, with `12–16px` outer inset around the rounded application frame where practical.
- Sidebar: fixed/sticky left rail, approximately `244px` wide at the screenshot size (about 23% of the frame).
- Main area: flexible width; internal padding around `30–32px`.
- Sidebar and main content fill the viewport height. Main content scrolls vertically if needed.
- Outer frame: rounded corners around `28–32px`; subtle dark outline/shadow.

```css
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 244px minmax(0, 1fr);
  overflow: hidden;
  border-radius: 30px;
  background: var(--color-canvas);
  box-shadow: 0 10px 32px var(--color-shadow);
}

.main-content {
  min-width: 0;
  overflow: auto;
  padding: 24px 30px 32px;
}
```

### Main content order

1. Top utility bar: search, clinic selector, notifications, clinician profile.
2. Greeting / page intro: live clinic badge, date/location, headline, short operational summary, action buttons.
3. Four KPI cards in a single desktop row.
4. Lower dashboard: wide consultation queue on the left; priority clinical alerts on the right.
5. Additional content can continue below the fold, but preserve the same spacing and surface treatment.

### Spacing system

Use a consistent 4px base scale:

- `4px`: icon-to-label micro-gap
- `8px`: tight internal spacing
- `12px`: small element spacing
- `16px`: standard component gap
- `20px`: compact card padding/gap
- `24px`: section gap
- `30–32px`: page horizontal padding
- `36–40px`: separation between major sections

Recommended CSS variables:

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
}
```

## 5. Sidebar navigation

### Appearance

- Width: `244px` desktop.
- Background: `--color-sidebar`.
- Padding: `20px` horizontally; approximately `22px` top.
- Logo row: small warm orange location/medical pin icon, “Aura Health” in white, subtitle “CLINICAL SUITE” in muted lavender.
- Navigation starts below the brand with a generous vertical gap.
- Each navigation item: about `38–40px` tall, rounded pill with icon and label.
- Inactive item: transparent background, muted lavender text/icon.
- Active item: cream background, dark muted text/icon.
- Bottom on-duty card: deep aubergine background, rounded corners, compact lead/doctor details.

### Navigation items

1. Dashboard — active by default
2. Patient Care
3. Diagnostics & Labs
4. Prescriptions
5. Reports
6. Clinic Settings

Use a consistent 16px outline icon set such as **Lucide**. Suggested icon mappings:
- Dashboard: `layout-dashboard` or `grid-2x2`
- Patient Care: `users-round`
- Diagnostics & Labs: `microscope`
- Prescriptions: `clipboard-plus`
- Reports: `chart-no-axes-column`
- Clinic Settings: `sliders-horizontal`
- Brand mark: `map-pin` or a medical location symbol

### Sidebar interaction states

- Hover: very subtle lighter aubergine surface.
- Active: cream pill, maintain high text contrast.
- Focus: visible keyboard outline in warm cream.
- On narrow screens: collapse to icon rail or use a drawer; never let the sidebar squeeze the content below readable widths.

## 6. Top utility bar

### Left: global search

- Long pill-shaped search field, white surface.
- Approximate height: `42px`.
- Search icon at left, placeholder: “Search patient ID, clinician, lab order…”
- Radius: `24px`.
- No strong border; use a soft shadow or subtle tonal contrast.
- Accessible label: “Search patients, clinicians, and lab orders”.

### Clinic selector

- Warm cream pill with location icon.
- Two-line label, e.g. “St. Jude / Central Clinic”.
- Small chevron at the right.
- Should be a real dropdown button with keyboard navigation.

### Notifications

- Small circular/rounded white surface with bell icon.
- Tiny orange dot for unread state.
- Provide accessible name and a notification panel when implemented.

### User profile

- Clinician name: “Dr. Vance”
- Role: “Chief Medical Officer”
- Small circular avatar at right.
- Align text right; keep role smaller and muted.

## 7. Greeting / page introduction

### Eyebrow row

- Cream capsule badge with a small peach/orange dot and text `LIVE CLINIC STREAM`.
- Follow with date and location metadata, separated by a small dot.
- Example date/location: `Thursday, October 24 • Pavilion 3A (East Wing)`.
- In implementation, use the actual current date and clinic data instead of hardcoding this sample.

### Heading

- Text: `Good morning, Dr. Nasquez`
- Use a large serif headline, around `34px`.
- The clinician name is italicized.
- Keep the line tight and elegant.

### Description

- Example: `Clinical operations are steady today. 28 consultations charted, with priority triage active for morning metabolic screening.`
- Max width around `390–430px` at the reference size.
- Use muted dark-purple body text and a comfortable `1.45–1.55` line height.

### Actions

Two right-aligned buttons on desktop:
- **Schedule Consult** — cream background, dark text, calendar-plus icon.
- **+ New Patient Intake** — espresso background, white text, user-plus icon.

Button details:
- Height: `44–48px`.
- Radius: `24px`.
- Padding: `16–20px`.
- Icon/text gap: `8px`.
- Soft shadow only; no hard border.
- Hover: subtle darkening/lift; active: slight press.
- Use semantic `<button>` elements and visible focus states.

## 8. KPI / metric cards

Four equal-width cards with `12–16px` gaps. On the reference, cards are white with rounded corners, no prominent borders, and subtle shadows.

### Shared card rules

- Border radius: `16–18px`.
- Padding: `18–20px`.
- Minimum height: approximately `150–160px`.
- Label at top-left, icon in a small pastel circle at top-right.
- Large metric in serif display type.
- Supplementary value and context in small UI text.
- Progress bar at the bottom where shown.

### Card A — Daily Consultations

- Label: `DAILY CONSULTATIONS`
- Metric: `28`
- Supporting text: `scheduled`
- Footnote: `9 completed` and `32% volume`
- Progress bar: dark aubergine fill over a pale pink/lavender track.
- Icon: stethoscope inside pale pink circle.

### Card B — Triage Queue

- Label: `TRIAGE QUEUE`
- Metric: `4`
- Status badge: `Pending Review`
- Detail: `2 high-priority metabolic alerts`
- Action text: `Take Action`
- Progress/attention bar: muted orange fill over pale peach track.
- Icon: asterisk/alert symbol in peach circle.

### Card C — Lab Turnaround

- Label: `LAB TURNAROUND`
- Metric: `2.4`
- Unit/context: `hrs avg today`
- Detail: `0.8h faster than baseline`
- Status: `Optimal`
- Progress bar: muted olive/gray fill over warm neutral track.
- Icon: clock/history icon in cream circle.

### Card D — Care Index

- Label: `CARE INDEX`
- Metric: `98.4%`
- Context: `satisfaction`
- Detail: `142 reviews logged`
- Tier label: `Tier 1`
- Progress bar: dark aubergine fill over pale pink track.
- Icon: heart in pale pink circle.

### Metric card implementation notes

- Keep metric values visually dominant but not oversized.
- Do not encode status by color alone; include readable status text.
- Progress bars should have accessible labels and values if they represent real data.
- Use responsive grid behavior: 4 columns on wide desktop, 2 columns on tablet, 1 column on small mobile.

## 9. Lower dashboard: consultation queue

### Main container

- Left column occupies roughly `62–66%` of the lower dashboard width.
- White surface, radius `20px`, padding `20px`.
- Header row: eyebrow `CLINICAL QUEUE`, title `Today’s Patient Consultations`.
- Right side of header: pale purple capsule `4 Priority Cases Shown`, plus a filter/sliders icon button.
- Patient rows are vertically stacked with `10–12px` gaps.

### Patient row design

Each row:
- Soft blush surface (`--color-surface-blush`).
- Radius: `14–16px`.
- Padding: `12–14px`.
- Layout: time badge, patient details, status badge, “Open Chart” action.
- Align content vertically centered.
- Row height target: `68–76px` at desktop.
- Keep IDs and metadata smaller than patient names.
- Long names and consultation descriptions should truncate gracefully on narrow widths.

### Example rows from the visual reference

**Row 1**
- Time badge: `09:30 AM`
- Patient: `Eleanor Campbell`
- Patient ID: `#AH-9042`
- Consultation: `Endocrine Follow-up & Thyroid Panel`
- Status: `Checked In`
- Action: `Open Chart →`

**Row 2**
- Time badge: `10:15 AM`
- Patient: `Julien Bernard`
- Patient ID: `#AH-8110`
- Consultation: `Preventative Wellness & Cardiometabolic Check`
- Status: `Exam Room 4`
- Action: `Open Chart →`

**Row 3**
- Time badge: `11:00 AM`
- Patient: `Sophia Al-Mansoor`
- Patient ID: `#AH-7729`
- Consultation: `Cardiovascular Screening & Lipid Profiling`
- Status: `Awaiting Labs`
- Action: `Open Chart →`

**Row 4**
- Time badge: `01:30 PM`
- Patient: `Arthur Pendelton`
- Patient ID: `#AH-6430`
- Consultation: `Rheumatology Care Plan & Joint Ultrasound`
- Status: `Pre-Registered`
- Action: `Open Chart →`

These are reference-only sample records. Use fictional/demo data in development and never expose real patient data without appropriate authorization.

### Time badges

- Approximate size: `44 × 44px`.
- Radius: `12px`.
- Cream background for first row; alternate pale peach/lavender backgrounds for other rows.
- Time uses bold `10–11px` UI text; AM/PM can be on a second line.

### Status badges

- Compact capsule, `10–11px` text, subtle colored dot.
- Checked In: cream.
- Exam Room: warm cream/peach.
- Awaiting Labs: peach.
- Pre-Registered: pale lavender.
- Keep each badge short; on mobile it may move to a second line.

### Open Chart button

- Dark purple background, white text.
- Pill radius, `11–12px` text, compact horizontal padding.
- Use an arrow icon/character at the end.
- On small screens, prioritize patient and time; move action to a full-width secondary row if necessary.

## 10. Lower dashboard: priority clinical alerts

### Container

- Right column about `30–32%` of the lower dashboard.
- Warm cream/gold background (`--color-surface-cream`).
- Radius: `20px`.
- Padding: `18–20px`.
- Header: small orange dot, title `Priority Clinical Alerts`, dark pill `2 Action Required`.
- Alerts are individual white/ivory cards with `14–16px` radius.

### Alert card 1 — Critical lab result

- Category: `CRITICAL LAB RESULT` in small orange uppercase text.
- Timestamp: `18m ago`.
- Patient: `Marcus Vance (44M)`.
- Message: `Serum Potassium elevated at 5.9 mEq/L. Follow-up ECG recommended prior to outpatient discharge.`
- Primary action: `Acknowledge & Order ECG`.
- Use warning styling but keep text readable and calm.
- This is demo copy only; clinical content in a real product must be validated by qualified medical professionals and connected to approved clinical workflows.

### Alert card 2 — Renewal request

- Category: `RENEWAL REQUEST`.
- Timestamp: `1h ago`.
- Patient: `Clara Dubois (67F)`.
- Message: `Requested refill for Empagliflozin 25mg (90-day). Last renal function panel within normal baseline.`
- Primary action: `Authorize Refill`.
- Secondary action: `Review Chart`.
- Use a two-action footer where the primary button is a dark purple pill and the secondary action is subdued text.

### Alert card behavior

- Cards should support an optional severity indicator, clear timestamp, concise summary, and one or more actions.
- Do not allow alert text to overflow the panel. Use sensible wrapping.
- On narrow screens, stack the alerts panel below the consultation queue.
- Use explicit text labels such as “Critical” and “Action required”; color is supplemental only.

## 11. Component inventory

Build reusable components rather than one monolithic page:

- `AppShell`
- `Sidebar`
- `BrandMark`
- `SidebarNavItem`
- `OnDutyLeadCard`
- `TopBar`
- `GlobalSearch`
- `ClinicSelector`
- `NotificationButton`
- `UserProfile`
- `PageGreeting`
- `LiveStreamBadge`
- `ActionButton`
- `MetricGrid`
- `MetricCard`
- `ProgressBar`
- `ConsultationQueue`
- `PatientConsultationRow`
- `TimeBadge`
- `StatusBadge`
- `PriorityAlertsPanel`
- `ClinicalAlertCard`
- `IconButton`

Suggested component data should come from arrays/objects so rows and cards can be rendered dynamically.

## 12. Responsive behavior

### Wide desktop: `1200px and up`

- Full sidebar (`244px`).
- Top bar on one line.
- Greeting text and actions share a row.
- Four metric columns.
- Consultation queue and alert panel side by side.

### Tablet / compact laptop: `768–1199px`

- Sidebar may reduce to `200–220px` or collapse to an icon rail.
- Top utility bar can wrap.
- Greeting actions may move beneath the description.
- Metric cards use 2 columns.
- Lower dashboard can retain two columns only if each remains readable; otherwise stack.

### Mobile: below `768px`

- Sidebar becomes a drawer opened by a menu button, or a compact top/bottom navigation.
- Main padding: `16px`.
- Top bar wraps; search takes full width.
- Greeting heading: `28–30px`.
- Actions stack or wrap and become easy to tap.
- Metric cards: 1 or 2 columns depending on width.
- Consultation queue and alerts stack vertically.
- Patient row details may wrap; avoid horizontal page scrolling.
- Minimum touch target: `44 × 44px`.
- Respect safe-area insets on mobile devices.

## 13. Radius, elevation, and visual effects

```css
:root {
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-card: 17px;
  --radius-panel: 20px;
  --radius-pill: 999px;
  --shadow-card: 0 5px 18px rgba(47, 20, 45, 0.045);
  --shadow-float: 0 8px 24px rgba(47, 20, 45, 0.08);
}
```

- Cards: mostly shadow-only, with very subtle edge separation.
- Buttons: soft shadow and small hover lift (`translateY(-1px)` at most).
- Avoid glassmorphism, strong blur, or high-contrast gradients; the reference is matte and softly layered.
- Transitions: `150–220ms ease`.
- Respect `prefers-reduced-motion`.

## 14. Iconography

Use **Lucide** outline icons for consistency. Default size `15–18px` in controls and `18–20px` in metric icon circles. Stroke width around `1.7–2px`.

Use a single icon style throughout; do not mix emoji, filled icons, and multiple icon libraries in the final UI. Small colored dots are appropriate for status indicators.

## 15. Interaction and accessibility

- Use semantic landmarks: `aside`, `nav`, `header`, `main`, and meaningful section headings.
- Every icon-only button needs an accessible name.
- Inputs must have labels or accessible names; placeholder text alone is not a label.
- Preserve visible keyboard focus.
- Ensure text contrast meets WCAG AA where feasible, especially sidebar labels, status badges, and muted metadata.
- Buttons and status indicators must not rely on color alone.
- Add loading, empty, error, and disabled states for search, queue, and alert actions.
- Use realistic data states; do not claim that actions succeeded before the backend confirms success.
- Healthcare production systems need authentication, role-based access control, audit logs, secure data handling, and applicable privacy/regulatory review. Do not put actual patient information in a public demo.

## 16. Suggested CSS starter tokens

```css
:root {
  color-scheme: light;

  --color-sidebar: #381840;
  --color-sidebar-deep: #200028;
  --color-sidebar-text: #BCA5C2;
  --color-sidebar-active: #F0E0C0;

  --color-canvas: #FFF8FA;
  --color-surface: #FFFFFF;
  --color-surface-blush: #FFF5FA;
  --color-surface-cream: #F0E0C0;
  --color-surface-cream-light: #F8EEDC;

  --color-text: #28152D;
  --color-text-muted: #827783;
  --color-text-subtle: #A59AA5;

  --color-action: #300D05;
  --color-action-hover: #451A10;
  --color-accent-purple: #EEDCF3;
  --color-accent-purple-strong: #4A2054;
  --color-accent-peach: #F9D8C9;
  --color-accent-orange: #E9865D;
  --color-accent-pink: #FBE6F5;
  --color-success: #6F7860;
  --color-border: #F0E9EF;

  --font-ui: "DM Sans", Inter, Arial, sans-serif;
  --font-display: "DM Serif Display", Georgia, serif;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-card: 17px;
  --radius-panel: 20px;
  --radius-pill: 999px;

  --shadow-card: 0 5px 18px rgba(47, 20, 45, 0.045);
  --shadow-float: 0 8px 24px rgba(47, 20, 45, 0.08);
}
```

## 17. Definition of done

The implementation is visually aligned when:

- [ ] The deep aubergine sidebar and warm ivory/blush workspace dominate the palette.
- [ ] Display serif is used for the greeting and key metrics; sans-serif is used for operational UI.
- [ ] The greeting, four KPI cards, consultation queue, and alert panel follow the described hierarchy.
- [ ] Card corners, pill buttons, and shadows are soft and consistent.
- [ ] Status pills are compact and distinguishable.
- [ ] Desktop layout matches the reference proportions without clipping.
- [ ] Tablet and mobile layouts stack cleanly with no horizontal overflow.
- [ ] All controls are keyboard accessible and have meaningful labels.
- [ ] Demo patient and clinical data are clearly treated as sample data.
- [ ] Colors, fonts, radii, and spacing are defined centrally as design tokens.

---

## 18. Altrix Health Copilot — project-specific adaptation (added 2026-10-12)

This file remains the visual design reference. The original Aura Health reference depicts a **clinic operations dashboard**; Altrix Health Copilot is a **personal health-records copilot**. Reuse the visual system, not the clinic's workflow or its sample clinical claims.

### Product identity and visual decisions

- **Product name shown in the UI:** Altrix Health Copilot. Do not rename the product to Aura Health; Aura is the design reference only.
- **Target experience:** individuals reviewing their own health records, with a guided educational copilot. Do not display clinician-only actions or imply this app is a clinical operations system.
- **Visual direction:** use the palette and typography in Sections 2–3 as the starting point: aubergine sidebar, warm ivory canvas, blush/cream surfaces, muted peach accents, DM Serif Display for editorial headings/key values, and DM Sans for UI/body. These tokens supersede the initial prototype's generic blue theme unless the Product Manager explicitly changes this decision.
- **Keep:** spacious cards, rounded pills, subtle shadows, restrained icons, keyboard focus, responsive navigation, and desktop/tablet/mobile layouts.
- **Do not copy from the reference:** clinic names, clinician names, real-looking patient queues, consultation counts, refill authorizations, order-ECG actions, or statements that imply clinical decisions are being made by Altrix.

### Translate clinic dashboard patterns into the personal health copilot

| Reference pattern | Altrix adaptation | Safety/product rule |
|---|---|---|
| Clinic operations greeting | “Your health, in one place” or similarly calm, personal copy | Do not imply the app is a doctor or clinician |
| Daily Consultations KPI | “Records in your health vault” | Clearly mark all demo counts as synthetic |
| Triage Queue KPI | “Items to review” | Explain uncertainty; do not present an AI-generated diagnosis |
| Lab Turnaround KPI | “Recent records” or “Latest update” | Use only actual demo timestamps/data; no fabricated performance claims |
| Care Index KPI | “Timeline entries” or another verifiable product metric | Do not invent satisfaction/clinical outcome scores |
| Patient consultation queue | Recent health records / upload-and-review queue | Keep synthetic records visibly labelled |
| Priority Clinical Alerts | “Worth reviewing” / “Questions to discuss” | No autonomous treatment orders, prescription authorization, or false reassurance |
| Schedule Consult / New Patient Intake | “Upload a record” / “Open Health Copilot” | Any provider booking remains explicitly mock/demo-only |
| Clinician profile / clinic selector | Language control, demo-session indicator, and personal profile area when implemented | Do not display fictitious clinician identity or imply real account persistence in demo mode |

### Navigation baseline for Altrix

Use the existing routes where practical; do not create duplicate pages just to match the reference labels:

1. Dashboard (`/`)
2. My Records (existing `/records`)
3. Health Timeline (existing `/timeline`)
4. Health Copilot (existing `/copilot`)
5. Nearby Care (only when clearly marked as demo/mock until a verified provider source exists)
6. Settings / Profile (only when implemented; do not make an inert navigation item look functional)

Keep the existing Report Review workflow (`/review`) reachable from the record upload/review actions, even if it is not a primary sidebar item.

### Interaction and iteration protocol

The project must be developed as small, reviewable increments. Do not implement multiple phases before the Product Manager can inspect the result.

1. Start the local dev server and confirm the current app runs before changing code.
2. Implement **one visual increment at a time** (initially the shared app shell and Dashboard only).
3. Run typecheck, tests, and production build; fix regressions.
4. Keep the dev server running so hot reload can show the change immediately.
5. Ask the Product Manager to inspect the page at the local URL and share notes or a screenshot.
6. Make the requested corrections before proceeding to the next page or backend integration.
7. At the end of every increment, update `PROJECT_CONTEXT.md`, `docs/DEVELOPMENT_LOG.md`, and this design spec's Decision Log if any visual/product decision changes.

Do not connect Supabase, add Gemini API usage, execute SQL, or push to a remote repository while doing a purely visual increment unless the Product Manager explicitly approves that separate step. Keep mock data and offline mode working.

### Decision Log

| Date | Decision | Status |
|---|---|---|
| 2026-10-12 | Use the Aura reference's warm aubergine/ivory design system for Altrix; retain Altrix branding and personal-copilot workflows. | Implemented in Iteration 1; pending CTO/Product Manager visual review |
| 2026-10-12 | Develop interactively: app shell + Dashboard first, pause for local browser review, then move to the next page. | Implemented in Iteration 1; dev server running on http://localhost:4321/ |
| 2026-10-12 | Keep Supabase/Gemini/SQL out of the initial design-alignment increment; preserve mock/offline mode. | Verified; offline mock fixtures active |
| 2026-10-12 | Adopt `@lucide/astro` (v1.55.0) as the standardized icon system across all pages and components; replace UI emojis and ad-hoc SVGs with consistent Lucide stroke icons. | Implemented across all routes and components; smoke tested and verified |
| 2026-10-12 | Iteration 2A: Align `/records` with warm aubergine/ivory tokens, interactive drag-and-drop dropzone, four-stage simulated extraction progress, format/size validation, and verified synthetic fixture loader. | Implemented on branch feat/records-page-iteration-2a; verified with tests, typecheck, build, and smoke tests |



