# 🔐 Madadgaar Partner Portal - Authentication System

## Overview
Your authentication system now stores user sessions for **20 days** without requiring re-login. The system uses localStorage for persistent storage and JWT tokens for API authentication.

---

## 📁 File Structure

```
src/
├── utils/
│   └── auth.js                    # ✅ NEW - Centralized auth utilities
├── pages/
│   └── Login.jsx                  # ✅ UPDATED - Uses auth utilities
├── components/
│   └── Navbar.jsx                 # ✅ UPDATED - Uses auth utilities
├── App.js                         # ✅ UPDATED - Uses auth utilities
└── pages/property/
    └── CreateProperty.jsx         # ✅ UPDATED - Uses auth utilities
```

---

## 🔄 Authentication Flow

### 1. **User Login** (Login.jsx)
```javascript
// When user logs in successfully:
import { saveUserSession } from '../utils/auth';

saveUserSession(token, userData);
// ✅ Automatically stores:
//    - userToken (JWT)
//    - userData (user object)
//    - isAuthenticated (true)
//    - loginTime (timestamp)
//    - loginExpiration (20 days from now)
```

### 2. **Session Validation** (App.js - ProtectedRoute)
```javascript
import { isAuthenticated, isSessionExpired, clearUserSession } from './utils/auth';

// Every protected route automatically checks:
const authenticated = isAuthenticated();  // ✅ Checks if user is logged in
const expired = isSessionExpired();       // ✅ Checks if 20 days passed

if (!authenticated || expired) {
  clearUserSession();                     // ✅ Auto logout
  redirect('/');                          // ✅ Back to login
}
```

### 3. **API Calls** (CreateProperty.jsx and others)
```javascript
import { getAuthHeaders } from '../../utils/auth';

fetch(`${apiUrl}/endpoint`, {
  method: 'POST',
  headers: getAuthHeaders(),  // ✅ Automatically includes Authorization: Bearer {token}
  body: JSON.stringify(data)
});
```

### 4. **User Logout** (Navbar.jsx)
```javascript
import { clearUserSession } from '../utils/auth';

const handleLogout = () => {
  clearUserSession();  // ✅ Clears all auth data
  navigate('/');
};
```

---

## 🛠️ Available Utility Functions

### **auth.js** - Complete API Reference

#### Session Management
```javascript
import { 
  saveUserSession,     // Save login session
  clearUserSession,    // Logout user
  isAuthenticated,     // Check if logged in
  isSessionExpired,    // Check if session expired
  extendSession        // Extend session by 20 days
} from './utils/auth';

// Example: Extend session on user activity
document.addEventListener('click', () => {
  extendSession(); // Reset 20-day timer
});
```

#### User Data
```javascript
import { 
  getUserData,        // Get user object
  updateUserData,     // Update user data
  getToken           // Get JWT token
} from './utils/auth';

// Example: Get user info
const user = getUserData();
console.log(user.name, user.email);

// Example: Update user profile
updateUserData({ profilePic: 'new-url.jpg' });
```

#### Session Info
```javascript
import { 
  getRemainingSessionTime,  // Time left before expiration
  getSessionInfo            // Complete session details
} from './utils/auth';

// Example: Show session expiry warning
const remaining = getRemainingSessionTime();
if (remaining.days < 3) {
  alert(`Session expires in ${remaining.days} days`);
}

// Example: Debug session
console.log(getSessionInfo());
// Output:
// {
//   isActive: true,
//   loginTime: "1/19/2026, 10:30:00 AM",
//   expirationTime: "2/8/2026, 10:30:00 AM",
//   remainingDays: 18,
//   remainingHours: 5,
//   remainingMinutes: 23,
//   isExpired: false,
//   sessionDurationDays: 20
// }
```

#### Permissions
```javascript
import { 
  hasAccess,          // Check specific permission
  getUserAccess       // Get all permissions
} from './utils/auth';

// Example: Check if user can access Property module
if (hasAccess('Property')) {
  // Show property features
}

// Example: Get all access
const permissions = getUserAccess();
// ['Property', 'Loan', 'Installments']
```

#### API Headers
```javascript
import { getAuthHeaders } from './utils/auth';

// Example: Make authenticated API call
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: getAuthHeaders(),  // ✅ Includes Authorization header
  body: JSON.stringify(data)
});
```

---

## ⚙️ Configuration

### Change Session Duration
Edit `src/utils/auth.js`:

```javascript
// Line 7-8
const SESSION_DURATION_DAYS = 20; // Change to 30, 60, 90, etc.
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;
```

**Examples:**
- 7 days: `SESSION_DURATION_DAYS = 7`
- 30 days: `SESSION_DURATION_DAYS = 30`
- 90 days: `SESSION_DURATION_DAYS = 90`
- 1 year: `SESSION_DURATION_DAYS = 365`

