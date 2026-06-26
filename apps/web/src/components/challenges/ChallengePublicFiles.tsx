import { Download } from "lucide-react";

type PublicFile = {
  path: string;
  size: number;
  url: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChallengePublicFiles({ files }: { files: PublicFile[] }) {
  if (!files.length) return null;

  return (
    <div className="challenge-files">
      <p className="challenge-files__label">첨부 파일</p>
      <ul className="challenge-files__list">
        {files.map((file) => (
          <li key={file.path}>
            <a href={file.url} download className="challenge-files__item">
              <Download className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              <span className="challenge-files__name">{file.path}</span>
              <span className="challenge-files__size">{formatSize(file.size)}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}