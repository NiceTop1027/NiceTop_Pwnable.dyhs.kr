"use client";

import { useState, useEffect } from "react";
import { api, ApiError } from "@/lib/api";
import type { Challenge, InstanceInfo } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export function ChallengeInstanceButton({ challenge }: { challenge: Challenge }) {
  const [instance, setInstance] = useState<InstanceInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const handleStartInstance = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.startChallengeInstance(challenge.id);
      setInstance(data);
      setShowModal(true);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStopInstance = async () => {
    if (!instance) return;

    setLoading(true);
    try {
      await api.stopChallengeInstance(challenge.id, instance.id);
      setInstance(null);
      setShowModal(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "인스턴스 정지에 실패했습니다.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCommand = () => {
    if (!instance) return;
    const cmd = `nc ${instance.host} ${instance.port}`;
    navigator.clipboard.writeText(cmd).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (!instance) {
      setRemainingTime(0);
      return;
    }

    const calculateRemaining = () =>
      Math.max(
        0,
        Math.floor((new Date(instance.expiresAt).getTime() - Date.now()) / 1000),
      );

    setRemainingTime(calculateRemaining());

    const timerId = setInterval(() => {
      const newRemaining = calculateRemaining();
      setRemainingTime(newRemaining);

      if (newRemaining <= 0) {
        clearInterval(timerId);
        setInstance(null);
        setShowModal(false);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [instance]);

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return (
    <>
      <Button
        onClick={instance ? () => setShowModal(true) : handleStartInstance}
        disabled={loading}
        variant={instance ? "outline" : "fill"}
      >
        {loading ? "처리 중..." : instance ? "접속 정보 확인" : "인스턴스 시작"}
      </Button>

      {error && !showModal && <p className="instance-error">{error}</p>}

      {showModal && instance && (
        <div className="instance-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="instance-modal" onClick={(e) => e.stopPropagation()}>
            <h2>원격 접속 정보</h2>

            <div className="instance-info">
              <div className="instance-info-row">
                <label>호스트</label>
                <code>{instance.host}</code>
              </div>
              <div className="instance-info-row">
                <label>포트</label>
                <code>{instance.port}</code>
              </div>
              <div className="instance-info-row">
                <label>남은 시간</label>
                <span>
                  {minutes}분 {seconds}초
                </span>
              </div>
            </div>

            <div className="instance-command">
              <label>접속 명령어</label>
              <div className="instance-command-box">
                <code>
                  nc {instance.host} {instance.port}
                </code>
                <Button onClick={handleCopyCommand} variant="outline">
                  {isCopied ? "복사됨" : "복사"}
                </Button>
              </div>
            </div>

            <div className="instance-modal-actions">
              <Button onClick={handleStopInstance} disabled={loading}>
                {loading ? "정지 중..." : "인스턴스 정지"}
              </Button>
              <Button onClick={() => setShowModal(false)} variant="outline">
                닫기
              </Button>
            </div>

            {error && <div className="instance-error">{error}</div>}
          </div>
        </div>
      )}
    </>
  );
}