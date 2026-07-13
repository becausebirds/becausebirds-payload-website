# 🐦 Jeff Mann's Bird Blog

A full-featured birding blog built on **Payload CMS** + **Next.js** that combines a personal blog with integrated eBird checklists, bird species taxonomy, media galleries, quizzes, guestbook, and a bird-lover gift shop.

## 🗺️ Site Map

| Route | Description |
|---|---|
| `/` | Home page — latest posts, projects, birding stats snapshot |
| `/{post-slug}` | Blog post or page |
| `/archive` | Full archive of all blog posts |
| `/bird-checklists` | Explore page — browse all public bird checklists |
| `/bird-checklists/{slug}` | Individual checklist detail with map, species list, and media |
| `/birds/{slug}` | Individual bird species page with taxonomy info and media |
| `/gifts` | Bird lover gift shop — affiliate product listings |
| `/guestbook` | Community guestbook — visitors leave a message |
| `/metrics` | Website analytics dashboard (iframe embed) |
| `/quiz/{slug}` | Bird personality quiz |

---

## 📦 Data Model (Payload CMS Collections)

### Birds (`birds`)

The central taxonomy hub — every bird species from the **eBird/Clements** taxonomy.

| Field | Type | Description |
|---|---|---|
| `speciesCode` | `text` (unique, indexed) | 6-letter eBird species code, e.g. `cangoo` |
| `sciName` | `text` (indexed) | Scientific name |
| `comName` | `text` | Common name |
| `order` | `text` | Taxonomic order |
| `familyComName` | `text` | Family common name |
| `familySciName` | `text` | Family scientific name |
| `taxonomicStatus` | `select` | `current` / `lumped` / `split` / `deprecated` |
| `lumpedInto` | `relationship → birds` | If lumped, points to the current species |
| `lumpedFrom` | `relationship → birds (hasMany)` | If current, lists species lumped into this one |
| `splitInto` | `relationship → birds (hasMany)` | If split, points to the resulting species |
| `splitFrom` | `relationship → birds` | If current, points to the original pre-split species |
| `slug` | `text` (unique, auto-generated) | URL slug from common name → `/birds/{slug}` |
| `description` | `textarea` | Optional public-facing notes |
| `lastSyncedAt` | `date` | Last sync timestamp with eBird |
| `rawTaxonomyData` | `json` (hidden) | Raw eBird taxonomy payload |

> **Taxonomy change tracking:** When eBird lumps or splits species, old entries remain live as historical records. Self-referential relationships (`lumpedInto`, `lumpedFrom`, `splitInto`, `splitFrom`) preserve the full history.

---

### Bird Checklists (`bird-checklists`)

Each checklist represents a birding outing imported from **eBird**.

| Field | Type | Description |
|---|---|---|
| `private` | `checkbox` | If checked, no public page is generated |
| `ebirdChecklistId` | `text` (indexed) | The original eBird checklist ID |
| `slug` | `text` (unique) | Auto-generated from eBird ID |
| `title` | `text` | Checklist title |
| `date` | `date` | Date of the outing |
| `startTime` | `text` | Start time |
| `locationName` | `text` | Location name |
| `locationId` | `text` (indexed) | eBird location ID |
| `latitude` / `longitude` | `number` | GPS coordinates |
| `county` | `text` (indexed) | County |
| `state` | `text` (indexed) | State / province |
| `region` | `text` (indexed) | Region |
| `protocol` | `select` | Traveling / Stationary / Incidental / Historical / Area |
| `duration` | `number` | Duration in minutes |
| `distance` | `number` | Distance in miles |
| `numberOfObservers` | `number` | Party size |
| `speciesCount` | `number` | Total species observed |
| `gpsTrack` | `json` | GPS track points — GeoJSON-compatible `[{ lat, lng, timestamp? }, ...]` |
| `trackDistanceKm` | `number` | GPS track distance in km |
| `species` | `json` | Raw species array from eBird import: `[{ commonName, scientificName, count, comments }]` |
| `speciesRecords` | `array` | **Linked** species — array of `{ bird: relationship → birds, count, comments }` |
| `notes` | `textarea` | Personal notes (never overwritten on re-import) |
| `lastImportedAt` | `date` | Last eBird import timestamp |
| `rawImportData` | `json` (hidden) | Raw import payload |

> **Import workflow:** A custom admin UI component (`EbirdImportField`) allows importing checklists directly from eBird CSV/exports. The `species` JSON field holds the raw import, while `speciesRecords` links each observation to a `birds` record for rich cross-referencing.

---

### Bird Media (`bird-media`)

Photos, audio recordings, and videos from birding outings.

| Field | Type | Description |
|---|---|---|
| *(upload fields)* | — | File stored at `public/birdmedia/` — accepts `image/*`, `audio/*`, `video/*` |
| `checklistId` | `relationship → bird-checklists` | The checklist this media was captured on |
| `species` | `relationship → birds (hasMany)` | One or more bird species featured |
| `soundTypeTags` | `group` | Audio-only: `song`, `call`, `flightSong`, `flightCall`, `mechanicalSound`, `dawnSong`, `duet` |
| `rating` | `number (1–5)` | Quality rating |
| `equipment` | `group` | Audio-only: `recorder`, `microphone`, `accessories` |
| `mediaNotes` | `textarea` | Additional notes |

> **Cross-linking:** Each piece of media links back to a checklist and to one or more bird species, creating a fully traversable graph of *where* and *what* was seen/heard.

---

### Quizzes (`quizzes`)

Bird personality quizzes — the user answers questions and gets matched to a bird personality.

| Field | Type | Description |
|---|---|---|
| `name` | `text` | Quiz name |
| `slug` | `text` (unique) | URL slug → `/quiz/{slug}` |
| `description` | `textarea` | Quiz description |
| `personalities` | `array` | Possible results — each has `title`, `description` (rich text), and `image` (upload → media) |
| `questions` | `array` | Quiz questions — each has `title`, `featuredImage` (upload → media), and `answers` (array of `{ title, personalityIndex }`) |

> **Personality matching:** Each answer maps to a `personalityIndex`, pointing to the personality at that position in the array. The quiz tallies results and reveals the matched bird personality.

---

### Products (`products`)

Affiliate / bird-lover gift items displayed in the gift shop.

| Field | Type | Description |
|---|---|---|
| `title` | `text` | Product name |
| `slug` | `text` (unique) | URL slug |
| `description` | `richText` | Product description |
| `price` | `number` | Price |
| `categories` | `array` | Product categories |
| `tags` | `array` | Tags |
| `thumbnail` | `upload → media` | Product image |
| `externalUrl` | `text` | Affiliate / external purchase URL |
| `buttonText` | `text` | CTA button text (default: "View Product") |
| `status` | `select` | `publish` / `draft` |
| `publishedAt` | `date` | Publication date |

---

### Visitors (`visitors`)

The blog's **guestbook** — public signings from site visitors.

| Field | Type | Description |
|---|---|---|
| `name` | `text` (required) | Visitor's name |
| `location` | `text` (required) | Visitor's location |
| `favoriteBird` | `text` (required) | Visitor's favorite bird species |
| `message` | `textarea` | Optional message |
| `date` | `date` (auto-default) | Timestamp of the entry |

> **Notifications:** An `afterChange` hook sends an admin notification when a new guestbook entry is submitted.

---

## 🔗 Entity Relationship Diagram
