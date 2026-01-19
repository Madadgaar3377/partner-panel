/**
 * Authentication Utility Functions
 * Centralized auth logic for token management, session handling, and user data
 */

// Constants
const SESSION_DURATION_DAYS = 20; // Session expires after 20 days
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Save user session to localStorage
 * @param {string} token - JWT token from backend
 * @param {object} user - User data object
 */
export const saveUserSession = (token, user) => {
  const loginTime = new Date();
  const expirationTime = new Date(loginTime.getTime() + SESSION_DURATION_MS);
  
  localStorage.setItem('userToken', token || '');
  localStorage.setItem('userData', JSON.stringify(user || {}));
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('loginTime', loginTime.toISOString());
  localStorage.setItem('loginExpiration', expirationTime.toISOString());
  
  console.log(`Session saved. Expires in ${SESSION_DURATION_DAYS} days (${expirationTime.toLocaleString()})`);
};

/**
 * Get user token from localStorage
 * @returns {string|null} - JWT token or null
 */
export const getToken = () => {
  return localStorage.getItem('userToken');
};

/**
 * Get user data from localStorage
 * @returns {object|null} - User data object or null
 */
export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  try {
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated and session is valid
 */
export const isAuthenticated = () => {
  const authFlag = localStorage.getItem('isAuthenticated') === 'true';
  const token = getToken();
  
  if (!authFlag || !token) {
    return false;
  }
  
  // Check if session has expired
  return !isSessionExpired();
};

/**
 * Check if session has expired
 * @returns {boolean} - True if session expired
 */
export const isSessionExpired = () => {
  const expirationTime = localStorage.getItem('loginExpiration');
  
  if (!expirationTime) {
    return true; // No expiration time means session is invalid
  }
  
  const expirationDate = new Date(expirationTime);
  const currentDate = new Date();
  
  return currentDate > expirationDate;
};

/**
 * Get remaining session time
 * @returns {object} - Object with days, hours, minutes remaining
 */
export const getRemainingSessionTime = () => {
  const expirationTime = localStorage.getItem('loginExpiration');
  
  if (!expirationTime) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }
  
  const expirationDate = new Date(expirationTime);
  const currentDate = new Date();
  const remainingMs = expirationDate - currentDate;
  
  if (remainingMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }
  
  const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  
  return { days, hours, minutes, expired: false };
};

/**
 * Extend user session (refresh expiration time)
 * Call this on user activity to keep session alive
 */
export const extendSession = () => {
  const currentExpiration = localStorage.getItem('loginExpiration');
  
  if (!currentExpiration) {
    console.warn('No active session to extend');
    return false;
  }
  
  const newExpirationTime = new Date(Date.now() + SESSION_DURATION_MS);
  localStorage.setItem('loginExpiration', newExpirationTime.toISOString());
  
  console.log(`Session extended. New expiration: ${newExpirationTime.toLocaleString()}`);
  return true;
};

/**
 * Clear user session (logout)
 */
export const clearUserSession = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('loginTime');
  localStorage.removeItem('loginExpiration');
  
  console.log('Session cleared');
};

/**
 * Update user data in localStorage
 * @param {object} newUserData - Updated user data
 */
export const updateUserData = (newUserData) => {
  const currentData = getUserData();
  const updatedData = { ...currentData, ...newUserData };
  localStorage.setItem('userData', JSON.stringify(updatedData));
};

/**
 * Get authorization header for API calls
 * @returns {object} - Headers object with Authorization
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Check if user has specific access permission
 * @param {string} accessType - Type of access (e.g., 'Property', 'Loan', 'Installments', 'Insurance')
 * @returns {boolean} - True if user has access
 */
export const hasAccess = (accessType) => {
  const userData = getUserData();
  return userData?.userAccess?.includes(accessType) || false;
};

/**
 * Get user's full access list
 * @returns {array} - Array of access permissions
 */
export const getUserAccess = () => {
  const userData = getUserData();
  return userData?.userAccess || [];
};

/**
 * Get session info for debugging/display
 * @returns {object} - Session information
 */
export const getSessionInfo = () => {
  const loginTime = localStorage.getItem('loginTime');
  const expirationTime = localStorage.getItem('loginExpiration');
  const remaining = getRemainingSessionTime();
  
  return {
    isActive: isAuthenticated(),
    loginTime: loginTime ? new Date(loginTime).toLocaleString() : null,
    expirationTime: expirationTime ? new Date(expirationTime).toLocaleString() : null,
    remainingDays: remaining.days,
    remainingHours: remaining.hours,
    remainingMinutes: remaining.minutes,
    isExpired: remaining.expired,
    sessionDurationDays: SESSION_DURATION_DAYS
  };
};
