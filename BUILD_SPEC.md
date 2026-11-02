# Job Lab — Complete Rebuild Specification

Hand this document to the builder app as-is. It is a full functional spec of an existing, working application. Build it in the order given in Section 12.

---

## 1. What this app is

**Job Lab** (internal name: JobBridge Lab) is an **employment-centre kiosk app** used inside a physical job resource centre and as a public web portal. Job seekers walk in, sign in at a tablet/laptop, and get a toolkit to search for work, track applications, build a resume, and map a career path.

Key product constraints that drive every design decision:

- **Users are not "accounts" in the usual product sense.** They are *participants*: name, email, phone, a simple password, plus their career history. They are stored as ordinary database records, not platform users.
- **Guest sessions exist.** Someone can use the whole app without registering; their work is not retained after they sign out, but they can still email or print a resume during the session.
- **Two entry modes from a URL parameter.** A kiosk machine links to `?location=onsite` (shows "Riverview Crossing Jobs Lab — Onsite Portal"); anything else shows the public portal. Every visit and registration is logged with which mode it came from, for centre reporting.
- **Low digital literacy must be assumed.** Big touch targets, plain language, one obvious action per screen, everything explained inline.

---

## 2. Session & identity model (important — do not substitute platform auth)

The app does **not** use the platform's login. It implements its own lightweight participant session:

- A `ParticipantProvider` React context holds `{ participant, isGuest, loading, login, logout, setParticipant }`.
- On mount, it reads `sessionStorage['joblab_participant']` and hydrates from it. `loading` is `true` until that read completes, then `false` permanently.
- `login(data)` sets state, computes `isGuest = data.is_guest`, and writes to sessionStorage.
- `logout()` clears state and removes the sessionStorage key.
- All routes except `/` are wrapped in a guard: if `loading` → full-screen spinner; if no `participant` → `<Navigate to="/" replace />`.
- **Session is per-browser-tab** (sessionStorage, not localStorage) — deliberately, so a kiosk tab closes cleanly.

Auth is by **email + password compared against the stored `password_hash` field**. There is no hashing, no tokens, no recovery flow. This is a kiosk-grade shortcut, not real security. Rebuild it the same way if matching behaviour matters; if the receiving app has real authentication, adapt at that layer but keep the participant record shape, the guest concept, and the URL `location` parameter.

---

## 3. Design system

Modern, calm, professional. Blue primary, warm amber accent, off-white background. Rounded, soft-shadowed cards on a light page. Dark navy sidebar.

**Fonts** (Google Fonts, imported at the top of `index.css` before the Tailwind directives):
- Heading: **DM Sans** 400/500/600/700 → `--font-heading`
- Body: **Inter** 300–800 → `--font-body`

**Tailwind theme mapping:** `font-heading` / `font-body`; colours via CSS variables `hsl(var(--token))`.

**Light theme tokens (HSL channels, space-separated):**

| Token | Value | Notes |
|---|---|---|
| `--background` | `220 20% 97%` | off-white page |
| `--foreground` | `222 47% 11%` | near-black navy |
| `--card` / `--popover` | `0 0% 100%` | |
| `--primary` | `217 91% 50%` | blue — key actions, links, active nav |
| `--primary-foreground` | `0 0% 100%` | |
| `--secondary` | `220 14% 96%` | |
| `--muted` / `--muted-foreground` | `220 14% 96%` / `220 9% 46%` | supporting text |
| `--accent` | `32 95% 54%` | amber — deadlines, guest warnings |
| `--accent-foreground` | `0 0% 100%` | |
| `--destructive` | `0 84% 60%` | |
| `--border` / `--input` | `220 13% 91%` | |
| `--ring` | `217 91% 50%` | |
| `--chart-1..5` | `217 91% 50%`, `160 60% 45%`, `32 95% 54%`, `280 65% 60%`, `340 75% 55%` | blue, green, amber, purple, pink — used as semantic status colours |
| `--radius` | `0.75rem` | |

Dark theme equivalents also defined (background `222 47% 6%`, card `222 47% 9%`, sidebar darker) — the app ships light by default; include the dark block for completeness.

