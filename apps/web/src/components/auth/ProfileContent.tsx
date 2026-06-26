"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { api, ApiError, type AuthUser } from "@/lib/api";
import { scoreToLevel } from "@/lib/level";
import {
  translateApiError,
  validateDisplayName,
  validateEmail,
  validatePassword,
} from "@/lib/auth-validation";
import { AuthField } from "@/components/auth/AuthField";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { ProfileAvatar } from "@/components/auth/ProfileAvatar";
import { isStaffRole } from "@/lib/roles";
import { LearningProgressList } from "@/components/lectures/LearningProgressList";
import {
  confirmUnsavedLeave,
  useUnsavedChangesWarning,
} from "@/lib/use-unsaved-changes-warning";

type Tab = "overview" | "profile" | "security";

type MeUser = AuthUser & {
  _count: { solves: number; achievements: number; lectureProgress: number };
};

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "개요" },
  { id: "profile", label: "프로필" },
  { id: "security", label: "보안" },
];

function xpProgress(score: number) {
  const lv = scoreToLevel(score);
  const current = (lv - 1) * 200;
  const next = lv * 200;
  const pct = Math.min(100, ((score - current) / (next - current)) * 100);
  return { level: lv, pct: Number.isFinite(pct) ? pct : 0 };
}

