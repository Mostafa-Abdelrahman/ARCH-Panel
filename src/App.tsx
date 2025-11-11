import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admins from "./pages/Admins";
import Logos from "./pages/Logos";
import HeroContent from "./pages/HeroContent";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import ContactInfo from "./pages/ContactInfo";
import SocialLinks from "./pages/SocialLinks";
import SettingsContent from "./pages/SettingsContent";
import ContactMessages from "./pages/ContactMessages";
import AuditLogs from "./pages/AuditLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="admins" element={<Admins />} />
              <Route path="logos" element={<Logos />} />
              <Route path="hero" element={<HeroContent />} />
              <Route path="services" element={<Services />} />
              <Route path="projects" element={<Projects />} />
              <Route path="contact-info" element={<ContactInfo />} />
              <Route path="social-links" element={<SocialLinks />} />
              <Route path="settings" element={<SettingsContent />} />
              <Route path="messages" element={<ContactMessages />} />
              <Route path="audit-logs" element={<AuditLogs />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
