# La Eterna Salsa - AI Agent Context

## Stack
Next.js 16, Supabase, shadcn/ui, Tailwind v4, TypeScript

## Commands
```bash
npm run dev      # Development
npm run build    # Build (verify before commit)
```

## Key Files
```
lib/supabase.ts          # Browser client (placeholder values for build)
lib/supabase-server.ts   # Server client + service role
lib/database.types.ts    # Generated types from schema
supabase/schema.sql      # Full database schema
middleware.ts            # Admin auth protection
```

## Routes
- `/` - Homepage (radio player + chat)
- `/video` - YouTube playlist page
- `/shoutout` - Submit shoutout form
- `/admin/*` - Protected admin panel (10 sections)

## Database Tables
`chat_messages`, `shoutouts`, `stickers`, `site_config`, `djs`, `faqs`, `platform_links`, `social_links`, `admin_emails`

## Components
```
components/
├── radio-player.tsx      # Vinyl-style player, huge play button
├── chat-widget.tsx       # Real-time chat, GIFs, stickers, view-only for guests
├── recent-songs.tsx      # Shoutcast metadata polling (45s interval)
├── shoutouts-carousel.tsx
├── giphy-picker.tsx
├── sticker-picker.tsx
└── ui/                   # shadcn components
```

## Build Notes
- Admin pages use `// @ts-nocheck` (Supabase types need env vars)
- Supabase clients have placeholder values for static builds
- PWA icons at `/public/icons/`

## Colors
```css
--brand-red: #D32F2F
--brand-gold: #FBC000
--brand-orange: #ff8906
```

## Env Vars
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
SUPABASE_SECRET_KEY
NEXT_PUBLIC_GIPHY_API_KEY
NEXT_PUBLIC_SHOUTCAST_URL (optional - for live metadata)
```

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |
