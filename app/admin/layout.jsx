"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, UserPlus, CheckSquare, LogOut, Languages } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "SYSTEM_ADMIN") {
      router.push("/login");
    } else {
      setLoading(false);
    }

    // Google Translate
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element_admin');
      };
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [router]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const menuItems = [
    { name: "Overview", path: "/admin", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Assign V.O.", path: "/admin/vo-allotment", icon: UserPlus },
    { name: "Approvals", path: "/admin/approvals", icon: CheckSquare },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      <style dangerouslySetInnerHTML={{ __html: `
        .goog-te-gadget { font-size: 0px !important; color: transparent !important; }
        .goog-te-gadget img { display: none !important; }
        .goog-te-gadget .goog-logo-link { display: none !important; }
        .goog-te-combo { 
          padding: 4px; background: transparent; border: none;
          color: #374151 !important; font-size: 14px !important; cursor: pointer;
          outline: none; min-width: 150px;
        }
        body { top: 0 !important; }
        .skiptranslate iframe { display: none !important; }
      `}} />

      {/* Responsive Google Translate */}
      {isMounted && (
        <div className="fixed top-2 right-2 lg:top-4 lg:right-4 z-[60] flex items-center gap-1 lg:gap-2 bg-white px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg shadow-sm border border-gray-200 transform scale-75 lg:scale-100 origin-right">
          <Languages className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600 hidden sm:block" />
          <div id="google_translate_element_admin"></div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Persistent Sidebar & Mobile Menu Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-orange-500 to-orange-600 text-white transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="relative flex flex-col items-center justify-center p-6 border-b border-orange-400 gap-3">
          <button onClick={() => setSidebarOpen(false)} className="absolute top-2 right-2 lg:hidden text-white hover:bg-orange-700 p-1 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <img src="/assets/emblem.svg" alt="Ashok Stambha" className="h-16 w-auto brightness-0 invert" />
          <h1 className="text-xl font-bold text-center">Unified Scholarship</h1>
        </div>

        <div className="p-4 flex flex-col gap-2 flex-1 overflow-y-auto">
          <div className="mb-2 px-4 py-2 bg-orange-700/50 rounded-lg text-sm font-semibold uppercase tracking-wider">
            System Admin
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-orange-700 text-white shadow-md"
                    : "hover:bg-orange-500 text-white/90"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-orange-400">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-orange-700 transition-colors text-left text-sm"
          >
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Mobile App Header */}
        <header className="lg:hidden bg-white border-b shadow-sm p-3 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="w-10"></div> {/* Spacer */}
          <div className="flex items-center gap-2">
            <img src="/assets/emblem.svg" alt="Emblem" className="h-8 w-auto" />
            <h1 className="text-base font-bold text-orange-600 truncate">Admin Portal</h1>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white border-b px-8 py-4 items-center justify-between shadow-sm shrink-0">
          <h1 className="text-xl font-semibold text-gray-800">
            {menuItems.find(item => pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path)))?.name || "Overview"}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 lg:pb-8">
          {children}
        </main>

        {/* App-like Bottom Navigation (Mobile Only) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-40 pb-safe">
          <div className="flex items-center justify-around h-16">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
              return (
                <Link key={item.name} href={item.path} className={`flex flex-col items-center gap-1 ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
                  <Icon className="h-6 w-6" />
                  <span className="text-[10px] font-semibold">{item.name}</span>
                </Link>
              );
            })}
            <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center gap-1 text-gray-500">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              <span className="text-[10px] font-semibold">Menu</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
