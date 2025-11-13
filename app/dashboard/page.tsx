"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Upload, LogOut, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";
import { validateFile } from "@/lib/file-utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { nanoid } from "nanoid";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AnalyticsDashboard } from "@/components/ui/analytics-dashboard";
import Link from "next/link";

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

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const cancelRequestedRef = useRef(false);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    checkAuth();
    loadFiles();
  }, []);

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
  }, []);

  const checkAuth = async () => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error || !data?.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
    } catch (error) {
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const { data, error } = await insforge.database
        .from("files")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load files");
        return;
      }

      setFiles(data || []);
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

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
    setUploading(true);
    setUploadProgress(0);

    const controller = new AbortController();
    uploadAbortRef.current = controller;

    let progressInterval: any;
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

      // Upload to storage
      const { data: uploadData, error: uploadError } = await insforge.storage
        .from("user-files")
        .upload(file.name, file);

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
      const { data: fileData, error: dbError } = await insforge.database
        .from("files")
        .insert([
          {
            user_id: user.id,
            file_name: file.name,
            file_url: uploadData.url,
            file_key: uploadData.key,
            file_size: file.size,
            file_type: file.type,
            share_token: shareToken,
            downloads: 0,
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
    } catch (error: any) {
      if (error?.name === "AbortError" || error?.message === "AbortError" || cancelRequestedRef.current) {
        // Ensure no file remnants in storage if upload somehow succeeded before cancel
        if (uploadAbortRef.current) {
          // Upload may have completed - attempt cleanup
          try {
            // Get the file key from the error context or try to reconstruct
            // Note: If upload completed, we already cleaned it up above
          } catch {}
        }
        toast("Upload canceled");
      } else {
        toast.error(error.message || "An error occurred");
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
      <header className="glass sticky top-0 z-50 shadow-lg backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer">
            FileShare
          </h1>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <Link href="/files">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">View Files</Button>
            </Link>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium hidden lg:inline">{user?.email}</span>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:scale-110 transition-transform h-8 w-8 sm:h-9 sm:w-9" title="Logout">
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6">
        {/* Analytics Dashboard */}
        <div className="mb-4 sm:mb-6">
          <AnalyticsDashboard files={files} />
        </div>

        {/* Upload Section */}
        <Card className="glass-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Upload File
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Share your files with anyone via a secure link</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-300 ${
                dragActive ? "border-primary bg-primary/10 scale-105 shadow-lg" : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 transition-all ${
                dragActive ? "text-primary scale-110" : "text-muted-foreground"
              }`} />
              <p className="text-sm sm:text-base font-semibold mb-2">
                Drag and drop your files here, or click to browse
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Maximum file size: 10GB
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                {uploading ? "Uploading..." : "Select Files"}
              </Button>
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
                <div className="flex justify-end mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:scale-105 transition-transform"
                    onClick={() => {
                      cancelRequestedRef.current = true;
                      try { uploadAbortRef.current?.abort(); } catch {}
                      toast("Canceling upload...");
                    }}
                  >
                    Cancel Upload
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

    </div>
  );
}
