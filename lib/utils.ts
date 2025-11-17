import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function calculateTrendingScore(
  votes: number,
  comments: number,
  createdAt: Date
): number {
  const now = new Date();
  const ageInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  // Time decay factor (gravity = 1.8)
  const gravity = 1.8;
  const timeFactor = Math.pow(ageInHours + 2, gravity);

  // Engagement score
  const engagementScore = votes * 10 + comments * 5;

  // Final trending score
  return engagementScore / timeFactor;
}

export function formatDate(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
}
