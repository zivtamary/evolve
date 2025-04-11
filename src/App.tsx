import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Settings from "./pages/Settings";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import ParticlesAnimation from "./components/Background/ParticlesAnimation";

const queryClient = new QueryClient();

// Auth wrapper component
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useSettings();

  // Don't show loading spinner during initial auth check
  // The app will render immediately and handle auth state changes in the background
  return <>{children}</>;
};

// Route guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSettings();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

const AppRoutes = () => {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    // First set background to loaded
    const backgroundTimer = setTimeout(() => {
      setBackgroundLoaded(true);

      // Then after background is visible, start fading in the content
      const contentTimer = setTimeout(() => {
        setContentLoaded(true);
      }, 800); // Reduced from 2000ms to 800ms for faster sequence

      return () => clearTimeout(contentTimer);
    }, 50); // Reduced from 100ms to 50ms for faster initial load

    return () => clearTimeout(backgroundTimer);
  }, []);

  return (
    <div className="relative">
      {/* Background fade-in */}
      {window.location.hash !== "#/privacy-policy" && window.location.hash !== "#/terms-of-service" && <motion.div
        className="fixed inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: backgroundLoaded ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }} // Reduced from 0.8s to 0.5s
      />}

      {/* Particles Animation - Always visible from the start */}
      <ParticlesAnimation
        isVisible={
          window.location.hash !== "#/privacy-policy" &&
          window.location.hash !== "#/terms-of-service" && window.location.hash !== "#/auth"
        }
      />

      <HashRouter>
        <Routes>
         
            <Route path="/" element={
                <>
                 {/* Content fade-in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: contentLoaded ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }} // Reduced from 0.8s to 0.5s
          >
                <Index />
                </motion.div>
                </>
                } />
          <Route path="/auth" element={<Auth />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          {/* Redirect all unmatched routes to home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SettingsProvider>
        <AuthWrapper>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthWrapper>
      </SettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
