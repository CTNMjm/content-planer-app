"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  requiresAdmin?: boolean;
  requiresPermission?: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserPermissions();
    }
  }, [session]);

  const fetchUserPermissions = async () => {
    try {
      const response = await fetch('/api/users/all-permissions');
      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data.permissions || []);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Content-Pläne", href: "/contentplan", requiresPermission: "content.view" },
    { label: "Input-Pläne", href: "/inputplan", requiresPermission: "input.view" },
    { label: "Redaktionspläne", href: "/redakplan", requiresPermission: "redak.view" },
  ];

  const adminItems: NavItem[] = [
    { label: "Benutzer", href: "/admin/users", requiresAdmin: true },
    { label: "Standorte", href: "/admin/locations", requiresAdmin: true },
    { label: "Einstellungen", href: "/admin/settings", requiresAdmin: true },
  ];

  const isAdmin = session?.user?.role === 'ADMIN';

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    if (isAdmin) return true;
    return userPermissions.includes(permission);
  };

  const filterNavItems = (items: NavItem[]) => {
    return items.filter(item => {
      if (item.requiresAdmin && !isAdmin) return false;
      if (item.requiresPermission && !hasPermission(item.requiresPermission)) return false;
      return true;
    });
  };

  const visibleNavItems = filterNavItems(navItems);
  const visibleAdminItems = filterNavItems(adminItems);

  if (!session) return null;

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          {/* Hauptnavigation */}
          <div className="flex space-x-1">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-4 text-sm font-medium border-b-2 transition-colors
                  ${pathname === item.href 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-700 hover:text-blue-600 hover:border-gray-300'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Admin-Navigation */}
          {visibleAdminItems.length > 0 && (
            <>
              <div className="flex items-center">
                <div className="w-px h-6 bg-gray-300" />
              </div>
              <div className="flex space-x-1">
                {visibleAdminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-4 py-4 text-sm font-medium border-b-2 transition-colors
                      ${pathname === item.href 
                        ? 'border-red-500 text-red-600' 
                        : 'border-transparent text-gray-700 hover:text-red-600 hover:border-gray-300'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}