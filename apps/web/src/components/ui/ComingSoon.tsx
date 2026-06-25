interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({
  title = "준비 중",
  description = "이 기능은 현재 개발 중입니다",
}: ComingSoonProps) {
  return (
    <div className="py-24 text-center">
      <h2 className="text-[1.75rem] font-semibold tracking-tight text-[var(--text)]">
        {title}
      </h2>
      <p className="text-body mx-auto mt-4 max-w-sm">{description}</p>
    </div>
  );
}