import Link from 'next/link';
import type { Challenge } from '@/lib/api';

// 난이도에 따라 다른 색상을 적용하기 위한 맵
const difficultyColorMap: { [key: string]: string } = {
  EASY: 'bg-green-100 text-green-800 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  HARD: 'bg-red-100 text-red-800 border-red-200',
  INSANE: 'bg-purple-100 text-purple-800 border-purple-200',
};

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const solvesCount = challenge.solves ?? challenge._count?.solves ?? 0;
  const difficultyClass = difficultyColorMap[challenge.difficulty.toUpperCase()] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <>
      <Link href={`/wargame/${challenge.slug}`} className="challenge-card-link">
        <div className="challenge-card">
          <div className="card-header">
            <h3 className="challenge-title" title={challenge.title}>
              {challenge.title}
            </h3>
            <div className="challenge-meta">
              <span className={`challenge-tag ${difficultyClass}`}>
                {challenge.difficulty}
              </span>
              <span className="challenge-tag challenge-category">
                {challenge.category}
              </span>
            </div>
          </div>

          <p className="challenge-description">{challenge.description}</p>

          <div className="card-footer">
            <span className="challenge-points">{challenge.points} EXP</span>
            <span className="challenge-solves">{solvesCount} Solves</span>
          </div>
        </div>
      </Link>
      <style jsx>{`
        .challenge-card-link {
          display: block;
          height: 100%;
          text-decoration: none;
          color: inherit;
        }
        .challenge-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
          background-color: white;
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .challenge-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.07);
        }
        
        .card-header {
          margin-bottom: 1rem;
        }

        .challenge-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .challenge-meta {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .challenge-tag {
            font-size: 0.75rem;
            font-weight: 500;
            padding: 0.2rem 0.6rem;
            border-radius: 9999px;
            white-space: nowrap;
            border: 1px solid transparent;
        }
        
        .challenge-category {
            background-color: #f3f4f6;
            color: #4b5563;
            border-color: #e5e7eb;
        }

        .challenge-description {
          flex-grow: 1;
          font-size: 0.875rem;
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 68px; /* 3줄 높이를 확보하여 카드가 줄어드는 것을 방지 */
        }

        .card-footer {
          margin-top: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .challenge-points {
          font-weight: 700;
          font-size: 1rem;
          color: #3b82f6;
        }
      `}</style>
    </>
  );
}
