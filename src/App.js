import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { isAuthenticated, isSessionExpired, clearUserSession, getUserData } from './utils/auth';
import Signup from './pages/Signup';
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProfileView from './pages/ProfileView';
import CompleteProfile from './pages/CompleteProfile';
import PendingVerification from './pages/PendingVerification';

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

// Commission
import CommissionConfiguration from './pages/commission/CommissionConfiguration';
import CommissionManagement from './pages/commission/CommissionManagement';

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
  const authenticated = isAuthenticated();
  const userData = getUserData();
  
  // Check if session has expired
  if (!authenticated || isSessionExpired()) {
    // Session expired or invalid, clear and redirect
    clearUserSession();
    return <Navigate to="/" replace />;
  }
  
  // Check user verification and profile completion status
  if (authenticated && userData) {
    // Check if profile is complete (has RegisteredCompanyName - main required field)
    const hasCompanyDetails = userData.companyDetails && 
                              userData.companyDetails.RegisteredCompanyName;
    const currentPath = window.location.pathname;
    
    // Handle complete-profile page
    if (currentPath === '/complete-profile') {
      // If profile is already complete and verified, redirect to dashboard
      if (hasCompanyDetails && userData.isVerified) {
        return <Navigate to="/dashboard" replace />;
      }
      // If profile is complete but not verified, redirect to pending-verification
      if (hasCompanyDetails && !userData.isVerified) {
        return <Navigate to="/pending-verification" replace />;
      }
      // Profile not complete - allow access to complete-profile
      return children;
    }
    
    // Handle pending-verification page
    if (currentPath === '/pending-verification') {
      // If profile is not complete, redirect to complete-profile
      if (!hasCompanyDetails) {
        return <Navigate to="/complete-profile" replace />;
      }
      // If already verified, redirect to dashboard
      if (hasCompanyDetails && userData.isVerified) {
        return <Navigate to="/dashboard" replace />;
      }
      // Profile complete but not verified - allow access to pending-verification
      return children;
    }
    
    // For all other protected routes:
    // If profile not complete, redirect to complete-profile
    if (!hasCompanyDetails) {
      return <Navigate to="/complete-profile" replace />;
    }
    
    // If profile complete but not verified by admin, redirect to pending-verification
    if (hasCompanyDetails && !userData.isVerified) {
      return <Navigate to="/pending-verification" replace />;
    }
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        
        {/* Complete Profile */}
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          }
        />

        {/* Pending Verification */}
        <Route
          path="/pending-verification"
          element={
            <ProtectedRoute>
              <PendingVerification />
            </ProtectedRoute>
          }
        />
        
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

        {/* Commission Routes */}
        <Route
          path="/commission/configure"
          element={
            <ProtectedRoute>
              <CommissionConfiguration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/commission/management"
          element={
            <ProtectedRoute>
              <CommissionManagement />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