**Sidebar tokens:** background `222 47% 11%`, foreground `220 14% 96%`, primary `217 91% 60%`, accent `222 40% 18%`, border `222 40% 18%`.

**Colour usage conventions to preserve:**
- `chart-2` (green) = success / offer / completed / great-match.
- `accent` (amber) = deadline, guest warning, interview status.
- `chart-4` (purple) = phone screen.
- `chart-5`, `chart-3` = decorative tile colours on the dashboard grid.

Base body style: `bg-background text-foreground font-body`; global `border-border`.

---

## 4. Data model

Five entities. Every record also has the platform built-ins (`id`, `created_date`, `updated_date`, `created_by_id`). Field names must be reproduced exactly — pages read them literally.

### 4.1 Participant
```
name            string   required
email           string   required
phone           string
password_hash   string            // plain password stored here (kiosk-grade)
is_guest        boolean  default false
total_visits    number   default 1
last_visit      string (date-time)
education  [ { institution, degree, field, start_year, end_year, description } ]
experience [ { company, title, start_date, end_date, current(bool), description } ]
skills     [ string ]
interests  [ string ]
career_goals    string
```

### 4.2 VisitLog
```
participant_id    string
participant_name  string   required
participant_email string
is_guest          boolean  default false
visit_date        string (date-time)  required
location_type     string enum [ onsite | offsite ]   // from the ?location= URL param
```

### 4.3 JobApplication
```
participant_id           string  required
company                  string  required
position                 string  required
location                 string
job_url                  string
status                   string enum [ saved, applied, phone_screen, interview, offer, rejected, withdrawn ]  default saved
date_applied             string (date)
deadline                 string (date)
salary_range             string
how_to_apply             string            // online | email | in_person | phone | linkedin | indeed | other
application_instructions string
job_description          string
notes                    string
follow_up_date           string (date)
```

### 4.4 Resume
```
participant_id   string  required
title            string  required
template         string enum [ professional, modern, creative, simple ]  default professional
objective        string
summary          string
education  [ { institution, degree, field, start_year, end_year, achievements } ]
experience [ { company, title, start_date, end_date, current(bool), bullets [string] } ]
skills     [ string ]
certifications [ { name, issuer, year } ]
volunteer [ { organization, role, description } ]
references_available boolean default true
```

### 4.5 CareerPath
```
participant_id   string  required
title            string  required
current_role     string
target_role      string
timeline_years   number
milestones [ { title, description, target_date, status(not_started|in_progress|completed), skills_needed [string] } ]
required_skills    [ string ]
required_education string
notes              string
```

**Access control:** every record is created with `participant_id` and all reads filter on it. If the target platform has row-level security, scope read/update/delete to the record creator. Rows are internal user data — no open reads. `VisitLog` is operator-facing reporting data; if staff don't need it, restrict writes to the app and reads to admins.

---

## 5. Routes

| Path | Screen | Guard |
|---|---|---|
| `/` | Entry (sign in / register / guest) | public |
| `/dashboard` | Dashboard | participant required |
| `/job-search` | Job Search | participant required |
| `/job-tracker` | Job Tracker | participant required |
| `/resume-builder` | Resume Builder | participant required |
| `/career-path` | Career Path Builder | participant required |
| `/resources` | Resources & Training | participant required |
| `/profile` | My Profile | participant required |
| `*` | Not found | public |

All guarded routes share one **AppLayout** (sidebar shell) as a layout route rendering `<Outlet />`.

---

## 6. Screens in detail

### 6.1 Entry (`/`)
Centred single card on a subtle gradient background (`from-background via-background to-primary/5`), max-width ~28rem, fade-and-rise entrance animation.

Header above the card: rounded square icon tile (briefcase, `bg-primary/10`, blue icon), title **"Job Lab"**, then a subtitle that switches on the URL param:
- `?location=onsite` → "Riverview Crossing Jobs Lab" + "Onsite Portal"
- otherwise → "Your career starts here" + "Public Portal"

Three tabs: **Sign In · Register · Guest**

