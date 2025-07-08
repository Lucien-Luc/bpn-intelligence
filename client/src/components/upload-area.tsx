import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface UploadAreaProps {
  onUploadComplete?: () => void;
}

export default function UploadArea({ onUploadComplete }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const response = await authenticatedFetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Upload successful",
        description: "Your document is being processed and will be available shortly.",
      });
      onUploadComplete?.();
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const supportedTypes = [
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    for (const file of files) {
      if (!supportedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 50MB limit.`,
          variant: "destructive",
        });
        continue;
      }

      uploadMutation.mutate(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quick Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`upload-area border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-[#00728e] bg-[#00728e] bg-opacity-5" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <i className="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h4>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop files here or click to browse
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {["PDF", "Excel", "PowerPoint", "Word", "Text"].map((type) => (
              <span
                key={type}
                className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
              >
                {type}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.xls,.xlsx,.ppt,.pptx,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploadMutation.isPending}
            />
            <Button
              type="button"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={uploadMutation.isPending}
              className="bpn-turquoise hover:opacity-90"
            >
              {uploadMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Uploading...
                </>
              ) : (
                "Choose Files"
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Maximum file size: 50MB</p>
        </div>
      </CardContent>
    </Card>
  );
}
