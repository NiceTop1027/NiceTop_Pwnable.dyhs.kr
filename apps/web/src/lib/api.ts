export function resolveServerApiUrl() {
  if (process.env.INTERNAL_API_URL) return process.env.INTERNAL_API_URL;
  if (
    process.env.API_URL &&
    process.env.WEB_URL &&
    process.env.API_URL === process.env.WEB_URL &&
    process.env.API_PORT
  ) {
    return `http://localhost:${process.env.API_PORT}`;
  }
  return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";
}
/**
 * API 통신을 위한 중앙 클라이언트 모듈
 */

const SERVER_API_URL = resolveServerApiUrl();

function getApiOrigin(): string {
  if (typeof window !== "undefined") return "";
  return SERVER_API_URL;
}

export function buildApiUrl(path: string): string {
  const origin = getApiOrigin();
  return origin ? `${origin}/api${path}` : `/api${path}`;
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = fetch(buildApiUrl("/auth/refresh"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    cache: "no-store",
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const data = (await res.json().catch(() => null)) as {
        user?: unknown;
      } | null;
      return !!data?.user;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

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

function extractErrorMessage(data: unknown, status: number): string {
  if (!data || typeof data !== "object") {
    return status === 429
      ? "Too many requests. Please try again later"
      : "Request failed";
  }

  const payload = data as { message?: unknown; error?: unknown };
  const raw = payload.message ?? payload.error;

  if (typeof raw === "string" && raw.trim()) return raw;
  if (Array.isArray(raw)) {
    const joined = raw.filter((item) => typeof item === "string").join(", ");
    if (joined) return joined;
  }

  return status === 429
    ? "Too many requests. Please try again later"
    : "Request failed";
}

type FetchOptions = RequestInit & {
  skipAuthRetry?: boolean;
  serverCookieHeader?: string;
};

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(extractErrorMessage(data, res.status), res.status, data);
  }
  return data as T;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuthRetry, serverCookieHeader, headers, ...rest } = options;
  const isFormData = rest.body instanceof FormData;

  const request = () =>
    fetch(buildApiUrl(path), {
      ...rest,
      credentials: serverCookieHeader ? undefined : "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(serverCookieHeader ? { Cookie: serverCookieHeader } : {}),
        ...headers,
      },
      cache: rest.cache ?? "no-store",
    });

  let res = await request();

  if (
    res.status === 401 &&
    !skipAuthRetry &&
    !path.startsWith("/auth/") &&
    !serverCookieHeader
  ) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await request();
    }
  }

  return parseResponse<T>(res);
}

export async function apiUpload<T>(
  path: string,
  form: FormData,
  options: { method?: string; serverCookieHeader?: string } = {},
): Promise<T> {
  const res = await fetch(buildApiUrl(path), {
    method: options.method ?? "POST",
    credentials: options.serverCookieHeader ? undefined : "include",
    headers: options.serverCookieHeader
      ? { Cookie: options.serverCookieHeader }
      : undefined,
    body: form,
    cache: "no-store",
  });

  return parseResponse<T>(res);
}

export type InstanceInfo = {
  id: string;
  host: string;
  port: number;
  expiresAt: string;
};

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
};

export type RankingEntry = {
  rank: number;
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  score: number;
  level: number;
  _count: { solves: number };
};

export type ChallengePublicFile = {
  path: string;
  size: number;
  url: string;
};

export type ChallengeDetail = Challenge & {
  solved: { id: string; solvedAt: string; isFirstBlood: boolean } | null;
  publicFiles?: ChallengePublicFile[];
};

export type LecturePageSummary = {
  id: string;
  title: string;
  slug: string;
  order: number;
};

export type LecturePageDetail = LecturePageSummary & {
  content: string;
};

export type LectureProgressState = {
  progress: number;
  completed: boolean;
  visitedPageSlugs: string[];
  lastPageSlug: string | null;
};

export type LectureDetail = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  tier: string;
  category: { name: string; slug: string };
  version: number;
  pages: LecturePageSummary[];
  page: LecturePageDetail;
  userProgress: LectureProgressState | null;
};

export type LearningProgressItem = {
  lectureId: string;
  title: string;
  slug: string;
  category: string;
  totalPages: number;
  progress: number;
  completed: boolean;
  visitedPageSlugs: string[];
  lastPageSlug: string | null;
  lastAccessedAt: string | null;
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
  createdAt: string;
  _count: { solves: number };
  solves?: number;
};

