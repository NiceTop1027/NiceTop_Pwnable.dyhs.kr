import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { appendNextToAuthPath } from "@/lib/auth-redirect";
import { serverLecture } from "@/lib/api-server";

export async function requireAuthLecture(slug: string, pageSlug?: string) {
  const returnPath = pageSlug
    ? `/curriculum/${slug}/${pageSlug}`
    : `/curriculum/${slug}`;

  try {
    return await serverLecture(slug, pageSlug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(appendNextToAuthPath("/auth/login", returnPath));
    }
    notFound();
  }
}