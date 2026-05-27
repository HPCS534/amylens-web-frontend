# AmyLens Web Frontend

Frontend for Module 4 dashboards (Devices, Flagged Sessions, Analytics, Data Export), built with React + Vite.

## Prerequisites

- Node.js 20+
- npm 10+
- Module 3 backend running (default expected URL: `http://localhost:8080`)

## Install

```bash
npm install
```

## Environment

Create a `.env.local` file in the project root.

Recommended local values:

```env
# Backend base URL used by Vite proxy in development
VITE_API_URL=http://localhost:8080

# LAN IP of the machine running this frontend (for QR and phone access)
VITE_LAN_HOST=192.168.254.121

# Explicit URL encoded in the provisioning QR
VITE_QR_URL=http://192.168.254.121:5173/login
```

Notes:

- `VITE_QR_URL` has highest priority for the QR code.
- If `VITE_QR_URL` is not set, the app uses the current host, and for localhost it can fall back to `VITE_LAN_HOST`.

## Run (Development)

Standard local run:

```bash
npm run dev
```

Run with LAN access (recommended for phone/QR testing):

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

Open:

- Local browser: `http://localhost:5173`
- Phone on same network: `http://<your-lan-ip>:5173`

## Build and Preview

Build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Test and Lint

```bash
npm run test
npm run lint
```

## LAN and QR Troubleshooting

If phone scan opens `localhost` or cannot connect:

1. Ensure `.env.local` has a valid `VITE_QR_URL` using your LAN IP.
2. Start dev server with `--host 0.0.0.0`.
3. Ensure phone and PC are on the same router/subnet (avoid guest Wi-Fi).
4. Allow firewall inbound traffic for frontend port (`5173`) and backend port (`8080`).
5. Hard refresh the web app and rescan the QR.

## Backend Integration

- Frontend API calls use `/api/*` and Vite proxies them to `VITE_API_URL` in development.
- If backend authentication redirects or CORS issues occur, verify backend CORS/session-cookie settings for your frontend origin.
