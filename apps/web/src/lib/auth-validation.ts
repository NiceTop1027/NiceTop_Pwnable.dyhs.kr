export function validateUsername(value: string): string | null {
  if (!value.trim()) return "아이디를 입력해 주세요";
  if (value.length < 3) return "아이디는 3자 이상이어야 합니다";
  if (value.length > 20) return "아이디는 20자 이하여야 합니다";
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    return "아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다";
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "비밀번호를 입력해 주세요";
  if (value.length < 8) return "비밀번호는 8자 이상이어야 합니다";
  if (value.length > 72) return "비밀번호는 72자 이하여야 합니다";
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "올바른 이메일 형식이 아닙니다";
  }
  return null;
}

export function passwordStrength(value: string): {
  score: number;
  label: string;
} {
  if (!value) return { score: 0, label: "" };

  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^a-zA-Z0-9]/.test(value)) score += 1;

  if (score <= 1) return { score: 1, label: "약함" };
  if (score <= 3) return { score: 2, label: "보통" };
  return { score: 3, label: "강함" };
}

export function translateApiError(message: string): string {
  const map: Record<string, string> = {
    "Invalid credentials": "아이디 또는 비밀번호가 올바르지 않습니다",
    "Username or email already exists": "이미 사용 중인 아이디 또는 이메일입니다",
    "Username can only contain letters, numbers, and underscores":
      "아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다",
  };

  return map[message] ?? message;
}