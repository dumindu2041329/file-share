"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";
import { formatFileSize, formatDate } from "@/lib/file-utils";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Barcode } from "@/components/barcode";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface FileData {
  id: string;
  file_name: string;
  storage_url: string;
  file_size: number;
  file_type: string;
  share_token: string;
  download_count: number;
  created_at: string;
}

function DocketBar() {
  return (
    <header className="border-b-2 border-rule">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="size-2.5 bg-primary" aria-hidden="true" />
          <span className="text-sm font-extrabold tracking-tight">FileShare</span>
        </Link>
        <span className="stamp text-muted-foreground">Claim check</span>
      </div>
    </header>
  );
}

/** A docket: paper stock between two perforated feed strips. */
function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="pinfeed" aria-hidden="true" />
      <div className="border-x-2 border-rule bg-card">{children}</div>
      <div className="pinfeed" aria-hidden="true" />
    </div>
  );
}

export default function SharePage() {
  const params = useParams();
  const token = params?.token as string;

  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const loadFile = useCallback(async () => {
    try {
      const { data, error } = await insforge.database.rpc("get_shared_file", {
        p_token: token,
      });

      const shared = Array.isArray(data) ? data[0] : data;

      if (error || !shared) {
        toast.error("File not found");
        return;
      }

      setFile(shared);
    } catch (error) {
      console.error("Error loading file:", error);
      toast.error("Failed to load file");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      await loadFile();
    })();
  }, [token, loadFile]);

  const handleDownload = async () => {
    if (!file) return;

    setDownloading(true);

    try {
      // Increment download count
      await insforge.database.rpc("increment_downloads", { file_id: file.id });

      // Open file URL in new tab to download
      window.open(file.storage_url, "_blank");

      setDownloaded(true);
      toast.success("Download started!");

      // Update local state
      setFile({ ...file, download_count: file.download_count + 1 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!file) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <DocketBar />
        <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
          <div className="print-in mx-auto w-full max-w-md">
            <Sheet>
              <div className="px-5 py-10 text-center sm:px-8 sm:py-12">
                <p className="stamp text-muted-foreground">Not on the manifest</p>
                <h1 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-4xl">
                  Nothing under this ticket.
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  The link may have been withdrawn, or the ticket was copied
                  wrong.
                </p>

                <div className="mt-6 border border-border bg-background px-4 py-3 text-left">
                  <p className="stamp text-muted-foreground">Ticket presented</p>
                  <p className="mt-1.5 break-all font-mono text-sm font-bold">
                    {token || "—"}
                  </p>
                </div>

                <Button asChild size="lg" className="mt-8 h-12 w-full">
                  <Link href="/">
                    <ArrowLeft className="mr-2 size-4" />
                    Back to the counter
                  </Link>
                </Button>
              </div>
            </Sheet>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DocketBar />

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="print-in mx-auto w-full max-w-2xl">
          <Sheet>
            {/* Consignment */}
            <div className="border-b-2 border-rule px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="stamp text-muted-foreground">One file, held for you</p>
                  <h1 className="mt-3 break-words text-2xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-4xl">
                    {file.file_name}
                  </h1>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Someone left this at the counter. Take it whenever you like.
                  </p>
                </div>
                <span
                  className={cn(
                    "stamp shrink-0 border px-2 py-1",
                    downloaded
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-foreground/40 text-muted-foreground"
                  )}
                >
                  {downloaded ? "Collected" : "Ready"}
                </span>
              </div>
            </div>

            {/* The ticket itself */}
            <div className="border-b-2 border-rule px-5 py-6 sm:px-8">
              <Barcode value={file.share_token} height={64} />
            </div>

            {/* Printed spec */}
            <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
              <div className="bg-card px-5 py-4">
                <p className="stamp text-muted-foreground">Size</p>
                <p className="tabular mt-2 text-lg font-bold">
                  {formatFileSize(file.file_size)}
                </p>
              </div>
              <div className="bg-card px-5 py-4">
                <p className="stamp text-muted-foreground">Type</p>
                <p
                  className="mt-2 truncate text-lg font-bold"
                  title={file.file_type || "Unknown"}
                >
                  {file.file_type || "Unknown"}
                </p>
              </div>
              <div className="bg-card px-5 py-4">
                <p className="stamp text-muted-foreground">Issued</p>
                <p className="tabular mt-2 text-lg font-bold">
                  {formatDate(file.created_at)}
                </p>
              </div>
              <div className="bg-card px-5 py-4">
                <p className="stamp text-muted-foreground">Collected</p>
                <p className="tabular mt-2 text-lg font-bold">
                  {file.download_count}
                </p>
              </div>
            </div>

            {/* Stub */}
            <div className="tear" aria-hidden="true" />
            <div className="px-5 py-6 sm:px-8 sm:py-8">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                size="lg"
                className="h-14 w-full text-base"
              >
                <Download className="mr-2 size-5" />
                {downloading
                  ? "Opening the box…"
                  : downloaded
                    ? "Download again"
                    : "Take the file"}
              </Button>

              {downloaded && (
                <p className="stamp mt-3 text-center text-muted-foreground">
                  If nothing happened, take it again
                </p>
              )}

              <p className="mt-6 border-l-2 border-primary pl-3 text-xs leading-relaxed text-muted-foreground">
                Only this ticket opens the file. Check who handed you the link
                before you pass it on.
              </p>
            </div>
          </Sheet>
        </div>
      </main>
    </div>
  );
}
