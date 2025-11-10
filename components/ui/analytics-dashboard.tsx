"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, HardDrive, TrendingUp, FileText } from "lucide-react";

interface FileData {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  downloads: number;
  created_at: string;
}

interface AnalyticsDashboardProps {
  files: FileData[];
}

export function AnalyticsDashboard({ files }: AnalyticsDashboardProps) {
  // Calculate statistics
  const totalFiles = files.length;
  const totalDownloads = files.reduce((sum, file) => sum + file.downloads, 0);
  const totalStorage = files.reduce((sum, file) => sum + file.file_size, 0);
  
  // Format storage size
  const formatStorage = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Get most popular file
  const mostPopular = files.length > 0 
    ? files.reduce((prev, current) => (prev.downloads > current.downloads) ? prev : current)
    : null;

  // Get recent upload count (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUploads = files.filter(file => new Date(file.created_at) >= sevenDaysAgo).length;

  const stats = [
    {
      title: "Total Files",
      value: totalFiles.toString(),
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30"
    },
    {
      title: "Total Downloads",
      value: totalDownloads.toString(),
      icon: Download,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30"
    },
    {
      title: "Storage Used",
      value: formatStorage(totalStorage),
      icon: HardDrive,
      color: "text-pink-600",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30"
    },
    {
      title: "Recent Uploads",
      value: `${recentUploads} (7d)`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const hasData = totalFiles > 0;
          return (
            <Card 
              key={stat.title} 
              className={`glass-card border ${stat.borderColor} hover:scale-105 transition-transform duration-300 ${
                !hasData ? 'opacity-80' : ''
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold mt-2 ${
                      !hasData ? 'text-muted-foreground' : ''
                    }`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor} border ${stat.borderColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
}
