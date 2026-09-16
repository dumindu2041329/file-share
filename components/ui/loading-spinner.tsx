"use client";

import { Barcode } from "@/components/barcode";

export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="print-in w-full max-w-sm">
        <div className="pinfeed" />
        <div className="border-x border-border bg-card px-6 py-8 text-center">
          <p className="stamp text-muted-foreground">Reading transfer</p>
          <div className="relative mt-6 overflow-hidden">
            <Barcode value="FILE-SHARE" height={44} showValue={false} />
            <div className="sweep absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
          </div>
          <p className="stamp mt-6 font-bold text-foreground">FileShare</p>
        </div>
        <div className="pinfeed" />
      </div>
    </div>
  );
}
