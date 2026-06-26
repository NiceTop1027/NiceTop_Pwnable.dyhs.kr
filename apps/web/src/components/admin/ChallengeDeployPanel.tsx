"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  Power,
  RefreshCw,
  Upload,
} from "lucide-react";
import { adminApi, type AdminChallenge, type ChallengeDockerStatus } from "@/lib/api";
import { AdminBadge } from "./ui/AdminBadge";

const statusLabels: Record<ChallengeDockerStatus["buildStatus"], string> = {
  none: "미설정",
  building: "빌드 중",
  ready: "준비 완료",
  failed: "빌드 실패",
};

export function ChallengeDeployPanel({
  challengeId,
  instanceEnabled,
  onChallengeUpdated,
}: {
  challengeId: string;
  instanceEnabled: boolean;
  onChallengeUpdated?: (challenge: AdminChallenge) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ChallengeDockerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = await adminApi.getChallengeDockerStatus(challengeId);
      setStatus(next);
      if (next.hasContext) {
        setExpanded(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "상태를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  const reloadChallenge = useCallback(async () => {
    const challenge = await adminApi.getChallenge(challengeId);
    onChallengeUpdated?.(challenge);
    return challenge;
  }, [challengeId, onChallengeUpdated]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    if (status?.buildStatus !== "building") return;
    const timer = window.setInterval(refreshStatus, 4000);
    return () => window.clearInterval(timer);
  }, [refreshStatus, status?.buildStatus]);

  async function handleUpload(file: File) {
    setWorking(true);
    setError("");
    setExpanded(true);
    try {
      const next = await adminApi.uploadChallengeDocker(challengeId, file);
      setStatus(next);
      await reloadChallenge();
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
      await refreshStatus();
    } finally {
      setWorking(false);
    }
  }

  async function handleRebuild() {
    setWorking(true);
    setError("");
    try {
      const next = await adminApi.rebuildChallengeDocker(challengeId);
      setStatus(next);
      await reloadChallenge();
    } catch (err) {
      setError(err instanceof Error ? err.message : "빌드에 실패했습니다.");
      await refreshStatus();
    } finally {
      setWorking(false);
    }
  }

  async function handleInstanceToggle() {
    setWorking(true);
    setError("");
    try {
      if (instanceEnabled) {
        if (!confirm("인스턴스를 끌까요? 유저는 원격 접속을 사용할 수 없습니다.")) {
          return;
        }
        await adminApi.updateChallenge(challengeId, { dockerImage: null });
        await reloadChallenge();
        return;
      }

      const next = status ?? (await adminApi.getChallengeDockerStatus(challengeId));
      if (next.buildStatus !== "ready") {
        alert("ZIP을 업로드하고 빌드가 완료된 뒤 인스턴스를 켜세요.");
        return;
      }

      if (!next.instanceCapable) {
        alert("이 Repository는 [vm] ports가 없어 로컬 문제입니다.");
        return;
      }

      await adminApi.updateChallenge(challengeId, {
        dockerImage: next.imageName,
      });
      await reloadChallenge();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "인스턴스 설정을 변경하지 못했습니다.",
      );
    } finally {
      setWorking(false);
    }
  }

  const buildReady = status?.buildStatus === "ready";
  const hasContext = Boolean(status?.hasContext);
  const instanceCapable = Boolean(status?.instanceCapable);

  return (
    <section className={`challenge-deploy-panel ${expanded ? "is-expanded" : "is-collapsed"}`}>
      <div className="challenge-deploy-panel__header">
        <div>
          <p className="challenge-deploy-panel__eyebrow">
            <Package className="h-4 w-4" aria-hidden />
            배포 · 인스턴스
          </p>
          <p className="challenge-deploy-panel__desc">
            {hasContext
              ? "업로드된 Repository를 빌드한 뒤, 필요할 때 인스턴스를 켭니다."
              : "문제를 만든 뒤 Repository ZIP을 업로드하면 배포를 시작할 수 있습니다."}{" "}
            <Link href="/admin/challenges/guide">출제 가이드</Link>
          </p>
        </div>
        <div className="challenge-deploy-panel__header-actions">
          {hasContext && (
            <button
              type="button"
              className="challenge-deploy-panel__refresh"
              onClick={refreshStatus}
              disabled={loading || working}
              aria-label="새로고침"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
          <button
            type="button"
            className="challenge-deploy-panel__refresh"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                접기
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                열기
              </>
            )}
          </button>
        </div>
      </div>

      {!expanded ? null : loading && !status ? (
        <div className="challenge-deploy-panel__loading">
          <Loader2 className="h-4 w-4 animate-spin" />
          상태 확인 중
        </div>
      ) : (
        <>
          <div className="challenge-deploy-panel__status">
            <div className="challenge-deploy-panel__status-item">
              <span className="challenge-deploy-panel__label">빌드</span>
              <AdminBadge
                variant={
                  status?.buildStatus === "ready"
                    ? "success"
                    : status?.buildStatus === "failed"
                      ? "danger"
                      : "warning"
                }
              >
                {status ? statusLabels[status.buildStatus] : "—"}
              </AdminBadge>
            </div>

            <div className="challenge-deploy-panel__status-item">
              <span className="challenge-deploy-panel__label">유형</span>
              <AdminBadge variant={instanceCapable ? "success" : "default"}>
                {instanceCapable ? "인스턴스 가능" : "로컬"}
              </AdminBadge>
            </div>

            {instanceCapable && (
              <div className="challenge-deploy-panel__status-item">
                <span className="challenge-deploy-panel__label">인스턴스</span>
                <AdminBadge variant={instanceEnabled ? "success" : "default"}>
                  {instanceEnabled ? "ON" : "OFF"}
                </AdminBadge>
              </div>
            )}
          </div>

          {status?.storagePath && (
            <div className="challenge-deploy-panel__status-item challenge-deploy-panel__status-item--wide">
              <span className="challenge-deploy-panel__label">저장 위치</span>
              <code className="challenge-deploy-panel__code">{status.storagePath}</code>
            </div>
          )}

          {status?.lastArchive && (
            <p className="challenge-deploy-panel__hint">
              최근 업로드: <code>{status.lastArchive}</code>
              {status.archives.length > 1
                ? ` · 보관 ${status.archives.length}개`
                : ""}
            </p>
          )}

          {status?.buildError && (
            <p className="challenge-deploy-panel__error">{status.buildError}</p>
          )}

          <div className="challenge-deploy-panel__actions">
            <input
              ref={inputRef}
              type="file"
              accept=".zip,application/zip"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="challenge-deploy-panel__button challenge-deploy-panel__button--primary"
              disabled={working}
              onClick={() => inputRef.current?.click()}
            >
              {working ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              ZIP 업로드
            </button>
            <button
              type="button"
              className="challenge-deploy-panel__button"
              disabled={working || !hasContext}
              onClick={() => void handleRebuild()}
            >
              <RefreshCw className="h-4 w-4" />
              다시 빌드
            </button>
            {instanceCapable && (
              <button
                type="button"
                className={`challenge-deploy-panel__button ${
                  instanceEnabled ? "" : "challenge-deploy-panel__button--primary"
                }`}
                disabled={working || (instanceEnabled ? false : !buildReady)}
                onClick={() => void handleInstanceToggle()}
              >
                {working ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                {instanceEnabled ? "인스턴스 끄기" : "인스턴스 켜기"}
              </button>
            )}
          </div>

          {status?.files && status.files.length > 0 && (
            <ul className="challenge-deploy-panel__files">
              {status.files.slice(0, 8).map((file) => (
                <li key={file}>{file}</li>
              ))}
              {status.files.length > 8 && (
                <li>외 {status.files.length - 8}개 파일</li>
              )}
            </ul>
          )}

          <p className="challenge-deploy-panel__hint">
            ZIP은 <code>data/wargame-repositories/&#123;slug&#125;/archives/</code>에
            보관되고, 빌드는 <code>repository/</code> 폴더에서 진행됩니다. 인스턴스는
            빌드 후 직접 켜야 합니다.
          </p>
        </>
      )}

      {error && <p className="challenge-deploy-panel__error">{error}</p>}
    </section>
  );
}