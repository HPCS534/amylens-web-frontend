# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Integration with Module 3 (backend)

 - Copy `.env.local.example` to `.env.local` and update `VITE_API_URL` if your backend runs on a different host/port.
 - Dev proxy is configured in `vite.config.js` to forward `/api` to the backend. This lets you call `/api/*` from the frontend without CORS during development.
 - A small API client is provided at `src/api/client.js`. Usage examples:

```js
import { api, login } from './src/api/client'

// login (sets session cookie)
await login('admin', 'password')

// get sessions (requires login)
const sessions = await api.getSessions()

// submit review
await api.reviewSession(123, { action: 'ACCEPT' })
```

See `src/api/client.js` for more helper functions (varieties, device auth, submit session, etc.).
