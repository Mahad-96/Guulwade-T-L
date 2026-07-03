import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './components/LanguageContext.tsx';
import { CurrencyProvider, useCurrency } from './components/CurrencyContext.tsx';
import { ThemeProvider, useTheme } from './components/ThemeContext.tsx';
import Navbar from './components/Navbar.tsx';
import HomePage from './components/HomePage.tsx';
import TrackingView from './components/TrackingView.tsx';
import BookingForm from './components/BookingForm.tsx';
import CustomerDashboard from './components/CustomerDashboard.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import CareersPage from './components/CareersPage.tsx';
import QuotesForm from './components/QuotesForm.tsx';
import ContactForm from './components/ContactForm.tsx';
import { Mail, Phone, MapPin, X, ShieldAlert } from 'lucide-react';

function AppContent() {
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Navigation tab route state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedTrackingId, setSelectedTrackingId] = useState<string>('');

  // Authentication states
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('guulwade_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved session:', e);
      }
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setAuthLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Invalid email or password.');
      }

      const data = await response.json();
      setCurrentUser(data.user);
      localStorage.setItem('guulwade_user', JSON.stringify(data.user));
      localStorage.setItem('guulwade_token', data.token);
      
      setIsLoginModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      
      if (data.user.role === 'Super Admin' || data.user.role === 'Admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('dashboard');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Error executing login request.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('guulwade_user');
    localStorage.removeItem('guulwade_token');
    setActiveTab('home');
  };

  const handleTrackIdSubmit = (id: string) => {
    setSelectedTrackingId(id);
    setActiveTab('tracking');
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'tracking':
        return <TrackingView initialTrackingId={selectedTrackingId} />;
      case 'booking':
        return (
          <BookingForm 
            currentUser={currentUser} 
            onBookingSuccess={(bkg, shp) => {
              setActiveTab('dashboard');
            }} 
          />
        );
      case 'dashboard':
        return (
          <CustomerDashboard 
            currentUser={currentUser} 
            onTrackIdSelected={handleTrackIdSubmit}
            onBookNowTabSelected={() => setActiveTab('booking')}
          />
        );
      case 'admin':
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'careers':
        return <CareersPage />;
      case 'quote':
      case 'quotes':
        return <QuotesForm />;
      case 'contact':
        return <ContactForm />;
      default:
        return (
          <HomePage 
            onTabSelected={(tab) => {
              if (tab === 'booking' && !currentUser) {
                setIsLoginModalOpen(true);
              } else {
                setActiveTab(tab);
              }
            }} 
            onTrackIdSubmit={handleTrackIdSubmit} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B1220] transition-colors duration-300">
      
      {/* 1. Universal Header Navigation */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        openLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* 2. Main Page Body Layout */}
      <main className="flex-grow">
        {renderActiveView()}
      </main>

      {/* 3. Authentication Login Modal popup */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0B1220] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 md:p-8">
            
            {/* Close button */}
            <button 
              onClick={() => { setIsLoginModalOpen(false); setLoginError(''); }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <span className="bg-[#0057B8] text-white font-black text-xs px-2 py-0.5 rounded">GTL SECURE ACCESS</span>
              <h3 className="text-xl font-black text-gray-950 dark:text-white mt-2">Login to Control Tower</h3>
              <p className="text-xs text-gray-500 mt-1">Access your client shipment tracking logs or coordinator admin dashboards.</p>
            </div>

            {loginError && (
              <div className="p-3 mb-4 text-xs text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded-xl border border-red-150 flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Email address *</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@guulwade.com or customer@test.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-[#0057B8] hover:bg-[#00479b] dark:bg-[#FFB000] dark:hover:bg-[#e09b00] text-white dark:text-[#0B1220] font-bold rounded-xl shadow cursor-pointer text-sm"
              >
                {authLoading ? 'Verifying access credentials...' : 'Authenticate Securely'}
              </button>
            </form>

            {/* Help guidelines */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-500 space-y-1">
              <p>🔑 <strong className="text-gray-800 dark:text-gray-300">Admin credentials:</strong> admin@guulwade.com / Admin@12345</p>
              <p>📦 <strong className="text-gray-800 dark:text-gray-300">Customer credentials:</strong> customer@test.com / Customer@123</p>
            </div>

          </div>
        </div>
      )}

      {/* 4. Corporate Credibility Footer */}
      <footer className="bg-[#0B1220] text-gray-400 border-t border-white/5 pt-16 pb-8 text-left mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Logo & Corporate profile */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="bg-[#0057B8] text-white font-black text-lg px-2.5 py-1 rounded">GTL</span>
              <span className="text-lg font-black tracking-wider text-white">GUULWADE</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Guulwade is East Africa's leading full-scale logistics and maritime terminal operator. Connecting Horn trade routes with Bab el-Mandeb, India, and the Mediterranean.
            </p>
            <div className="flex space-x-3 text-xs font-bold text-white pt-2">
              <span>● Safety first</span>
              <span>● Cargo Secure</span>
              <span>● 24/7 Live</span>
            </div>
          </div>

          {/* Core trading hubs dry ports */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFB000]">Horn Logistics Terminals</h4>
            <div className="space-y-2.5 text-xs">
              <p className="flex items-center gap-2"><MapPin size={12} className="text-gray-500 shrink-0" /> <span>Mogadishu Deep Port facility, Somalia</span></p>
              <p className="flex items-center gap-2"><MapPin size={12} className="text-gray-500 shrink-0" /> <span>Berbera Economic Port, Somaliland</span></p>
              <p className="flex items-center gap-2"><MapPin size={12} className="text-gray-500 shrink-0" /> <span>Bole Dry Port Logistics Zone, Ethiopia</span></p>
              <p className="flex items-center gap-2"><MapPin size={12} className="text-gray-500 shrink-0" /> <span>Suez Canal Transit Authority, Egypt</span></p>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFB000]">Logistics Portals</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span onClick={() => setActiveTab('home')} className="hover:text-white cursor-pointer transition-colors font-medium">Home slider</span>
              <span onClick={() => setActiveTab('tracking')} className="hover:text-white cursor-pointer transition-colors font-medium">Track Shipment</span>
              <span onClick={() => setActiveTab('quote')} className="hover:text-white cursor-pointer transition-colors font-medium">Get Quote</span>
              <span onClick={() => setActiveTab('careers')} className="hover:text-white cursor-pointer transition-colors font-medium">Careers Jobs</span>
              <span onClick={() => setActiveTab('contact')} className="hover:text-white cursor-pointer transition-colors font-medium">Customer CRM</span>
              <span onClick={() => { if (currentUser) setActiveTab('dashboard'); else setIsLoginModalOpen(true); }} className="hover:text-white cursor-pointer transition-colors font-medium">Dashboard</span>
            </div>
          </div>

          {/* Contact Support */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFB000]">HQ Inquiries Office</h4>
            <div className="space-y-3 text-xs">
              <p className="flex items-center gap-2">
                <span className="text-gray-500 shrink-0">📞</span>
                <span>+252 61 777 5050 (Corporate)</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-500 shrink-0">✉</span>
                <span>support@guulwade.com</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-500 shrink-0">⏰</span>
                <span>Sat – Thu: 8:00 AM – 6:00 PM (EAT)</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom certification footer lines */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 mt-12 pt-6 text-center text-[10px] text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Guulwade Transportation & Logistics. All maritime, overland corridors rights reserved.</p>
          <div className="flex space-x-4">
            <span>SGS Cargo Safety Certified</span>
            <span>•</span>
            <span>WCO trade regulations compliant</span>
            <span>•</span>
            <span>PWA Enabled</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AppContent />
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
