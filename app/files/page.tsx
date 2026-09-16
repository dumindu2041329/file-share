"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Trash2,
  LogOut,
  Share2,
  Search,
  Filter,
  SortAsc,
  QrCode,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";
import { formatFileSize, generateShareUrl, formatDate } from "@/lib/file-utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { QRCodeDialog } from "@/components/ui/qr-code-dialog";
import type { UserSchema } from "@insforge/sdk";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const FILES_PER_PAGE = 10;

type SortKey = "name" | "date" | "size" | "download_count";

const SORT_LABELS: Record<SortKey, string> = {
  date: "Newest first",
  name: "Name (A–Z)",
  size: "Largest first",
  download_count: "Most collected",
};

/**
 * The manifest grid. It reflows in three tiers so the ledger never has to
 * scroll sideways: name + size + collected on tablets, type and date added
 * once there's room for the full row.
 */
const ROW_GRID =
  "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 md:grid-cols-[auto_minmax(0,1fr)_7rem_6rem_auto] md:gap-x-4 lg:grid-cols-[auto_minmax(0,1fr)_10rem_7rem_6rem_11rem_auto]";

function filterAndSortFiles(
  files: FileData[],
  searchQuery: string,
  filterType: string,
  sortBy: SortKey
): FileData[] {
  let result = [...files];

  if (searchQuery) {
    result = result.filter((file) =>
      file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (filterType !== "all") {
    result = result.filter((file) => {
      const type = file.file_type.split("/")[0];
      return type === filterType;
    });
  }

  result.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.file_name.localeCompare(b.file_name);
      case "date":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "size":
        return b.file_size - a.file_size;
      case "download_count":
        return b.download_count - a.download_count;
      default:
        return 0;
    }
  });

  return result;
}

