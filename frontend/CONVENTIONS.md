# Frontend conventions

Next.js (App Router) + Tailwind v4 in `frontend/`.

- **Styling: Tailwind utility classes only.** No CSS-in-JS and **no inline
  `style={{ ... }}` objects** — use Tailwind classes. There are deliberately no
  CSS Modules; don't introduce `.module.css`. Keep dark-mode variants (`dark:`)
  alongside their light counterparts.
- **One component per file.** Each React component lives in its own
  `frontend/components/<Name>.tsx` and is imported where used. Page files
  (`app/**/page.tsx`) stay thin — they fetch/route and compose components; they
  do not define reusable sub-components inline.
- **Don't duplicate class strings.** When the same Tailwind block appears in
  more than one place, extract a component (e.g. `LikeButton`, `AuthorLine`)
  rather than copy-pasting the classes.
- **Client vs server.** Interactive components start with `"use client"`. Pure
  presentational components (e.g. `RoleBadge`, `AuthorLine`) omit it.
- **API access goes through `lib/api.ts`** (the `Posts`/`Replies`/`Users`/`Auth`
  objects). Don't call `fetch` directly from components. Auth/role helpers live
  in `lib/auth.ts` (`useCurrentUser`, `canModify`).
