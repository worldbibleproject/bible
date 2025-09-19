import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatUserRole(role: string) {
  switch (role) {
    case 'SEEKER':
      return 'Seeker';
    case 'DISCIPLE_MAKER':
      return 'Mentor';
    case 'CHURCH_FINDER':
      return 'Church Finder';
    case 'ADMIN':
      return 'Administrator';
    default:
      return capitalizeFirst(role.toLowerCase());
  }
}

export function formatSessionStatus(status: string) {
  switch (status) {
    case 'SCHEDULED':
      return 'Scheduled';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return capitalizeFirst(status.toLowerCase());
  }
}

export function formatConnectionStatus(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'CONTACTED':
      return 'Contacted';
    case 'VISITED':
      return 'Visited';
    case 'JOINED':
      return 'Joined';
    case 'DECLINED':
      return 'Declined';
    default:
      return capitalizeFirst(status.toLowerCase());
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'SCHEDULED':
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'IN_PROGRESS':
    case 'CONTACTED':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
    case 'JOINED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
    case 'DECLINED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}


