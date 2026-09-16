import Link from "next/link";

/**
 * The counter: every auth screen is a form handed across a desk, so it wears
 * the same paper stock and perforated feed edges as the rest of the system.
 */
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b-2 border-rule">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="size-2.5 bg-primary" aria-hidden="true" />
            <span className="text-sm font-extrabold tracking-tight">
              FileShare
            </span>
          </Link>
          <span className="stamp text-muted-foreground">Counter</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="print-in mx-auto w-full max-w-md">
          <div className="pinfeed" aria-hidden="true" />
          <div className="border-x-2 border-rule bg-card">
            <div className="border-b-2 border-rule px-5 py-6 sm:px-7">
              <p className="stamp text-muted-foreground">{eyebrow}</p>
              <h1 className="mt-3 text-2xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>

            <div className="px-5 py-6 sm:px-7 sm:py-7">{children}</div>

            {footer && (
              <div className="border-t border-border px-5 py-4 text-center text-sm text-muted-foreground sm:px-7">
                {footer}
              </div>
            )}
          </div>
          <div className="pinfeed" aria-hidden="true" />
        </div>
      </main>
    </div>
  );
}

/** A tear-off divider with a label sitting in the gap. */
export function TearLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="tear flex-1" aria-hidden="true" />
      <span className="stamp text-muted-foreground">{label}</span>
      <span className="tear flex-1" aria-hidden="true" />
    </div>
  );
}
