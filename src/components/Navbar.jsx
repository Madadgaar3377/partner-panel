import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  User, 
  Settings,
  Home,
  FileText,
  Building2,
  DollarSign,
  Shield,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('loginExpiration');
    navigate('/');
  };

  if (!userData) return null;

  // Define menu items based on access
  const accessMenus = {
    Installments: {
      icon: FileText,
      label: 'Installments',
      color: 'blue',
      items: [
        { label: 'Create Plan', path: '/installments/create' },
        { label: 'View All Plans', path: '/installments' },
        { label: 'Requests', path: '/installments/requests' }
      ]
    },
    Property: {
      icon: Building2,
      label: 'Property',
      color: 'green',
      items: [
        { label: 'Add Property', path: '/property/create' },
        { label: 'View Properties', path: '/property' },
        { label: 'Applications', path: '/property/applications' }
      ]
    },
    Loan: {
      icon: DollarSign,
      label: 'Loans',
      color: 'purple',
      items: [
        { label: 'Create Loan', path: '/loans/create' },
        { label: 'View Loans', path: '/loans' },
        { label: 'Applications', path: '/loans/applications' }
      ]
    },
    Insurance: {
      icon: Shield,
      label: 'Insurance',
      color: 'orange',
      items: [
        { label: 'Create Plan', path: '/insurance/create' },
        { label: 'View Plans', path: '/insurance' },
        { label: 'Claims', path: '/insurance/claims' }
      ]
    }
  };

  // Get available menus based on user access
  const availableMenus = userData.userAccess?.map(access => accessMenus[access]).filter(Boolean) || [];

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="p-2 bg-red-600 rounded-lg">
              <span className="text-xl font-bold text-white">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-red">Madadgaar</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Partner Portal</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Dashboard */}
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/dashboard')
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </button>

            {/* Dynamic Access Menus */}
            {availableMenus.map((menu) => {
              const Icon = menu.icon;
              const isMenuActive = menu.items.some(item => location.pathname.startsWith(item.path.split('/')[1]));
              
              return (
                <div key={menu.label} className="relative">
                  <button
                    onClick={() => toggleDropdown(menu.label)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isMenuActive
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{menu.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      openDropdown === menu.label ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Dropdown */}
                  {openDropdown === menu.label && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2">
                      {menu.items.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                            isActive(item.path) ? 'bg-red-50 text-red-600' : 'text-gray-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            <div 
              className="flex items-center gap-3 px-3 py-2 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => navigate('/profile')}
              title="View Profile"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-red-200 flex items-center justify-center">
                {userData.profilePic ? (
                  <img src={userData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-red-600" />
                )}
              </div>
              <span className="text-sm font-semibold text-gray-800">{userData.userName?.split(' ')[0]}</span>
            </div>
            
            <button
              onClick={() => navigate('/profile/edit')}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Edit Profile"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 animate-in fade-in slide-in-from-top-2">
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-red-50 rounded-lg">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-red-200 flex items-center justify-center">
                {userData.profilePic ? (
                  <img src={userData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{userData.name}</p>
                <p className="text-xs text-gray-500">{userData.email}</p>
              </div>
            </div>

            {/* Dashboard */}
            <button
              onClick={() => {
                navigate('/dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard') ? 'bg-red-50 text-red-600' : 'text-gray-700'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            {/* Access Menus */}
            {availableMenus.map((menu) => {
              const Icon = menu.icon;
              return (
                <div key={menu.label} className="mt-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    {menu.label}
                  </div>
                  {menu.items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 pl-8 transition-colors ${
                        isActive(item.path) ? 'bg-red-50 text-red-600' : 'text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              );
            })}

            {/* Settings & Logout */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => {
                  navigate('/profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">My Profile</span>
              </button>
              <button
                onClick={() => {
                  navigate('/profile/edit');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Edit Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

