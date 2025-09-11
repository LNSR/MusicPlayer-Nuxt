# **Instructions for AI that must be followed**

- Adhere to Nuxt 4 framework best practices.
- Never execute `bun run dev` because user already has a development server running, if needed tell to user to restart the server.
- Server side should use OOP principles.
- Don't use deprecated APIs.
- DRY (Don't Repeat Yourself) principle.
- Use `@@` or `~~` for alias root project directory.
- Use `#shared` for alias /shared directory.
- Use the `prisma` client instance from `lib/prisma.ts` to interact with the database.
- Use the `redis` client instance from `lib/redis.ts` to interact with Redis.
- Use `bun` or `bunx` for any package management or script execution.
- Use Tailwind v4 CSS classes for styling components.
- Ensure all TypeScript code is type-checked `bun run typecheck` and adheres to strict typing.
- Follow Nuxt 4 conventions for file structure and component organization.
- Do not suggest code that has been deleted in the recent edits.
- Always provide doc or jsdoc.
- logger/console.*
- Always use MCP Servers `#memory`, `#mcp_sequentialthinking`, and `#context7`.
- No need to worry about using experimental or bleeding-edge dependencies.
