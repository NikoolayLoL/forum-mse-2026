# Forum — Functional Requirements

> Translated from the assignment's **"Forum User Stories"** (original in Bulgarian).
> The requirements use the term **"Topic"**; the codebase implements it as **`Post`**
> (`PostEntity`, `PostsApiController`, `/posts`). Treat **Topic = Post** throughout.

## FUS1 — Create a Topic (registered users)

As a registered user, I want to be able to create a Topic. Each Topic contains:

- A short description of the subject (**title**). The title **must be unique**.
- Information about the user who created it (**creator**).
- **Created date.**
- **Modified date.**
- Information on **how many people have viewed** the Topic (**view count**).

## FUS2 — Create Replies

As a user, I want to be able to create replies in any topic. A Reply must include:

- The **text** of the reply.
- Information about the user who created it (**creator**).
- **Created date.**
- **Modified date.**

## FUS3 — View Topics

As a user, I want to be able to browse topics. Whenever a topic is opened, its
replies are loaded **paginated, 10 per page**.

## FUS4 — Register a user

As a user, I want to be able to register an account in the system.

## FUS5 — Roles

I want the users in the system to have the following roles:

- **Administrator** — the *only* role that can make users into moderators.
  Can perform every operation that the other roles can.
- **Moderator** — a regular user who can create and edit **their own** topics and
  replies, and can also edit **other users'** topics and replies.
- **User** — can create topics and replies. Can edit only the objects created
  **by themselves**.

---

## Implementation status

Verify against code before relying on this — it can drift.

| Requirement | Where | Status |
|---|---|---|
| FUS4 register | `POST /auth/register` → `AuthService.register` (USER role, returns JWT) | ✅ |
| FUS5 roles enum | `domain/UserRole` (ADMIN, MODERATOR, USER) | ✅ |
| FUS5 admin-only user creation | `UsersApiController.createUser` `@PreAuthorize("hasRole('ADMIN')")` | ✅ |
| FUS5 ownership edit rules | `security/ContentSecurity`, `@PreAuthorize` on posts/replies controllers | ✅ |
| FUS1 unique title | `posts.uq_posts_title` + `PostEntity.title` (409 on conflict) | ✅ |
| FUS1 creator on Topic | `PostEntity.author`, stamped in `PostService.create` | ✅ |
| FUS1 created/modified date | `PostEntity.createdAt` / `updatedAt` (`@PreUpdate`) | ✅ |
| FUS1 view count | `PostEntity.views`, incremented on open (no `updatedAt` bump) | ✅ |
| FUS2 creator/dates on Reply | `ReplyEntity.author` / `createdAt` / `updatedAt` | ✅ |
| FUS3 replies paginated 10/page | `RepliesApiController.listRepliesForPost` returns `ReplyPage` | ✅ |
| Likes (extension) | `PostLikeEntity` / `ReplyLikeEntity` + `/likes` endpoints | ✅ |
| Frontend: auth-aware nav | `frontend/components/SiteHeader.tsx` | ✅ |
| Frontend: browse + open topics | `frontend/app/page.tsx`, `app/posts/[id]/page.tsx` | ✅ |
| Frontend: create/edit/like/reply | `app/posts/new`, `app/posts/[id]` | ✅ |
| Frontend: admin user management | `app/admin/users/page.tsx` | ✅ |
