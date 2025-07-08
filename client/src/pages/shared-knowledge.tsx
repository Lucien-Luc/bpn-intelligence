import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/auth";
import Sidebar from "@/components/sidebar";
import DocumentCard from "@/components/document-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Document } from "@shared/schema";

export default function SharedKnowledgePage() {
  const { data: sharedDocuments = [], isLoading } = useQuery({
    queryKey: ["/api/documents/shared"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/documents/shared");
      return response.json() as Promise<Document[]>;
    },
  });

  const getCategoryStats = () => {
    const categories = sharedDocuments.reduce((acc, doc) => {
      const category = doc.fileType.includes("pdf") ? "Reports" :
                     doc.fileType.includes("excel") ? "Data" :
                     doc.fileType.includes("powerpoint") ? "Presentations" :
                     doc.fileType.includes("word") ? "Documents" : "Other";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories).map(([name, count]) => ({ name, count }));
  };

  const categories = getCategoryStats();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Knowledge Base</h2>
              <p className="text-sm text-gray-600">Shared business intelligence and corporate documents</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="fas fa-building text-[#00728e]"></i>
                <span>BPN Business Resources</span>
              </div>
              <Button className="bpn-turquoise hover:opacity-90">
                <i className="fas fa-share-alt mr-2"></i>
                Share Document
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{sharedDocuments.length}</div>
              <div className="text-sm text-gray-600">Total Documents</div>
            </div>
            {categories.slice(0, 3).map((category) => (
              <div key={category.name} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{category.count}</div>
                <div className="text-sm text-gray-600">{category.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">Loading shared documents...</p>
              </div>
            </div>
          ) : sharedDocuments.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="fas fa-building text-6xl text-gray-400 mb-6"></i>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No Shared Documents
                </h3>
                <p className="text-gray-600 mb-4 max-w-md">
                  This is where company-wide documents and resources will appear. 
                  Contact your administrator to share documents with the team.
                </p>
                <Button className="bpn-turquoise hover:opacity-90">
                  <i className="fas fa-envelope mr-2"></i>
                  Contact Admin
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {/* Featured Resources */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Featured Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { 
                        title: "Company Handbook", 
                        icon: "fas fa-book", 
                        color: "text-blue-600",
                        bg: "bg-blue-100",
                        description: "Policies and procedures"
                      },
                      { 
                        title: "IT Guidelines", 
                        icon: "fas fa-laptop", 
                        color: "text-green-600",
                        bg: "bg-green-100",
                        description: "Technical standards"
                      },
                      { 
                        title: "Training Materials", 
                        icon: "fas fa-graduation-cap", 
                        color: "text-purple-600",
                        bg: "bg-purple-100",
                        description: "Learning resources"
                      },
                    ].map((resource) => (
                      <div key={resource.title} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                        <div className={`w-12 h-12 ${resource.bg} rounded-lg flex items-center justify-center mb-3`}>
                          <i className={`${resource.icon} ${resource.color}`}></i>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{resource.title}</h4>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Document Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {categories.map((category) => (
                  <Card key={category.name}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                        <span>{category.name}</span>
                        <span className="text-sm font-normal text-gray-600">{category.count} documents</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {sharedDocuments
                          .filter(doc => {
                            const docCategory = doc.fileType.includes("pdf") ? "Reports" :
                                              doc.fileType.includes("excel") ? "Data" :
                                              doc.fileType.includes("powerpoint") ? "Presentations" :
                                              doc.fileType.includes("word") ? "Documents" : "Other";
                            return docCategory === category.name;
                          })
                          .slice(0, 3)
                          .map((doc) => (
                            <div key={doc.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                <i className="fas fa-file-alt text-gray-600 text-sm"></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{doc.originalName}</p>
                                <p className="text-xs text-gray-500">
                                  Updated {new Date(doc.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                      {sharedDocuments.filter(doc => {
                        const docCategory = doc.fileType.includes("pdf") ? "Reports" :
                                          doc.fileType.includes("excel") ? "Data" :
                                          doc.fileType.includes("powerpoint") ? "Presentations" :
                                          doc.fileType.includes("word") ? "Documents" : "Other";
                        return docCategory === category.name;
                      }).length > 3 && (
                        <Button variant="ghost" className="w-full mt-2 text-[#00728e] hover:text-opacity-80">
                          View all {category.name.toLowerCase()}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* All Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    All Shared Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sharedDocuments.map((doc) => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
