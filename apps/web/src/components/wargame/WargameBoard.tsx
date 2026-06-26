"use client";

import { useMemo, useState } from "react";
import { PreviewList } from "@/components/pages/PreviewList";
import type { Challenge } from "@/lib/api";

const categoryLabels: Record<string, string> = {
  PWN: "Pwnable",
  REV: "Reversing",
  WEB: "Web",
  CRYPTO: "Crypto",
  FORENSIC: "Forensics",
  MISC: "Misc",
  OSINT: "OSINT",
};

const difficultyLabels: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  INSANE: "Insane",
};

const difficultyOrder = ["EASY", "MEDIUM", "HARD", "INSANE"] as const;

type SortKey = "recommended" | "points-asc" | "points-desc" | "solves-desc" | "title";

function challengeExcerpt(description: string, max = 120): string | undefined {
  const text = description.trim();
  if (!text) return undefined;

  if (text.startsWith("[")) {
    try {
      const blocks = JSON.parse(text) as Array<{
        content?: Array<{ text?: string }>;
      }>;
      const plain = blocks
        .map((block) =>
          (block.content ?? []).map((item) => item.text ?? "").join(""),
        )
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (plain) return plain.length > max ? `${plain.slice(0, max)}…` : plain;
    } catch {
      // fall through
    }
  }

  const stripped = text.replace(/[#*_`>\[\]]/g, "").replace(/\s+/g, " ").trim();
  if (!stripped) return undefined;
  return stripped.length > max ? `${stripped.slice(0, max)}…` : stripped;
}

function challengeMeta(challenge: Challenge) {
  const xp = challenge.xpReward ?? challenge.points;
  const parts = [
    difficultyLabels[challenge.difficulty] ?? challenge.difficulty,
    `${xp.toLocaleString()} XP`,
    `${challenge._count.solves} solved`,
  ];
  if (challenge.dockerImage) parts.push("Docker");
  return parts.join(" · ");
}

function difficultyWeight(difficulty: string) {
  switch (difficulty) {
    case "EASY":
      return 1;
    case "MEDIUM":
      return 2;
    case "HARD":
      return 3;
    case "INSANE":
      return 4;
    default:
      return 0;
  }
}

function sortChallenges(list: Challenge[], sort: SortKey) {
  const copy = [...list];
  copy.sort((a, b) => {
    switch (sort) {
      case "points-asc":
        return (a.xpReward ?? a.points) - (b.xpReward ?? b.points);
      case "points-desc":
        return (b.xpReward ?? b.points) - (a.xpReward ?? a.points);
      case "solves-desc":
        return b._count.solves - a._count.solves;
      case "title":
        return a.title.localeCompare(b.title, "ko");
      default:
        return (
          difficultyWeight(a.difficulty) - difficultyWeight(b.difficulty) ||
          (a.xpReward ?? a.points) - (b.xpReward ?? b.points) ||
          a.title.localeCompare(b.title, "ko")
        );
    }
  });
  return copy;
}

function toPreviewItems(challenges: Challenge[]) {
  return challenges.map((challenge) => ({
    title: challenge.title,
    desc: challengeExcerpt(challenge.description),
    meta: challengeMeta(challenge),
    href: `/wargame/${challenge.slug}`,
  }));
}

export function WargameBoard({ challenges }: { challenges: Challenge[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [difficulty, setDifficulty] = useState("ALL");
  const [instanceOnly, setInstanceOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("recommended");

  const categories = useMemo(
    () => [...new Set(challenges.map((c) => c.category))].sort(),
    [challenges],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = challenges.filter((challenge) => {
      if (category !== "ALL" && challenge.category !== category) return false;
      if (difficulty !== "ALL" && challenge.difficulty !== difficulty) return false;
      if (instanceOnly && !challenge.dockerImage) return false;
      if (!q) return true;

      const haystack = [
        challenge.title,
        challenge.slug,
        challenge.category,
        challenge.difficulty,
        challengeExcerpt(challenge.description, 500) ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });

    return sortChallenges(list, sort);
  }, [category, challenges, difficulty, instanceOnly, query, sort]);

  const grouped = useMemo(() => {
    const showGrouped =
      category === "ALL" && !query.trim() && !instanceOnly && sort === "recommended";

    if (!showGrouped) {
      return [["문제", filtered] as const];
    }

    const map = new Map<string, Challenge[]>();
    for (const challenge of filtered) {
      const key = challenge.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(challenge);
    }

    return [...map.entries()].map(
      ([key, items]) => [categoryLabels[key] ?? key, items] as const,
    );
  }, [category, filtered, instanceOnly, query, sort]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    category !== "ALL" ||
    difficulty !== "ALL" ||
    instanceOnly ||
    sort !== "recommended";

  return (
    <>
      <div className="mb-12 max-w-3xl space-y-6">
        <div>
          <label htmlFor="wargame-search" className="input-label">
            검색
          </label>
          <input
            id="wargame-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목, 설명"
            className="input-field"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
          <label className="flex items-center gap-3 text-caption">
            <span className="text-[var(--text-tertiary)]">카테고리</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field w-auto min-w-[9rem] py-2 text-sm"
              aria-label="카테고리"
            >
              <option value="ALL">전체</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {categoryLabels[item] ?? item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 text-caption">
            <span className="text-[var(--text-tertiary)]">난이도</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="input-field w-auto min-w-[9rem] py-2 text-sm"
              aria-label="난이도"
            >
              <option value="ALL">전체</option>
              {difficultyOrder.map((item) => (
                <option key={item} value={item}>
                  {difficultyLabels[item]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 text-caption">
            <span className="text-[var(--text-tertiary)]">정렬</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="input-field w-auto min-w-[9rem] py-2 text-sm"
              aria-label="정렬"
            >
              <option value="recommended">추천</option>
              <option value="points-asc">점수 낮은순</option>
              <option value="points-desc">점수 높은순</option>
              <option value="solves-desc">풀이 많은순</option>
              <option value="title">제목순</option>
            </select>
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-caption">
            <input
              type="checkbox"
              checked={instanceOnly}
              onChange={(e) => setInstanceOnly(e.target.checked)}
              className="accent-white"
            />
            인스턴스만
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn-text text-caption"
              onClick={() => {
                setQuery("");
                setCategory("ALL");
                setDifficulty("ALL");
                setInstanceOnly(false);
                setSort("recommended");
              }}
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        grouped.map(([label, items], index) => (
          <section key={label} className={index > 0 ? "mt-16" : undefined}>
            <p className="text-eyebrow mb-6">{label}</p>
            <PreviewList items={toPreviewItems(items)} />
          </section>
        ))
      ) : (
        <p className="text-body py-8 text-center">조건에 맞는 문제가 없습니다</p>
      )}
    </>
  );
}