**Sign In**
- Email, Password (with eye toggle). Submit.
- Look up `Participant` by `{ email, is_guest: false }`. If none → error toast "No account found with that email. Please register first." If `password_hash` mismatch → "Incorrect password."
- On success: `update` the participant with `total_visits + 1` and `last_visit = now`; create a `VisitLog` with `location_type` from the URL param; `login()` with the merged record; toast "Welcome back, {name}!"; navigate to `/dashboard`.

**Register**
- Full Name, Email, Phone, Password, Confirm Password.
- Validate passwords match and length ≥ 4 (toast errors).
- Reject if a non-guest participant with that email exists → "An account with this email already exists. Please sign in."
- Create participant (`is_guest:false, total_visits:1, last_visit:now`), create `VisitLog`, `login()`, toast "Welcome, {name}! Your account has been created.", go to `/dashboard`.

**Guest**
- Amber-tinted note above the form: *"Guest mode: Your work won't be saved after you log out, but you can email or print documents during your session."*
- Full Name, Email, Phone. Submit creates a participant with `is_guest:true`, logs the visit, `login()`, toast, go to `/dashboard`. Outline-style button to distinguish from real sign-in.

All three submit handlers show a loading state on the button while awaiting.

### 6.2 AppLayout (shell)
- **Desktop (≥lg):** fixed 16rem navy sidebar. Top: logo tile + "Job Lab" + "Career Resource Centre". Middle: nav list (Dashboard, Job Search, Job Tracker, Resume Builder, Career Path, Resources, My Profile) with lucide icons; active item uses `bg-sidebar-accent text-sidebar-primary`, inactive `text-sidebar-foreground/70` with hover. Bottom: guest warning chip when applicable, avatar circle with the participant's initial, name, email, and a "Sign Out" ghost button (logout → navigate `/`).
- **Mobile (<lg):** fixed 14-height top bar with hamburger, logo, and a "Guest" badge; drawer slides in from the left over a 50% black scrim, containing the same nav + name + sign out.
- Main content: `lg:ml-64`, `pt-14 lg:pt-0`, inner padding `p-4 sm:p-6 lg:p-8`, `max-w-7xl mx-auto`.

### 6.3 Dashboard (`/dashboard`)
Personalised welcome: "Welcome{, first-name}". Subtitle: "Here's your career command centre. What would you like to work on today?" Show an amber outline badge "Guest Session — work not saved" when guest.

**Quick-action grid** (1 / 2 / 3 columns responsive), six cards, each linking with icon tile, label, description, staggered fade-in:
| Label | Description | Icon |
|---|---|---|
| Search Jobs | Find jobs tailored to your skills | search |
| Track Applications | Monitor your job applications | clipboard-list |
| Build Resume | Create a professional resume | file-text |
| Career Path | Map your career trajectory | route |
| Resources | Training, guides & more | book-open |
| My Profile | Update skills & experience | briefcase |

**"Quick Links & Job Sites"** — four external link cards (open new tab, external-link icon): ALIS Alberta (alis.alberta.ca), Job Bank Canada (jobbank.gc.ca), Indeed Canada (ca.indeed.com), LinkedIn Jobs (linkedin.com/jobs).

**"Labour Market Insights"** card — three tinted tiles, external links: Alberta Job Trends (alis.alberta.ca/look-for-work/), Occupational Profiles (alis.alberta.ca/explore-careers/), Wage & Outlook Data (jobbank.gc.ca/trend-analysis).

### 6.4 Job Search (`/job-search`)
Title + subtitle "Find opportunities tailored to your experience and skills".

**Search card:** text input with inline search icon ("Job title, skills, or keywords…", Enter submits), location input with map-pin icon defaulting to `"Alberta"`, and a Search button (spinner while loading).

**Pre-fill behaviour:** on mount, if the search box is empty, seed it from the participant's profile — first two skills joined with ", "; otherwise the most recent experience title.

