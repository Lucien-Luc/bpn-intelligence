import Sidebar from "@/components/sidebar";
import ChatInterface from "@/components/chat-interface";

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Business Intelligence Assistant</h2>
              <p className="text-sm text-gray-600">Get insights and analysis from your business documents</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#a8cb63] rounded-full"></div>
              <span className="text-sm text-gray-600">AI Assistant Active</span>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 p-6">
          <ChatInterface height="h-full" showHeader={false} />
        </div>
      </div>
    </div>
  );
}
