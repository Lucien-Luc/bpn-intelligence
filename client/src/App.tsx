import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { authService, type AuthUser } from "./lib/auth";
import { useEffect, useState } from "react";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ChatPage from "@/pages/chat";
import DocumentsPage from "@/pages/documents";
import UploadPage from "@/pages/upload";
import SearchPage from "@/pages/search";
import SharedKnowledgePage from "@/pages/shared-knowledge";
import AnalyticsPage from "@/pages/analytics";
import NotFound from "@/pages/not-found";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(authService.getUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth...");
        const currentUser = await authService.getCurrentUser();
        console.log("Auth result:", currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        console.log("Auth check complete");
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
        <Route path="/" component={DashboardPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/documents" component={DocumentsPage} />
        <Route path="/upload" component={UploadPage} />
        <Route path="/search" component={SearchPage} />
        <Route path="/shared-knowledge" component={SharedKnowledgePage} />
        <Route path="/analytics" component={AnalyticsPage} />
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