**Tab 1 — AI Results:**
Call the platform LLM (see §8.1) to generate 8 realistic Canadian job postings matching the query, passing the participant's skills and latest role as context. While loading show a centred spinner + "Searching for jobs…".
Each result card shows: title; company; location; type badge; 2-line-clamped description; salary badge; posted badge; a green "Great match" badge when `match_score >= 80`; and a right-aligned **"Save to Tracker"** button (becomes a disabled green "Saved" once used). Saving creates a `JobApplication` with `status:'saved'` and toast `"«title»" saved to your Job Tracker!`.
Footer disclaimer: *"These results are AI-generated suggestions. Use the Job Sites tab to search real job postings."*
Empty states: after a search with no results → "No results found. Try different keywords."; before any search → briefcase icon + "Enter a search term to find matching jobs" (plus "We've pre-filled based on your profile skills" when applicable).

**Tab 2 — Job Sites:** six cards that open the real site with the current query appended:
- Indeed Canada — `https://ca.indeed.com/jobs?q=`
- Job Bank Canada — `https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=`
- LinkedIn Jobs — `https://www.linkedin.com/jobs/search/?keywords=`
- Glassdoor — `https://www.glassdoor.ca/Job/jobs.htm?sc.keyword=`
- ALIS Alberta — `https://alis.alberta.ca/look-for-work/` (no query appended)
Query is `encodeURIComponent(searchQuery || 'jobs')`. Footer hint reflects whether a query is set.

### 6.5 Job Tracker (`/job-tracker`)
Header: title, subtitle "Track job listings and manage your applications", and an **Add Job** button opening a dialog form.

Load all `JobApplication` records for the participant via a cached query, then split client-side: saved listings (`status === 'saved'`) vs. applications (everything else).

**Add/Edit form** (dialog, scrollable, max-height 90vh): Company*, Position*, Location, Status select (all seven statuses, labelled), Application Deadline (date), Salary Range (placeholder "e.g. $50,000–$65,000"), Date Applied (date), Follow-up Date (date), Job URL, How to Apply select (Online / Email / In Person / Phone / LinkedIn / Indeed / Other — values `online,email,in_person,phone,linkedin,indeed,other`), Application Instructions (textarea, placeholder mentions cover letter / reference number / references), Job Description (textarea), Notes (textarea). One full-width submit: "Add to Tracker" or "Update".
When opened from the Applications tab, default the status to `applied`; from Saved Listings, default to `saved`.

**Card** (`AppCard`): position title, status badge (hidden when `saved`), and a deadline badge — amber normally, red with alert icon once `isPast(deadline)`. Meta row: company, location, "Applied: MMM d", salary range. "How to apply: …" line. Collapsible "Show more / Show less" revealing application instructions (amber tinted panel), job description (grey panel, clamped to 6 lines), notes, and follow-up date. Right-hand actions: open job URL (if present), optional **Mark Applied** button (sets `status:'applied'` and `date_applied` to today), edit (pencil), delete (trash, destructive).

**Tab 1 — Saved Listings:** explanatory line pointing to Job Search; cards with **Mark Applied** shown; empty state "No saved listings yet." with guidance.

**Tab 2 — Applications:** filter pill row — "All (n)" plus one pill per status that actually has records, showing counts. Cards without the apply button. Empty state "No applications yet."

Mutations invalidate the list query; success toasts: "Added to tracker!", "Updated!", "Removed."

### 6.6 Resume Builder (`/resume-builder`)
Header + **New Resume** dialog: Resume Name, Template Style select (Professional / Modern / Creative / Simple), note "Your profile info will be imported automatically.", Create button. Creating seeds the new resume from the participant's `education`, `experience`, `skills` (experience normalised so `bullets` becomes `[description]` or `['']`), empty summary/objective, empty certifications/volunteer, `references_available: true`, then opens the editor immediately.

Guest users see an amber info card: *"As a guest, your resume won't be saved after you log out. Use the email or print features to save your work."*

Resume list: 1/2/3-column grid of cards — file icon, title, template badge, and "N positions · N education · N skills". Delete appears on hover (destructive trash), stops propagation. Empty state: "No resumes yet" / "Create your first resume to get started".

**Resume editor** (replaces the list when a resume is selected):
Toolbar: back arrow, title, template badge; right side Email, Word, PDF, Save.
Two tabs: **Edit** and **Preview**.

