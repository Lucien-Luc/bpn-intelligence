import { Card, CardContent } from "@/components/ui/card";
import { Document } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface DocumentCardProps {
  document: Document;
  onClick?: () => void;
}

export default function DocumentCard({ document, onClick }: DocumentCardProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return { icon: "fas fa-file-pdf", color: "text-red-600", bg: "bg-red-100" };
    if (fileType.includes("excel") || fileType.includes("sheet")) return { icon: "fas fa-file-excel", color: "text-green-600", bg: "bg-green-100" };
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return { icon: "fas fa-file-powerpoint", color: "text-blue-600", bg: "bg-blue-100" };
    if (fileType.includes("word") || fileType.includes("document")) return { icon: "fas fa-file-word", color: "text-blue-800", bg: "bg-blue-100" };
    return { icon: "fas fa-file-alt", color: "text-purple-600", bg: "bg-purple-100" };
  };

  const getStatusColor = (document: Document) => {
    if (document.isProcessing) return "bg-yellow-400";
    if (document.isIndexed) return "bg-[#a8cb63]";
    return "bg-gray-400";
  };

  const getStatusText = (document: Document) => {
    if (document.isProcessing) return "Processing";
    if (document.isIndexed) return "Indexed";
    return "Pending";
  };

  const fileInfo = getFileIcon(document.fileType);
  const timeAgo = formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true });

  return (
    <Card 
      className="document-card border border-gray-200 transition-all duration-300 hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${fileInfo.bg} rounded-lg flex items-center justify-center`}>
            <i className={`${fileInfo.icon} ${fileInfo.color}`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {document.originalName}
            </h4>
            <p className="text-xs text-gray-500">Updated {timeAgo}</p>
            <div className="flex items-center mt-1">
              <div className={`w-2 h-2 ${getStatusColor(document)} rounded-full mr-2`}></div>
              <span className="text-xs text-gray-600">{getStatusText(document)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
