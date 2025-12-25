import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProfileView from './pages/ProfileView';

// Installments
import InstallmentsList from './pages/installments/InstallmentsList';
import CreateInstallmentPlan from './pages/installments/CreateInstallmentPlan';
import EditInstallmentPlan from './pages/installments/EditInstallmentPlan';
import InstallmentRequests from './pages/installments/InstallmentRequests';
import InstallmentDetail from './pages/installments/InstallmentDetail';

// Property
import PropertyList from './pages/property/PropertyList';
import CreateProperty from './pages/property/CreateProperty';

// Loans
import LoansList from './pages/loans/LoansList';

// Insurance
import InsuranceList from './pages/insurance/InsuranceList';

// Auth Page Component (handles login/signup toggle)
const AuthPage = () => {
  const [showLogin, setShowLogin] = useState(true);

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return showLogin ? (
    <Login onToggleForm={toggleForm} />
  ) : (
    <Signup onToggleForm={toggleForm} />
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        
        {/* Dashboard & Profile */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Installments Routes */}
        <Route
          path="/installments"
          element={
            <ProtectedRoute>
              <InstallmentsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/installments/create"
          element={
            <ProtectedRoute>
              <CreateInstallmentPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/installments/edit/:id"
          element={
            <ProtectedRoute>
              <EditInstallmentPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/installments/requests"
          element={
            <ProtectedRoute>
              <InstallmentRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/installments/view/:id"
          element={
            <ProtectedRoute>
              <InstallmentDetail />
            </ProtectedRoute>
          }
        />

        {/* Property Routes */}
        <Route
          path="/property"
          element={
            <ProtectedRoute>
              <PropertyList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/property/create"
          element={
            <ProtectedRoute>
              <CreateProperty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/property/applications"
          element={
            <ProtectedRoute>
              <PropertyList />
            </ProtectedRoute>
          }
        />

        {/* Loans Routes */}
        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <LoansList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans/create"
          element={
            <ProtectedRoute>
              <LoansList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans/applications"
          element={
            <ProtectedRoute>
              <LoansList />
            </ProtectedRoute>
          }
        />

        {/* Insurance Routes */}
        <Route
          path="/insurance"
          element={
            <ProtectedRoute>
              <InsuranceList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insurance/create"
          element={
            <ProtectedRoute>
              <InsuranceList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insurance/claims"
          element={
            <ProtectedRoute>
              <InsuranceList />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
