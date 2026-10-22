import React, { useState } from 'react';
import { NFMonogram } from './NFMonogram';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronDown,
  FileText
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (initialTab?: 'login' | 'signup') => void;
  onOpenSellerModal: () => void;
  onOpenEnquiryModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenSellerModal,
  onOpenEnquiryModal,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'properties', label: 'All Properties' },
    { id: 'residential', label: 'Residential' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'industrial', label: 'Industrial' },
    { id: 'seller', label: 'List Property', isSeller: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#17211D] text-[#F4F0E7] border-b border-[#23312C] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark & Monogram */}
        <button
          onClick={() => {
            onNavigate('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-3 text-left shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B87952] rounded-lg p-1"
        >
          <NFMonogram size={38} inverted />
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold tracking-tight text-[#F4F0E7] group-hover:text-[#C8D6B0] transition-colors whitespace-nowrap">
              NF ESTATE GROUP
            </span>
            <span className="text-[11px] font-medium tracking-wider text-[#C8D6B0] uppercase whitespace-nowrap">
              Gujarat Real Estate
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                if (link.isSeller) {
                  onOpenSellerModal();
                } else {
                  onNavigate(link.id);
                }
              }}
              className={`whitespace-nowrap transition-colors relative py-1 text-sm ${
                currentView === link.id
                  ? 'text-[#C8D6B0] font-semibold'
                  : 'text-[#F4F0E7]/80 hover:text-[#C8D6B0]'
              }`}
            >
              {link.label}
              {currentView === link.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8D6B0] rounded-full" />
              )}
            </button>
          ))}

          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-[#B87952]/20 text-[#DE9F7B] border border-[#B87952]/30 hover:bg-[#B87952]/30 transition-colors whitespace-nowrap`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Owner Admin
            </button>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action Area */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('account-enquiries')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#23312C] hover:bg-[#2e4039] text-[#C8D6B0] border border-[#33463f] transition-colors whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5 text-[#B87952]" />
                <span>View My Enquiries</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#23312C] hover:bg-[#2e4039] text-[#F4F0E7] border border-[#33463f] transition-colors whitespace-nowrap focus:outline-none"
                >
                  <div className="w-6 h-6 rounded-full bg-[#B87952] flex items-center justify-center text-[11px] font-bold text-white uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#C8D6B0]" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-[#17211D] border border-[#2e4039] shadow-xl py-2 z-50 text-sm"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#23312C]">
                      <p className="font-semibold text-[#F4F0E7] truncate">{user.name}</p>
                      <p className="text-xs text-[#C8D6B0] truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#23312C] text-[#C8D6B0]">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('account');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[#F4F0E7]/90 hover:bg-[#23312C] hover:text-[#C8D6B0] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#C8D6B0]" />
                      My Account
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('account-enquiries');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[#F4F0E7]/90 hover:bg-[#23312C] hover:text-[#C8D6B0] transition-colors"
                    >
                      <FileText className="w-4 h-4 text-[#C8D6B0]" />
                      View My Enquiries
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[#DE9F7B] hover:bg-[#23312C] transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#B87952]" />
                        Owner Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-[#23312C] my-1" />

                    <button
                      onClick={async () => {
                        await logout();
                        setUserDropdownOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-red-400 hover:bg-[#23312C] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 text-xs font-semibold text-[#F4F0E7] hover:text-[#C8D6B0] transition-colors whitespace-nowrap"
              >
                Login to Your Account
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 text-xs font-bold text-white bg-[#B87952] hover:bg-[#9E6340] rounded-lg transition-colors shadow-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#B87952]"
              >
                Create Your Account
              </button>
            </div>
          )}

          <button
            onClick={onOpenEnquiryModal}
            className="px-4 py-2 text-xs font-bold text-[#17211D] bg-[#C8D6B0] hover:bg-[#b5c799] rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            Enquire Now
          </button>
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          {user ? (
            <button
              onClick={() => onNavigate('account-enquiries')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-[#23312C] text-[#C8D6B0] rounded border border-[#33463f] whitespace-nowrap"
            >
              Enquiries
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-[#B87952] text-white rounded whitespace-nowrap"
            >
              Login
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#F4F0E7] hover:text-[#C8D6B0] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#17211D] border-b border-[#2e4039] px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                if (link.isSeller) {
                  onOpenSellerModal();
                } else {
                  onNavigate(link.id);
                }
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 px-3 rounded-lg text-base font-medium ${
                currentView === link.id
                  ? 'bg-[#23312C] text-[#C8D6B0]'
                  : 'text-[#F4F0E7]/90 hover:bg-[#23312C]'
              }`}
            >
              {link.label}
            </button>
          ))}

          {user && (
            <>
              <button
                onClick={() => {
                  onNavigate('account');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-3 rounded-lg text-base font-medium text-[#F4F0E7]/90 hover:bg-[#23312C]"
              >
                My Account & Enquiries
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 px-3 rounded-lg text-base font-semibold text-[#DE9F7B] bg-[#B87952]/10 hover:bg-[#B87952]/20"
                >
                  Owner Admin Dashboard
                </button>
              )}

              <button
                onClick={async () => {
                  await logout();
                  setMobileMenuOpen(false);
                  onNavigate('home');
                }}
                className="block w-full text-left py-2 px-3 rounded-lg text-base font-medium text-red-400 hover:bg-[#23312C]"
              >
                Logout
              </button>
            </>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                onOpenEnquiryModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-sm font-semibold rounded-lg bg-[#B87952] text-white hover:bg-[#9E6340] transition-colors"
            >
              Enquire Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
