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
import ESGOverview from './pages/esg/Overview';
import Analytics from './pages/esg/Analytics';
import Actions from './pages/esg/Actions';
import CarbonCollection from './pages/carbon/Collection';
import CarbonAnalytics from './pages/carbon/Analytics';
import CarbonConfig from './pages/carbon/Config';
import SaasLanding from './pages/SaasLanding';
import Landing from './pages/LandingYC';

import Register from './pages/Register';
import MisAgentes from './pages/MisAgentes';
import Onboarding from './pages/Onboarding';
import Integraciones from './pages/inventario/Integraciones';
import Facturas from './pages/inventario/Facturas';
import Normativas from './pages/inventario/Normativas';
import DashboardMain from './pages/DashboardMain';
import Recursos from './pages/Recursos';


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

        {/* Landing page principal */}
        <Route path="/" element={<Landing />}/>

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
        <Route path="esg/overview" element={<ESGOverview />} />
        <Route path="esg/analytics" element={<Analytics />} />
        <Route path="esg/actions" element={<Actions />} />
        <Route path="carbon/collection" element={<CarbonCollection />} />
        <Route path="carbon/analytics" element={<CarbonAnalytics />} />
        <Route path="carbon/config" element={<CarbonConfig />} />
        <Route path="agentes-ia" element={<MisAgentes />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="inventario/integraciones" element={<Integraciones />} />
        <Route path="inventario/facturas" element={<Facturas />} />
        <Route path="inventario/normativas" element={<Normativas />} />
        <Route path="dashboard" element={<DashboardMain />} />
        <Route path="recursos" element={<Recursos />} />
    
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