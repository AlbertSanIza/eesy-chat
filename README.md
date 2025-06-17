# eesy-chat

## License

MIT

## Technologies

- [Bun](https://bun.sh/)
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Tanstack Router](https://tanstack.com/router)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Vercel](https://vercel.com/)
- [Clerk](https://clerk.com/)
- [Convex](https://convex.dev/)
- [Hono](https://hono.dev/)
- [Railway](https://railway.app/)
- [OpenRouter](https://openrouter.ai/)

## Minimum Requirements

- Node Latest LTS
- Bun Latest

## Environment Variables

`OPENROUTER_API_KEY`: Your OpenRouter API key.
`VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key.
`VITE_CONVEX_URL`: Your Convex URL.
`VITE_RAILWAY_API_URL`: Your Railway API URL.
`DOMAIN_URL`: Your domain URL (e.g., http://localhost:5173 for local development or VITE_RAILWAY_API_URL on railway).

## Installation

```bash
bun install
```

## Run

```bash
# Start the hono backend
bun hono

# Start the convex backend
bun convex

# Start the vite frontend
bun dev:fe
```
