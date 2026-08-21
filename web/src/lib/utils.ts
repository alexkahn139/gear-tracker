import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatKg(grams?: number): string {
  if (grams == null) {
    return '—';
  }
  return `${(grams / 1000).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })} kg`;
}

export function formatDate(iso?: string): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) {
    return false;
  }
  const t = new Date(dueDate).getTime();
  return !Number.isNaN(t) && t < Date.now();
}
