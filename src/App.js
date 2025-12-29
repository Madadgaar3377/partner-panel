import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
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
import EditProperty from './pages/property/EditProperty';
import PropertyDetail from './pages/property/PropertyDetail';

// Loans
import LoansList from './pages/loans/LoansList';
import CreateLoan from './pages/loans/CreateLoan';
import EditLoan from './pages/loans/EditLoan';
import LoanDetail from './pages/loans/LoanDetail';

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
  const loginExpiration = localStorage.getItem('loginExpiration');
  
  // If authenticated but no expiration (old session), force re-login
  if (isAuthenticated && !loginExpiration) {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginTime');
    return <Navigate to="/" replace />;
  }
  
  // Check if login has expired
  if (isAuthenticated && loginExpiration) {
    const expirationDate = new Date(loginExpiration);
    const currentDate = new Date();
    
    if (currentDate > expirationDate) {
      // Session expired, clear localStorage
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('loginExpiration');
      return <Navigate to="/" replace />;
    }
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
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
          path="/property/edit/:id"
          element={
            <ProtectedRoute>
              <EditProperty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/property/view/:id"
          element={
            <ProtectedRoute>
              <PropertyDetail />
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
              <CreateLoan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans/edit/:id"
          element={
            <ProtectedRoute>
              <EditLoan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans/view/:id"
          element={
            <ProtectedRoute>
              <LoanDetail />
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