export function ProfileContent() {
  const { user, level, isLoading, logout, setUser } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<MeUser["_count"] | null>(null);

  const [profile, setProfile] = useState({ displayName: "", email: "", bio: "" });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [securityMsg, setSecurityMsg] = useState("");
  const [securityErr, setSecurityErr] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);

  useEffect(() => {
    if (!user) return setStats(null);
    api
      .me()
      .then((me) => setStats(me?._count ?? null))
      .catch(() => setStats(null));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setProfile({
      displayName: user.displayName ?? "",
      email: user.email ?? "",
      bio: user.bio ?? "",
    });
  }, [user]);

  const profileDirty = useMemo(() => {
    if (!user) return false;
    return (
      profile.displayName.trim() !== (user.displayName ?? "") ||
      profile.email.trim() !== (user.email ?? "") ||
      profile.bio.trim() !== (user.bio ?? "")
    );
  }, [profile, user]);

  const securityDirty = useMemo(
    () =>
      passwords.currentPassword !== "" ||
      passwords.newPassword !== "" ||
      passwords.confirmPassword !== "",
    [passwords],
  );

  const hasUnsavedChanges =
    (tab === "profile" && profileDirty) || (tab === "security" && securityDirty);

  useUnsavedChangesWarning(hasUnsavedChanges);

  function switchTab(next: Tab) {
    if (next === tab) return;
    if (hasUnsavedChanges && !confirmUnsavedLeave()) return;
    setTab(next);
  }

  async function handleLogout() {
    if (hasUnsavedChanges && !confirmUnsavedLeave()) return;
    await logout();
  }

  if (isLoading) {
    return (
      <div className="profile-center">
        <span className="profile-spinner" />
        <span>불러오는 중</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-center profile-guest-box">
        <div className="profile-hero-avatar">?</div>
        <h2 className="profile-hero-name">로그인이 필요합니다</h2>
        <p className="profile-hero-meta">회원가입 후 프로필과 학습 기록을 확인할 수 있습니다</p>
        <div className="profile-guest-actions">
          <Button href="/auth" variant="outline">
            로그인
          </Button>
          <Button href="/auth?tab=register" variant="fill">
            회원가입
          </Button>
        </div>
      </div>
    );
  }

  const displayName = user.displayName ?? user.username;
  const xp = xpProgress(user.score);
  const isStaff = isStaffRole(user.role);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");

    const dnErr = validateDisplayName(profile.displayName);
    const emErr = validateEmail(profile.email);
    if (dnErr) return setProfileErr(dnErr);
    if (emErr) return setProfileErr(emErr);

    setProfileLoading(true);
    try {
      const updated = await api.updateProfile( {
        displayName: profile.displayName.trim(),
        email: profile.email.trim(),
        bio: profile.bio.trim(),
      });
      setUser(updated);
      setProfileMsg("저장되었습니다");
    } catch (err) {
      setProfileErr(
        err instanceof ApiError ? translateApiError(err.message) : "저장 실패",
      );
    } finally {
      setProfileLoading(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setSecurityMsg("");
    setSecurityErr("");

    if (!passwords.currentPassword) {
      return setSecurityErr("현재 비밀번호를 입력해 주세요");
    }
    const pwErr = validatePassword(passwords.newPassword);
    if (pwErr) return setSecurityErr(pwErr);
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setSecurityErr("새 비밀번호가 일치하지 않습니다");
    }
    if (passwords.currentPassword === passwords.newPassword) {
      return setSecurityErr("새 비밀번호는 현재와 달라야 합니다");
    }

    setSecurityLoading(true);
    try {
      await api.changePassword( {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSecurityMsg("비밀번호가 변경되었습니다");
    } catch (err) {
      setSecurityErr(
        err instanceof ApiError ? translateApiError(err.message) : "변경 실패",
      );
    } finally {
      setSecurityLoading(false);
    }
  }

  return (
    <div className="profile-layout">
      <header className="profile-hero">
        <ProfileAvatar
          user={user}
          size="hero"
          onError={(msg) => {
            setProfileErr(msg);
            setTab("profile");
          }}
        />
        <div className="profile-hero-body">
          <h1 className="profile-hero-name">{displayName}</h1>
          <p className="profile-hero-meta">@{user.username}</p>
          <div className="profile-xp-row">
            <span>Lv.{xp.level}</span>
            <div className="profile-xp-track">
              <div className="profile-xp-fill" style={{ width: `${xp.pct}%` }} />
            </div>
            <span>{user.score.toLocaleString()} XP</span>
          </div>
        </div>
        <div className="profile-hero-actions">
          {isStaff && (
            <Link href="/admin" className="profile-hero-link">
              <Shield className="h-3.5 w-3.5" strokeWidth={1.5} />
              관리
            </Link>
          )}
          <button type="button" className="profile-hero-link" onClick={() => void handleLogout()}>
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            로그아웃
          </button>
        </div>
      </header>

      <nav className="auth-tabs profile-tabs" aria-label="프로필 메뉴">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`auth-tab ${tab === t.id ? "auth-tab-active" : ""}`}
            onClick={() => switchTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="profile-content">
        {tab === "overview" && (
          <section className="profile-section">
            <h2 className="profile-section-title">학습 현황</h2>
            <div className="profile-stats">
              {[
                { label: "레벨", value: `Lv.${level}` },
                { label: "경험치", value: user.score.toLocaleString() },
                { label: "완료 강의", value: stats ? String(stats.lectureProgress) : "—" },
                { label: "해결 문제", value: stats ? String(stats.solves) : "—" },
                { label: "업적", value: stats ? String(stats.achievements) : "—" },
              ].map((s) => (
                <div key={s.label} className="profile-stat">
                  <span className="profile-stat-label">{s.label}</span>
                  <span className="profile-stat-value">{s.value}</span>
                </div>
              ))}
            </div>
            <div className="profile-learning">
              <h3 className="profile-learning-title">학습한 강의</h3>
              <LearningProgressList />
            </div>

            {user.bio && (
              <div className="profile-bio-box">
                <span className="profile-stat-label">소개</span>
                <p className="profile-bio-text">{user.bio}</p>
              </div>
            )}
            <Button variant="outline" onClick={() => switchTab("profile")}>
              프로필 수정
            </Button>
          </section>
        )}

        {tab === "profile" && (
          <section className="profile-section">
            <h2 className="profile-section-title">프로필 설정</h2>
            <p className="profile-section-desc">프로필 사진과 닉네임, 연락처를 수정합니다</p>

            <div className="profile-avatar-block">
              <ProfileAvatar
                user={user}
                size="form"
                onUpdated={() => {
                  setProfileMsg("");
                  setProfileErr("");
                }}
                onError={setProfileErr}
              />
              <div className="profile-avatar-hint">
                <p className="profile-avatar-hint-title">프로필 사진</p>
                <p className="profile-avatar-hint-desc">
                  클릭하여 업로드 · 확대·회전·맞춤 조정 · JPEG, PNG, WebP, GIF · 최대 2MB
                </p>
              </div>
            </div>

            <form className="auth-form profile-form" onSubmit={saveProfile}>
              <AuthField label="아이디" name="username" value={user.username} readOnly />
              <AuthField
                label="닉네임"
                name="displayName"
                value={profile.displayName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, displayName: e.target.value }))
                }
                placeholder="표시 이름"
                maxLength={50}
                required
              />
              <AuthField
                label="이메일"
                name="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="선택 사항"
              />
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="bio">
                  소개
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  className="auth-field-input min-h-24 resize-y"
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="한 줄 소개"
                  maxLength={200}
                />
                <p className="auth-field-hint">{profile.bio.length}/200</p>
              </div>

              <AuthAlert message={profileErr} />
              {profileMsg && <p className="profile-success">{profileMsg}</p>}

              <div className="profile-form-bar">
                {profileDirty && (
                  <span className="profile-dirty">저장되지 않은 변경</span>
                )}
                <Button variant="fill" type="submit" disabled={profileLoading || !profileDirty}>
                  {profileLoading ? "저장 중…" : "저장"}
                </Button>
              </div>
            </form>
          </section>
        )}

        {tab === "security" && (
          <section className="profile-section">
            <h2 className="profile-section-title">비밀번호 변경</h2>
            <p className="profile-section-desc">현재 비밀번호 확인 후 새 비밀번호를 설정합니다</p>

            <form className="auth-form profile-form" onSubmit={savePassword}>
              <AuthField
                label="현재 비밀번호"
                name="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
                }
                autoComplete="current-password"
                required
              />
              <AuthField
                label="새 비밀번호"
                name="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                }
                autoComplete="new-password"
                required
              />
              <PasswordStrength password={passwords.newPassword} />
              <AuthField
                label="새 비밀번호 확인"
                name="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                autoComplete="new-password"
                required
              />

              <AuthAlert message={securityErr} />
              {securityMsg && <p className="profile-success">{securityMsg}</p>}

              <Button variant="fill" type="submit" disabled={securityLoading}>
                {securityLoading ? "변경 중…" : "비밀번호 변경"}
              </Button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}