*Edit tab cards:*
1. **Summary & Objective** — two textareas, each with an "AI Suggest" ghost button (sparkles) that calls the LLM (see §8.2) and fills the field.
2. **Work Experience** — Add button; each entry is a bordered block with Job Title, Company, Start Year, End Year (year selects, "Present" allowed) and a list of achievement bullets, each with a "+ Bullet" adder and per-bullet delete. Entry-level delete in the corner.
3. **Education** — Add button; Institution, Degree/Credential select (see preset list below), Field of Study, Start Year, End Year. Per-entry delete.
4. **Skills** — removable badges ("skill ×") plus the typeahead skill input with a curated suggestion catalogue.
5. **Template** — select to switch style.
Bottom action row: "Save" (outline) and "Save & Preview Resume".

*Preview tab:* letter-sized resume render (see §7) — 8.5×11in, 0.75in padding, Arial 11pt, blue rule under the name, centred name + email/phone, then uppercase blue section headings with a thin rule: Professional Summary, Objective, Work Experience, Education, Skills, Certifications, and a centred italic "References available upon request" footer. Only non-empty sections render.

*Export behaviours:*
- **PDF** → switch to Preview, then `window.print()` after ~300 ms (print CSS isolates the resume page, sets `@page { size: letter; margin: 0 }`).
- **Word** → grab the rendered resume HTML, wrap it in a minimal HTML document with print-like styles, download as a `Blob` with MIME `application/msword` and a BOM, filename `{title}.doc`.
- **Email** → send `{title}` + the resume HTML to the participant's own email address via the platform email integration; toast on success; error toast if no email on file.
- **Save** → update the `Resume` record, propagate to parent state, toast "Saved!".

**Degree/Credential presets** (reuse on Profile too): Some High School · High School Diploma / GED · Some College / CEGEP · College Diploma · College Certificate · Apprenticeship / Trades Certificate · Bachelor's Degree · Post-Graduate Diploma · Master's Degree · Doctoral Degree (PhD) · Professional Degree (MD, JD, etc.) · Other.

### 6.7 Career Path (`/career-path`)
Header + **New Path** dialog: Path Name, Current Role, Target Role, Timeline select (1, 2, 3, 5, 7, 10 years), and one primary **"Generate AI Career Path"** button (disabled until a target role is entered; spinner while generating). There is no manual blank path — the LLM produces the milestones (see §8.3).

Generated path is saved with `status:'not_started'` on every milestone, then opened.

**Path detail view:** back link + title + destructive Delete on the right. Three stat cards: Current Role, Target Role, Timeline (years). A "Required Skills" card of outline badges. Then a **Milestones timeline**: vertical rule down the left, each milestone a node with a circular status button (not started ○ / in progress ◎ / completed ✓) that cycles status on click, and a bordered panel that tints green when completed, blue when in progress. Each shows title, target date, description, and `skills_needed` badges.

**Path list:** 1/2-column cards — route icon, title, "current → target", and outline badges for "{n}y timeline" and "{n} milestones". Empty state: "No career paths yet".

### 6.8 Resources (`/resources`)
Title "Resources & Training", subtitle "Everything you need to succeed in your job search". Five tabs of external resource cards (icon tile, title, description, optional tag badge, external-link chevron; whole card is a link opening a new tab):

- **Job Search:** ALIS Alberta – Look for Work; Job Bank Canada; WorkBC Career Guide; Canada Job Search Tips.
- **Interviews:** Common Interview Questions (ALIS); STAR Method Guide (Job Bank); Virtual Interview Tips (Job Bank).
- **Resumes:** ALIS Resume Writing; Cover Letter Guide (ALIS); LinkedIn Profile Tips (Job Bank).
- **Training:** LinkedIn Learning (Paid); Coursera (Free/Paid); Google Career Certificates (Paid); Khan Academy (Free); Codecademy (Free/Paid); Alberta Learning Info (Free).
- **Career Planning:** ALIS Explore Careers; Career Quizzes (ALIS); NOC System; Labour Market Info (Job Bank).

