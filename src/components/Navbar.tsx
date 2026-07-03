import React, { useState } from 'react';
import { useLanguage, Language } from './LanguageContext.tsx';
import { useCurrency, Currency } from './CurrencyContext.tsx';
import { useTheme } from './ThemeContext.tsx';
import { 
  Menu, X, Globe, DollarSign, Sun, Moon, 
  User, Clipboard, Compass, LogOut, ChevronDown 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: any;
  setCurrentUser: (user: any) => void;
  openLoginModal: () => void;
}

export default function Navbar({ activeTab, setActiveTab, currentUser, setCurrentUser, openLoginModal }: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('home') },
    { id: 'about', label: t('about') },
    { id: 'services', label: t('services') },
    { id: 'tracking', label: t('tracking') },
    { id: 'booking', label: t('booking') },
    { id: 'quote', label: t('quote') },
    { id: 'careers', label: t('careers') },
    { id: 'blog', label: t('blog') },
    { id: 'contact', label: t('contact') },
  ];

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('guulwade_user');
    localStorage.removeItem('guulwade_token');
    setActiveTab('home');
  };

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#0B1220] border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavClick('home')} 
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#0057B8] flex items-center justify-center rounded-none transition-transform duration-300 group-hover:rotate-90">
                <div className="w-5 h-5 border-t-4 border-r-4 border-[#FFB000] rotate-45"></div>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                  GUULWADE <span className="text-[#0057B8] dark:text-[#FFB000]">LOGISTICS</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                  Global Forwarding Grid
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-none border-b-2 ${
                  activeTab === item.id
                    ? 'text-[#0057B8] dark:text-[#FFB000] border-[#FFB000]'
                    : 'text-gray-600 dark:text-gray-300 hover:text-[#0057B8] dark:hover:text-[#FFB000] border-transparent hover:border-gray-200 dark:hover:border-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Quick Actions (Theme, Currency, Language, Auth) */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Dark Mode Switch */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-none border border-transparent hover:border-gray-100 dark:hover:border-gray-800 cursor-pointer"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Currency Selector */}
            <div className="relative">
              <button 
                onClick={() => { setCurrOpen(!currOpen); setLangOpen(false); }}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-none border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 cursor-pointer"
              >
                <DollarSign size={13} />
                <span>{currency}</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${currOpen ? 'rotate-180' : ''}`} />
              </button>
              {currOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-[#0B1220] border border-gray-100 dark:border-gray-800 rounded-none shadow-2xl z-50 overflow-hidden">
                  {(['USD', 'SOS', 'ETB', 'EUR'] as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => { setCurrency(curr); setCurrOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                        currency === curr ? 'text-[#0057B8] dark:text-[#FFB000] bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => { setLangOpen(!langOpen); setCurrOpen(false); }}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-none border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 cursor-pointer"
              >
                <Globe size={13} />
                <span className="uppercase">{language}</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#0B1220] border border-gray-100 dark:border-gray-800 rounded-none shadow-2xl z-50 overflow-hidden">
                  <button
                    onClick={() => { setLanguage('en'); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300"
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage('so'); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300"
                  >
                    Somali
                  </button>
                  <button
                    onClick={() => { setLanguage('ar'); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300"
                  >
                    Arabic
                  </button>
                </div>
              )}
            </div>

            {/* User Auth */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') {
                      handleNavClick('admin-dashboard');
                    } else {
                      handleNavClick('customer-dashboard');
                    }
                  }}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer"
                >
                  <User size={14} className="text-[#0057B8] dark:text-[#FFB000]" />
                  <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/25 rounded-none border border-transparent hover:border-red-100 cursor-pointer"
                  title="Log Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white bg-[#0057B8] hover:bg-blue-700 dark:bg-[#FFB000] dark:hover:bg-yellow-500 dark:text-[#0B1220] rounded-none shadow-none transition-all duration-300 cursor-pointer"
              >
                <User size={14} />
                <span>{t('login')}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0B1220] border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-4 py-2.5 rounded-none text-xs uppercase tracking-wider font-bold ${
                  activeTab === item.id
                    ? 'text-[#0057B8] dark:text-[#FFB000] bg-gray-50 dark:bg-gray-900 border-l-4 border-[#FFB000]'
                    : 'text-gray-600 dark:text-gray-300 hover:text-[#0057B8] dark:hover:text-[#FFB000] hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2 px-4 justify-between items-center">
              {/* Mobile Language Selector */}
              <div className="flex space-x-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-xs font-bold rounded-none ${language === 'en' ? 'bg-[#0057B8] text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('so')}
                  className={`px-2 py-1 text-xs font-bold rounded-none ${language === 'so' ? 'bg-[#0057B8] text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'}`}
                >
                  SO
                </button>
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-2 py-1 text-xs font-bold rounded-none ${language === 'ar' ? 'bg-[#0057B8] text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'}`}
                >
                  AR
                </button>
              </div>

              {/* Mobile Currency Selector */}
              <div className="flex space-x-1">
                {(['USD', 'SOS', 'ETB', 'EUR'] as Currency[]).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`px-1.5 py-1 text-[10px] font-bold rounded-none ${currency === curr ? 'bg-[#00A86B] text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300'}`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 px-4">
              {currentUser ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') {
                        handleNavClick('admin-dashboard');
                      } else {
                        handleNavClick('customer-dashboard');
                      }
                    }}
                    className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 rounded-none block"
                  >
                    {currentUser.name} ({currentUser.role})
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-none block"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setIsOpen(false); openLoginModal(); }}
                  className="w-full py-3 text-center text-xs font-bold uppercase tracking-widest text-white bg-[#0057B8] dark:bg-[#FFB000] dark:text-[#0B1220] rounded-none shadow-none"
                >
                  {t('login')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
