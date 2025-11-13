"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, LogOut, FileText, Share2, CheckSquare, Square, Search, Filter, SortAsc, QrCode, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";
import { formatFileSize, getFileIcon, generateShareUrl, formatDate } from "@/lib/file-utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { QRCodeDialog } from "@/components/ui/qr-code-dialog";
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
  file_url: string;
  file_key: string;
  file_size: number;
  file_type: string;
  share_token: string;
  downloads: number;
  created_at: string;
}

const FILES_PER_PAGE = 10;

export default function FilesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; key: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "downloads">("date");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedFileForQR, setSelectedFileForQR] = useState<FileData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const copyShareLink = (token: string) => {
    const url = generateShareUrl(token);
    navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard!");
  };

  const downloadFromDashboard = async (file: FileData) => {
    try {
      // Increment download count in DB
      await insforge.database
        .from("files")
        .update({ downloads: file.downloads + 1 })
        .eq("id", file.id);
    } catch (error) {
      // Non-blocking: still allow opening the file
      console.error("Failed to increment downloads:", error);
    } finally {
      // Open the file and optimistically update UI
      window.open(file.file_url, "_blank");
      setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, downloads: f.downloads + 1 } : f)));
    }
  };

  const deleteFile = async (fileId: string, fileKey: string) => {
    setFileToDelete({ id: fileId, key: fileKey });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      // Delete from storage first
      const { error: storageError } = await insforge.storage
        .from("user-files")
        .remove(fileToDelete.key);

      if (storageError) {
        console.error("Storage deletion error:", storageError);
        toast.error("Failed to delete file from storage");
        return;
      }

      // Then delete from database
      const { error: dbError } = await insforge.database
        .from("files")
        .delete()
        .eq("id", fileToDelete.id);

      if (dbError) {
        toast.error("Failed to delete file from database");
        return;
      }

      toast.success("File deleted successfully!");
      await loadFiles();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
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
      setSelectedFiles(new Set(filteredAndSortedFiles.map(f => f.id)));
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
      // Get the files to delete
      const filesToDelete = files.filter(f => selectedFiles.has(f.id));

      // Delete each file from storage and database
      for (const file of filesToDelete) {
        try {
          // Delete from storage
          const { error: storageError } = await insforge.storage
            .from("user-files")
            .remove(file.file_key);

          if (storageError) {
            console.error(`Storage deletion error for ${file.file_name}:`, storageError);
            errorCount++;
            continue;
          }

          // Delete from database
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

      // Show results
      if (successCount > 0) {
        toast.success(`${successCount} file${successCount > 1 ? 's' : ''} deleted successfully!`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} file${errorCount > 1 ? 's' : ''}`);
      }

      // Clear selection and reload
      setSelectedFiles(new Set());
      await loadFiles();
    } catch (error: any) {
      toast.error(error.message || "An error occurred during bulk delete");
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

  // Get unique file types for filter
  const fileTypes = useMemo(() => {
    const types = new Set(files.map(f => {
      const type = f.file_type.split('/')[0];
      return type || 'other';
    }));
    return Array.from(types);
  }, [files]);

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    let result = [...files];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(file =>
        file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      result = result.filter(file => {
        const type = file.file_type.split('/')[0];
        return type === filterType;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.file_name.localeCompare(b.file_name);
        case "date":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "size":
          return b.file_size - a.file_size;
        case "downloads":
          return b.downloads - a.downloads;
        default:
          return 0;
      }
    });

    return result;
  }, [files, searchQuery, filterType, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedFiles.length / FILES_PER_PAGE);
  const paginatedFiles = useMemo(() => {
    const start = (currentPage - 1) * FILES_PER_PAGE;
    const end = start + FILES_PER_PAGE;
    return filteredAndSortedFiles.slice(start, end);
  }, [filteredAndSortedFiles, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, sortBy]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-50 shadow-lg backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer">
            FileShare
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Dashboard</Button>
            </Link>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium hidden lg:inline">{user?.email}</span>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:scale-110 transition-transform h-8 w-8 sm:h-9 sm:w-9" title="Logout">
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6 md:py-8 pb-12 sm:pb-16">
        {/* Files List */}
        <Card className="glass-card border-0 shadow-xl">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    Your Files
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base mt-1">
                    {filteredAndSortedFiles.length} of {files.length} {files.length === 1 ? "file" : "files"}
                    {selectedFiles.size > 0 && ` • ${selectedFiles.size} selected`}
                  </CardDescription>
                </div>
                {files.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedFiles.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={bulkDeleteFiles}
                      disabled={deleting}
                      className="shadow-md hover:shadow-lg transition-all hover:scale-105 text-xs sm:text-sm"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {deleting ? "Deleting..." : `Delete ${selectedFiles.size}`}
                    </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="hover:scale-105 transition-transform text-xs sm:text-sm"
                    >
                      {selectedFiles.size === filteredAndSortedFiles.length ? (
                        <><Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Deselect All</span><span className="sm:hidden">Deselect</span></>
                      ) : (
                        <><CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Select All</span><span className="sm:hidden">Select</span></>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Search, Filter, Sort Controls */}
              {files.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Filter by Type */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter: {filterType === "all" ? "All Types" : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>File Type</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setFilterType("all")}>
                        All Types
                      </DropdownMenuItem>
                      {fileTypes.map(type => (
                        <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Sort */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        <SortAsc className="h-4 w-4 mr-2" />
                        Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSortBy("date")}>
                        Date (Newest First)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("name")}>
                        Name (A-Z)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("size")}>
                        Size (Largest First)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("downloads")}>
                        Downloads (Most First)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg text-muted-foreground">No files uploaded yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  <Link href="/dashboard" className="text-primary hover:underline">Go to Dashboard</Link> to upload your first file
                </p>
              </div>
            ) : filteredAndSortedFiles.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg text-muted-foreground">No files match your search</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search term
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] gap-3"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                        <Checkbox
                          checked={selectedFiles.has(file.id)}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                          className="mt-1 flex-shrink-0"
                        />
                        <div className="text-3xl sm:text-4xl flex-shrink-0">{getFileIcon(file.file_type)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-sm sm:text-base">{file.file_name}</h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden md:inline">{formatDate(file.created_at)}</span>
                            <span className="hidden sm:inline">•</span>
                            <Badge variant="secondary" className="text-xs">
                              <Download className="h-3 w-3 mr-1" />
                              {file.downloads}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openQRCode(file)}
                          title="Generate QR Code"
                          className="hover:scale-110 transition-transform h-8 w-8 sm:h-9 sm:w-9"
                        >
                          <QrCode className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyShareLink(file.share_token)}
                          title="Copy share link"
                          className="hover:scale-110 transition-transform h-8 w-8 sm:h-9 sm:w-9"
                        >
                          <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => downloadFromDashboard(file)}
                          title="Download"
                          className="hover:scale-110 transition-transform h-8 w-8 sm:h-9 sm:w-9"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFile(file.id, file.file_key)}
                          title="Delete"
                          className="hover:scale-110 transition-transform h-8 w-8 sm:h-9 sm:w-9"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t gap-3">
                    <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                      Showing {((currentPage - 1) * FILES_PER_PAGE) + 1} to {Math.min(currentPage * FILES_PER_PAGE, filteredAndSortedFiles.length)} of {filteredAndSortedFiles.length} files
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="hover:scale-105 transition-transform text-xs sm:text-sm"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8 h-8 sm:w-9 sm:h-9 p-0 hover:scale-105 transition-transform text-xs sm:text-sm"
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="hover:scale-105 transition-transform text-xs sm:text-sm"
                      >
                        Next
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Dialogs */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteFile}
        title="Delete File"
        description="Are you sure you want to delete this file? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Files"
        description={`Are you sure you want to delete ${selectedFiles.size} file${selectedFiles.size > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText={`Delete ${selectedFiles.size} file${selectedFiles.size > 1 ? 's' : ''}`}
        cancelText="Cancel"
        variant="destructive"
      />

      {/* QR Code Dialog */}
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
