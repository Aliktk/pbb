# PBB Platform - Architecture & Design

This is the single reference for how the Pashtoonkhwa Blood Bank platform is put together:
the topology, the data model (ERD), the request flows, how the head office and branches
interact, and how it is deployed. Diagrams are Mermaid (they render on GitHub, Vercel, and
most Markdown viewers).

- **What & why:** [`PBB Build Harness.md`](<PBB Build Harness.md>)
- **Build plan / tracks:** [`BUILD-PLAN.md`](BUILD-PLAN.md)
- **Deployment specifics:** [`DEPLOYMENT.md`](DEPLOYMENT.md)
- **Screens:** [`ROUTE-INVENTORY.md`](ROUTE-INVENTORY.md)

---

## 1. System topology

```mermaid
flowchart TB
    subgraph Client["User devices - 3G phones in Zhob, desktops in Quetta"]
        PUB["Public visitor"]
        DONOR["Donor (self-service)"]
        STAFF["Branch / head-office staff"]
    end

    subgraph Vercel["Vercel (edge + serverless)"]
        WEB["Next.js web app<br/>apps/web<br/>• public site (Server Components)<br/>• /me self-service<br/>• /admin panel (Client Components)"]
    end

    subgraph Host["Always-on Node host (Railway / Render / Fly)"]
        API["NestJS API - apps/api<br/>/api/v1<br/>• auth + RBAC<br/>• donors / requests / inventory<br/>• content · notifications<br/>• BullMQ workers"]
    end

    subgraph Supabase["Supabase"]
        PG[("PostgreSQL<br/>Prisma-managed<br/>+ donor_eligibility view<br/>+ append-only audit_log")]
        STORE["Storage bucket<br/>media + consent forms"]
    end

    REDIS["Redis / Upstash<br/>cache + BullMQ queues"]
    SMS["Twilio (SMS)<br/>via NotificationPort"]
    WA["WhatsApp Cloud API<br/>(behind a flag)"]

    PUB & DONOR & STAFF --> WEB
    WEB -->|"HTTPS JSON<br/>/api/v1"| API
    API -->|"Prisma<br/>pooled :6543"| PG
    API -->|"migrations<br/>direct :5432"| PG
    API --> REDIS
    API --> STORE
    API --> SMS
    API --> WA
    WEB -.->|"media URLs"| STORE

    classDef db fill:#EAF6EE,stroke:#17803D;
    classDef ext fill:#FDF6E7,stroke:#B7791F;
    class PG,STORE db;
    class SMS,WA,REDIS ext;
```

**Boundaries that matter:**

- The **web never talks to Postgres directly.** Every read/write goes through the API, which
  is where scoping (role + town) and the ethical constraints are enforced. The browser can be
  inspected; the server cannot be bypassed (INV-10).
- **Prisma is the only path to the database.** The pooled connection (`:6543`,
  `pgbouncer=true`) is used at runtime; the direct connection (`:5432`) is used for migrations.
- **Providers sit behind ports.** SMS/WhatsApp go through `NotificationPort`; media through
  `StoragePort`. Swapping Twilio, or moving media to Cloudinary, changes one file.

---

## 2. Deployment architecture

| Concern | Local dev | Production |
|---|---|---|
| Web | `next dev` :3000 | **Vercel** (root dir `apps/web`) |
| API | `nest start` :4000 | Always-on Node host + BullMQ workers |
| Postgres | Docker `:5433` | **Supabase** (pooled `:6543` runtime, direct `:5432` migrations) |
| Redis | Docker `:6379` | Upstash (serverless, Vercel-friendly) |
| Media | local filesystem | **Supabase Storage** (`StoragePort`; Cloudinary later if needed) |
| SMS / WhatsApp | `console` driver (logs) | Twilio + WhatsApp Cloud API (flagged) |

