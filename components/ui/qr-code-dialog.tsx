"use client";

import { useRef } from "react";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20">
              <Share2 className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <DialogTitle>Share via QR Code</DialogTitle>
              <DialogDescription className="text-left">
                Scan to access: {fileName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-6">
          {/* QR Code */}
          <div
            ref={qrRef}
            className="p-4 bg-white rounded-xl shadow-lg border-2 border-primary/20"
          >
            <QRCodeCanvas
              value={shareUrl}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/icon.svg",
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>

          {/* Share URL */}
          <div className="w-full p-3 bg-muted rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">Share Link</p>
            <p className="text-sm font-mono truncate">{shareUrl}</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyLink}
            className="w-full sm:w-auto"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button
            type="button"
            onClick={handleDownloadQR}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download QR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
