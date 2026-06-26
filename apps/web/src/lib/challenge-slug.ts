const REPOSITORY_SLUG_PATTERN = /^[a-z0-9_-]+$/;

export function suggestRepositorySlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s_-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || ""
  );
}

export function isValidRepositorySlug(slug: string): boolean {
  return REPOSITORY_SLUG_PATTERN.test(slug) && slug.length > 0;
}