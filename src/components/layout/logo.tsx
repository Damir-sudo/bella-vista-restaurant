import { cn } from '@/lib/utils';

/**
 * Bella Vista brand mark — a gold monogram crest paired with the wordmark.
 * Purely presentational (UI only).
 */
export function Logo({
  className,
  showText = true,
  size = 40,
}: {
  className?: string;
  showText?: boolean;
  size?: number;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="text-accent"
      >
        {/* Crest ring */}
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
        <circle cx="24" cy="24" r="18.5" stroke="currentColor" strokeWidth="1.4" />
        {/* Crossed fork & knife */}
        <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          <line x1="17" y1="11" x2="31" y2="33" />
          <line x1="31" y1="11" x2="17" y2="33" />
        </g>
        {/* Monogram */}
        <text
          x="24"
          y="29.5"
          textAnchor="middle"
          fontFamily="var(--font-display), Georgia, serif"
          fontSize="17"
          fontWeight="700"
          fill="currentColor"
        >
          BV
        </text>
        {/* Top accent dot */}
        <circle cx="24" cy="5" r="1.6" fill="currentColor" />
      </svg>
      {showText && (
        <span className="font-display text-[1.6rem] font-bold leading-none tracking-tight">
          Bella<span className="text-accent">Vista</span>
        </span>
      )}
    </span>
  );
}
