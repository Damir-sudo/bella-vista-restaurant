import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conditional logic, deduped. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as USD currency. */
export function formatCurrency(value: number | string, currency = 'USD') {
  const amount = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/** Convert a string to a URL-friendly slug. */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Human-friendly date, e.g. "May 31, 2026". */
export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Ensure a callback/redirect target is a safe, app-internal path.
 * Prevents open-redirect attacks by rejecting absolute URLs (https://evil.com),
 * protocol-relative URLs (//evil.com) and backslash tricks (/\evil.com).
 */
export function safeInternalPath(path: string | null | undefined, fallback = '/account') {
  if (!path || !path.startsWith('/')) return fallback;
  if (path.startsWith('//') || path.startsWith('/\\')) return fallback;
  return path;
}

/** Generate a unique-ish order number, e.g. BV-1A2B3C4D. */
export function generateOrderNumber() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString(36).slice(-3).toUpperCase();
  return `BV-${stamp}${random}`;
}


/**
 * Send a plain-text message to the configured Telegram chat via the Bot API.
 *
 * Configured through TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID. When either is
 * missing it no-ops, and it never throws — notification failures must not break
 * the calling flow (e.g. checkout). All failures are logged.
 */
export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set; skipping notification.');
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`[telegram] sendMessage failed (${res.status}): ${detail}`);
    }
  } catch (error) {
    console.error('[telegram] sendMessage error:', error);
  }
}
