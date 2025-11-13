"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, FileText, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";
import { formatFileSize, getFileIcon, formatDate } from "@/lib/file-utils";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface FileData {
  id: string;
  file_name: string;
  file_url: string;
  file_key: string;
  file_size: number;
  file_type: string;
  share_token: string;
  downloads: number;
  created_at: string;
}

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (token) {
      loadFile();
    }
  }, [token]);

  const loadFile = async () => {
    try {
      const { data, error } = await insforge.database
        .from("files")
        .select("*")
        .eq("share_token", token)
        .single();

      if (error || !data) {
        toast.error("File not found");
        return;
      }

      setFile(data);
    } catch (error) {
      console.error("Error loading file:", error);
      toast.error("Failed to load file");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;

    setDownloading(true);

    try {
      // Increment download count
      await insforge.database
        .from("files")
        .update({ downloads: file.downloads + 1 })
        .eq("id", file.id);

      // Open file URL in new tab to download
      window.open(file.file_url, "_blank");

      setDownloaded(true);
      toast.success("Download started!");

      // Update local state
      setFile({ ...file, downloads: file.downloads + 1 });
    } catch (error: any) {
      toast.error(error.message || "Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!file) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)]" />
        <Card className="w-full max-w-md glass-card border-0 relative z-10 text-center shadow-2xl animate-fade-in-up">
          <CardContent className="pt-8 sm:pt-12 pb-6 sm:pb-8 px-6 sm:px-8">
            <FileText className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 sm:mb-6 text-muted-foreground opacity-50" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">File Not Found</h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
              The file you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)]" />
      
      <Card className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-2xl glass-card border-0 relative z-10 shadow-2xl animate-fade-in-up">
        <CardHeader className="text-center pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8 pb-3 sm:pb-4">
          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-3 sm:mb-4 md:mb-6 animate-pulse-slow">{getFileIcon(file.file_type)}</div>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-3 break-words px-2">
            {file.file_name}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base md:text-lg mt-1 sm:mt-2">
            Someone shared this file with you
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-10">
          {/* File Info */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl bg-muted/50 border border-muted">
            <div>
              <p className="text-xs text-muted-foreground mb-1">File Size</p>
              <p className="font-medium text-xs sm:text-sm md:text-base">{formatFileSize(file.file_size)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Uploaded</p>
              <p className="font-medium text-xs sm:text-sm md:text-base">{formatDate(file.created_at)}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-muted-foreground mb-1">File Type</p>
              <p className="font-medium text-xs sm:text-sm md:text-base truncate">{file.file_type || "Unknown"}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-muted-foreground mb-1">Downloads</p>
              <Badge variant="secondary" className="font-medium text-xs inline-flex items-center">
                <Download className="h-3 w-3 mr-1" />
                {file.downloads}
              </Badge>
            </div>
          </div>

          {/* Download Button */}
          <div className="space-y-2 sm:space-y-3">
            <Button
              onClick={handleDownload}
              disabled={downloading}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-2xl transition-all hover:scale-105 text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6"
            >
              {downloading ? (
                "Starting download..."
              ) : downloaded ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Download Again
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Download File
                </>
              )}
            </Button>

            {downloaded && (
              <p className="text-xs sm:text-sm text-center text-muted-foreground">
                If your download didn't start, please try again
              </p>
            )}
          </div>

          {/* Security Notice */}
          <div className="p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <p className="text-xs sm:text-sm text-center font-medium leading-relaxed">
              🔒 This file is shared securely via FileShare. Always verify the source
              before downloading files from the internet.
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center pt-2 sm:pt-4">
            <Button variant="ghost" asChild className="hover:scale-105 transition-transform text-sm sm:text-base">
              <Link href="/">
                <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
