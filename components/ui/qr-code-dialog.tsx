"use client";

import { useRef, useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  fileName: string;
}

export function QRCodeDialog({
  open,
  onOpenChange,
  shareUrl,
  fileName,
}: QRCodeDialogProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [qrSize, setQrSize] = useState(200);

  useEffect(() => {
    const computeSize = () => {
      if (typeof window === 'undefined') return;
      
      // Get viewport width
      const vw = window.innerWidth;
      
      // Calculate available width: viewport - margins - dialog padding
      // Mobile: vw - 2rem margin - 2*1rem padding = vw - 48px
      // Desktop: min(448px, vw - 32px) - 2*1.5rem padding = ~400px max
      let availableWidth;
      if (vw < 640) {
        // Mobile
        availableWidth = vw - 48; // 2rem margin + padding
      } else {
        // Desktop
        availableWidth = Math.min(448, vw - 32) - 48; // max-w-md minus padding
      }
      
      // QR container width minus its padding (2 * 12px or 16px)
      const qrContainerPadding = vw < 640 ? 24 : 32;
      const maxQrSize = availableWidth - qrContainerPadding;
      
      // Constrain between reasonable bounds
      const size = Math.max(120, Math.min(240, maxQrSize));
      setQrSize(size);
    };

    // Initial computation with delay to ensure DOM is ready
    const timer = setTimeout(computeSize, 100);

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', computeSize);
      window.addEventListener('orientationchange', computeSize);
    }
    
    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', computeSize);
        window.removeEventListener('orientationchange', computeSize);
      }
    };
  }, [open]);

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-${fileName}.png`;
    link.click();
    toast.success("QR code downloaded!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] sm:w-full p-3 sm:p-6 max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2 shrink-0 border-b-2 border-rule">
          <div className="flex items-center gap-2 sm:gap-3 pb-3">
            <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center border-2 border-rule bg-primary text-primary-foreground">
              <Share2 className="size-4 sm:size-5" />
            </div>
            <div className="text-left min-w-0 flex-1 overflow-hidden">
              <DialogTitle className="text-sm sm:text-base truncate">
                Scan to collect
              </DialogTitle>
              <DialogDescription className="text-left text-xs truncate">
                {fileName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div ref={containerRef} className="flex flex-col items-center gap-2 sm:gap-3 py-2 sm:py-3 w-full overflow-hidden flex-1 min-h-0">
          {/* QR Code */}
          <div
            ref={qrRef}
            className="p-3 sm:p-4 bg-white border-2 border-rule w-fit max-w-full shrink-0 mx-auto"
          >
            <QRCodeCanvas
              value={shareUrl}
              size={qrSize}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Share URL */}
          <div className="w-full p-2 sm:p-3 bg-background border border-border overflow-hidden">
            <p className="stamp text-muted-foreground mb-1.5">Ticket link</p>
            <p className="text-xs sm:text-sm font-mono truncate break-all">
              {shareUrl}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-3 shrink-0 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyLink}
            className="w-full sm:w-auto text-sm"
          >
            <Copy className="mr-2 size-4" />
            Copy link
          </Button>
          <Button
            type="button"
            onClick={handleDownloadQR}
            className="w-full sm:w-auto text-sm"
          >
            <Download className="mr-2 size-4" />
            Download QR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