**Domain:** none yet. Until one is bought, the app runs on the default **`*.vercel.app`** URL
for the web and the host's URL for the API - set `NEXT_PUBLIC_API_URL` and `CORS_ORIGINS`
accordingly. When a domain is added, only those two env values (plus Vercel's domain setting)
change; nothing in the code is domain-coupled.

**Why Vercel for web but a separate host for the API:** the API runs background workers
(nightly backups, screening-expiry sweeps, SMS/WhatsApp queues) that need a persistent
process, which Vercel's serverless model does not provide. The web is a perfect fit for
Vercel. See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the alternative (API-on-Vercel + Supabase
cron) if you prefer a single provider.

---

## 3. Data model (ERD)

Derived from the branch Donor Diary and the prototype. Every field earns its place. The full
definition is `apps/api/prisma/schema.prisma`; this is the shape and the relationships.

```mermaid
erDiagram
    TOWN ||--o{ BRANCH : "has office"
    TOWN ||--o{ TOWN : "served from"
    TOWN ||--o{ DONOR : "registers in"
    TOWN ||--o{ BLOOD_REQUEST : "raised in"
    TOWN ||--o{ THALASSEMIA_PATIENT : "cared for in"
    TOWN ||--o{ USER : "scopes"

    BRANCH ||--o{ DONOR : "holds MR (unique per branch)"
    BRANCH ||--o{ STOCK_LEVEL : "stocks"
    BRANCH ||--o{ DONATION : "records at"

    DONOR ||--o{ SCREENING : "tested by"
    DONOR ||--o{ DONATION : "gives"
    DONOR ||--o{ DONOR_OTP : "signs in with"
    DONOR ||--|| DONOR_ELIGIBILITY : "status (view)"

    BLOOD_REQUEST ||--o{ REQUEST_CALL : "worked by"
    BLOOD_REQUEST ||--o{ DONATION : "fulfilled by"

    USER }o--|| ROLE : "has"
    USER ||--o{ AUDIT_LOG : "acts"
    USER ||--o{ REFRESH_TOKEN : "holds"
    USER ||--o{ PASSWORD_RESET_TOKEN : "requests"
    USER ||--o{ INVITATION : "creates"
    USER ||--o{ DONOR : "created by"

    THALASSEMIA_PATIENT }o--o| MEDIA_ASSET : "consent form"
    PAGE ||--o{ PAGE_VERSION : "versions"

    TOWN {
        string id PK
        string name UK
        string servedFromId FK
        bool isOffice
    }
    BRANCH {
        string id PK
        string townId FK
        string address
        string phones "array"
        bool hasAmbulance
        datetime stockUpdatedAt
    }
    DONOR {
        string id PK
        string mrNo "unique per branch"
        string name
        enum bloodGroup
        enum rhFactor
        datetime dateOfBirth
        string phone "branch + head office only"
        string townId FK
        string branchId FK
        datetime lastDonatedAt
        int timesDonated
        datetime deferredUntil
        datetime deletedAt "soft delete = same-day removal"
    }
    SCREENING {
        string id PK
        string donorId FK
        datetime testedAt
        enum hcv
        enum hiv
        enum hbsAg
        enum vdrl
        enum mp
    }
    DONATION {
        string id PK
        string donorId FK
        string requestId FK
        string branchId FK
        datetime donatedAt
        int quantityMl
        enum componentType
    }
    BLOOD_REQUEST {
        string id PK
        string reference UK
        string patientName "never in public responses"
        string hospital
        string townId FK
        enum bloodGroup
        int unitsNeeded
        enum urgency
        string requesterPhone
        enum status
        enum source
    }
    STOCK_LEVEL {
        string id PK
        string branchId FK
        enum bloodGroup
        enum rhFactor
        int unitsAvailable
    }
    USER {
        string id PK
        string email UK
        string passwordHash "null while INVITED"
        string roleId FK
        string townId FK
        enum status
        string twoFactorSecret
    }
    ROLE {
        string id PK
        string name UK
        int level "lower = more senior"
        json permissions
    }
    AUDIT_LOG {
        string id PK
        string actorId FK
        string action
        string entityType
        string reason "required for delete/export/consent"
        json before
        json after
    }
    DONOR_ELIGIBILITY {
        string id PK
        string status "the ONE rule (view)"
    }
```

### The rule that lives in the database

Callability is decided by **one** database view, `donor_eligibility` - never by application
arithmetic in more than one place (INV-5). It returns exactly one of seven states:

```
REMOVED · DEFERRED · NEVER_SCREENED · REACTIVE · SCREENING_STALE · COOLDOWN · ELIGIBLE
```

Every list, search, count and dashboard figure reads it, so two screens can never disagree.
The thresholds (90-day cooldown, 180-day screening staleness) exist only in migration `002`.

---

## 4. How the head office and branches interact

PBB is one head office in Quetta, six branch offices, and fourteen towns (eight served
without an office of their own).

```mermaid
flowchart TD
    HO["HEAD OFFICE - Quetta<br/>role level 0<br/>sees all 14 towns"]

    subgraph Offices["Six branch offices (role level 2)"]
        Q["Quetta branch"]
        P["Pishin"]
        Z["Zhob"]
        L["Loralai"]
        C["Chaman"]
        S["Sibi"]
    end

    HO --> Q & P & Z & L & C & S

    Z --> ZT["Muslim Bagh · Killa Saifullah · Sherani"]
    L --> LT["Dukki · Musakhel"]
    C --> CT["Qila Abdullah"]
    S --> ST["Harnai"]
    Q --> QT["Ziarat"]

    classDef ho fill:#E02B20,color:#fff,stroke:#B31F16;
    classDef br fill:#16171B,color:#fff;
    class HO ho;
    class Q,P,Z,L,C,S br;
```

**The scoping model (enforced server-side):**

- A **branch manager** or **data-entry clerk** sees and edits **only their own town's** donors,
  requests and stock. A branch manager cannot see another branch's stock as their own
  (INV-2).
- **Head office** sees the whole picture across all fourteen towns, and is the only role that
  can create accounts across towns or grant senior roles.
- A **town served without an office** (e.g. Sherani) is operated from its serving branch
  (Zhob). Its donors are counted from the register itself, so a donor can never sit in a town
  no filter can reach (INV-3).
- **Account creation is constrained:** a creator can never grant a role at or above their own
  `level`, nor place a user outside their own town. There is no self-registration - an account
  is created by somebody above it, receives an invitation link, and sets its own password
  (the head office never sees it).

**A branch that goes quiet:** if a branch stops updating stock, after 48 hours the public
shortage strip hides itself rather than show stale figures, and the branch turns red on the
head office's network screen.

---

## 5. Request flows

### 5.1 The emergency - the whole product

An attendant needs O− in Quetta at 02:00.

```mermaid
sequenceDiagram
    actor A as Attendant (public phone)
    participant W as Web (/join/requester)
    participant API as NestJS API
    participant DB as Supabase (Prisma)
    participant CO as Coordinator (admin)

    A->>W: Submit request (group, hospital, phone)
    W->>API: POST /requests (rate-limited, honeypot+captcha)
    API->>API: validate (Zod) · reject bots
    API->>DB: INSERT blood_request (status OPEN)
    API-->>W: 201 { reference }
    W-->>A: "Request received · PBB-xxxx"

    Note over CO,DB: within one second
    CO->>API: GET /requests?status=open (scoped to town)
    API->>DB: SELECT (own town only)
    DB-->>CO: request appears on the Quetta board

    CO->>API: GET /donors/search/eligible?group=O−&townId=Quetta
    API->>DB: read donor_eligibility view, order by longest-since-donation
    DB-->>CO: ranked list (p95 < 200ms)
    CO->>API: POST /requests/:id/calls (donor, outcome)
    CO->>API: POST /donors/:id/donations
    API->>DB: donation written · lastDonatedAt +90d · request CLOSED
    API->>DB: public /needs board drops the request
```

### 5.2 Staff sign-in + RBAC scoping

```mermaid
sequenceDiagram
    actor U as Staff
    participant W as Web (/admin/login)
    participant API as NestJS API
    participant DB as Supabase

    U->>W: email + password
    W->>API: POST /auth/sign-in
    API->>DB: find user, verify argon2id hash
    alt two-factor enabled
        API-->>W: 2FA required
        U->>API: POST /auth/two-factor/verify (TOTP)
    end
    API-->>W: access JWT (role + townId) + refresh token
    Note over W,API: every later request carries the JWT;<br/>the server derives scope from it - never the client
    U->>API: GET /donors (JWT)
    API->>API: guard: role permits? scope = own town
    API->>DB: SELECT donors WHERE town = caller's town
    DB-->>U: only permitted rows (INV-10, INV-11)
```

### 5.3 Donor self-service (phone + OTP)

```mermaid
sequenceDiagram
    actor D as Donor
    participant W as Web (/me)
    participant API as NestJS API
    participant N as NotificationPort (SMS)
    participant DB as Supabase

    D->>W: enter phone
    W->>API: POST /me/otp
    API->>DB: create DonorOtp (hashed, expiry)
    API->>N: send 6-digit code
    D->>W: enter code
    W->>API: POST /me/verify
    API->>DB: check code, mark used
    API-->>W: short-lived session
    D->>W: update number / record a donation elsewhere / turn off night calls
    D->>W: remove me
    W->>API: DELETE /me/record
    API->>DB: soft-delete same day · donations kept as an unnamed number in totals
```

---

## 6. Web application structure

```mermaid
flowchart LR
    subgraph web["apps/web (Next.js App Router)"]
        RL["app/layout.tsx<br/>fonts + globals.css (prototype CSS verbatim)"]
        subgraph pub["(public) - Server Components"]
            PL["layout: header · footer · announcement · WhatsApp"]
            HOME["25 marketing pages"]
            ME["/me self-service"]
        end
        subgraph adm["/admin - Client Components"]
            SH["AdminShell: sidebar · role switcher · mobile bar"]
            SCR["30 admin screens"]
        end
        LIB["lib/ - style(css), nav, admin(elig), adminData<br/>components/ - ImageSlot, forms, sheets"]
    end
    RL --> pub & adm
    pub --> LIB
    adm --> SH --> SCR
    SCR --> LIB
```

- **Public site** = Server Components - fast on 3G, indexable.
- **Admin** = Client Components behind `AdminShell`; every figure is meant to come from one
  API field, never derived on the client (INV-1).
- **Shared vocabulary:** `lib/style.ts` (`css()` ports the prototype's inline styles),
  `lib/nav.ts` (the one town list), `lib/admin.ts` (the eligibility mirror - deleted once
  wired to the API).

---

## 7. Cross-cutting rules (the invariants)

The §7 invariants are enforced by `scripts/invariants/run.mjs` and the test suites:

| Rule | Guarantee |
|---|---|
| INV-1 | One source per number - no figure computed in two places |
| INV-2 | Scoped header ⇒ scoped body |
| INV-3 | No orphan records - every FK resolves |
| INV-5 | One eligibility rule - only `donor_eligibility` decides callability |
| INV-7 | Failures are visible - no catch leaves stale UI |
| INV-8 | Plurals + empty states at 0 / 1 / many |
| INV-9 | No dead controls - every button does something or is not rendered |
| INV-10 | Permissions are server-side |
| INV-11 | Privacy holds - phones/patient names never leak |
| INV-12 | The audit log is complete and immutable (append-only, DB-enforced) |

---

## 8. Current state vs target

- **Built & verified:** the schema + migrations + eligibility view + audit guard on Supabase;
  the full web UI (62 routes) as design (sample data); the NestJS API scaffold with a live
  `/health` DB round-trip.
- **Next:** wire the web to the API (auth, donor reads, request intake), which retires the
  web's sample-data eligibility mirror and turns the admin figures into real API fields.
