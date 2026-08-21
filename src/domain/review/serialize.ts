import type { WeeklyReview } from "@/domain/types";
import { toDate } from "@/domain/task/time";

interface SerializedReview {
  id: string;
  weekStart: string;
  weekEnd: string;
  workedWell?: string;
  didntWork?: string;
  shouldChange?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function serializeReview(review: WeeklyReview): SerializedReview {
  return {
    id: review.id,
    weekStart: review.weekStart.toISOString(),
    weekEnd: review.weekEnd.toISOString(),
    workedWell: review.workedWell,
    didntWork: review.didntWork,
    shouldChange: review.shouldChange,
    userId: review.userId,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

export function deserializeReview(raw: SerializedReview): WeeklyReview {
  return {
    id: raw.id,
    weekStart: toDate(raw.weekStart) ?? new Date(0),
    weekEnd: toDate(raw.weekEnd) ?? new Date(0),
    workedWell: raw.workedWell ?? "",
    didntWork: raw.didntWork ?? "",
    shouldChange: raw.shouldChange ?? "",
    userId: raw.userId,
    createdAt: toDate(raw.createdAt) ?? new Date(0),
    updatedAt: toDate(raw.updatedAt) ?? new Date(0),
  };
}
