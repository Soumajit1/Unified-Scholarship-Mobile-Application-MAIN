"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, X, LogOut, LayoutDashboard, User, FileText, 
  CheckSquare, MessageSquare, ListChecks, Users, CheckCircle, BarChart, Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppLayoutWrapper({ children }) {
  const [role, setRole] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('role') || 'STUDENT';
      setRole(storedRole);

      // Load Google Translate script dynamically to avoid React hydration mismatch
      if (!window.googleTranslateElementInit) {
        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement({ 
            pageLanguage: 'en',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          }, 'google_translate_element');
        };
        const script = document.createElement('script');
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    let activePersonal = {};
    try { activePersonal = JSON.parse(localStorage.getItem('student_personal') || '{}'); } catch(e) {}
    if (activePersonal.email && role === 'STUDENT') {
      const usersDb = JSON.parse(localStorage.getItem('users_db') || '{}');
      usersDb[activePersonal.email] = {
        personal: localStorage.getItem('student_personal'),
        education: localStorage.getItem('student_education'),
        documents: localStorage.getItem('student_documents'),
        applied: localStorage.getItem('student_applied_scholarships'),
        role: 'STUDENT',
        status: usersDb[activePersonal.email]?.status || 'ACTIVE'
      };
      localStorage.setItem('users_db', JSON.stringify(usersDb));
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  // Hide the sidebar on auth pages AND on /admin (which has its own dedicated layout)
  const hideOnRoutes = ['/', '/login', '/signup'];
  if (hideOnRoutes.includes(pathname) || pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  const NavLinks = () => {
    if (role === 'VERIFYING_OFFICER') {
      return (
        <>
          <Link href="/officer" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/officer' ? 'bg-orange-700 text-white' : 'hover:bg-orange-500'}`}> 
            <ListChecks className="h-5 w-5" /> Applications 
          </Link>
          <Link href="/officer/history" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('/officer/history') ? 'bg-orange-700 text-white' : 'hover:bg-orange-500'}`}> 
            <CheckSquare className="h-5 w-5" /> Verification History 
          </Link>
        </>
      );
    }
    
    if (role === 'SYSTEM_ADMIN') {
      return (
        <>
          <Link href="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('/admin/users') ? 'bg-orange-700 text-white' : 'hover:bg-orange-500'}`}> 
            <Users className="h-5 w-5" /> User Management 
          </Link>
          <Link href="/admin/vo-allotment" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('/admin/vo-allotment') ? 'bg-orange-700 text-white' : 'hover:bg-orange-500'}`}> 
            <User className="h-5 w-5" /> Allocate V.O. 
          </Link>
          <Link href="/admin/approvals" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('/admin/approvals') ? 'bg-orange-700 text-white' : 'hover:bg-orange-500'}`}> 
            <CheckCircle className="h-5 w-5" /> Final Approval 
          </Link>
          <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin' ? 'bg-orange-700 text-white' : 'hover:bg-orange-500'}`}> 
            <BarChart className="h-5 w-5" /> Dashboard 
          </Link>
        </>
      );
    }

    // Default to STUDENT
    return (
      <>
        <Link href="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('/profile') ? 'bg-orange-700 text-white' : 'hover:bg-orange-500'}`}> 
          <User className="h-5 w-5" /> Update Account 
        </Link>
        <Link href="/apply" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('/apply') ? 'bg-orange-700 text-white' : 'hover:bg-orange-500'}`}> 
          <FileText className="h-5 w-5" /> Apply Scholarship 
        </Link>
        <Link href="/status" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('/status') ? 'bg-orange-700 text-white' : 'hover:bg-orange-500'}`}> 
          <CheckSquare className="h-5 w-5" /> Application Status 
        </Link>
        <Link href="/chat" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('/chat') ? 'bg-orange-700 text-white' : 'hover:bg-orange-500'}`}> 
          <MessageSquare className="h-5 w-5" /> Jago Chatbot 
        </Link>
        <Link href="/faq" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('/faq') ? 'bg-orange-700 text-white' : 'hover:bg-orange-500'}`}> 
          <MessageSquare className="h-5 w-5" /> FAQ 
        </Link>
        <Link href="/contact" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('/contact') ? 'bg-orange-700 text-white' : 'hover:bg-orange-500'}`}> 
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> 
          Contact Us 
        </Link>
      </>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Google Translate Script & Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .goog-te-gadget { font-size: 0px !important; color: transparent !important; }
          .goog-te-gadget img { display: none !important; }
          .goog-te-gadget .goog-logo-link { display: none !important; }
          .goog-te-combo { 
            padding: 4px; 
            background: transparent; 
            border: none;
            color: #374151 !important; 
            font-size: 14px !important; 
            cursor: pointer;
            outline: none;
            min-width: 150px;
          }
          body { top: 0 !important; }
          .skiptranslate iframe { display: none !important; }
        `
      }} />

      {/* Responsive Google Translate (Fixed in Top Right) */}
      {isMounted && (
        <div className="fixed top-2 right-2 lg:top-4 lg:right-4 z-[60] flex items-center gap-1 lg:gap-2 bg-white px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg shadow-sm border border-gray-200 transform scale-75 lg:scale-100 origin-right">
          <Languages className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600 hidden sm:block" />
          <div id="google_translate_element"></div>
        </div>
      )}

      {/* Mobile Sidebar Overlay (Only shown when Menu is clicked) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Left Panel) - Desktop Persistent, Mobile Hidden by Default */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-orange-500 to-orange-600 text-white transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="relative flex flex-col items-center justify-center p-6 border-b border-orange-400 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="absolute top-2 right-2 lg:hidden text-white hover:bg-orange-700">
            <X className="h-5 w-5" />
          </Button>
          <img src="/assets/emblem.svg" alt="Ashok Stambha" className="h-16 w-auto brightness-0 invert" />
          <h1 className="text-xl font-bold text-center">Unified Scholarship</h1>
        </div>
        
        <div className="p-4 flex flex-col gap-2 h-[calc(100vh-140px)] overflow-y-auto">
          <div className="mb-4 px-4 py-2 bg-orange-700/50 rounded-lg text-sm font-semibold uppercase tracking-wider">
            {role ? role.replace('_', ' ') : 'STUDENT'} PANEL
          </div>
          <NavLinks />
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-orange-400">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-orange-700 transition-colors text-left"
          >
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* App-like Mobile Header - Symmetrical */}
        <header className="lg:hidden bg-white border-b shadow-sm p-3 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="w-10"></div> {/* Spacer for symmetry */}
          <div className="flex items-center gap-2">
            <img src="/assets/emblem.svg" alt="Emblem" className="h-8 w-auto" />
            <h1 className="text-base font-bold text-orange-600 truncate">Scholarship Portal</h1>
          </div>
          <div className="w-10 flex justify-end"></div> {/* Empty spacer for perfect symmetry */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 lg:pb-8">
          {children}
        </main>

        {/* App-like Bottom Navigation (Mobile Only) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-40 pb-safe">
          <div className="flex items-center justify-around h-16">
            {role === 'VERIFYING_OFFICER' ? (
              <>
                <Link href="/officer" className={`flex flex-col items-center gap-1 ${pathname === '/officer' ? 'text-orange-600' : 'text-gray-500'}`}>
                  <ListChecks className="h-6 w-6" />
                  <span className="text-[10px] font-semibold">Apps</span>
                </Link>
                <Link href="/officer/history" className={`flex flex-col items-center gap-1 ${pathname.includes('/officer/history') ? 'text-orange-600' : 'text-gray-500'}`}>
                  <CheckSquare className="h-6 w-6" />
                  <span className="text-[10px] font-semibold">History</span>
                </Link>
                <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center gap-1 text-gray-500">
                  <Menu className="h-6 w-6" />
                  <span className="text-[10px] font-semibold">Menu</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${pathname === '/dashboard' ? 'text-orange-600' : 'text-gray-500'}`}>
                  <LayoutDashboard className="h-6 w-6" />
                  <span className="text-[10px] font-semibold">Home</span>
                </Link>
                <Link href="/apply" className={`flex flex-col items-center gap-1 ${pathname.includes('/apply') ? 'text-orange-600' : 'text-gray-500'}`}>
                  <FileText className="h-6 w-6" />
                  <span className="text-[10px] font-semibold">Apply</span>
                </Link>
                <Link href="/status" className={`flex flex-col items-center gap-1 ${pathname.includes('/status') ? 'text-orange-600' : 'text-gray-500'}`}>
                  <CheckSquare className="h-6 w-6" />
                  <span className="text-[10px] font-semibold">Status</span>
                </Link>
                <Link href="/profile" className={`flex flex-col items-center gap-1 ${pathname.includes('/profile') ? 'text-orange-600' : 'text-gray-500'}`}>
                  <User className="h-6 w-6" />
                  <span className="text-[10px] font-semibold">Profile</span>
                </Link>
                <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center gap-1 text-gray-500">
                  <Menu className="h-6 w-6" />
                  <span className="text-[10px] font-semibold">Menu</span>
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
