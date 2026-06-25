import { DocArticle } from "@/components/content/DocArticle";

type LectureArticleProps = {
  title: string;
  description: string | null;
  category: string;
  content: string;
};

export function LectureArticle({
  title,
  description,
  category,
  content,
}: LectureArticleProps) {
  return (
    <DocArticle
      backHref="/curriculum"
      backLabel="커리큘럼"
      eyebrow={category}
      title={title}
      lead={description}
      content={content}
    />
  );
}