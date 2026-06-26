"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Package, Power, RefreshCw, Upload } from "lucide-react";
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

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = await adminApi.getChallengeDockerStatus(challengeId);
      setStatus(next);
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

  return (
    <section className="challenge-deploy-panel">
      <div className="challenge-deploy-panel__header">
        <div>
          <p className="challenge-deploy-panel__eyebrow">
            <Package className="h-4 w-4" aria-hidden />
            문제 배포
          </p>
          <p className="challenge-deploy-panel__desc">
            ZIP 업로드 → 빌드 완료 → 인스턴스 ON. 접속 포트는 유저마다 자동 배정됩니다.{" "}
            <Link href="/admin/challenges/guide">출제 가이드</Link>
          </p>
        </div>
        <button
          type="button"
          className="challenge-deploy-panel__refresh"
          onClick={refreshStatus}
          disabled={loading || working}
          aria-label="새로고침"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && !status ? (
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
              <span className="challenge-deploy-panel__label">인스턴스</span>
              <AdminBadge variant={instanceEnabled ? "success" : "default"}>
                {instanceEnabled ? "ON · 접속 가능" : "OFF · 로컬 문제"}
              </AdminBadge>
            </div>
          </div>

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
              disabled={working || !status?.hasContext}
              onClick={() => void handleRebuild()}
            >
              <RefreshCw className="h-4 w-4" />
              다시 빌드
            </button>
            <button
              type="button"
              className={`challenge-deploy-panel__button ${
                instanceEnabled
                  ? ""
                  : "challenge-deploy-panel__button--primary"
              }`}
              disabled={
                working || (instanceEnabled ? false : !buildReady)
              }
              onClick={() => void handleInstanceToggle()}
            >
              {working ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Power className="h-4 w-4" />
              )}
              {instanceEnabled ? "인스턴스 끄기" : "인스턴스 켜기"}
            </button>
          </div>

          <p className="challenge-deploy-panel__hint">
            Specfile · Description.md · public/ 형식의 ZIP을 올리세요. [vm] ports가
            있으면 빌드 후 인스턴스가 자동으로 켜집니다.
          </p>
        </>
      )}

      {error && <p className="challenge-deploy-panel__error">{error}</p>}
    </section>
  );
}