Use the real URLs from the existing app where known: `https://alis.alberta.ca/look-for-work/find-and-apply-for-jobs/resumes/`, `https://alis.alberta.ca/look-for-work/find-and-apply-for-jobs/cover-letters/`, `https://alis.alberta.ca/explore-careers/`, `https://alis.alberta.ca/explore-careers/know-yourself/`, `https://alis.alberta.ca/plan-your-education/`, `https://www.jobbank.gc.ca/findajob/resources/prepare-for-an-interview`, `https://www.jobbank.gc.ca/findajob/resources/virtual-job-interviews`, `https://www.jobbank.gc.ca/findajob/resources/social-media-job-search`, `https://noc.esdc.gc.ca/`, `https://www.jobbank.gc.ca/trend-analysis`, `https://www.linkedin.com/learning/`, `https://www.coursera.org`, `https://grow.google/intl/en_ca/certificates/`, `https://www.khanacademy.org`, `https://www.codecademy.com`, `https://www.workbc.ca/plan-career`.

### 6.9 My Profile (`/profile`)
Title + subtitle "Your education, experience, and skills power all the features in Job Lab", with a **Save Profile** button top-right (duplicated at the bottom).

Cards:
1. **Contact Information** (read-only): Name, Email, Phone (— when empty). Guests see an amber note: "Guest account — create a full account to save your profile".
2. **Career Goals** — 3-row textarea.
3. **Work Experience** — Add; Job Title, Company, Start Year, End Year (year selects), Description textarea; per-entry delete; "No experience added yet" when empty.
4. **Education** — Add; Institution, Degree/Credential select, Field of Study, Start Year, End Year; per-entry delete; empty message.
5. **Skills** — removable badges + typeahead skill input.
6. **Interests & Industries** — removable outline badges + a plain input: type and press Enter to add.

Save updates the `Participant` record, updates the context value, and rewrites the sessionStorage copy, then toasts "Profile saved!".

---

## 7. Resume print/export technical notes

- Screen page: `width: 816px; min-height: 1056px; padding: 72px; box-sizing: border-box;` Arial, 11pt, line-height 1.4, `#111` on white, `shadow-xl`, centred on a `bg-muted/30` backdrop.
- Print stylesheet: hide everything (`body * { visibility: hidden }`), reveal only `#resume-page` and its children, pin it fixed at top-left at `8.5in × 11in` with `0.75in` padding, no shadow/border, and `@page { size: letter; margin: 0 }`.
- The inner content wrapper needs a stable id (`resume-preview-content`) because both the Word export and the email send read its `innerHTML`. Guard with an error toast if preview isn't mounted.

---

## 8. AI integration calls

All three use one LLM integration call. Ask for JSON with the schema shown and read the result object directly.

### 8.1 Job search generation
Prompt: generate **8 realistic job listings** for `"{query}"` in `"{location}"`, including the participant's skills and latest role when present, modelled on postings that would appear on Canadian job boards, with variety in companies and seniority.
Schema: object → `jobs[]` of `{ title, company, location, salary, type, description, posted, match_score (number) }`.
Render `result.jobs || []`.

### 8.2 Resume summary / objective
- Summary: "Write a professional resume summary (2–3 sentences) for someone with this background: {skills, experience, education as JSON}".
- Objective: "Write a professional objective statement (1–2 sentences) for someone targeting roles related to: {latest experience title or 'their field'}".
Returns plain text; drop it straight into the field and toast.

### 8.3 Career path generation
Prompt: create a detailed career path from `"{current_role or 'entry-level'}"` to `"{target_role}"` over `{timeline_years}` years, including current skills and education, with **4–6 milestones** and specific skills needed for each.
Schema: object → `milestones[]` of `{ title, description, target_date, skills_needed[] }`, plus `required_skills[]` and `required_education`.
Save milestones with `status:'not_started'`.

---

## 9. Shared components to build

