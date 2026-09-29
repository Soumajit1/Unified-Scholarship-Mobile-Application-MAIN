"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, CircleUser, LogOut, LayoutDashboard, User, FileText, CheckSquare, MessageSquare, ListChecks } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function HeaderWrapper() {
  const [role, setRole] = useState(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('role'));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  // Hide the navbar on these specific routes
  const hideOnRoutes = ['/', '/login', '/signup'];
  if (hideOnRoutes.includes(pathname)) {
    return null;
  }

  const NavLinks = () => {
    if (role === 'VERIFYING_OFFICER') {
      return (
        <>
          <Link href="/officer" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"> <ListChecks className="h-5 w-5" /> Officer Dashboard </Link>
          <Link href="/officer/history" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"> <CheckSquare className="h-5 w-5" /> Verification History </Link>
        </>
      );
    }
    return (
      <>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"> <LayoutDashboard className="h-5 w-5" /> Dashboard </Link>
        <Link href="/profile" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"> <User className="h-5 w-5" /> Profile </Link>
        <Link href="/apply" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"> <FileText className="h-5 w-5" /> Apply </Link>
        <Link href="/status" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"> <CheckSquare className="h-5 w-5" /> Status </Link>
        <Link href="/chat" className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"> <MessageSquare className="h-5 w-5" /> AI Chat </Link>
      </>
    );
  };

  return (
    <header className="bg-white/70 backdrop-blur-md border-b sticky top-0 z-10 flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="md:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <h1 className="text-xl font-bold text-red-600">Unified Scholarship</h1>
      </div>
      {/* Desktop navigation */}
      <nav className="hidden md:flex gap-4 items-center">
        <NavLinks />
      </nav>
      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Mobile sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <nav className="flex flex-col gap-2">
            <NavLinks />
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
