# PostgreSQL Backend Plan

This document maps the current frontend API usage to a PostgreSQL-backed backend.

## Goals

- Move all real data out of frontend hardcoded arrays and DEV fallbacks.
- Keep the React app as a thin client that only renders data from `/api/...`.
- Preserve the current frontend contract where possible.

## Current Frontend API Surface

The frontend already expects these endpoints:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/reset`
- `GET /api/varieties`
- `POST /api/sessions`
- `GET /api/sessions`
- `POST /api/sessions/{id}/review`
- `GET /api/sessions/export`
- `GET /api/analytics`
- `GET /api/devices`
- `POST /api/devices/auth`
- `GET /api/devices/{ssaid}/users`
- `PUT /api/devices/{id}/approve`
- `PUT /api/devices/{id}/deny`

## Recommended Tables

### `users`
Stores authenticated users and reviewers.

Suggested columns:

- `id` UUID primary key
- `username` text unique not null
- `password_hash` text not null
- `display_name` text
- `role` text not null
- `is_active` boolean default true
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### `devices`
Stores registered devices.

Suggested columns:

- `id` UUID primary key
- `ssaid` text unique not null
- `hardware_identity` text not null
- `workspace_assignment` text
- `health_status` text not null
- `approved` boolean default false
- `denied` boolean default false
- `approved_by` UUID references `users(id)`
- `approved_at` timestamptz
- `denied_by` UUID references `users(id)`
- `denied_at` timestamptz
- `last_seen_at` timestamptz
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### `device_users`
Maps a device to allowed users.

Suggested columns:

- `device_id` UUID references `devices(id)`
- `user_id` UUID references `users(id)`
- primary key `(device_id, user_id)`

### `sessions`
Stores the core analysis/session data used by the dashboard, export, analytics, and flagged session review.

Suggested columns:

- `id` UUID primary key
- `session_code` text unique not null
- `device_id` UUID references `devices(id)`
- `user_id` UUID references `users(id)`
- `variety` text not null
- `status` text not null
- `trial_stage` text
- `season` text
- `captured_at` timestamptz not null
- `submitted_at` timestamptz
- `amylose_class` text
- `confidence_score` numeric(5,4)
- `grain_length` numeric(8,2)
- `grain_shape` text
- `percent_acceptability` numeric(5,2)
- `image_hash` text
- `review_state` text default 'pending'
- `reviewer_id` UUID references `users(id)`
- `reviewed_at` timestamptz
- `review_note` text
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### `session_reviews`
Keeps a full audit trail for approve/deny actions.

Suggested columns:

- `id` UUID primary key
- `session_id` UUID references `sessions(id)`
- `action` text not null
- `reviewer_id` UUID references `users(id)`
- `reviewer_note` text
- `reviewed_at` timestamptz not null default now()

### `export_jobs`
Tracks export requests and export history.

Suggested columns:

- `id` UUID primary key
- `requested_by` UUID references `users(id)`
- `format` text not null
- `status_filter` text
- `variety_filter` text
- `date_from` date
- `date_to` date
- `record_count` integer
- `export_status` text not null default 'queued'
- `file_path` text
- `created_at` timestamptz not null default now()
- `completed_at` timestamptz

### `analytics_snapshots`
Optional cache table for dashboard charts.

Suggested columns:

- `id` UUID primary key
- `snapshot_date` date not null
- `metric_name` text not null
- `metric_value` numeric not null
- `payload` jsonb
- `created_at` timestamptz not null default now()

### `varieties`
Lookup table for valid rice varieties.

Suggested columns:

- `id` UUID primary key
- `name` text unique not null
- `is_active` boolean default true

## Endpoint-to-Table Mapping

### Auth

- `POST /api/auth/login` -> validate `users.username` + `password_hash`
- `POST /api/auth/logout` -> invalidate session or token
- `POST /api/auth/reset` -> update `users.password_hash`

### Device Management

- `GET /api/devices` -> read from `devices`
- `POST /api/devices/auth` -> resolve device by `ssaid` and return allowed users
- `GET /api/devices/{ssaid}/users` -> join `devices` + `device_users` + `users`
- `PUT /api/devices/{id}/approve` -> update `devices.approved`, `approved_by`, `approved_at`
- `PUT /api/devices/{id}/deny` -> update `devices.denied`, `denied_by`, `denied_at`

### Sessions

- `POST /api/sessions` -> insert into `sessions`
- `GET /api/sessions` -> query `sessions` with filters for `variety`, `status`, `dateFrom`, `dateTo`
- `POST /api/sessions/{id}/review` -> insert `session_reviews` row and update `sessions.review_state`, `reviewer_id`, `reviewed_at`, `review_note`

### Export

- `GET /api/sessions/export` -> query `sessions` and render CSV/JSON/PDF from filtered rows
- If you need export history, use `export_jobs` to persist each request

### Analytics

- `GET /api/analytics` -> aggregate from `sessions`
- Optionally cache aggregates in `analytics_snapshots`

### Varieties

- `GET /api/varieties` -> read active rows from `varieties`

## Recommended Export Columns

Your frontend already mentions a 14-column GQ-RIS export. The backend should emit a stable column order, for example:

1. `sessionId`
2. `deviceSsaid`
3. `userName`
4. `variety`
5. `amyloseClass`
6. `confidenceScore`
7. `capturedAt`
8. `submittedAt`
9. `trialStage`
10. `season`
11. `imageHash`
12. `grainLength`
13. `grainShape`
14. `percentAcceptability`

## What to Remove From the Frontend

After the backend is ready, remove or minimize:

- DEV export blobs in `src/api/client.js`
- hardcoded fallback rows in `AnalyticsPage.jsx`
- hardcoded fallback sessions in `FlaggedSessionsPage.jsx`
- sample session rows in `ExportLanding.jsx`
- browser-stored password helpers in `passwordResetState.js` if you do not want demo mode

## Suggested Migration Order

1. Create the PostgreSQL schema and seed data.
2. Implement `/api/varieties` and `/api/devices` first.
3. Implement `/api/sessions` and `/api/sessions/{id}/review`.
4. Implement `/api/sessions/export`.
5. Implement `/api/analytics`.
6. Remove the frontend fallbacks once the API is stable.

## Implementation Note

If you are using Spring Boot, the simplest path is:

- JPA entities for the tables above
- service layer for filtering and export mapping
- controllers that keep the current `/api/...` paths
- Spring Security for authenticated endpoints and role checks

