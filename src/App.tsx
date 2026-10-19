import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { ApiAlertProvider } from './context/ApiAlertContext';
import { ApiAlertBanner } from './components/ui/ApiAlertBanner';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { EvaluationsListPage } from './pages/EvaluationsListPage';
import { NewEvaluationPage } from './pages/NewEvaluationPage';
import { EvaluationWorkspacePage } from './pages/EvaluationWorkspacePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PublicSharedReportPage } from './pages/PublicSharedReportPage';
import { LandingPage } from './pages/LandingPage';
import { EmptyState } from './components/ui/EmptyState';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ApiAlertProvider>
            <BrowserRouter>
              <ApiAlertBanner />
              <Routes>
                {/* Standalone Full-Bleed Marketing & Showcase Landing Page */}
                <Route path="/landing" element={<LandingPage />} />

                {/* Standalone View-Only Public Shared Evaluation Report */}
                <Route path="/share/report/:token" element={<PublicSharedReportPage />} />

                {/* Core App Shell Workspace Routes */}
                <Route
                  path="/*"
                  element={
                    <AppShell>
                      <Routes>
                        {/* Root redirects to Dashboard */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />

                        {/* Dashboard Command Center */}
                        <Route path="/dashboard" element={<DashboardPage />} />

                        {/* New Evaluation Wizard */}
                        <Route path="/new-evaluation" element={<NewEvaluationPage />} />

                        {/* Evaluations Catalog */}
                        <Route path="/evaluations" element={<EvaluationsListPage />} />

                        {/* Evaluation Workspace & Sub-Routes */}
                        <Route path="/evaluations/:id" element={<EvaluationWorkspacePage />} />
                        <Route path="/evaluations/:id/:tab" element={<EvaluationWorkspacePage />} />

                        {/* System Settings */}
                        <Route path="/settings" element={<SettingsPage />} />

                        {/* Admin Observability & Governance */}
                        <Route path="/admin" element={<AdminDashboardPage />} />

                        {/* 404 Not Found Fallback */}
                        <Route
                          path="*"
                          element={
                            <div className="py-16 text-center">
                              <EmptyState
                                icon={AlertCircle}
                                title="Route Not Found"
                                description="The evaluation workspace or path you requested does not exist or has been archived."
                                actionLabel="Return to Command Center"
                                onAction={() => { window.location.href = '/dashboard'; }}
                              />
                            </div>
                          }
                        />
                      </Routes>
                    </AppShell>
                  }
                />
              </Routes>
            </BrowserRouter>
          </ApiAlertProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