- **`ParticipantProvider` / `useParticipant`** — §2.
- **`AppLayout`** — §6.2, layout route with `<Outlet />`.
- **`YearSelect`** — select of the current year back 60 years, plus a `"Present"` option first; placeholders pass-through.
- **`SkillInput`** — text input with a fuzzy suggestion dropdown (max 7, case-insensitive `includes`, excludes already-added skills, closes on blur after 150 ms, `Escape` clears). Enter adds the first suggestion when it starts with the typed text, otherwise the raw trimmed input. Catalogue (~100 entries) grouped: general workplace (Microsoft Office, Excel, Word, PowerPoint, Outlook, Google Workspace, Data Entry, Filing, Scheduling, Customer Service, Cash Handling, POS Systems, Communication, Teamwork, Time Management, Problem Solving, Leadership, Adaptability, Multitasking, Attention to Detail, Critical Thinking, Conflict Resolution); trades & labour (Forklift Operation, Warehouse Management, Inventory Control, Shipping & Receiving, Heavy Equipment, Hand Tools, Power Tools, Blueprint Reading, WHMIS, First Aid, Safety Compliance, Welding, Electrical, Plumbing, Carpentry, Painting); tech (JavaScript, Python, HTML/CSS, React, SQL, Data Analysis, Social Media, Graphic Design, Adobe Photoshop, Canva, IT Support, Networking, Cybersecurity); healthcare & services (Patient Care, Medical Terminology, CPR, Food Handling, Food Safety, Cooking, Cleaning & Sanitation, Childcare, Elder Care, Personal Support); sales & marketing (Sales, Cold Calling, Account Management, Marketing, Content Writing, SEO, Social Media Marketing, Event Planning, Public Speaking, Negotiation); finance & admin (Bookkeeping, QuickBooks, Accounts Payable, Accounts Receivable, Payroll, Administrative Support, Reception, Record Keeping, Project Management).
- **`ResumePreview`** — §7. **`ResumeEditor`** — §6.6.
- Toast notifications for every mutation, both success and validation failure.

---

## 10. Library choices

React + React Router + Tailwind, a shadcn-style component set (card, button, input, label, textarea, badge, select, tabs, dialog), lucide-react icons, a query cache for entity reads with invalidation after mutations, and Framer Motion for the light entrance/stagger animations (dashboard grid, cards, milestones). Nothing exotic.

---

## 11. Behaviours that are easy to get wrong

1. **Every entity read must filter by `participant_id`** — otherwise one participant sees another's applications and resumes.
2. **Saved vs. applied is the Job Tracker's core split.** `saved` records are *listings*; everything else is an *application*. Both live in one entity.
3. **Deadline badges must recompute** as past/future using a real date comparison, not string comparison.
4. **Guest mode is a UI promise**: warn in Entry, in the sidebar (chip), on the Dashboard (badge), on Profile, and on Resume Builder (the "email or print before you go" card).
5. **Status cycling on milestones** goes not_started → in_progress → completed → not_started.
6. **The `location` URL parameter must survive the whole Entry flow** and be written into every `VisitLog` created there.
7. **Resume seeding from the profile** happens once, at creation — editing the profile later must not silently overwrite an in-progress resume.

---

## 12. Recommended build order

1. Theme tokens + fonts + base layout shell.
2. `Participant` and `VisitLog` entities; the session provider; the route guard.
3. Entry screen (all three tabs, both location modes) — this is the top of the funnel, get it perfect.
4. AppLayout sidebar + mobile drawer.
5. Dashboard.
6. Profile (needed because resumes and searches seed from it) + `YearSelect`, `SkillInput`.
7. Job Tracker (entity CRUD patterns land here).
8. Job Search (AI generation + save-to-tracker).
9. Resume Builder + editor + preview/print/Word/email.
10. Career Path.
11. Resources.
12. Pass over empty states, loading states, guest warnings, toasts, and mobile at 390 px wide.

**Acceptance checklist:** register → land on dashboard → fill profile → search jobs → save one → mark it applied → create a resume seeded from the profile → print it → generate a career path → cycle a milestone → sign out → sign in again and find everything still there. Then repeat as a guest and confirm the warnings appear and nothing persists after sign-out.

---

## 13. Not part of this app (omit)

The current build also contains a cosmetic hook that fetches brand colours from an external hub every 30 seconds and rewrites CSS variables. That is deployment plumbing specific to this installation — leave it out; the token palette in §3 is the app's own identity.

Also out of scope: staff/admin reporting views beyond the raw `VisitLog` records, multi-language support, notification emails, and any form of password recovery.