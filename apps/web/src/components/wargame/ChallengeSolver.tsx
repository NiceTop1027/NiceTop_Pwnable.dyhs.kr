"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, type ChallengeDetail } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { getAccessToken } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
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
    const token = getAccessToken();
    if (!token) {
      setMessage("로그인 후 제출할 수 있습니다");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await api.submitFlag(challenge.slug, flag, token);
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
        <p className="text-body">FLAG 제출을 위해 로그인이 필요합니다</p>
        <Button href="/auth/login" variant="fill" className="mt-6">
          로그인
        </Button>
      </div>
    );
  }

  return (
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
  );
}