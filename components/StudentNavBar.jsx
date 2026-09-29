"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, FileText, CheckSquare, MessageCircle } from "lucide-react";

export function StudentNavBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Update Profile", href: "/profile", icon: User },
    { name: "Apply", href: "/apply", icon: FileText },
    { name: "Status", href: "/status", icon: CheckSquare },
    { name: "AI Chat", href: "/chat", icon: MessageCircle },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-zinc-950 shadow-2xl rounded-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm hidden sm:inline-block">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}