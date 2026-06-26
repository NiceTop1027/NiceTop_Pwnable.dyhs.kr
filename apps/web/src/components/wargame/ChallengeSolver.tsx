"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, type ChallengeDetail } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { ChallengeInstanceButton } from "@/components/challenges/ChallengeInstanceButton";
import { translateApiError } from "@/lib/auth-validation";

export function ChallengeSolver({
  challenge,
}: {
  challenge: ChallengeDetail;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [flag, setFlag] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(!!challenge.solved);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const res = await api.submitFlag(challenge.slug, flag);
      setSuccess(true);
      setMessage(
        res.isFirstBlood
          ? `First Blood! +${res.points} XP`
          : `정답! +${res.points} XP`,
      );
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? translateApiError(err.message)
          : "제출 실패";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  if (success || challenge.solved) {
    return (
      <div className="rounded-2xl border border-[var(--divider)] bg-[var(--bg-muted)] p-8 text-center">
        <p className="text-[1.25rem] font-semibold text-[var(--text)]">해결 완료</p>
        {challenge.solved?.isFirstBlood && (
          <p className="text-caption mt-2">First Blood</p>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-[var(--divider)] bg-[var(--bg-muted)] p-8 text-center">
        <p className="text-body">접속 정보 확인 및 FLAG 제출을 위해 로그인이 필요합니다</p>
        <Button href="/auth" variant="fill" className="mt-6">
          로그인
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {challenge.dockerImage ? (
        <div className="rounded-2xl border border-[var(--divider)] bg-[var(--bg-muted)] p-8">
          <p className="text-body font-semibold mb-2">원격 접속</p>
          <p className="text-caption mb-4">
            인스턴스는 서버 IP의 10000번대 포트로 열립니다. Cloudflare를 거치지 않으므로
            표시된 호스트(IP)로 nc 접속하세요.
          </p>
          <ChallengeInstanceButton challenge={challenge} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--divider)] bg-[var(--bg-muted)] p-8 text-center">
          <p className="text-body">이 문제는 아직 원격 인스턴스가 준비되지 않았습니다.</p>
          <p className="text-caption mt-2">파일 다운로드 후 로컬에서 풀어보세요.</p>
        </div>
      )}

      {/* FLAG 제출 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="flag" className="input-label">
          FLAG 제출
        </label>
        <input
          id="flag"
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="DYHS{...}"
          className="input-field font-mono"
          required
        />
        <Button variant="fill" type="submit" disabled={loading}>
          {loading ? "제출 중…" : "제출"}
        </Button>
        {message && (
          <p className={`text-sm ${success ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}