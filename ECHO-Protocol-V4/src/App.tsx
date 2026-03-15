/**
 * App Component - Main application with routing
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from '@/modules/wallet/WalletProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/shared/Navbar';

// Pages
import Home from '@/pages/Home';
import Marketplace from '@/pages/Marketplace';
import AssetDetail from '@/pages/AssetDetail';
import LicenseShop from '@/pages/LicenseShop';
import MyAssets from '@/pages/MyAssets';
import Profile from '@/pages/Profile';

// Creator Pages
import CreatorDashboard from '@/pages/creator/Dashboard';
import CreatorMyAssets from '@/pages/creator/MyAssets';
import Upload from '@/pages/creator/Upload';
import Revenue from '@/pages/creator/Revenue';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Layout component with Navbar
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20">{children}</main>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <ToastProvider>
          <HashRouter>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/asset/:id" element={<AssetDetail />} />
                <Route path="/license/:id" element={<LicenseShop />} />
                
                {/* User Routes */}
                <Route path="/my-assets" element={<MyAssets />} />
                <Route path="/profile" element={<Profile />} />
                
                {/* Creator Routes */}
                <Route path="/creator/dashboard" element={<CreatorDashboard />} />
                <Route path="/creator/assets" element={<CreatorMyAssets />} />
                <Route path="/creator/upload" element={<Upload />} />
                <Route path="/creator/revenue" element={<Revenue />} />
                
                {/* Redirects */}
                <Route path="/creator" element={<Navigate to="/creator/dashboard" replace />} />
                
                {/* 404 */}
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
                    <p className="text-lg text-muted-foreground mb-6">页面未找到</p>
                    <a href="#/" className="text-primary-600 hover:underline">
                      返回首页
                    </a>
                  </div>
                } />
              </Routes>
            </Layout>
          </HashRouter>
        </ToastProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;