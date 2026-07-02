export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://forum:9000";

const TOKEN_KEY = "forum.token";
export const AUTH_EVENT = "forum:auth-change";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export class ApiError extends Error {
  status: number;
  body: string;
  constructor(status: number, statusText: string, body: string) {
    super(messageFor(status, statusText, body));
    this.status = status;
    this.body = body;
  }
}

function messageFor(status: number, statusText: string, body: string): string {
  // The backend sends ResponseStatusException reasons in the JSON "message" field.
  try {
    const parsed = JSON.parse(body);
    if (parsed?.message) return parsed.message as string;
  } catch {
    /* not JSON */
  }
  if (status === 401) return "Please sign in to continue.";
  if (status === 403) return "You are not allowed to do that.";
  return body || `${status} ${statusText}`;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, res.statusText, text);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ------------------------------- Types ------------------------------- */

export type UserRole = "ADMIN" | "MODERATOR" | "USER";

export type AuthorSummary = { id: number; username: string; role: UserRole };

export type PostResponse = {
  id: number;
  title: string;
  content: string;
  author: AuthorSummary;
  views: number;
  likeCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PostPage = {
  content: PostResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ReplyResponse = {
  id: number;
  postId: number;
  content: string;
  author: AuthorSummary;
  likeCount: number;
  likedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReplyPage = {
  content: ReplyResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  /** Newest reply for the topic, pinned at the top regardless of page. */
  newest?: ReplyResponse | null;
};

export type CreatePostRequest = { title: string; content: string };
export type UpdatePostRequest = { title: string; content: string };
export type CreateReplyRequest = { content: string };
export type UpdateReplyRequest = { content: string };

export type LoginRequest = { username: string; password: string };
export type RegisterRequest = { username: string; password: string; email?: string };
export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
};

export type UserResponse = {
  id: number;
  username: string;
  email?: string | null;
  role: UserRole;
  createdAt: string;
};
export type UpdateUserRequest = {
  username: string;
  role: UserRole;
  email?: string | null;
  password?: string;
};

/* ----------------------------- Endpoints ----------------------------- */

export const Posts = {
  list: (page = 0, size = 15) => api<PostPage>(`/posts?page=${page}&size=${size}`),
  get: (id: number) => api<PostResponse>(`/posts/${id}`),
  create: (body: CreatePostRequest) =>
    api<PostResponse>("/posts", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: UpdatePostRequest) =>
    api<PostResponse>(`/posts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: number) => api<void>(`/posts/${id}`, { method: "DELETE" }),
  like: (id: number) => api<PostResponse>(`/posts/${id}/likes`, { method: "POST" }),
  unlike: (id: number) => api<PostResponse>(`/posts/${id}/likes`, { method: "DELETE" }),
};

export const Replies = {
  list: (postId: number, page = 0, size = 10) =>
    api<ReplyPage>(`/posts/${postId}/replies?page=${page}&size=${size}`),
  create: (postId: number, body: CreateReplyRequest) =>
    api<ReplyResponse>(`/posts/${postId}/replies`, { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: UpdateReplyRequest) =>
    api<ReplyResponse>(`/replies/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: number) => api<void>(`/replies/${id}`, { method: "DELETE" }),
  like: (id: number) => api<ReplyResponse>(`/replies/${id}/likes`, { method: "POST" }),
  unlike: (id: number) => api<ReplyResponse>(`/replies/${id}/likes`, { method: "DELETE" }),
};

export type UpdateThemeRequest = {
  seed: string;
  figures: string[];
  bgColor: string;
  bgOpacity: number;
  cardColor: string;
  cardOpacity: number;
  opacity: number;
  blur: number;
  density: number;
  baseSize: number;
  sizeVariation: number;
  accentColor: string;
  accentVariation: number;
};

export type ThemeCustomization = UpdateThemeRequest & {
  scope: "PAGE" | "USER";
  pageKey?: string | null;
  userId?: number | null;
};

export const Theme = {
  home: () => api<ThemeCustomization>("/theme-customizations/home"),
  forUser: (userId: number) =>
    api<ThemeCustomization>(`/theme-customizations/users/${userId}`),
  updateHome: (body: UpdateThemeRequest) =>
    api<ThemeCustomization>("/theme-customizations/home", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  updateUser: (userId: number, body: UpdateThemeRequest) =>
    api<ThemeCustomization>(`/theme-customizations/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

export const Auth = {
  login: (body: LoginRequest) =>
    api<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body: RegisterRequest) =>
    api<LoginResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
};

export const Users = {
  list: () => api<UserResponse[]>("/users"),
  update: (id: number, body: UpdateUserRequest) =>
    api<UserResponse>(`/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: number) => api<void>(`/users/${id}`, { method: "DELETE" }),
};
