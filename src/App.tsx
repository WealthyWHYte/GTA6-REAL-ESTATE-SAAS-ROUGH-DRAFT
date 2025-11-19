// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';

import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/auth/register-page";
import LoginPage from "./pages/auth/login-page";
import DashboardPage from "./pages/dashboard-page";
import UploadPage from "./pages/upload-page";
import HeistMissionPage from "./pages/heist-mission/[dataset_id]";
import DealDetailPage from "./pages/deals/[id]";
import BlackMarketPage from "./pages/black-market";
import CommandCenter from "@/components/CommandCenter";
import MissionBriefingPage from "./pages/mission-briefing";
import MissionControlPage from "./pages/mission-control";
import CountdownPage from "./pages/countdown";
import DeployOffersPage from "./pages/deploy-offers";
import GenerateContractsPage from "./pages/generate-contracts";
import FollowUpQueuePage from "./pages/follow-up-queue";
import TopPropertyTargetsPage from "./pages/top-property-targets";
import PortfolioOverviewPage from "./pages/portfolio-overview";
import ActiveListsPage from "./pages/active-lists";
import WholesaleFeesPage from "./pages/wholesale-fees";
import SellerClosingsPage from "./pages/seller-closings";
import AcquisitionFeesPage from "./pages/acquisition-fees";
import PipelineScoutPage from "./pages/agents/pipeline-scout";
import UnderwriterPage from "./pages/agents/underwriter";
import OfferGeneratorPage from "./pages/agents/offer-generator";
import ContractSpecialistPage from "./pages/agents/contract-specialist";
import EmailCloserPage from "./pages/agents/email-closer";
import GTAMoneyBar from "@/components/GTAMoneyBar";

const queryClient = new QueryClient();

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<CountdownPage />} />
          <Route path="/countdown" element={<CountdownPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/black-market" element={<BlackMarketPage />} />
          <Route path="/black-market/:id" element={<DealDetailPage />} />
          
          {/* Protected Routes with GTAMoneyBar */}
          <Route
            path="/mission-briefing"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <MissionBriefingPage />
                </>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/command-center"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <CommandCenter />
                </>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <UploadPage />
                </>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/heist-mission/:dataset_id"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <HeistMissionPage />
                </>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/mission-control"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <MissionControlPage />
                </>
              </ProtectedRoute>
            }
          />

          {/* Agent Routes */}
          <Route
            path="/agent/pipeline-scout"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <PipelineScoutPage />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/agent/underwriter"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <UnderwriterPage />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/agent/offer-generator"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <OfferGeneratorPage />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/agent/contract-specialist"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <ContractSpecialistPage />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/agent/email-closer"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <EmailCloserPage />
                </>
              </ProtectedRoute>
            }
          />

          {/* Quick Commands Pages */}
          <Route
            path="/deploy-offers"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <DeployOffersPage />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/generate-contracts"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <GenerateContractsPage />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/follow-up-queue"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <FollowUpQueuePage />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/top-property-targets"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <TopPropertyTargetsPage />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/portfolio-overview"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <PortfolioOverviewPage />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/active-lists"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <ActiveListsPage />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/wholesale-fees"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <WholesaleFeesPage />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller-closings"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <SellerClosingsPage />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/acquisition-fees"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <AcquisitionFeesPage />
                </>
              </ProtectedRoute>
            }
          />

          {/* Countdown Page */}
          <Route
            path="/countdown"
            element={
              <ProtectedRoute>
                <>
                  <GTAMoneyBar />
                  <CountdownPage />
                </>
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;