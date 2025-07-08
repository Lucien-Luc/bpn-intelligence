import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/auth";
import Sidebar from "@/components/sidebar";
import DocumentCard from "@/components/document-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Document } from "@shared/schema";

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [filterBy, setFilterBy] = useState<"all" | "processing" | "indexed">("all");

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/documents");
      return response.json() as Promise<Document[]>;
    },
  });

  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch = doc.originalName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        filterBy === "all" || 
        (filterBy === "processing" && doc.isProcessing) ||
        (filterBy === "indexed" && doc.isIndexed);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.originalName.localeCompare(b.originalName);
        case "size":
          return b.fileSize - a.fileSize;
        case "date":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const getStatusStats = () => {
    const total = documents.length;
    const processing = documents.filter(d => d.isProcessing).length;
    const indexed = documents.filter(d => d.isIndexed).length;
    return { total, processing, indexed };
  };

  const stats = getStatusStats();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">My Documents</h2>
              <p className="text-sm text-gray-600">Manage your personal document library</p>
            </div>
            <Button className="bpn-turquoise hover:opacity-90">
              <i className="fas fa-plus mr-2"></i>
              Upload Document
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600">{stats.total} Total</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#a8cb63] rounded-full"></div>
              <span className="text-sm text-gray-600">{stats.indexed} Indexed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-gray-600">{stats.processing} Processing</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <Input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "date" | "size")}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
              </select>
              <select 
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as "all" | "processing" | "indexed")}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Documents</option>
                <option value="indexed">Indexed Only</option>
                <option value="processing">Processing Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">Loading documents...</p>
              </div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="fas fa-folder-open text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "No documents found" : "No documents yet"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? "Try adjusting your search terms or filters"
                    : "Upload your first document to get started"
                  }
                </p>
                {!searchTerm && (
                  <Button className="bpn-turquoise hover:opacity-90">
                    <i className="fas fa-plus mr-2"></i>
                    Upload Document
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="document-card transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-file-pdf text-red-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                          {doc.originalName}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {formatFileSize(doc.fileSize)}
                        </p>
                        <div className="flex items-center mb-2">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            doc.isProcessing ? "bg-yellow-400" : 
                            doc.isIndexed ? "bg-[#a8cb63]" : "bg-gray-400"
                          }`}></div>
                          <span className="text-xs text-gray-600">
                            {doc.isProcessing ? "Processing" : 
                             doc.isIndexed ? "Indexed" : "Pending"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-[#00728e] hover:text-opacity-80 p-1"
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-[#00728e] hover:text-opacity-80 p-1"
                          >
                            <i className="fas fa-download"></i>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
