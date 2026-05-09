import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Feed from "@/pages/Feed";
import WritePage from "@/pages/WritePage";
import EditPage from "@/pages/EditPage";
import FrameView from "@/pages/FrameView";
import ProfilePage from "@/pages/ProfilePage";
import Dashboard from "@/pages/Dashboard";
import SavedPage from "@/pages/SavedPage";
import Notifications from "@/pages/Notifications";
import TheoryPage from "@/pages/TheoryPage";
import NotFound from "@/pages/NotFound";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import WallPage from "@/pages/WallPage";
import SidebarLayout from "@/components/SidebarLayout";
import { SidebarProvider } from "@/hooks/useSidebar";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SidebarProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/feed" element={<SidebarLayout><Feed /></SidebarLayout>} />
            <Route path="/write" element={<ProtectedRoute><WritePage /></ProtectedRoute>} />
            <Route path="/edit/:id" element={<ProtectedRoute><EditPage /></ProtectedRoute>} />
            <Route path="/frame/:username/:id" element={<FrameView />} />
            <Route path="/dashboard" element={<ProtectedRoute><SidebarLayout><Dashboard /></SidebarLayout></ProtectedRoute>} />
            <Route path="/dashboard/frames" element={<ProtectedRoute><SidebarLayout><Dashboard /></SidebarLayout></ProtectedRoute>} />
            <Route path="/dashboard/saved" element={<ProtectedRoute><SidebarLayout><Dashboard /></SidebarLayout></ProtectedRoute>} />
            <Route path="/saved" element={<Navigate to="/dashboard/saved" replace />} />
            <Route path="/notifications" element={<ProtectedRoute><SidebarLayout><Notifications /></SidebarLayout></ProtectedRoute>} />
            <Route path="/theory" element={<TheoryPage />} />
            <Route path="/wall" element={<WallPage />} />
            <Route path="/:username" element={<SidebarLayout><ProfilePage /></SidebarLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </SidebarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
