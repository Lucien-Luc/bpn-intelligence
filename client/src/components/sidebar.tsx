import { Link, useLocation } from "wouter";
import { authService } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { path: "/dashboard", label: "Dashboard", icon: "fas fa-home" },
  { path: "/chat", label: "Chat Assistant", icon: "fas fa-comments" },
  { path: "/documents", label: "My Documents", icon: "fas fa-folder" },
  { path: "/shared-knowledge", label: "Shared Knowledge", icon: "fas fa-building" },
  { path: "/upload", label: "Upload Files", icon: "fas fa-upload" },
  { path: "/search", label: "Search", icon: "fas fa-search" },
  { path: "/analytics", label: "Analytics", icon: "fas fa-chart-bar" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const user = authService.getUser();

  const handleLogout = async () => {
    await authService.logout();
    window.location.reload();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bpn-turquoise rounded-lg flex items-center justify-center">
            <i className="fas fa-robot text-white"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Corporate LLM</h1>
            <p className="text-sm text-gray-500">Document Intelligence</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md sidebar-hover transition-colors ${
                    location === item.path
                      ? "text-gray-900 bg-[#00728e] bg-opacity-10"
                      : "text-gray-700"
                  }`}
                >
                  <i className={`${item.icon} mr-3 ${
                    location === item.path ? "text-[#00728e]" : "text-gray-400"
                  }`}></i>
                  {item.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bpn-green rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {authService.getInitials()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {authService.getFullName()}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <i className="fas fa-sign-out-alt"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
