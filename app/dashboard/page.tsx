"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";
import { validateFile } from "@/lib/file-utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { nanoid } from "nanoid";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AnalyticsDashboard } from "@/components/ui/analytics-dashboard";
import type { UserSchema } from "@insforge/sdk";
import Link from "next/link";

interface FileData {
  id: string;
  file_name: string;
  storage_url: string;
  storage_key: string;
  file_size: number;
  file_type: string;
  share_token: string;
  download_count: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserSchema | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const cancelRequestedRef = useRef(false);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error || !data?.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
    } catch {
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadFiles = useCallback(async () => {
    try {
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) return;

      const { data, error } = await insforge.database
        .from("files")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load files");
        return;
      }

      setFiles(data || []);
    } catch (error) {
      console.error("Error loading files:", error);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await Promise.all([checkAuth(), loadFiles()]);
    })();
  }, [checkAuth, loadFiles]);

  // Refresh files when the tab regains focus or periodically
  useEffect(() => {
    const onFocus = () => {
      loadFiles();
    };
    const onVisibility = () => {
      if (!document.hidden) loadFiles();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    const interval = setInterval(loadFiles, 15000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(interval);
    };
  }, [loadFiles]);

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesArray = Array.from(selectedFiles);
    const validFiles: File[] = [];

    // Validate all selected files and report issues per-file
    for (const f of filesArray) {
      const validation = validateFile(f);
      if (!validation.valid) {
        toast.error(`${f.name}: ${validation.error}`);
      } else {
        validFiles.push(f);
      }
    }

    // Reset cancel flag before starting uploads
    cancelRequestedRef.current = false;

    // Upload sequentially so progress UI stays consistent
    for (const f of validFiles) {
      if (cancelRequestedRef.current) break;
      await uploadFile(f);
      if (cancelRequestedRef.current) break; // check again after await
    }
  };

  const uploadFile = async (file: File) => {
    if (!user) return;

    // Reset cancel flag at the start of each individual upload
    cancelRequestedRef.current = false;
    setUploading(true);
    setUploadProgress(0);

    const controller = new AbortController();
    uploadAbortRef.current = controller;

    let progressInterval: ReturnType<typeof setInterval> | undefined;
    try {
      // Simulate progress with ref checks
      progressInterval = setInterval(() => {
        if (cancelRequestedRef.current) {
          clearInterval(progressInterval);
          return;
        }
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Check if canceled before starting upload
      if (cancelRequestedRef.current) {
        throw new Error("AbortError");
      }

      // Upload to storage under a per-user folder to avoid key collisions
      const storageKey = `${user.id}/${nanoid(12)}-${file.name}`;
      const { data: uploadData, error: uploadError } = await insforge.storage
        .from("user-files")
        .upload(storageKey, file);

      clearInterval(progressInterval);

      // Check again after upload - delete file if canceled
      if (cancelRequestedRef.current) {
        if (uploadData?.key) {
          try {
            await insforge.storage.from("user-files").remove(uploadData.key);
          } catch (e) {
            console.error("Failed to cleanup canceled upload:", e);
          }
        }
        throw new Error("AbortError");
      }

      setUploadProgress(95);

      if (uploadError || !uploadData) {
        if (uploadError?.name === "AbortError" || cancelRequestedRef.current) {
          throw new Error("AbortError");
        }
        toast.error("Failed to upload file");
        return;
      }

      // Generate unique share token
      const shareToken = nanoid(10);

      // Check before DB save
      if (cancelRequestedRef.current) {
        // Delete uploaded file from storage since we're canceling
        await insforge.storage.from("user-files").remove(uploadData.key);
        throw new Error("AbortError");
      }

      // Save file metadata to database
      const { error: dbError } = await insforge.database
        .from("files")
        .insert([
          {
            user_id: user.id,
            file_name: file.name,
            storage_url: uploadData.url,
            storage_key: uploadData.key,
            file_size: file.size,
            file_type: file.type,
            share_token: shareToken,
            download_count: 0,
          },
        ])
        .select()
        .single();

      if (dbError) {
        toast.error("Failed to save file metadata");
        return;
      }

      setUploadProgress(100);
      toast.success("File uploaded successfully!");
      
      // Reload files
      await loadFiles();
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const isAbort =
        cancelRequestedRef.current ||
        (error instanceof Error &&
          (error.name === "AbortError" || error.message === "AbortError"));

      if (isAbort) {
        toast("Upload canceled");
      } else {
        toast.error(error instanceof Error ? error.message : "An error occurred");
      }
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      uploadAbortRef.current = null;
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 200);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleLogout = async () => {
    await insforge.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-rule bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex items-center justify-between gap-2 px-4 py-3 sm:py-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span aria-hidden className="size-2.5 bg-primary" />
            <span className="text-lg font-extrabold tracking-tight sm:text-xl">
              FileShare
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/files"
              className="stamp px-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              Your files
            </Link>
            <span className="hidden font-mono text-xs text-muted-foreground lg:inline">
              {user?.email}
            </span>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-16 sm:py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="stamp text-muted-foreground">Your account</p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Hand over a file
            </h1>
          </div>
        </div>

        {/* Ledger totals */}
        <AnalyticsDashboard files={files} />

        {/* Intake counter */}
        <div className="mt-6 overflow-hidden rounded-md border bg-card">
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
            <span className="stamp font-bold">Intake</span>
            <span className="stamp text-muted-foreground">
              Max 200 MB per file
            </span>
          </div>

          <div className="p-4 sm:p-6">
            <div
              className={`border border-dashed px-5 py-10 text-center transition-colors sm:py-14 ${
                dragActive
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground/60"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload
                className={`mx-auto h-8 w-8 transition-colors ${
                  dragActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <p className="mt-4 text-lg font-bold tracking-tight sm:text-xl">
                Drag files here
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                or pick them off your computer
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={uploading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-6"
              >
                {uploading ? "Uploading…" : "Choose files"}
              </Button>
              <p className="mt-5 text-xs text-muted-foreground">
                Any format. Documents, images, video, archives — up to 200 MB
                each.
              </p>
            </div>

            {uploading && (
              <div className="mt-6">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="stamp text-muted-foreground">
                    Uploading
                  </span>
                  <span className="tabular font-mono text-sm font-bold">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="mt-3" />
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      cancelRequestedRef.current = true;
                      try {
                        uploadAbortRef.current?.abort();
                      } catch {}
                      toast("Canceling upload…");
                    }}
                  >
                    Cancel upload
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
