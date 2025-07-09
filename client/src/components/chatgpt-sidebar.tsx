import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth";
import { Link } from "wouter";

const conversationHistory = [
  { id: 1, title: "Q3 Financial Analysis", time: "2 hours ago" },
  { id: 2, title: "Market Research Summary", time: "1 day ago" },
  { id: 3, title: "Strategic Planning Review", time: "3 days ago" },
  { id: 4, title: "Customer Feedback Analysis", time: "1 week ago" },
];

export default function ChatGPTSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    window.location.reload();
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white flex flex-col h-screen transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00728e] to-[#005a70] rounded-full flex items-center justify-center">
              <i className="fas fa-brain text-white text-sm"></i>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-sm font-semibold">BPN Intelligence</h1>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-1"
          >
            <i className={`fas ${isCollapsed ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
          </Button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          className="w-full bg-[#00728e] hover:bg-[#005a70] text-white rounded-lg transition-colors"
          size={isCollapsed ? "sm" : "default"}
        >
          {isCollapsed ? (
            <i className="fas fa-plus"></i>
          ) : (
            <>
              <i className="fas fa-plus mr-2"></i>
              New Chat
            </>
          )}
        </Button>
      </div>

      {/* Conversation History */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-2">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Recent Conversations
            </h2>
            {conversationHistory.map((conversation) => (
              <div
                key={conversation.id}
                className="p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="text-sm text-white font-medium mb-1 truncate">
                  {conversation.title}
                </div>
                <div className="text-xs text-gray-400">
                  {conversation.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Button */}
      <div className="p-4 border-t border-gray-700">
        <Link href="/settings">
          <Button
            variant="ghost"
            className="w-full text-gray-400 hover:text-white hover:bg-gray-800 justify-start"
            size={isCollapsed ? "sm" : "default"}
          >
            {isCollapsed ? (
              <i className="fas fa-cog"></i>
            ) : (
              <>
                <i className="fas fa-cog mr-2"></i>
                Settings
              </>
            )}
          </Button>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#a8cb63] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {authService.getInitials()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {authService.getFullName()}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {authService.getUser()?.email}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-1"
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}