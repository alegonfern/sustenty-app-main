import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Organizations from './pages/Organizations';
import Teams from './pages/Teams';
import TeamMembers from './pages/TeamMembers';
import Collection from './pages/esg/Collection';
import Analytics from './pages/esg/Analytics';
import Actions from './pages/esg/Actions';
import EmissionFactors from './pages/esg/EmissionFactors';
import Scopes from './pages/esg/Scopes';
import Periods from './pages/esg/Periods';
import ESGConfig from './pages/esg/Config';
import SaasLanding from './pages/SaasLanding';

import Register from './pages/Register';


// Compliance Module
import {
  ComplianceDashboard,
  ComplianceDocuments,
  ComplianceAnalyses,
  ComplianceAnalysisDetail,
  ComplianceGaps,
  ComplianceReports
} from './pages/compliance';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layout/Dashboard';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Routes>
      {/* Rutas de autenticación sin layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/register" element={<Register />} />

        {/* Placeholder for landing page if needed */}
        <Route path="/" element={<div>Landing page placeholder</div>}/>

      {/* Rutas protegidas bajo /app */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
        <Route path="profile" element={<Profile />} />
        <Route path="organizations" element={<Organizations />} />
        <Route path="esg/collection" element={<Collection />} />
        <Route path="esg/analytics" element={<Analytics />} />
        <Route path="esg/actions" element={<Actions />} />
        <Route path="esg/emission-factors" element={<EmissionFactors />} />
        <Route path="esg/scopes" element={<Scopes />} />
        <Route path="esg/periods" element={<Periods />} />
        <Route path="esg/config" element={<ESGConfig />} />
        {/* Compliance Routes */}
        <Route path="compliance" element={<ComplianceDashboard />} />
        <Route path="compliance/dashboard" element={<ComplianceDashboard />} />
        <Route path="compliance/documents" element={<ComplianceDocuments />} />
        <Route path="compliance/analyses" element={<ComplianceAnalyses />} />
        <Route path="compliance/analyses/:id" element={<ComplianceAnalysisDetail />} />
        <Route path="compliance/gaps" element={<ComplianceGaps />} />
        <Route path="compliance/reports" element={<ComplianceReports />} />
        <Route path="team/teams" element={<Teams />} />
        <Route path="team/members" element={<TeamMembers />} />
        <Route path="settings" element={<Settings />} />
        <Route path="ayuda" element={<Help />} />
      </Route>
    </Routes>
    
    {/* Botón flotante de WhatsApp (visible en toda la app después de login) */}
    <FloatingWhatsApp />
    </AppProvider>
  );
}

  export default App;