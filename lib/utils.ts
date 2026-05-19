import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getPlatformColor(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'instagram': return '#E1306C'
    case 'linkedin': return '#0077B5'
    case 'twitter':
    case 'x': return '#1DA1F2'
    default: return '#F7BE4D'
  }
}

export function getPlatformIcon(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'instagram': return '📸'
    case 'linkedin': return '💼'
    case 'twitter':
    case 'x': return '𝕏'
    default: return '📝'
  }
}
