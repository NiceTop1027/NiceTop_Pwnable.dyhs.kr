"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { PublicUserProfile } from "@/lib/api";
import { scoreToLevel } from "@/lib/level";
import { useAuth } from "@/providers/AuthProvider";
import { UserAvatar } from "./UserAvatar";

function xpProgress(score: number) {
  const lv = scoreToLevel(score);
  const current = (lv - 1) * 200;
  const next = lv * 200;
  const pct = Math.min(100, ((score - current) / (next - current)) * 100);
  return { level: lv, pct: Number.isFinite(pct) ? pct : 0 };
}

export function PublicProfileContent({ profile }: { profile: PublicUserProfile }) {
  const { user: me } = useAuth();
  const displayName = profile.displayName ?? profile.username;
  const xp = xpProgress(profile.score);
  const isMe = me?.username === profile.username;

  return (
    <div className="profile-layout">
      <header className="profile-hero">
        <UserAvatar user={profile} size="md" className="profile-hero-avatar-static" />
        <div className="profile-hero-body">
          <h1 className="profile-hero-name">{displayName}</h1>
          <p className="profile-hero-meta">@{profile.username}</p>
          <div className="profile-xp-row">
            <span>Lv.{xp.level}</span>
            <div className="profile-xp-track">
              <div className="profile-xp-fill" style={{ width: `${xp.pct}%` }} />
            </div>
            <span>{profile.score.toLocaleString()} XP</span>
          </div>
        </div>
        {isMe && (
          <div className="profile-hero-actions">
            <Link href="/profile" className="profile-hero-link">
              내 프로필 수정
            </Link>
          </div>
        )}
      </header>

      <section className="profile-section">
        <h2 className="profile-section-title">활동</h2>
        <div className="profile-stats">
          {[
            { label: "레벨", value: `Lv.${profile.level}` },
            { label: "경험치", value: profile.score.toLocaleString() },
            {
              label: "완료 강의",
              value: String(profile._count.lectureProgress),
            },
            { label: "해결 문제", value: String(profile._count.solves) },
            { label: "업적", value: String(profile._count.achievements) },
          ].map((s) => (
            <div key={s.label} className="profile-stat">
              <span className="profile-stat-label">{s.label}</span>
              <span className="profile-stat-value">{s.value}</span>
            </div>
          ))}
        </div>

        {profile.bio && (
          <div className="profile-bio-box">
            <span className="profile-stat-label">소개</span>
            <p className="profile-bio-text">{profile.bio}</p>
          </div>
        )}

        <p className="profile-public-joined">
          가입일{" "}
          {new Date(profile.createdAt).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <Button href="/ranking" variant="outline">
          랭킹 보기
        </Button>
      </section>
    </div>
  );
}