import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/auth";
import Sidebar from "@/components/sidebar";
import StatsCard from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface AnalyticsData {
  documentStats: {
    totalDocuments: number;
    processedToday: number;
    processingTime: number;
    errorRate: number;
  };
  userActivity: {
    totalQueries: number;
    activeUsers: number;
    avgResponseTime: number;
    popularTimes: Array<{ hour: number; count: number }>;
  };
  systemPerformance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    indexingSpeed: number;
  };
  trends: {
    documentsOverTime: Array<{ date: string; count: number }>;
    queriesOverTime: Array<{ date: string; count: number }>;
    fileTypes: Array<{ type: string; count: number; percentage: number }>;
  };
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics", timeRange],
    queryFn: async () => {
      const response = await authenticatedFetch(`/api/analytics?range=${timeRange}`);
      return response.json() as Promise<AnalyticsData>;
    },
  });

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "pdf": return { icon: "fas fa-file-pdf", color: "text-red-600" };
      case "excel": return { icon: "fas fa-file-excel", color: "text-green-600" };
      case "powerpoint": return { icon: "fas fa-file-powerpoint", color: "text-blue-600" };
      case "word": return { icon: "fas fa-file-word", color: "text-blue-800" };
      default: return { icon: "fas fa-file-alt", color: "text-purple-600" };
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unable to load analytics
            </h3>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Business Analytics</h2>
              <p className="text-sm text-gray-600">Intelligence platform performance and business insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={(value: "day" | "week" | "month") => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Last 24h</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bpn-turquoise hover:opacity-90">
                <i className="fas fa-download mr-2"></i>
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Documents"
                value={analytics.documentStats.totalDocuments}
                icon="fas fa-file-alt"
                iconColor="text-[#00728e]"
                change={`+${analytics.documentStats.processedToday}`}
                changeType="increase"
              />
              <StatsCard
                title="Total Queries"
                value={analytics.userActivity.totalQueries}
                icon="fas fa-question-circle"
                iconColor="text-purple-600"
                change={`${analytics.userActivity.avgResponseTime}ms avg`}
                changeType="neutral"
              />
              <StatsCard
                title="Active Users"
                value={analytics.userActivity.activeUsers}
                icon="fas fa-users"
                iconColor="text-[#a8cb63]"
                change="Online now"
                changeType="increase"
              />
              <StatsCard
                title="Error Rate"
                value={`${analytics.documentStats.errorRate}%`}
                icon="fas fa-exclamation-triangle"
                iconColor="text-red-600"
                change="Below target"
                changeType="decrease"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Document Processing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Document Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Processing Time</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatTime(analytics.documentStats.processingTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Documents Processed Today</span>
                      <span className="text-sm font-medium text-gray-900">
                        {analytics.documentStats.processedToday}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-medium text-[#a8cb63]">
                        {100 - analytics.documentStats.errorRate}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">CPU Usage</span>
                        <span className="text-gray-900">{analytics.systemPerformance.cpuUsage}%</span>
                      </div>
                      <Progress value={analytics.systemPerformance.cpuUsage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Memory Usage</span>
                        <span className="text-gray-900">{analytics.systemPerformance.memoryUsage}%</span>
                      </div>
                      <Progress value={analytics.systemPerformance.memoryUsage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Disk Usage</span>
                        <span className="text-gray-900">{analytics.systemPerformance.diskUsage}%</span>
                      </div>
                      <Progress value={analytics.systemPerformance.diskUsage} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Indexing Speed</span>
                      <span className="text-sm font-medium text-gray-900">
                        {analytics.systemPerformance.indexingSpeed} docs/min
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* File Type Distribution */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  File Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {analytics.trends.fileTypes.map((fileType) => {
                    const iconInfo = getFileTypeIcon(fileType.type);
                    return (
                      <div key={fileType.type} className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                          <i className={`${iconInfo.icon} ${iconInfo.color} text-xl`}></i>
                        </div>
                        <div className="text-sm font-medium text-gray-900 capitalize mb-1">
                          {fileType.type}
                        </div>
                        <div className="text-xs text-gray-600">{fileType.count} files</div>
                        <div className="text-xs text-gray-500">{fileType.percentage}%</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Activity Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Document Upload Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.trends.documentsOverTime.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#00728e] h-2 rounded-full"
                              style={{ width: `${Math.min(100, (item.count / Math.max(...analytics.trends.documentsOverTime.map(d => d.count))) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Query Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.trends.queriesOverTime.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#a8cb63] h-2 rounded-full"
                              style={{ width: `${Math.min(100, (item.count / Math.max(...analytics.trends.queriesOverTime.map(d => d.count))) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Peak Usage Hours */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Peak Usage Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-2">
                  {analytics.userActivity.popularTimes.map((timeSlot) => (
                    <div key={timeSlot.hour} className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {timeSlot.hour}:00
                      </div>
                      <div 
                        className="bg-[#00728e] rounded-sm mx-auto"
                        style={{ 
                          height: `${Math.max(4, (timeSlot.count / Math.max(...analytics.userActivity.popularTimes.map(t => t.count))) * 60)}px`,
                          width: '16px'
                        }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-1">
                        {timeSlot.count}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