export type Board = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { posts: number };
};

export type BoardAuthor = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export type PublicUserProfile = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  score: number;
  level: number;
  createdAt: string;
  _count: {
    solves: number;
    achievements: number;
    lectureProgress: number;
  };
};

export type BoardPostSummary = {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: BoardAuthor;
  _count: { comments: number; likes: number };
};

export type BoardPostsResponse = {
  board: {
    id: string;
    name: string;
    slug: string;
    type: string;
    description: string | null;
  };
  posts: BoardPostSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type BoardComment = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: BoardAuthor;
  replies?: BoardComment[];
};

export type BoardPostDetail = BoardPostSummary & {
  board: { name: string; slug: string; type: string };
  comments: BoardComment[];
  likedByMe: boolean;
};

export type AdminCommunityPost = BoardPostSummary & {
  board: { name: string; slug: string; type: string };
};

export type Notice = {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  publishedAt: string;
  author: { username: string; displayName: string | null; role: string };
};

export type NotificationItem = {
  id: string;
  title: string;
  publishedAt: string;
  isPinned: boolean;
  isRead: boolean;
};

export type NotificationSummary = {
  unreadCount: number;
  items: NotificationItem[];
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

export type AdminLecturePage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
};

export type AdminLecture = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  content: string;
  pages: AdminLecturePage[];
  isPublished: boolean;
  version: number;
  updatedAt: string;
};

export type AdminNotice = Notice;

export type AdminChallenge = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  dockerImage: string | null;
  isPublished: boolean;
  updatedAt: string;
};

export type ChallengeDockerStatus = {
  imageName: string;
  buildStatus: "none" | "building" | "ready" | "failed";
  buildError: string | null;
  builtAt: string | null;
  containerPort: number;
  files: string[];
  hasContext: boolean;
  instanceCapable: boolean;
  archives: string[];
  lastArchive: string | null;
  storagePath: string;
};

export type AdminCurriculumItem = {
  id: string;
  order: number;
  lecture: { id: string; title: string; slug: string } | null;
  challenge: { id: string; title: string; slug: string } | null;
};