---

## 🔒 Security Features

### ✅ **Automatic Session Expiration**
- Sessions automatically expire after **20 days**
- User is redirected to login page
- All auth data is cleared

### ✅ **Token-Based Authentication**
- JWT tokens sent with every API request
- Backend validates tokens
- Frontend never exposes sensitive data

### ✅ **Protected Routes**
- All dashboard routes require authentication
- Expired sessions redirect to login
- Profile completion checks enforce workflow

### ✅ **Secure Storage**
- Uses localStorage for persistence
- Data survives browser refresh
- Cleared on logout or expiration

---

## 📊 Session Lifecycle

```
┌─────────────┐
│   Login     │  User enters credentials
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Save Session│  saveUserSession(token, user)
│ (20 days)   │  Store in localStorage
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Active Session              │
│  ┌─────────────────────────────┐   │
│  │  User can access all pages  │   │
│  │  API calls include token    │   │
│  │  Session auto-checked       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Optional: extendSession()          │
│  (Reset 20-day timer)               │
└──────┬──────────────────────────────┘
       │
       ├──▶ User clicks Logout ──▶ clearUserSession() ──▶ Login Page
       │
       └──▶ 20 Days Pass ──▶ isSessionExpired() = true ──▶ Auto Logout ──▶ Login Page
```

---

## 🚀 Best Practices

### ✅ **DO**
- Use `getAuthHeaders()` for all API calls
- Use `getUserData()` instead of parsing localStorage
- Use `clearUserSession()` for logout
- Check `isAuthenticated()` before sensitive operations
- Use `extendSession()` on user activity if you want "remember me forever"

### ❌ **DON'T**
- Don't access localStorage directly
- Don't hardcode token headers
- Don't forget to check session expiration
- Don't store passwords in localStorage
- Don't share tokens between users

---

## 🧪 Testing Session Expiration

### Method 1: Manual Testing
```javascript
// In browser console:
localStorage.setItem('loginExpiration', new Date().toISOString());
// Refresh page - should auto-logout
```

### Method 2: Temporary Short Duration
```javascript
// In auth.js (FOR TESTING ONLY):
const SESSION_DURATION_DAYS = 0.001; // ~1.5 minutes
```

---

## 📱 User Experience

### Current Session: **20 Days**
- ✅ Users stay logged in for 20 days
- ✅ No interruption to workflow
- ✅ Automatic re-login on expiration
- ✅ Session survives browser restart
- ✅ Works across all tabs

### Example Timeline:
```
Day 1:  Login ✅
Day 5:  Still logged in ✅
Day 10: Still logged in ✅
Day 15: Still logged in ✅
Day 20: Still logged in ✅
Day 21: Auto-logout ⚠️ (20 days expired)
```

---

## 🔧 Troubleshooting

### Issue: User logged out unexpectedly
**Causes:**
1. 20 days passed
2. User cleared browser data
3. User logged out manually
4. localStorage was cleared

**Solution:**
- Check session expiration in browser console:
```javascript
console.log(getSessionInfo());
```

### Issue: "Unauthorized" API errors
**Causes:**
1. Token expired
2. Token not sent in headers
3. Backend token validation failed

**Solution:**
- Verify token exists:
```javascript
import { getToken } from './utils/auth';
console.log(getToken());
```

---

## 📝 Changelog

### v2.0 (Current) - January 2026
- ✅ Centralized auth utilities in `src/utils/auth.js`
- ✅ Session duration: **15 days → 20 days**
- ✅ Updated Login.jsx to use utilities
- ✅ Updated App.js ProtectedRoute to use utilities
- ✅ Updated Navbar.jsx to use utilities
- ✅ Updated CreateProperty.jsx to use utilities
- ✅ Added session extension feature
- ✅ Added permission checking functions
- ✅ Added comprehensive session info logging

### v1.0 (Previous)
- Manual localStorage management
- 15-day session duration
- Scattered auth logic across files

---

## 🎯 Future Enhancements

### Optional Improvements:
1. **Refresh Token Flow** - Automatically refresh tokens before expiration
2. **Remember Me Checkbox** - Let users choose session duration
3. **Session Activity Tracking** - Auto-extend on user activity
4. **Multi-Device Management** - Track active sessions across devices
5. **Biometric Auth** - Face ID / Fingerprint support

---

## 📞 Support

For authentication issues, check:
1. Browser console for errors
2. Network tab for API responses
3. localStorage data (`F12 → Application → Local Storage`)

---

**Last Updated:** January 19, 2026
**Version:** 2.0
**Session Duration:** 20 Days
**Security:** JWT Token + localStorage
