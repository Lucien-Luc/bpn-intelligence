import Sidebar from "@/components/sidebar";
import UploadArea from "@/components/upload-area";
import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Document } from "@shared/schema";

export default function UploadPage() {
  const { data: documents = [] } = useQuery({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/documents");
      return response.json() as Promise<Document[]>;
    },
  });

  const processingDocuments = documents.filter(doc => doc.isProcessing);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload Files</h2>
              <p className="text-sm text-gray-600">Add documents to your personal library</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <i className="fas fa-shield-alt text-[#00728e]"></i>
              <span>Secure local processing</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Area */}
              <div className="lg:col-span-1">
                <UploadArea />
              </div>

              {/* Upload Guidelines */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Upload Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Supported File Types</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-file-pdf text-red-600"></i>
                          <span className="text-sm text-gray-600">PDF Documents</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-file-excel text-green-600"></i>
                          <span className="text-sm text-gray-600">Excel Files</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-file-powerpoint text-blue-600"></i>
                          <span className="text-sm text-gray-600">PowerPoint</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-file-word text-blue-800"></i>
                          <span className="text-sm text-gray-600">Word Documents</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-file-alt text-purple-600"></i>
                          <span className="text-sm text-gray-600">Text Files</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">File Requirements</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Maximum file size: 50MB</li>
                        <li>• Files are processed locally for privacy</li>
                        <li>• Processing time varies by file size</li>
                        <li>• Indexed files enable AI search</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Privacy & Security</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• All processing happens on your machine</li>
                        <li>• No data sent to external servers</li>
                        <li>• Files stored in encrypted format</li>
                        <li>• Access controlled by your account</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Processing Queue */}
            {processingDocuments.length > 0 && (
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Processing Queue ({processingDocuments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {processingDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <i className="fas fa-file-alt text-blue-600"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{doc.originalName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={65} className="flex-1 h-2" />
                            <span className="text-xs text-gray-500">65%</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-cog fa-spin text-[#00728e]"></i>
                          <span className="text-sm text-gray-600">Processing...</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Uploads */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Recent Uploads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="fas fa-upload text-4xl text-gray-400 mb-4"></i>
                      <p className="text-gray-600">No uploads yet. Upload your first document above.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.slice(0, 5).map((doc) => (
                        <div key={doc.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-file-pdf text-red-600"></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{doc.originalName}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              doc.isProcessing ? "bg-yellow-400" : 
                              doc.isIndexed ? "bg-[#a8cb63]" : "bg-gray-400"
                            }`}></div>
                            <span className="text-xs text-gray-600">
                              {doc.isProcessing ? "Processing" : 
                               doc.isIndexed ? "Ready" : "Pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
