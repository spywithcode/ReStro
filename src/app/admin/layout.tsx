"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  BookMarked,
  BarChart3,
  LogOut,
  Building,
  Menu,
  X,
  User
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppData, AppProvider } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { restaurants } from '@/lib/data';
import { cn } from '@/lib/utils';


function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { restaurant, setRestaurantId, isLoading, logout, adminUser } = useAppData();
  const [sidebarOpen, setSidebarOpen] = useState(false);


  const menuItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/menu", icon: UtensilsCrossed, label: "Menu" },
    { href: "/admin/orders", icon: ClipboardList, label: "Orders" },
    { href: "/admin/tables", icon: BookMarked, label: "Tables" },
    { href: "/admin/reports", icon: BarChart3, label: "Reports" },
    { href: "/admin/profile", icon: User, label: "Profile" },
  ];

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && !restaurant && !adminUser) {
      router.replace('/');
    }
  }, [isLoading, restaurant, adminUser, router]);

  if (isLoading || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Logo showText={false} />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Restaurant Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm truncate">{restaurant.name}</h2>
              <p className="text-xs text-muted-foreground truncate">{restaurant.id}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/images/default-food.jpg" alt="Admin" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">A</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Button
                variant="ghost"
                className="p-0 h-auto text-sm font-medium truncate text-left"
                onClick={() => router.push('/admin/profile')}
              >
                Admin Profile
              </Button>
              <p className="text-xs text-muted-foreground truncate">{restaurant.id}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen">
        {/* Desktop Spacer for Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0" />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-background border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
              <Logo showText={false} size="sm" />
              <span className="font-semibold text-lg">{restaurant.name}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span className="hidden sm:inline">{restaurant.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch Restaurant</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={restaurant.id} onValueChange={setRestaurantId}>
                  {restaurants.map(r => (
                    <DropdownMenuRadioItem key={r.id} value={r.id}>
                      {r.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
            <div className="max-w-screen-xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>


    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AppProvider>
  )
}
