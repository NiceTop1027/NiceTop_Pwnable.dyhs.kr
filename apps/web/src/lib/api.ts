const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOptions = RequestInit & {
  token?: string | null;
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}/api${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: rest.cache ?? "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const raw = (data as { message?: string | string[] })?.message;
    const message = Array.isArray(raw)
      ? raw.join(", ")
      : raw ?? "Request failed";
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

export type AuthUser = {
  id: string;
  username: string;
  email: string | null;
  displayName: string | null;
  role: string;
  score: number;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type RankingEntry = {
  rank: number;
  id: string;
  username: string;
  displayName: string | null;
  score: number;
  level: number;
  _count: { solves: number };
};

export type ChallengeDetail = Challenge & {
  solved: { id: string; solvedAt: string; isFirstBlood: boolean } | null;
};

export type LectureDetail = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  tier: string;
  category: { name: string; slug: string };
  content: string;
  version: number;
};

export type LectureCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { lectures: number };
};

export type Lecture = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  tier: string;
  category: { name: string; slug: string };
  versions: { id: string; version: number }[];
  _count: { versions: number };
};

export type Challenge = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  xpReward: number;
  dockerImage: string | null;
  _count: { solves: number };
};

export type Board = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { posts: number };
};

export type Notice = {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  publishedAt: string;
  author: { username: string; displayName: string | null };
};

export type CtfEvent = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  mode: string;
  startAt: string;
  endAt: string;
  _count: { participants: number; challenges: number };
};

export type Curriculum = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content?: unknown;
  tier: string;
  items: {
    lecture: {
      title: string;
      slug: string;
      description: string | null;
    } | null;
    challenge: {
      title: string;
      slug: string;
    } | null;
  }[];
  _count: { items: number };
};

export type AdminCurriculum = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: unknown;
  tier: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export const api = {
  health: () => apiFetch<{ status: string }>("/health"),

  login: (username: string, password: string) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (data: {
    username: string;
    password: string;
    email?: string;
    displayName?: string;
  }) =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: (token: string) =>
    apiFetch<AuthUser & { _count: { solves: number; achievements: number; lectureProgress: number } }>(
      "/auth/me",
      { token },
    ),

  updateProfile: (
    token: string,
    data: { displayName?: string; email?: string; bio?: string },
  ) =>
    apiFetch<AuthUser>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  changePassword: (
    token: string,
    data: { currentPassword: string; newPassword: string },
  ) =>
    apiFetch<{ success: boolean }>("/auth/password", {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  uploadAvatar: async (token: string, file: File) => {
    const form = new FormData();
    form.append("avatar", file);

    const res = await fetch(`${API_URL}/api/auth/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const raw = (data as { message?: string | string[] })?.message;
      const message = Array.isArray(raw)
        ? raw.join(", ")
        : raw ?? "Request failed";
      throw new ApiError(message, res.status, data);
    }

    return data as AuthUser;
  },

  deleteAvatar: (token: string) =>
    apiFetch<AuthUser>("/auth/avatar", { method: "DELETE", token }),

  refresh: (refreshToken: string) =>
    apiFetch<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (refreshToken?: string) =>
    apiFetch<{ success: boolean }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  ranking: (limit = 50) =>
    apiFetch<RankingEntry[]>(`/users/ranking?limit=${limit}`),

  lectureCategories: () =>
    apiFetch<LectureCategory[]>("/lectures/categories"),

  lectures: (category?: string) =>
    apiFetch<Lecture[]>(
      category ? `/lectures?category=${category}` : "/lectures",
    ),

  challenges: (category?: string) =>
    apiFetch<Challenge[]>(
      category ? `/challenges?category=${category}` : "/challenges",
    ),

  challengeCategories: () =>
    apiFetch<{ category: string; count: number }[]>("/challenges/categories"),

  curricula: () => apiFetch<Curriculum[]>("/curricula"),

  boards: () => apiFetch<Board[]>("/boards"),

  notices: () => apiFetch<Notice[]>("/notices"),

  ctfEvents: () => apiFetch<CtfEvent[]>("/ctf"),

  lecture: (slug: string) => apiFetch<LectureDetail>(`/lectures/${slug}`),

  challenge: (slug: string, token?: string | null) =>
    apiFetch<ChallengeDetail>(`/challenges/${slug}`, { token }),

  submitFlag: (slug: string, flag: string, token: string) =>
    apiFetch<{ correct: boolean; isFirstBlood: boolean; points: number }>(
      `/challenges/${slug}/submit`,
      { method: "POST", body: JSON.stringify({ flag }), token },
    ),

  notice: (id: string) => apiFetch<Notice>(`/notices/${id}`),
};

export const adminApi = {
  stats: (token: string) =>
    apiFetch<Record<string, number>>("/admin/stats", { token }),

  logs: (token: string) => apiFetch<unknown[]>("/admin/logs", { token }),

  users: (token: string) => apiFetch<unknown[]>("/admin/users", { token }),

  updateUser: (token: string, id: string, data: { role?: string; isActive?: boolean }) =>
    apiFetch(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  lectureCategories: (token: string) =>
    apiFetch<{ id: string; name: string; slug: string }[]>("/admin/lectures/categories", { token }),

  lectures: (token: string) => apiFetch<unknown[]>("/admin/lectures", { token }),

  createLecture: (
    token: string,
    data: {
      categoryId: string;
      title: string;
      description?: string;
      content: string;
      isPublished?: boolean;
    },
  ) =>
    apiFetch("/admin/lectures", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  deleteLecture: (token: string, id: string) =>
    apiFetch(`/admin/lectures/${id}`, { method: "DELETE", token }),

  challenges: (token: string) => apiFetch<unknown[]>("/admin/challenges", { token }),

  createChallenge: (
    token: string,
    data: {
      title: string;
      description: string;
      category: string;
      difficulty?: string;
      points?: number;
      flag: string;
      dockerImage?: string;
      isPublished?: boolean;
    },
  ) =>
    apiFetch("/admin/challenges", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updateChallenge: (token: string, id: string, data: Record<string, unknown>) =>
    apiFetch(`/admin/challenges/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  deleteChallenge: (token: string, id: string) =>
    apiFetch(`/admin/challenges/${id}`, { method: "DELETE", token }),

  curricula: (token: string) => apiFetch<unknown[]>("/admin/curricula", { token }),

  createCurriculum: (
    token: string,
    data: {
      title: string;
      description?: string;
      content?: unknown;
      tier?: string;
    },
  ) =>
    apiFetch<AdminCurriculum>("/admin/curricula", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  getCurriculum: (token: string, id: string) =>
    apiFetch<AdminCurriculum>(`/admin/curricula/${id}`, { token }),

  updateCurriculum: (
    token: string,
    id: string,
    data: {
      title?: string;
      description?: string;
      content?: unknown;
      tier?: string;
    },
  ) =>
    apiFetch<AdminCurriculum>(`/admin/curricula/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  deleteCurriculum: (token: string, id: string) =>
    apiFetch(`/admin/curricula/${id}`, { method: "DELETE", token }),

  notices: (token: string) => apiFetch<Notice[]>("/admin/notices", { token }),

  createNotice: (
    token: string,
    data: { title: string; content: string; isPinned?: boolean },
  ) =>
    apiFetch("/admin/notices", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  deleteNotice: (token: string, id: string) =>
    apiFetch(`/admin/notices/${id}`, { method: "DELETE", token }),
};

export function isStaff(role?: string) {
  return role === "OWNER" || role === "ADMIN";
}