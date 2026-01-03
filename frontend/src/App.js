import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Organizations from './pages/Organizations';
import Collection from './pages/esg/Collection';
import Analytics from './pages/esg/Analytics';
import Actions from './pages/esg/Actions';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layout/Dashboard';

function App() {
  return (
    <Routes>
      {/* Rutas de autenticación sin layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<div>Register Page</div>} />

      {/* Rutas con DashboardLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="organizations" element={<Organizations />} />
        <Route path="esg/collection" element={<Collection />} />
        <Route path="esg/analytics" element={<Analytics />} />
        <Route path="esg/actions" element={<Actions />} />
        <Route path="users" element={<div>Users Page</div>} />
        <Route path="settings" element={<div>Settings Page</div>} />
      </Route>
    </Routes>
  );
}

export default App;