import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { authService, type AuthUser } from "./lib/auth";
import { useEffect, useState, Suspense } from "react";

import LoginPage from "@/pages/login";
import ChatGPTMain from "@/pages/chatgpt-main";
import DashboardPage from "@/pages/dashboard";
import ChatPage from "@/pages/chat";
import DocumentsPage from "@/pages/documents";
import UploadPage from "@/pages/upload";
import SearchPage from "@/pages/search";
import SharedKnowledgePage from "@/pages/shared-knowledge";
import AnalyticsPage from "@/pages/analytics";
import SettingsPage from "@/pages/settings";
import { lazy } from "react";

const AdminPage = lazy(() => import("@/pages/admin"));
import NotFound from "@/pages/not-found";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(authService.getUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bpn-turquoise rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-brain text-white text-xl"></i>
          </div>
          <p className="text-gray-600">Loading BPN Intelligence...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/" component={ChatGPTMain} />
        <Route path="/chat" component={ChatGPTMain} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/documents" component={DocumentsPage} />
        <Route path="/upload" component={UploadPage} />
        <Route path="/search" component={SearchPage} />
        <Route path="/shared-knowledge" component={SharedKnowledgePage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/admin" component={() => (
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00728e] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admin panel...</p>
            </div>
          </div>}>
            <AdminPage />
          </Suspense>
        )} />
        <Route component={NotFound} />
      </Switch>
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
