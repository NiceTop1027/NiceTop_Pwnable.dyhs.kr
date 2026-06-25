"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { INQUIRY_CATEGORIES, type InquiryCategory } from "@/lib/legal";
import { validateEmail } from "@/lib/auth-validation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";

type FormValues = {
  category: InquiryCategory;
  name: string;
  email: string;
  subject: string;
  message: string;
  consent: boolean;
};

const initialValues: FormValues = {
  category: "GENERAL",
  name: "",
  email: "",
  subject: "",
  message: "",
  consent: false,
};

export function ContactForm() {
  const { user } = useAuth();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    setValues((prev) => ({
      ...prev,
      name: prev.name || user.displayName || user.username,
      email: prev.email || user.email || "",
    }));
  }, [user]);

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!values.name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    const emailError = validateEmail(values.email);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (!values.subject.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    if (values.message.trim().length < 10) {
      setError("문의 내용을 10자 이상 입력해 주세요.");
      return;
    }
    if (!values.consent) {
      setError("개인정보 수집·이용에 동의해 주세요.");
      return;
    }

    setLoading(true);
    try {
      await api.submitInquiry({
        category: values.category,
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        consent: true,
      });
      setSuccess(true);
      setValues({
        ...initialValues,
        name: user?.displayName || user?.username || "",
        email: user?.email || "",
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError("문의가 너무 많습니다. 잠시 후 다시 시도해 주세요.");
      } else {
        setError("문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="contact-success">
        <h2 className="contact-success-title">문의가 접수되었습니다</h2>
        <p className="contact-success-text">
          빠른 시일 내에 입력하신 이메일로 답변드리겠습니다.
        </p>
        <Button type="button" variant="outline" onClick={() => setSuccess(false)}>
          추가 문의하기
        </Button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-field">
        <label htmlFor="inquiry-category" className="contact-label">
          문의 유형
        </label>
        <select
          id="inquiry-category"
          className="contact-select"
          value={values.category}
          onChange={(e) =>
            updateField("category", e.target.value as InquiryCategory)
          }
        >
          {INQUIRY_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="contact-grid">
        <div className="contact-field">
          <label htmlFor="inquiry-name" className="contact-label">
            이름
          </label>
          <input
            id="inquiry-name"
            className="contact-input"
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            maxLength={40}
            required
          />
        </div>

        <div className="contact-field">
          <label htmlFor="inquiry-email" className="contact-label">
            이메일
          </label>
          <input
            id="inquiry-email"
            type="email"
            className="contact-input"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            maxLength={120}
            required
          />
        </div>
      </div>

      <div className="contact-field">
        <label htmlFor="inquiry-subject" className="contact-label">
          제목
        </label>
        <input
          id="inquiry-subject"
          className="contact-input"
          value={values.subject}
          onChange={(e) => updateField("subject", e.target.value)}
          maxLength={120}
          required
        />
      </div>

      <div className="contact-field">
        <label htmlFor="inquiry-message" className="contact-label">
          문의 내용
        </label>
        <textarea
          id="inquiry-message"
          className="contact-textarea"
          value={values.message}
          onChange={(e) => updateField("message", e.target.value)}
          rows={8}
          maxLength={5000}
          required
        />
      </div>

      <label className="contact-consent">
        <input
          type="checkbox"
          checked={values.consent}
          onChange={(e) => updateField("consent", e.target.checked)}
        />
        <span>
          문의 응대를 위한 개인정보(이름, 이메일, 문의 내용) 수집·이용에
          동의합니다.{" "}
          <Link href="/legal/privacy" className="contact-consent-link">
            개인정보 처리방침
          </Link>
        </span>
      </label>

      {error && (
        <p className="contact-error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" variant="fill" disabled={loading}>
        {loading ? "접수 중…" : "문의 보내기"}
      </Button>
    </form>
  );
}