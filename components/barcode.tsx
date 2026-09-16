import { cn } from "@/lib/utils";

interface BarcodeProps {
  /** The share token this barcode encodes. Same token, same bars, every time. */
  value: string;
  /** Bar height in pixels. */
  height?: number;
  /** Print the token underneath the bars, the way a label would. */
  showValue?: boolean;
  className?: string;
}

/**
 * A Code 128-style barcode rendered from a share token.
 *
 * Every file in FileShare already has a unique token — this draws it. The
 * pattern is derived deterministically from the token, so a given link always
 * looks the same, and the label under it is the thing you'd actually type.
 */
function moduleWidths(value: string, count: number): number[] {
  // FNV-1a over the token, then a cheap xorshift to expand it into a run of
  // modules. Widths land in 1–4 so the bars read as a real barcode rather
  // than noise.
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const widths: number[] = [];
  let state = hash >>> 0 || 1;
  for (let i = 0; i < count; i++) {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    widths.push((state % 4) + 1);
  }
  return widths;
}

/** Narrow-narrow guard bars, as a printed barcode opens and closes. */
const GUARD = [1, 1];

export function Barcode({
  value,
  height = 56,
  showValue = true,
  className,
}: BarcodeProps) {
  const body = moduleWidths(value, 46);
  // bar, gap, bar, gap ... guards at both ends and dead centre
  const bars: number[] = [];
  for (const w of [...GUARD, ...body.slice(0, 22), ...GUARD, ...body.slice(22), ...GUARD]) {
    bars.push(w, 2);
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        className="flex w-full items-stretch bg-card px-2 py-2"
        style={{ height }}
        aria-hidden="true"
      >
        {bars.map((w, i) => (
          <div
            key={i}
            style={{ flexGrow: w, flexBasis: 0 }}
            className={i % 2 === 0 ? "bg-foreground" : "bg-transparent"}
          />
        ))}
      </div>
      {showValue && (
        <p className="stamp mt-2 break-all text-center text-muted-foreground">
          {value}
        </p>
      )}
    </div>
  );
}