export default function FilesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSchema | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; storage_key: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedFileForQR, setSelectedFileForQR] = useState<FileData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const copyShareLink = (token: string) => {
    const url = generateShareUrl(token);
    navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  };

  const downloadFromDashboard = async (file: FileData) => {
    try {
      await insforge.database
        .from("files")
        .update({ download_count: file.download_count + 1 })
        .eq("id", file.id);
    } catch (error) {
      // Non-blocking: still allow opening the file
      console.error("Failed to increment downloads:", error);
    } finally {
      window.open(file.storage_url, "_blank");
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, download_count: f.download_count + 1 } : f
        )
      );
    }
  };

  const deleteFile = async (fileId: string, storageKey: string) => {
    setFileToDelete({ id: fileId, storage_key: storageKey });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      const { error: storageError } = await insforge.storage
        .from("user-files")
        .remove(fileToDelete.storage_key);

      if (storageError) {
        console.error("Storage deletion error:", storageError);
        toast.error("Failed to delete the file from storage");
        return;
      }

      const { error: dbError } = await insforge.database
        .from("files")
        .delete()
        .eq("id", fileToDelete.id);

      if (dbError) {
        toast.error("Failed to delete the file record");
        return;
      }

      toast.success("File deleted");
      await loadFiles();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setFileToDelete(null);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredAndSortedFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredAndSortedFiles.map((f) => f.id)));
    }
  };

  const bulkDeleteFiles = () => {
    if (selectedFiles.size === 0) {
      toast.error("No files selected");
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    setDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const filesToDelete = files.filter((f) => selectedFiles.has(f.id));

      for (const file of filesToDelete) {
        try {
          const { error: storageError } = await insforge.storage
            .from("user-files")
            .remove(file.storage_key);

          if (storageError) {
            console.error(`Storage deletion error for ${file.file_name}:`, storageError);
            errorCount++;
            continue;
          }

          const { error: dbError } = await insforge.database
            .from("files")
            .delete()
            .eq("id", file.id);

          if (dbError) {
            console.error(`Database deletion error for ${file.file_name}:`, dbError);
            errorCount++;
            continue;
          }

          successCount++;
        } catch (error) {
          console.error(`Error deleting ${file.file_name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(
          `${successCount} file${successCount > 1 ? "s" : ""} deleted`
        );
      }
      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} file${errorCount > 1 ? "s" : ""}`);
      }

      setSelectedFiles(new Set());
      await loadFiles();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred during bulk delete"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await insforge.auth.signOut();
    router.push("/");
  };

  const openQRCode = (file: FileData) => {
    setSelectedFileForQR(file);
    setQrDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setCurrentPage(1);
  };

  const fileTypes = useMemo(() => {
    const types = new Set(
      files.map((f) => {
        const type = f.file_type.split("/")[0];
        return type || "other";
      })
    );
    return Array.from(types);
  }, [files]);

  const filteredAndSortedFiles = filterAndSortFiles(
    files,
    searchQuery,
    filterType,
    sortBy
  );

  const totalPages = Math.ceil(filteredAndSortedFiles.length / FILES_PER_PAGE);
  const paginatedFiles = useMemo(() => {
    const start = (currentPage - 1) * FILES_PER_PAGE;
    const end = start + FILES_PER_PAGE;
    return filteredAndSortedFiles.slice(start, end);
  }, [filteredAndSortedFiles, currentPage]);

  const allOnPageSelected =
    paginatedFiles.length > 0 &&
    paginatedFiles.every((f) => selectedFiles.has(f.id));

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
              href="/dashboard"
              className="stamp px-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              Upload
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="stamp text-muted-foreground">Manifest</p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Your files
            </h1>
            <p className="tabular mt-2 text-sm text-muted-foreground">
              {filteredAndSortedFiles.length} of {files.length}{" "}
              {files.length === 1 ? "file" : "files"}
              {selectedFiles.size > 0 && ` · ${selectedFiles.size} selected`}
            </p>
          </div>

          {selectedFiles.size > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={bulkDeleteFiles}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                {deleting ? "Deleting…" : `Delete ${selectedFiles.size}`}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFiles(new Set())}
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by file name"
                value={searchQuery}
                aria-label="Search files by name"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4" />
                  <span className="truncate">
                    {filterType === "all"
                      ? "All types"
                      : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="stamp text-muted-foreground">
                  File type
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setFilterType("all");
                    setCurrentPage(1);
                  }}
                >
                  All types
                </DropdownMenuItem>
                {fileTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setCurrentPage(1);
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <SortAsc className="h-4 w-4" />
                  <span className="truncate">{SORT_LABELS[sortBy]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="stamp text-muted-foreground">
                  Sort by
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => {
                      setSortBy(key);
                      setCurrentPage(1);
                    }}
                  >
                    {SORT_LABELS[key]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* The ledger */}
        <div className="mt-6 overflow-hidden rounded-md border bg-card">
          {files.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold tracking-tight">
                Nothing on the manifest yet
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Files you upload show up here with a link, a QR code, and a
                running download count.
              </p>
              <Button asChild className="mt-6">
                <Link href="/dashboard">Upload a file</Link>
              </Button>
            </div>
          ) : filteredAndSortedFiles.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-bold tracking-tight">
                No files match that search
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Try a shorter name, or widen the type filter.
              </p>
              <Button variant="outline" className="mt-6" onClick={clearFilters}>
                Clear search and filters
              </Button>
            </div>
          ) : (
            <>
              {/* Column headings */}
              <div
                className={`${ROW_GRID} hidden border-b border-rule px-4 py-3 md:grid sm:px-5`}
              >
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select every file on this page"
                />
                <span className="stamp text-muted-foreground">File</span>
                <span className="stamp hidden text-muted-foreground lg:block">
                  Type
                </span>
                <span className="stamp text-muted-foreground">Size</span>
                <span className="stamp text-muted-foreground">Collected</span>
                <span className="stamp hidden text-muted-foreground lg:block">
                  Issued
                </span>
                <span className="stamp text-right text-muted-foreground">
                  Actions
                </span>
              </div>

              {paginatedFiles.map((file) => {
                const isSelected = selectedFiles.has(file.id);
                return (
                  <div
                    key={file.id}
                    className={`${ROW_GRID} border-b border-border px-4 py-4 transition-colors sm:px-5 ${
                      isSelected ? "bg-primary/10" : "hover:bg-accent/60"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                      aria-label={`Select ${file.file_name}`}
                    />
                    <p className="truncate font-semibold tracking-tight">
                      {file.file_name}
                    </p>
                    <span className="hidden truncate font-mono text-xs text-muted-foreground lg:block">
                      {file.file_type || "unknown"}
                    </span>
                    <span className="tabular hidden text-sm text-muted-foreground md:block">
                      {formatFileSize(file.file_size)}
                    </span>
                    <span className="tabular hidden text-sm text-muted-foreground md:block">
                      {file.download_count}
                    </span>
                    <span className="tabular hidden text-sm text-muted-foreground lg:block">
                      {formatDate(file.created_at)}
                    </span>

                    {/* Folded columns, for small screens */}
                    <p className="tabular col-span-2 truncate font-mono text-xs text-muted-foreground md:hidden">
                      {file.file_type || "unknown"} · {formatFileSize(file.file_size)} ·{" "}
                      {file.download_count} collected · {formatDate(file.created_at)}
                    </p>

                    <div className="col-span-2 flex items-center justify-end gap-1 md:col-span-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openQRCode(file)}
                        aria-label={`Show the QR code for ${file.file_name}`}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => copyShareLink(file.share_token)}
                        aria-label={`Copy the share link for ${file.file_name}`}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => downloadFromDashboard(file)}
                        aria-label={`Download ${file.file_name}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => deleteFile(file.id, file.storage_key)}
                        aria-label={`Delete ${file.file_name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-5">
                  <p className="tabular stamp text-muted-foreground">
                    {(currentPage - 1) * FILES_PER_PAGE + 1}–
                    {Math.min(
                      currentPage * FILES_PER_PAGE,
                      filteredAndSortedFiles.length
                    )}{" "}
                    of {filteredAndSortedFiles.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="icon-sm"
                            className="tabular"
                            aria-label={`Page ${page}`}
                            aria-current={page === currentPage ? "page" : undefined}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteFile}
        title="Delete this file?"
        description="The link and QR code stop working right away, and this can't be undone."
        confirmText="Delete file"
        cancelText="Keep it"
        variant="destructive"
      />

      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selectedFiles.size} ${selectedFiles.size > 1 ? "files" : "file"}?`}
        description="Every link and QR code for these files stops working right away, and this can't be undone."
        confirmText={`Delete ${selectedFiles.size}`}
        cancelText="Keep them"
        variant="destructive"
      />

      {selectedFileForQR && (
        <QRCodeDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          shareUrl={generateShareUrl(selectedFileForQR.share_token)}
          fileName={selectedFileForQR.file_name}
        />
      )}
    </div>
  );
}
