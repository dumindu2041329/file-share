"use client";

interface FileData {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  download_count: number;
  created_at: string;
}

interface AnalyticsDashboardProps {
  files: FileData[];
}

export function AnalyticsDashboard({ files }: AnalyticsDashboardProps) {
  const totalFiles = files.length;
  const totalDownloads = files.reduce((sum, file) => sum + file.download_count, 0);
  const totalStorage = files.reduce((sum, file) => sum + file.file_size, 0);

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUploads = files.filter(
    (file) => new Date(file.created_at) >= sevenDaysAgo
  ).length;

  // A ledger totals row: the four numbers you'd want at the foot of a manifest.
  const stats = [
    { label: "Files", value: totalFiles.toString() },
    { label: "Downloads", value: totalDownloads.toString() },
    { label: "Storage used", value: formatStorage(totalStorage) },
    { label: "Added this week", value: recentUploads.toString() },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card px-4 py-4 sm:px-5 sm:py-5">
          <p className="stamp text-muted-foreground">{stat.label}</p>
          <p className="tabular mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
