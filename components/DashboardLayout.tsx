'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-bold">Sana Admin</span>
          <Link href="/" className="text-sm text-gray-600 hover:text-black">Dashboard</Link>
          <Link href="/products" className="text-sm text-gray-600 hover:text-black">Products</Link>
          <Link href="/orders" className="text-sm text-gray-600 hover:text-black">Orders</Link>
          <Link href="/branches" className="text-sm text-gray-600 hover:text-black">Branches</Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.name} ({user?.role})</span>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">Log out</button>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}