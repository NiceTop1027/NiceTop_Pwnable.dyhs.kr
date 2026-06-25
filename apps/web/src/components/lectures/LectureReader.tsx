import type { LectureDetail } from "@/lib/api";
import { LectureReaderView } from "./LectureReaderView";

type LectureReaderProps = {
  lecture: LectureDetail;
};

export function LectureReader({ lecture }: LectureReaderProps) {
  return <LectureReaderView lecture={lecture} />;
}