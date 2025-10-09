"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Tasks' },
    { href: '/work-hours', label: 'Work Hours' },
  ];

  return (
    <nav className="mb-8">
      <div className="flex justify-center">
        <div className="bg-blue-50/30 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-300/20 p-1">
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-blue-600 dark:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-800/30'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
