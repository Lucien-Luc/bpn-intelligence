import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/auth";
import Sidebar from "@/components/sidebar";
import DocumentCard from "@/components/document-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Document } from "@shared/schema";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["/api/search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const response = await authenticatedFetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      return response.json() as Promise<Document[]>;
    },
    enabled: !!searchTerm.trim(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setHasSearched(true);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Search</h2>
              <p className="text-sm text-gray-600">Find documents and content across your library</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <i className="fas fa-search text-[#00728e]"></i>
              <span>AI-powered search</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <Input
                type="text"
                placeholder="Search documents, content, or ask questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-20 py-3 text-lg"
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bpn-turquoise hover:opacity-90"
                disabled={!searchTerm.trim() || isLoading}
              >
                {isLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Search Suggestions */}
        {!hasSearched && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-gray-600 mb-3">Try searching for:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "financial reports",
                  "project updates",
                  "meeting notes",
                  "budget analysis",
                  "presentations",
                  "contracts",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setSearchTerm(suggestion);
                      setHasSearched(true);
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {!hasSearched ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="fas fa-search text-6xl text-gray-400 mb-6"></i>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Search Your Documents
                </h3>
                <p className="text-gray-600 mb-4 max-w-md">
                  Use natural language to find information across all your documents. 
                  Ask questions or search for specific topics.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Search by document name or content</p>
                  <p>• Ask questions about your documents</p>
                  <p>• Find related information across files</p>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">Searching your documents...</p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Search Results for "{searchTerm}"
                </h3>
                <p className="text-sm text-gray-600">
                  Found {searchResults.length} document{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>

              {searchResults.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No documents found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search terms or upload more documents.
                    </p>
                    <Button className="bpn-turquoise hover:opacity-90">
                      <i className="fas fa-plus mr-2"></i>
                      Upload Document
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              )}

              {/* Search Tips */}
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Search Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-lightbulb text-yellow-500 mt-1"></i>
                      <div>
                        <p className="font-medium text-gray-900">Use specific keywords</p>
                        <p className="text-sm text-gray-600">
                          Try "quarterly financial report" instead of "finance"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-question-circle text-blue-500 mt-1"></i>
                      <div>
                        <p className="font-medium text-gray-900">Ask questions</p>
                        <p className="text-sm text-gray-600">
                          "What were the key findings in the market analysis?"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-filter text-green-500 mt-1"></i>
                      <div>
                        <p className="font-medium text-gray-900">Combine terms</p>
                        <p className="text-sm text-gray-600">
                          Use multiple keywords to narrow down results
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
