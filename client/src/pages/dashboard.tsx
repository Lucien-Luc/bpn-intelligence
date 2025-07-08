import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/auth";
import Sidebar from "@/components/sidebar";
import StatsCard from "@/components/stats-card";
import ChatInterface from "@/components/chat-interface";
import DocumentCard from "@/components/document-card";
import UploadArea from "@/components/upload-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SystemStatus, Document } from "@shared/schema";

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/dashboard/stats");
      return response.json();
    },
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/documents");
      return response.json() as Promise<Document[]>;
    },
  });

  const { data: systemStatus = [] } = useQuery({
    queryKey: ["/api/system/status"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/system/status");
      return response.json() as Promise<SystemStatus[]>;
    },
  });

  const recentDocuments = documents
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const formatStorageUsed = (bytes: number) => {
    return `${(bytes / 1024).toFixed(1)} GB`;
  };

  const getStoragePercentage = () => {
    if (!stats) return 0;
    return Math.round((stats.storageUsed / 2500) * 100);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
              <p className="text-sm text-gray-600">Welcome back</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-[#a8cb63] rounded-full"></div>
                <span>Local LLM Active</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="fas fa-cloud-upload-alt text-[#00728e]"></i>
                <span>OneDrive Synced</span>
              </div>
              <Button className="bpn-turquoise hover:opacity-90">
                <i className="fas fa-plus mr-2"></i>
                Upload Document
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Documents"
              value={stats?.totalDocuments || 0}
              icon="fas fa-file-alt"
              iconColor="text-[#00728e]"
              change="+12%"
              changeType="increase"
            />
            <StatsCard
              title="Storage Used"
              value={formatStorageUsed(stats?.storageUsed || 0)}
              icon="fas fa-hdd"
              iconColor="text-[#a8cb63]"
              subtitle="2.5 GB Available"
              progress={getStoragePercentage()}
            />
            <StatsCard
              title="Queries Today"
              value={stats?.queriesToday || 0}
              icon="fas fa-question-circle"
              iconColor="text-purple-600"
              change="+8%"
              changeType="increase"
            />
            <StatsCard
              title="Processing"
              value={stats?.processing || 0}
              icon="fas fa-cog"
              iconColor="text-yellow-600"
              subtitle="Documents indexing..."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <ChatInterface />
            </div>

            {/* Recent Documents */}
            <div className="lg:col-span-1">
              <Card className="h-96 flex flex-col">
                <CardHeader className="border-b border-gray-200 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Recent Documents
                    </CardTitle>
                    <Button variant="ghost" className="text-[#00728e] hover:text-opacity-80 text-sm">
                      View all
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {recentDocuments.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No documents yet
                    </div>
                  ) : (
                    recentDocuments.map((doc) => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Upload Area */}
          <div className="mt-8">
            <UploadArea />
          </div>

          {/* System Status */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {systemStatus.map((status) => (
                  <div key={status.component} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        status.status === "online" ? "bg-[#a8cb63]" : 
                        status.status === "scheduled" ? "bg-yellow-400" : "bg-red-500"
                      }`}></div>
                      <span className="text-sm text-gray-700">
                        {status.component.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      status.status === "online" ? "text-[#a8cb63]" : 
                      status.status === "scheduled" ? "text-yellow-600" : "text-red-500"
                    }`}>
                      {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: "fas fa-sync", label: "Sync OneDrive" },
                  { icon: "fas fa-database", label: "Rebuild Index" },
                  { icon: "fas fa-download", label: "Export Data" },
                  { icon: "fas fa-cog", label: "Settings" },
                ].map((action) => (
                  <Button
                    key={action.label}
                    variant="ghost"
                    className="w-full justify-between px-4 py-3 h-auto bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <i className={`${action.icon} text-[#00728e]`}></i>
                      <span className="text-sm font-medium text-gray-700">{action.label}</span>
                    </div>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