export type AdminCurriculum = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  tier: string;
  order: number;
  items: AdminCurriculumItem[];
  updatedAt?: string;
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

  session: () =>
    apiFetch<{
      user:
        | (AuthUser & {
            _count: { solves: number; achievements: number; lectureProgress: number };
          })
        | null;
    }>("/auth/session", { skipAuthRetry: true }),

  me: () =>
    apiFetch<
      | (AuthUser & {
          _count: { solves: number; achievements: number; lectureProgress: number };
        })
      | null
    >("/auth/me", { skipAuthRetry: true }),

  updateProfile: (data: { displayName?: string; email?: string; bio?: string },
  ) =>
    apiFetch<AuthUser>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string },
  ) =>
    apiFetch<{ success: boolean }>("/auth/password", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  uploadAvatar: async (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return apiUpload<AuthUser>("/auth/avatar", form);
  },

  deleteAvatar: () =>
    apiFetch<AuthUser>("/auth/avatar", { method: "DELETE" }),

  refresh: () =>
    apiFetch<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({}),
      skipAuthRetry: true,
    }),

  logout: () =>
    apiFetch<{ success: boolean }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
      skipAuthRetry: true,
    }),

  ranking: (limit = 50) =>
    apiFetch<RankingEntry[]>(`/users/ranking?limit=${limit}`),

  userProfile: (username: string) =>
    apiFetch<PublicUserProfile>(`/users/profile/${username}`),

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

  boardPosts: (slug: string, page = 1, limit = 20) =>
    apiFetch<BoardPostsResponse>(
      `/boards/${slug}/posts?page=${page}&limit=${limit}`,
    ),

  boardPost: (slug: string, postId: string) =>
    apiFetch<BoardPostDetail>(`/boards/${slug}/posts/${postId}`, {}),

  createBoardPost: (
    slug: string,
    data: { title: string; content: string },
  ) =>
    apiFetch<BoardPostSummary>(`/boards/${slug}/posts`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateBoardPost: (
    slug: string,
    postId: string,
    data: { title?: string; content?: string },
  ) =>
    apiFetch<BoardPostSummary>(`/boards/${slug}/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteBoardPost: (slug: string, postId: string) =>
    apiFetch<{ success: boolean }>(`/boards/${slug}/posts/${postId}`, {
      method: "DELETE",
    }),

  toggleBoardPostLike: (slug: string, postId: string) =>
    apiFetch<{ liked: boolean }>(`/boards/${slug}/posts/${postId}/like`, {
      method: "POST",
    }),

  createBoardComment: (
    slug: string,
    postId: string,
    data: { content: string; parentId?: string },
  ) =>
    apiFetch<BoardComment>(`/boards/${slug}/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateBoardComment: (
    slug: string,
    postId: string,
    commentId: string,
    data: { content: string },
  ) =>
    apiFetch<BoardComment>(
      `/boards/${slug}/posts/${postId}/comments/${commentId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    ),

  deleteBoardComment: (
    slug: string,
    postId: string,
    commentId: string,
  ) =>
    apiFetch<{ success: boolean }>(
      `/boards/${slug}/posts/${postId}/comments/${commentId}`,
      { method: "DELETE" },
    ),

  notices: () => apiFetch<Notice[]>("/notices"),

  ctfEvents: () => apiFetch<CtfEvent[]>("/ctf"),

  lecture: (slug: string, pageSlug?: string) =>
    apiFetch<LectureDetail>(
      pageSlug ? `/lectures/${slug}/${pageSlug}` : `/lectures/${slug}`,
      {},
    ),

  recordLectureProgress: (slug: string, pageSlug: string) =>
    apiFetch<LectureProgressState & {
      lectureId: string;
      lectureSlug: string;
      lectureTitle: string;
      totalPages: number;
    }>(`/lectures/${slug}/progress`, {
      method: "POST",
      body: JSON.stringify({ pageSlug }),
    }),

  learningProgress: () =>
    apiFetch<LearningProgressItem[]>("/lectures/learning/progress", {}),

  challenge: (slug: string) =>
    apiFetch<ChallengeDetail>(`/challenges/${slug}`, {}),

  submitFlag: (slug: string, flag: string) =>
    apiFetch<{ correct: boolean; isFirstBlood: boolean; points: number }>(
      `/challenges/${slug}/submit`,
      { method: "POST", body: JSON.stringify({ flag }) },
    ),

  startChallengeInstance: (challengeId: string) =>
    apiFetch<InstanceInfo>(`/challenges/${challengeId}/instance/start`, {
      method: "POST",
    }),

  stopChallengeInstance: (challengeId: string, instanceId: string) =>
    apiFetch<void>(`/challenges/${challengeId}/instance/${instanceId}`, {
      method: "DELETE",
    }),

  notice: (id: string) => apiFetch<Notice>(`/notices/${id}`),

  notificationsRecent: () =>
    apiFetch<NotificationSummary>("/notifications/recent"),

  notifications: () =>
    apiFetch<NotificationSummary>("/notifications", {}),

  markAllNotificationsRead: () =>
    apiFetch("/notifications/read-all", { method: "POST" }),

  markNotificationRead: (noticeId: string) =>
    apiFetch(`/notifications/read/${noticeId}`, { method: "POST" }),

  submitInquiry: (data: {
    category: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    consent: boolean;
  }) =>
    apiFetch<{ id: string; createdAt: string }>("/contact/inquiries", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const adminApi = {
  stats: () =>
    apiFetch<Record<string, number>>("/admin/stats", {}),

  logs: () => apiFetch<unknown[]>("/admin/logs", {}),

  inquiries: () => apiFetch<unknown[]>("/admin/inquiries", {}),

  updateInquiryStatus: (id: string, status: string) =>
    apiFetch(`/admin/inquiries/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  users: () => apiFetch<unknown[]>("/admin/users", {}),

  updateUser: (id: string, data: { role?: string; isActive?: boolean }) =>
    apiFetch(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  lectureCategories: () =>
    apiFetch<{ id: string; name: string; slug: string }[]>("/admin/lectures/categories", {}),

  lectures: () => apiFetch<unknown[]>("/admin/lectures", {}),

  createLecture: (data: {
      categoryId: string;
      title: string;
      description?: string;
      content: string;
      isPublished?: boolean;
    },
  ) =>
    apiFetch<AdminLecture>("/admin/lectures", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getLecture: (id: string) =>
    apiFetch<AdminLecture>(`/admin/lectures/${id}`, {}),

  updateLecture: (id: string,
    data: {
      categoryId?: string;
      title?: string;
      description?: string;
      content?: string;
      isPublished?: boolean;
      slug?: string;
      pages?: {
        id?: string;
        title: string;
        slug?: string;
        content: string;
        order: number;
      }[];
    },
  ) =>
    apiFetch<AdminLecture>(`/admin/lectures/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteLecture: (id: string) =>
    apiFetch(`/admin/lectures/${id}`, { method: "DELETE" }),

  challenges: () => apiFetch<unknown[]>("/admin/challenges", {}),

  createChallenge: (data: {
      title: string;
      slug?: string;
      description: string;
      category: string;
      difficulty?: string;
      points?: number;
      flag: string;
      dockerImage?: string;
      isPublished?: boolean;
    },
  ) =>
    apiFetch<AdminChallenge>("/admin/challenges", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getChallenge: (id: string) =>
    apiFetch<AdminChallenge>(`/admin/challenges/${id}`, {}),

  updateChallenge: (
    id: string,
    data: {
      title?: string;
      description?: string;
      category?: string;
      difficulty?: string;
      points?: number;
      flag?: string;
      dockerImage?: string | null;
      isPublished?: boolean;
    },
  ) =>
    apiFetch<AdminChallenge>(`/admin/challenges/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteChallenge: (id: string) =>
    apiFetch(`/admin/challenges/${id}`, { method: "DELETE" }),

  getChallengeDockerStatus: (id: string) =>
    apiFetch<ChallengeDockerStatus>(`/admin/challenges/${id}/docker`, {}),

  uploadChallengeDocker: (id: string, file: File) => {
    const form = new FormData();
    form.append("archive", file);
    return apiUpload<ChallengeDockerStatus>(`/admin/challenges/${id}/docker/upload`, form);
  },

  rebuildChallengeDocker: (id: string) =>
    apiFetch<ChallengeDockerStatus>(`/admin/challenges/${id}/docker/build`, {
      method: "POST",
      body: JSON.stringify({}),
    }),

  notices: () => apiFetch<Notice[]>("/admin/notices", {}),

  createNotice: (data: { title: string; content: string; isPinned?: boolean },
  ) =>
    apiFetch<AdminNotice>("/admin/notices", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getNotice: (id: string) =>
    apiFetch<AdminNotice>(`/admin/notices/${id}`, {}),

  updateNotice: (id: string,
    data: { title?: string; content?: string; isPinned?: boolean },
  ) =>
    apiFetch<AdminNotice>(`/admin/notices/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteNotice: (id: string) =>
    apiFetch(`/admin/notices/${id}`, { method: "DELETE" }),

  curricula: () =>
    apiFetch<AdminCurriculum[]>("/admin/curricula", {}),

  createCurriculum: (data: {
      title: string;
      description?: string;
      tier?: string;
    },
  ) =>
    apiFetch<AdminCurriculum>("/admin/curricula", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCurriculum: (id: string) =>
    apiFetch<AdminCurriculum>(`/admin/curricula/${id}`, {}),

  updateCurriculum: (id: string,
    data: {
      title?: string;
      description?: string;
      tier?: string;
      order?: number;
    },
  ) =>
    apiFetch<AdminCurriculum>(`/admin/curricula/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteCurriculum: (id: string) =>
    apiFetch(`/admin/curricula/${id}`, { method: "DELETE" }),

  addCurriculumItem: (curriculumId: string,
    data: { lectureId?: string; challengeId?: string },
  ) =>
    apiFetch<AdminCurriculumItem>(`/admin/curricula/${curriculumId}/items`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteCurriculumItem: (curriculumId: string,
    itemId: string,
  ) =>
    apiFetch(`/admin/curricula/${curriculumId}/items/${itemId}`, {
      method: "DELETE",
    }),

  reorderCurriculumItems: (curriculumId: string,
    itemIds: string[],
  ) =>
    apiFetch<AdminCurriculum>(`/admin/curricula/${curriculumId}/items/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ itemIds }),
    }),

  communityPosts: () =>
    apiFetch<AdminCommunityPost[]>("/admin/community/posts", {}),

  updateCommunityPost: (postId: string,
    data: { isPinned?: boolean },
  ) =>
    apiFetch<AdminCommunityPost>(`/admin/community/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteCommunityPost: (postId: string) =>
    apiFetch(`/admin/community/posts/${postId}`, {
      method: "DELETE",
    }),

  uploadContentImage: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiUpload<{ url: string }>("/admin/uploads/content", form);
  },
};

export function isStaff(role?: string) {
  return role === "OWNER" || role === "ADMIN";
}

export { isStaffRole } from "./roles";
