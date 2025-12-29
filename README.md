# 🏢 Madadgaar Partner Portal 


<div align="center">

![Madadgaar Logo](https://img.shields.io/badge/Madadgaar-Partner%20Portal-dc2626?style=for-the-badge&logo=react&logoColor=white)

**A modern, feature-rich partner management system with advanced analytics and secure authentication**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.19-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React%20Router-6.20.0-CA4245?logo=react-router)](https://reactrouter.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.10.3-8B5CF6?logo=chart.js)](https://recharts.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Screenshots](#-screenshots) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Quick Start](#-quick-start)
- [Installation Guide](#-installation-guide)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Authentication System](#-authentication-system)
- [Dashboard Analytics](#-dashboard-analytics)
- [Installment Management](#-installment-management)
- [User Management](#-user-management)
- [Security Features](#-security-features)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🎯 Overview

The **Madadgaar Partner Portal** is a comprehensive web application designed for partners to manage their business operations including installment plans, property listings, loans, and insurance services. Built with modern React and featuring advanced analytics, the portal provides a seamless experience for partners to track their performance and manage customer applications.

### 🌟 Why Madadgaar Partner Portal?

- ✅ **Modern UI/UX** - Beautiful, responsive design with glass morphism effects
- ✅ **Advanced Analytics** - Real-time charts and performance tracking
- ✅ **Secure Authentication** - 15-day session management with JWT tokens
- ✅ **Permission-Based Access** - Dynamic UI based on user permissions
- ✅ **Complete CRUD Operations** - Full management of installments and applications
- ✅ **Professional Dashboard** - Multiple chart types for data visualization
- ✅ **Mobile Responsive** - Works seamlessly on all devices
- ✅ **Fast Performance** - Optimized React components and lazy loading

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Secure Login/Signup** - Email and password authentication
- **Forgot Password** - OTP-based password recovery system
  - Request OTP via email
  - Verify OTP and set new password
  - Auto-redirect after successful reset
- **JWT Token Management** - Secure token-based authentication
- **15-Day Session** - Automatic session expiration after 15 days
- **Protected Routes** - Route guards for authenticated access
- **Account Verification** - Admin approval system for new partners
- **Session Tracking** - Login time and expiration display
- **Auto-Logout** - Automatic logout on session expiration

### 📊 Advanced Dashboard
- **Real-Time Statistics** - Live data from backend APIs
- **Multiple Chart Types**:
  - 📈 **Area Chart** - Monthly performance trends
  - 🥧 **Pie Chart** - Status distribution overview
  - 📊 **Bar Chart** - Performance vs target comparison
- **Growth Indicators** - Percentage changes with visual arrows
- **Interactive Cards** - Clickable stat cards with hover effects
- **User Access Filtering** - Shows only relevant data based on permissions
- **Recent Activity Feed** - Latest installments and properties

### 💼 Installment Management
- **Create Plans** - Multi-step form for creating installment plans
- **Product Categories** - Support for phones, bikes, A/C, and more
- **Payment Plans** - Multiple payment options with calculations:
  - Flat Rate
  - Reducing Balance
  - Profit-Based
- **Image Gallery** - Multi-image upload for products
- **Detailed View** - Complete plan information with specifications
- **Edit & Delete** - Full CRUD operations
- **Application Tracking** - View and manage customer applications
- **Status Management** - Approve, reject, or update application status

### 🏠 Property Management
- **Property Listings** - Comprehensive real estate management
- **6-Step Creation** - Detailed property information collection:
  - Basic Information (type, purpose, area)
  - Pricing & Location (GPS coordinates, installments)
  - Features & Layout (rooms, floors, amenities)
  - Community Amenities (gym, pool, mosque, etc.)
  - Images & Marketing (gallery, descriptions)
  - Contact Information
- **Property Types** - House, Flat, Residential Plot, Commercial Plot, Agricultural Land
- **Purpose Options** - For Sale, For Rent, On Installment
- **Advanced Filtering** - Search by type, purpose, location
- **Image Gallery** - Multiple images with carousel navigation
- **Detailed Views** - Complete property specifications
- **Location Tracking** - Latitude/longitude coordinates
- **Nearby Facilities** - Schools, hospitals, shopping malls, transport
- **Full CRUD** - Create, read, update, delete operations

### 💰 Loan Management
- **Loan Applications** - Comprehensive loan application system
- **Multi-Step Forms** - 4-5 step application process based on employment type
- **Loan Types** - Personal, Business, Home, Car, Education, Startup
- **Employment Categories** - Salaried, Self-Employed, Startup, Business Owner
- **Dynamic Fields** - Form adapts to employment type selection
- **Startup Support** - Specialized fields for startup loan applications
- **Document Upload** - Multiple document attachments
- **Application Tracking** - Status monitoring and verification
- **Advanced Filtering** - Search by name, loan type, employment type
- **80+ Fields** - Comprehensive applicant information collection
- **Full CRUD** - Create, read, update, delete loan applications

### 👤 User Management
- **Profile View** - Comprehensive user information display
- **Profile Update** - Edit personal information and profile picture
- **Access Control** - Manage user access areas
- **Image Upload** - Profile picture and ID card upload
- **Contact Information** - Phone, WhatsApp, email management
- **Address Management** - Complete address storage
- **Wallet Balance** - Financial information display

### 🎨 UI/UX Features
- **Glass Morphism** - Frosted glass effects with backdrop blur
- **Animated Backgrounds** - Floating gradient orbs for depth
- **Gradient Text** - Eye-catching headings with color gradients
- **6-Block OTP** - Professional verification interface
- **Enhanced Buttons** - Scale and transform animations
- **Modern Inputs** - Rounded corners, focus rings, hover states
- **Custom Scrollbar** - Styled scrollbar with gradient theme
- **Smooth Animations** - Fade, slide, scale, bounce, and shake effects
- **Loading States** - Skeleton loaders and animated spinners
- **Error Handling** - Shake animations with friendly messages
- **Success Feedback** - Bounce-in animations and toast notifications
- **Hover Effects** - Lift, scale, and color transitions
- **Shadow Layers** - Multi-level shadows for depth
- **Typography** - Bold gradient headings throughout
- **Responsive Design** - Mobile-first, adaptive layouts
- **Performance** - Optimized animations and transitions

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14.0 or higher
- **npm** v6.0 or higher
- **Backend API** running at `https://api.madadgaar.com.pk/api`

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd partner-panel

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

---

## 🆕 Latest Updates (v0.1.5) - Enhanced UI/UX

### Major Design Overhaul
- ✅ **Glassmorphism Effects** - Frosted glass navbar with backdrop blur
- ✅ **Gradient Backgrounds** - Animated floating orbs on auth pages
- ✅ **Enhanced Typography** - Bold gradients on headings and logos
- ✅ **Modern Inputs** - Rounded corners, hover effects, focus states
- ✅ **6-Block OTP** - Professional OTP input interface
- ✅ **Smooth Animations** - Scale, fade, and slide animations throughout
- ✅ **Better Buttons** - Transform effects and enhanced shadows
- ✅ **Professional Polish** - Consistent design language
- ✅ **Mobile Optimized** - Enhanced responsive experience
- ✅ **Performance** - Optimized transitions and animations

## 📦 Installation Guide

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd partner-panel
```

### Step 2: Install Dependencies

```bash
# Remove old dependencies (if any)
rm -rf node_modules package-lock.json

# Install fresh dependencies
npm install
```

### Step 3: Configure API

Update `src/constants/apiUrl.js` with your backend API URL:

```javascript
const baseApi = 'https://api.madadgaar.com.pk/api';
export default baseApi;
```

### Step 4: Add Logo

Place your logo at `public/madadgaar-logo.jpg`

### Step 5: Run Development Server

```bash
npm start
```

---

## 📁 Project Structure

```
partner-panel/
├── public/
│   ├── index.html              # HTML template
│   ├── manifest.json           # PWA manifest
│   └── madadgaar-logo.jpg      # Company logo
├── src/
│   ├── components/
│   │   └── Navbar.jsx          # Dynamic navigation component
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Signup.jsx          # Registration page
│   │   ├── ForgetPassword.jsx  # Forgot password (OTP request)
│   │   ├── ResetPassword.jsx   # Reset password with OTP
│   │   ├── Dashboard.jsx       # Analytics dashboard
│   │   ├── Profile.jsx         # Profile edit page
│   │   ├── ProfileView.jsx     # Profile view page
│   │   ├── installments/
│   │   │   ├── InstallmentsList.jsx        # List all plans
│   │   │   ├── CreateInstallmentPlan.jsx   # Create new plan
│   │   │   ├── EditInstallmentPlan.jsx     # Edit existing plan
│   │   │   ├── InstallmentDetail.jsx       # View plan details
│   │   │   └── InstallmentRequests.jsx     # Manage applications
│   │   ├── property/
│   │   │   ├── PropertyList.jsx           # List all properties
│   │   │   ├── CreateProperty.jsx         # Create new property
│   │   │   ├── EditProperty.jsx           # Edit existing property
│   │   │   └── PropertyDetail.jsx         # View property details
│   │   ├── loans/
│   │   │   ├── LoansList.jsx              # List all loan applications
│   │   │   ├── CreateLoan.jsx             # Create new loan application
│   │   │   ├── EditLoan.jsx               # Edit existing loan
│   │   │   └── LoanDetail.jsx             # View loan details
│   │   └── insurance/
│   │       └── InsuranceList.jsx          # Insurance management (placeholder)
│   ├── constants/
│   │   └── apiUrl.js           # API configuration
│   ├── App.js                  # Main app with routing
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
└── README.md                   # This file
```

---

## 🔌 API Integration

### Base URL
```javascript
https://api.madadgaar.com.pk/api
```

### Authentication Endpoints

#### Login
```http
POST /login
Content-Type: application/json

{
  "email": "partner@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Signup
```http
POST /signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "partner@example.com",
  "password": "password123",
  "phoneNumber": "03XX-XXXXXXX",
  "WhatsappNumber": "03XX-XXXXXXX",
  "cnicNumber": "XXXXX-XXXXXXX-X",
  "Address": "Complete address",
  "userType": "partner",
  "userAccess": ["Installments", "Property"]
}
```

#### Forgot Password (Request OTP)
```http
POST https://api.madadgaar.com.pk/api/forgetPassword
Content-Type: application/json

{
  "email": "partner@example.com"
}

Response:
{
  "success": true,
  "message": "OTP sent to your email"
}
```

#### Reset Password (Verify OTP & Set New Password)
```http
POST https://api.madadgaar.com.pk/api/newPassword
Content-Type: application/json

{
  "email": "partner@example.com",
  "otp": "542505",
  "newPassword": "newpassword123"
}

Response:
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Dashboard Endpoints

#### Get Dashboard Data
```http
GET /partnerDashboard
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "stats": {
      "totalInstallments": 25,
      "totalInstallmentRequests": 45,
      "totalProperties": 12,
      "totalPropertyApplications": 30
    },
    "recent": {
      "recentInstallments": [...],
      "recentProperties": [...]
    }
  }
}
```

### User Management Endpoints

#### Get User Profile
```http
GET /getUserById
Authorization: Bearer {token}

Response:
{
  "success": true,
  "user": { ... }
}
```

#### Update User Profile
```http
PUT /updateUser
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "userName": "username",
  "phoneNumber": "03XX-XXXXXXX",
  ...
}
```

#### Upload Image
```http
POST /upload-image
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  image: <file>

Response:
{
  "success": true,
  "imageUrl": "https://..."
}
```

### Installment Management Endpoints

#### Get All Installments
```http
GET /getAllCreateInstallnment
Authorization: Bearer {token}
```

#### Get Installment Requests
```http
GET /getAllRequestInstallments
Authorization: Bearer {token}
```

#### Update Installment
```http
PUT /updateInstallment/:id
Authorization: Bearer {token}
Content-Type: application/json
```

#### Delete Installment
```http
DELETE /deleteInstallment/:id
Authorization: Bearer {token}
```

### Property Management Endpoints

#### Get All Properties
```http
GET /getAllProperties
Authorization: Bearer {token}

Response:
{
  "success": true,
  "properties": [...]
}
```

#### Create Property
```http
POST /createProperty
Authorization: Bearer {token}
Content-Type: application/json

{
  "data": {
    "userId": "...",
    "name": "Property Name",
    "purpose": "For Sale",
    "typeOfProperty": "House",
    "price": 5000000,
    "address": "Complete address",
    ...
  }
}
```

#### Get Single Property
```http
GET /getProperty/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "property": { ... }
}
```

#### Update Property
```http
PUT /updateProperty
Authorization: Bearer {token}
Content-Type: application/json

{
  "data": {
    "_id": "property_id",
    ...updated fields
  }
}
```

#### Delete Property
```http
DELETE /deleteProperty/:id
Authorization: Bearer {token}
```

#### Get Application Details
```http
GET /getApplication/:applicationId
Authorization: Bearer {token}
```

#### Update Application Status
```http
PUT /updateApplicationStatus
Authorization: Bearer {token}
Content-Type: application/json

{
  "applicationId": "...",
  "status": "approved",
  "note": "Approved by partner"
}
```

### Loan Management Endpoints

#### Get All Loans
```http
GET /getAllLoans
Authorization: Bearer {token}

Response:
{
  "success": true,
  "loans": [...]
}
```

#### Create Loan Application
```http
POST /createLoanPlan
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-01-15",
  "loanType": "Personal Loan",
  "employmentType": "Salaried",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+92 300 1234567",
  "city": "Karachi",
  "netSalary": "50000",
  "age": "30",
  "qualification": "Bachelor's",
  ...
}
```

#### Update Loan
```http
PUT /updateLoan/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  ...updated fields
}
```

#### Delete Loan
```http
DELETE /deleteLoan/:id
Authorization: Bearer {token}
```

---

## 🔒 Authentication System

### Login Flow

1. User enters email and password
2. System validates credentials with backend
3. Backend returns JWT token and user data
4. System checks `isVerified` status
5. If verified, store token and user data in localStorage
6. Calculate 15-day expiration timestamp
7. Redirect to dashboard

### Session Management

- **Duration**: 15 days from login
- **Storage**: localStorage
- **Keys**:
  - `userToken` - JWT authentication token
  - `userData` - User information (JSON)
  - `isAuthenticated` - Boolean flag
  - `loginTime` - Login timestamp (ISO)
  - `loginExpiration` - Expiration timestamp (ISO)

### Protected Routes

All routes except login/signup are protected:

```javascript
if (isAuthenticated && !loginExpiration) {
  // Old session without expiration - force re-login
  clearStorage();
  redirect('/');
}

if (isAuthenticated && loginExpiration) {
  if (currentDate > expirationDate) {
    // Session expired - clear and redirect
    clearStorage();
    redirect('/');
  }
}
```

### Account Verification

New partners must be verified by admin before accessing the portal:

```javascript
if (data.user.isVerified === false) {
  showError('Please wait for admin to verify your account');
  return;
}
```

---

## 📊 Dashboard Analytics

### Chart Types

#### 1. Monthly Performance (Area Chart)
- Shows 6-month trend
- Tracks installments and properties
- Gradient fill for visual appeal
- Interactive tooltips

#### 2. Status Distribution (Pie Chart)
- Visual breakdown of application statuses
- 5 status categories:
  - Pending (Orange)
  - Approved (Green)
  - In Progress (Blue)
  - Rejected (Red)
  - Completed (Purple)
- Percentage labels

#### 3. Performance vs Target (Bar Chart)
- Compares current vs target metrics
- Side-by-side comparison
- Color-coded bars

### Statistics Cards

Each card displays:
- **Icon** - Visual identifier
- **Count** - Main metric
- **Growth** - Percentage change with arrow
- **Details** - Additional information
- **Click Action** - Navigates to relevant page

### User Access Filtering

Dashboard adapts based on `userAccess` permissions:

```javascript
if (userAccess.includes('Installments')) {
  // Show installment stats and charts
}
if (userAccess.includes('Property')) {
  // Show property stats and charts
}
```

---

## 🏠 Property Management

### Property Listing System

The property management module provides a complete real estate listing solution:

#### Features Overview
- **Multi-Type Support** - Houses, flats, plots (residential/commercial), agricultural land
- **Purpose Options** - For sale, for rent, on installment
- **Comprehensive Details** - Up to 70+ fields per property
- **Image Management** - Multiple images with gallery view
- **Location Services** - GPS coordinates and address mapping
- **Amenities Tracking** - Community facilities and nearby locations

### Create Property

Multi-step form with 6 steps:

1. **Basic Property Information**
   - Property name, type, and purpose
   - Project type and duration
   - Plot size and area
   - Plot stage and possession type

2. **Pricing & Location**
   - Base price and installment details
   - Advance amount and monthly payments
   - Complete address
   - GPS coordinates (latitude/longitude)

3. **Property Features & Layout**
   - Bedrooms, bathrooms, kitchens
   - Floors, flooring type, furnished status
   - Additional rooms (drawing, dining, study, prayer)
   - Parking space and utilities
   - Built year and view

4. **Community Amenities**
   - Community lawn, swimming pool, gym
   - Mosque, kids play area, medical centre
   - Day care, BBQ area, community centre
   - Nearby schools, hospitals, malls
   - Public transport access

5. **Images & Marketing**
   - Multiple image upload
   - Image preview and removal
   - Property title and description
   - Marketing content

6. **Contact Information**
   - Full name, mobile, email
   - Landline (optional)
   - Additional messages/notes

### Property Details View

Comprehensive property information display:
- **Image Gallery** - Carousel with thumbnails
- **Key Statistics** - Bedrooms, bathrooms, area, floors
- **Full Description** - Property details and selling points
- **Room Breakdown** - All room counts and types
- **Amenities List** - Active community facilities
- **Nearby Facilities** - Schools, hospitals, transport, etc.
- **Pricing Information** - Sale price, installments, advance
- **Contact Details** - Owner/agent information

---

## 💼 Installment Management

### Create Installment Plan

Multi-step form with 4 steps:

1. **Basic Details**
   - Product name, category, company
   - City, price, status
   - Description and video URL

2. **Product Specifications** (Category-dependent)
   - Phones: Display, camera, battery, memory
   - Bikes: Performance, features
   - Air Conditioners: Capacity, features

3. **Product Images**
   - Multiple image upload
   - Preview and remove functionality
   - Drag-and-drop support

4. **Payment Plans**
   - Add multiple payment options
   - Auto-calculate monthly payments
   - Support for different interest types

### Payment Calculations

#### Flat Rate
```javascript
monthlyPayment = (price - downPayment) / tenure
```

#### Reducing Balance
```javascript
monthlyPayment = (principal × rate × (1 + rate)^n) / ((1 + rate)^n - 1)
```

#### Profit-Based
```javascript
totalAmount = price + (price × profitRate)
monthlyPayment = (totalAmount - downPayment) / tenure
```

### Application Management

Partners can:
- View all applications
- See applicant details
- Check guarantor information
- Update application status
- Add approval notes
- Cancel applications

### Status Workflow

```
Pending → In Progress → Approved → Completed
    ↓
Rejected / Cancelled
```

---

## 💰 Loan Management

### Loan Application System

The loan management module provides a comprehensive loan application and management solution:

#### Features Overview
- **Multiple Loan Types** - Personal, Business, Home, Car, Education, Startup
- **Employment-Based Forms** - Dynamic fields based on employment type
- **Comprehensive Details** - Up to 80+ fields per loan application
- **Document Management** - Multiple document uploads
- **Application Tracking** - Verification status and approval workflow

### Create Loan Application

Multi-step form with 4-5 steps (varies by employment type):

1. **Basic Loan Information**
   - Date and loan type selection
   - Employment type (Salaried, Self-Employed, Startup, Business Owner)
   - User ID (auto-filled from session)
   - Dynamic form preview based on employment type

2. **Personal Information**
   - Full name, email, phone, city
   - Age, qualification
   - Marital status, dependents
   - Personal background details

3. **Employment & Financial Details**
   - Net salary / monthly income (for Salaried/Self-Employed)
   - Relevant experience
   - Length of current employment
   - Other income sources
   - Residence type and information
   - Vehicle ownership status
   - Current consumer loans

4. **Startup-Specific Information** (Only for Startup employment type)
   - Educational background
   - Business structure (Sole Proprietorship, Partnership, Private/Public Limited)
   - Income bracket and composition
   - Net worth / available capital
   - Collateral ownership
   - Equity investment and ownership percentage
   - Bank financing status
   - Feasibility report availability
   - Team size and remuneration details

5. **Additional Information & Documents**
   - Previous loan history
   - Tangible assets as collateral
   - Equity contribution percentage
   - Guarantors for loan repayment
   - Document uploads (CNIC, salary slips, bank statements, etc.)

### Loan Details View

Comprehensive loan application display:
- **Application Summary** - Loan type, employment type, verification status
- **Personal Information** - Complete applicant details
- **Financial Information** - Income, expenses, assets
- **Loan History** - Previous loans and repayment record
- **Startup Details** - Business-specific information (if applicable)
- **Documents Gallery** - Uploaded documents with preview
- **Status Tracking** - Application timeline and current status

### Loan Filtering & Search

Advanced filtering options:
- **Search** - By applicant name or loan plan ID
- **Filter by Loan Type** - Personal, Business, Home, Car, Education, Startup
- **Filter by Employment** - Salaried, Self-Employed, Startup, Business Owner
- **Statistics Dashboard** - Total loans by category

---

## 👤 User Management

### Profile Information

- **Personal Details**
  - Full name, username
  - Email, phone numbers
  - CNIC number
  - Address

- **Financial Information**
  - Wallet balance
  - Bank account details

- **Access Control**
  - User access areas
  - Permissions management

- **Documents**
  - Profile picture
  - ID card image

### Profile Update Features

- Edit personal information
- Upload/change profile picture
- Update contact details
- Modify access permissions
- Change address
- Update bank information

---

## 🛡️ Security Features

### Authentication
- JWT token-based authentication
- Secure password hashing (bcrypt)
- Token expiration (15 days)
- Automatic session cleanup

### Authorization
- Role-based access control (RBAC)
- Permission-based UI rendering
- Protected API endpoints
- Route guards

### Data Protection
- HTTPS for all API calls
- Secure localStorage usage
- XSS prevention
- CSRF protection

### Input Validation
- Client-side validation
- Server-side validation
- Sanitized inputs
- Error handling

---

## 🎨 UI/UX Features

### Design System

**Colors:**
- Primary: Red (#dc2626)
- Secondary: White (#ffffff)
- Accent colors for charts and highlights

**Typography:**
- Font: Outfit (Google Fonts)
- Weights: 300, 400, 500, 600, 700

**Components:**
- Glass morphism cards
- Gradient buttons
- Smooth animations
- Custom scrollbar

### Responsive Breakpoints

```css
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

### Animations

- Fade-in on page load
- Slide-in for cards
- Hover effects on interactive elements
- Loading spinners
- Progress indicators

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0 - UI library
- **React Router DOM** 6.20.0 - Routing
- **Tailwind CSS** 3.4.19 - Styling
- **Recharts** 2.10.3 - Charts & graphs
- **Lucide React** 0.562.0 - Icons
- **PostCSS** 8.5.6 - CSS processing
- **Autoprefixer** 10.4.23 - CSS vendor prefixing

### Development Tools
- **Create React App** 5.0.1 - Build tooling
- **React Scripts** 5.0.1 - Development scripts
- **Web Vitals** 2.1.4 - Performance metrics

### Testing
- **@testing-library/react** 14.0.0
- **@testing-library/jest-dom** 6.9.1
- **@testing-library/user-event** 13.5.0

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: React 19 Compatibility Error
```
Cannot read properties of null (reading 'useContext')
```
**Solution:** Project uses React 18.2.0. If you see this error:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Restart development server

#### Issue: Charts Not Rendering
**Solution:** Ensure Recharts is installed:
```bash
npm install recharts@^2.10.3
```

#### Issue: Session Expired Immediately
**Solution:** Check if `loginExpiration` is set correctly:
```javascript
localStorage.getItem('loginExpiration')
```

#### Issue: Images Not Loading
**Solution:** 
1. Check if image upload API is working
2. Verify CORS settings on backend
3. Check image URL in network tab

#### Issue: Protected Routes Not Working
**Solution:** Clear localStorage and login again:
```javascript
localStorage.clear()
```

### Performance Issues

**Slow Loading:**
- Clear browser cache
- Check network connection
- Optimize images before upload
- Use production build

**Memory Leaks:**
- Check for unclosed subscriptions
- Verify component cleanup
- Use React DevTools Profiler

---

## 📝 Best Practices

### Code Organization
- Component-based architecture
- Separation of concerns
- Reusable components
- Consistent naming conventions

### State Management
- Local state with useState
- Global state with localStorage
- Avoid prop drilling
- Use custom hooks where needed

### Performance
- Lazy loading for routes
- Image optimization
- Code splitting
- Memoization for expensive operations

### Security
- Never store sensitive data in localStorage
- Always validate user input
- Use HTTPS for all requests
- Implement rate limiting

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Deploy to Hosting

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Manual Deployment:**
1. Build the project
2. Upload `build/` folder to your server
3. Configure web server (Apache/Nginx)
4. Set up HTTPS

### Environment Variables

Create `.env` file:
```
REACT_APP_API_URL=https://api.madadgaar.com.pk/api
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

### Code Style

- Use ESLint configuration
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic

---

## 📄 License

This project is proprietary software for Madadgaar.

---

## 📞 Support

For support and queries:
- **Email**: support@madadgaar.com.pk
- **Website**: https://madadgaar.com.pk

---

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Recharts** - For beautiful chart components
- **Lucide** - For the icon library

---

## 📊 Project Statistics

- **Total Files**: 65+
- **Total Components**: 30+
- **Total Lines of Code**: 12000+
- **API Endpoints**: 25+
- **Pages**: 20+
- **Property Fields**: 70+
- **Loan Fields**: 80+
- **Installment Categories**: 5+

---

## 🔄 Version History

### v0.1.5 (Latest) - Enhanced UI/UX Update
- ✅ **Major UI/UX Overhaul** - Modern, polished interface across all pages
- ✅ **Enhanced Authentication** - Improved login/signup with gradient backgrounds
- ✅ **Animated Backgrounds** - Floating gradient orbs for depth
- ✅ **Better Typography** - Extrabold headings with gradient text effects
- ✅ **Improved Navbar** - Glassmorphism effect with enhanced dropdowns
- ✅ **Enhanced Buttons** - Scale animations and better hover effects
- ✅ **Better Form Inputs** - Rounded corners, hover states, focus rings
- ✅ **6-Block OTP Input** - Modern OTP verification interface
- ✅ **Professional Polish** - Consistent spacing, shadows, and transitions
- ✅ **Mobile-First Design** - Improved responsive experience
- ✅ **Performance Optimizations** - Smoother animations and transitions

### v0.1.4
- ✅ Complete loan management system
- ✅ Multi-step loan application form (4-5 steps)
- ✅ Loan CRUD operations with filtering
- ✅ Startup-specific loan fields
- ✅ Employment type-based dynamic forms
- ✅ Forgot password feature with OTP
- ✅ Password reset via email verification
- ✅ 80+ loan application fields

### v0.1.3
- ✅ Complete property management system
- ✅ 6-step property creation form
- ✅ Property CRUD operations
- ✅ Image gallery with carousel
- ✅ Advanced filtering and search
- ✅ 70+ property fields support
- ✅ GPS coordinates integration
- ✅ Community amenities management

### v0.1.2
- ✅ React 18 compatibility
- ✅ Recharts integration
- ✅ Advanced dashboard with charts
- ✅ Bug fixes for null handling
- ✅ Session management (15 days)

### v0.1.1
- ✅ Installment CRUD operations
- ✅ Application status management
- ✅ Profile management with image upload

### v0.1.0
- ✅ Initial release
- ✅ Authentication system
- ✅ Basic dashboard
- ✅ User management

---

<div align="center">

**Made with ❤️ by The Code-xa Team**

⭐ Star this repository if you find it helpful!

[Report Bug](https://github.com/yourusername/partner-panel/issues) • [Request Feature](https://github.com/yourusername/partner-panel/issues)

</div>
